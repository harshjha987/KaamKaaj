package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByToken(String token);

    // Invalidate all active tokens for a user before issuing a new one.
    // Prevents multiple valid reset links floating in inboxes.
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void invalidateAllForUser(@Param("user") User user);

    // Daily cleanup — remove tokens older than 24 hours
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.createdAt < :cutoff")
    void deleteOldTokens(@Param("cutoff") Instant cutoff);
}