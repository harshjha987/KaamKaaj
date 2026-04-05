package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

// -------------------------------------------------------
// RefreshToken is a DB-backed entity — unlike access tokens
// which are stateless JWTs validated by signature alone,
// refresh tokens must be stored so we can:
//   1. Invalidate them on logout
//   2. Detect reuse (stolen token detection)
//   3. Rotate them on every use
//
// Fields:
//   token     — a cryptographically random string (not a JWT)
//               We use UUID or SecureRandom, not JWT, because
//               refresh tokens don't need to carry claims —
//               they're just opaque lookup keys.
//
//   user      — which user this token belongs to
//
//   expiresAt — when this token stops being valid
//               (separate from access token expiry)
//
//   revoked   — true if this token was already used (rotation)
//               or explicitly invalidated (logout)
//               We keep the row rather than deleting it so
//               we can detect reuse attempts.
// -------------------------------------------------------
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // The actual token value sent to the client.
    // Unique index makes lookups fast and prevents duplicates.
    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    // When revoked = true, this token cannot be used again.
    // If someone tries to use a revoked token, we know it
    // was stolen and revoke ALL tokens for this user.
    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}