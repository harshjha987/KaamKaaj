package com.harsh.KaamKaaj.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, String> {

    // Existing — used by WorkspaceAuthorizationService
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(
            String workspaceId, String userId);

    // Existing — used by InvitationService
    boolean existsByWorkspaceIdAndUserId(
            String workspaceId, String userId);

    // -------------------------------------------------------
    // NEW: List all ACTIVE members of a workspace.
    // Used by the "list members" endpoint.
    //
    // We filter by status = ACTIVE because INVITED members
    // haven't accepted yet — they're not real members yet
    // from the workspace's perspective.
    // -------------------------------------------------------
    List<WorkspaceMember> findByWorkspaceIdAndStatus(
            String workspaceId, MemberStatus status);

    // -------------------------------------------------------
    // NEW: Count how many ADMINs are in a workspace.
    // Used by the remove-member endpoint to prevent removing
    // the last admin — a workspace must always have at least
    // one admin, otherwise it becomes unmanageable.
    // -------------------------------------------------------
    long countByWorkspaceIdAndRoleAndStatus(
            String workspaceId, WorkspaceRole role, MemberStatus status);
}