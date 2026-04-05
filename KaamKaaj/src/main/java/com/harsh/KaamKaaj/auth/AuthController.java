package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.*;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Register, login, refresh tokens, forgot/reset password")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @Operation(summary = "Register", description = "No token required.")
    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Login",
            description = "Returns access token (15 min) and refresh token (7 days).")
    @SecurityRequirements
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Refresh access token",
            description = "Exchange a valid refresh token for new tokens. Old token is invalidated.")
    @SecurityRequirements
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @Operation(summary = "Get current user profile")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getUsername()));
    }

    @Operation(summary = "Logout",
            description = "Revokes all refresh tokens. All devices will need to log in again.")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.logout(principal.getUsername()));
    }

    // ── Forgot Password ───────────────────────────────────

    @Operation(
            summary = "Forgot password",
            description = """
            Submit your email to receive a password reset link.
            Always returns 200 with a generic message — even if the email
            isn't registered, to prevent user enumeration attacks.
            The link expires in 15 minutes and can only be used once.
            """
    )
    @SecurityRequirements
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(passwordResetService.requestPasswordReset(request));
    }

    // ── Reset Password ────────────────────────────────────

    @Operation(
            summary = "Reset password",
            description = """
            Submit the token from the reset email + your new password.
            Token must exist, not be used, and not be expired.
            On success all active sessions are invalidated.
            """
    )
    @SecurityRequirements
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(passwordResetService.resetPassword(request));
    }
}