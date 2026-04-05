package com.harsh.KaamKaaj.invitation;

import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.workspace.Workspace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "workspace_invitations",
        // A user can only have ONE pending invitation per workspace
        // at a time. The DB enforces this — not just the app code.
        // Without this constraint, an admin could spam invitations
        // to the same user and flood their inbox.
        //
        // Note: this allows re-inviting after DECLINED or CANCELLED
        // because a new row would be inserted — the unique constraint
        // only prevents duplicate PENDING invitations... actually
        // we'll enforce the "only one pending" rule in the service
        // layer since the DB constraint covers all statuses.
        // We'll handle re-invite logic in InvitationService.
        
)
public class WorkspaceInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    // The user being invited
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser;

    // The admin who sent the invitation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private InvitationStatus status = InvitationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Null until the user responds. We track this for the
    // audit trail — admins can see when users responded.
    @Column(name = "responded_at")
    private Instant respondedAt;
}