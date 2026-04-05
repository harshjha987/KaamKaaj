package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.ForgotPasswordRequest;
import com.harsh.KaamKaaj.auth.dto.ResetPasswordRequest;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepo userRepo;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final long EXPIRY_MINUTES = 15;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepo userRepo,
            JavaMailSender mailSender,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepo = userRepo;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // -------------------------------------------------------
    // Step 1: User submits their email.
    //
    // ALWAYS return the same generic message whether or not
    // the email exists. This prevents user enumeration —
    // attackers must not be able to tell which emails are
    // registered by submitting this endpoint.
    // -------------------------------------------------------
    @Transactional
    public String requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String genericMessage =
                "If that email is registered, you'll receive a password reset link shortly.";

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", email);
            return genericMessage;
        }

        User user = userOpt.get();

        // Invalidate any existing active tokens before issuing a new one
        tokenRepository.invalidateAllForUser(user);

        // Generate 32 random bytes → URL-safe Base64 string (no padding)
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String tokenValue = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenValue);
        resetToken.setUser(user);
        resetToken.setExpiresAt(Instant.now().plusSeconds(EXPIRY_MINUTES * 60));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        sendResetEmail(user.getEmail(), user.getUsername(), tokenValue);

        log.info("Password reset token issued for: {}", email);
        return genericMessage;
    }

    // -------------------------------------------------------
    // Step 2: User submits token + new password.
    //
    // Validates: exists, not used, not expired.
    // On success: updates password, marks token used.
    // -------------------------------------------------------
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invalid or expired reset token. Please request a new one."));

        if (resetToken.isUsed()) {
            throw new ResourceNotFoundException(
                    "This reset link has already been used. Please request a new one.");
        }

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResourceNotFoundException(
                    "This reset link has expired (" + EXPIRY_MINUTES +
                            " minute window). Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        // Mark as used — prevents replay attacks
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for: {}", user.getEmail());
        return "Password reset successfully. Please log in with your new password.";
    }

    private void sendResetEmail(String toEmail, String username, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("KaamKaaj — Reset your password");
        message.setText(
                "Hi " + username + ",\n\n" +
                        "You requested a password reset for your KaamKaaj account.\n\n" +
                        "Click the link below to reset your password:\n" +
                        resetLink + "\n\n" +
                        "This link expires in " + EXPIRY_MINUTES + " minutes.\n\n" +
                        "If you didn't request this, you can safely ignore this email.\n\n" +
                        "— The KaamKaaj Team"
        );

        try {
            mailSender.send(message);
            log.info("Reset email sent to: {}", toEmail);
        } catch (Exception e) {
            // Don't expose mail failures to the caller — the user
            // already received the generic success message
            log.error("Failed to send reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    // Runs daily at 3am — keeps the table clean
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanUpOldTokens() {
        tokenRepository.deleteOldTokens(Instant.now().minusSeconds(24 * 60 * 60));
        log.info("Cleaned up old password reset tokens");
    }
}