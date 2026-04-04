package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

// WorkspaceMember is a JOIN TABLE with extra columns.
//
// A plain @ManyToMany between User and Workspace would only
// store (user_id, workspace_id). But we also need to store:
//   - role (ADMIN or MEMBER in this workspace)
//   - status (INVITED, ACTIVE — for the invitation flow)
//   - joinedAt
//
// So we model it as its own entity with two @ManyToOne
// relationships. This pattern is called "association entity"
// or "join entity with attributes".
//
// The @Table uniqueConstraints ensures a user can only have
// ONE membership record per workspace — you can't be a member
// twice. The DB enforces this even if the application code
// has a bug.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "workspace_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_workspace_user",
                columnNames = {"workspace_id", "user_id"}
        )
)
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // This user's role WITHIN this workspace.
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    private WorkspaceRole role;

    // When a workspace is first created, the creator is added
    // as a member with status ACTIVE. Invited users start as
    // INVITED and move to ACTIVE once they accept.
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private MemberStatus status;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;
}