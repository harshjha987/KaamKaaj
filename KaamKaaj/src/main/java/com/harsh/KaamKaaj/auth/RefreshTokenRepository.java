package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    // Look up a token by its value — used during refresh
    Optional<RefreshToken> findByToken(String token);

    // Revoke ALL tokens for a user — used when:
    //   1. User logs out (revoke all sessions)
    //   2. Token reuse detected (security response)
    //
    // @Modifying tells Spring Data this is an UPDATE/DELETE
    // query, not a SELECT. Required for any write JPQL query.
    // @Transactional is needed on the calling service method.
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user")
    void revokeAllUserTokens(@Param("user") User user);

    // Clean up expired tokens periodically — used by a
    // scheduled job so the table doesn't grow forever.
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteAllExpiredTokens(@Param("now") Instant now);
}