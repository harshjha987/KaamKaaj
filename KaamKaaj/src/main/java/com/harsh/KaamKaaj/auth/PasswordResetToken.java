package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

// -------------------------------------------------------
// Stores a short-lived one-time token emailed to the user.
//
// Flow:
//   1. User submits email → we create this record
//   2. We email a link: /reset-password?token=<value>
//   3. User clicks link → sends token + new password to API
//   4. We validate (exists, not used, not expired)
//   5. Update password, mark token used
//
// Why DB and not JWT?
//   Reset tokens must be revocable. If the user requests
//   a second reset, the first token must be dead immediately.
//   JWTs can't be revoked without a blocklist. DB is simpler.
// -------------------------------------------------------
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "token", nullable = false, unique = true, length = 512)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    // Once used = true the token is dead — prevents replay attacks.
    // We keep the row (not delete) for audit purposes.
    @Column(name = "used", nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}