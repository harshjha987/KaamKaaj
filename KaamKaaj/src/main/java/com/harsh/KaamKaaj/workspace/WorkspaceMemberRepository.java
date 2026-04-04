package com.harsh.KaamKaaj.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, String> {

    // Used by WorkspaceAuthorizationService to check:
    // "is this user an active member of this workspace?"
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(
            String workspaceId, String userId);

    // Check if a user is already a member (any status) before
    // sending an invitation — no point inviting someone twice.
    boolean existsByWorkspaceIdAndUserId(
            String workspaceId, String userId);
}