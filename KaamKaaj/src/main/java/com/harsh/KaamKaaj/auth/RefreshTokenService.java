package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    // How long refresh tokens live — configured in properties.
    // 7 days in milliseconds = 604800000
    private final long refreshTokenDurationMs;

    // -------------------------------------------------------
    // SecureRandom is cryptographically strong random number
    // generator. We use it to generate the refresh token value.
    //
    // Why not use UUID?
    //   UUID v4 is random but only 122 bits of entropy.
    //   SecureRandom with 32 bytes gives 256 bits — stronger.
    //
    // Why not use JWT as the refresh token?
    //   We could, but refresh tokens are just opaque lookup
    //   keys. They don't need to carry claims. A random string
    //   is simpler and harder to reverse-engineer.
    // -------------------------------------------------------
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshTokenDurationMs
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    // Creates and persists a new refresh token for the user.
    // Called at login — alongside access token generation.
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Generate 32 random bytes and encode as URL-safe Base64
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String tokenValue = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(tokenValue);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setRevoked(false);

        return refreshTokenRepository.save(refreshToken);
    }

    // -------------------------------------------------------
    // Validates a refresh token and returns it if valid.
    // Throws specific exceptions so the caller can respond
    // with the right error message.
    //
    // Checks in order:
    //   1. Does the token exist in the DB?
    //   2. Has it been revoked? (used before, or logged out)
    //   3. Has it expired?
    // -------------------------------------------------------
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Refresh token not found. Please log in again."));

        if (refreshToken.isRevoked()) {
            // -------------------------------------------------------
            // SECURITY: Token reuse detected.
            //
            // A revoked token being used means either:
            //   A) The user is replaying an old token (bug in client)
            //   B) An attacker stole a token that was already rotated
            //
            // In either case, the safe response is to revoke ALL
            // tokens for this user — forcing everyone to re-login.
            // This limits the damage if case B is true.
            // -------------------------------------------------------
            refreshTokenRepository.revokeAllUserTokens(refreshToken.getUser());
            throw new ResourceNotFoundException(
                    "Refresh token already used or revoked. " +
                            "All sessions have been invalidated for security. " +
                            "Please log in again.");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResourceNotFoundException(
                    "Refresh token has expired. Please log in again.");
        }

        return refreshToken;
    }

    // -------------------------------------------------------
    // Token rotation — called after a successful refresh.
    //
    // Marks the OLD token as revoked, then creates a brand
    // new refresh token. The client must store the new one
    // and discard the old one.
    //
    // This means each refresh token can only be used ONCE.
    // -------------------------------------------------------
    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        // Mark old token as revoked
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // Issue a brand new token for the same user
        return createRefreshToken(oldToken.getUser());
    }

    // Revoke all tokens for a user — called on logout.
    @Transactional
    public void revokeAllTokensForUser(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    // -------------------------------------------------------
    // Scheduled cleanup job — runs every day at 2am.
    //
    // The refresh_tokens table would grow forever without this.
    // Expired tokens are useless but take up space. We delete
    // them on a schedule rather than on every request to avoid
    // adding latency to the refresh endpoint.
    //
    // @Scheduled requires @EnableScheduling on a config class.
    // The cron expression "0 0 2 * * ?" means:
    //   second=0, minute=0, hour=2, any day, any month, any weekday
    // -------------------------------------------------------
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanUpExpiredTokens() {
        refreshTokenRepository.deleteAllExpiredTokens(Instant.now());
    }
}