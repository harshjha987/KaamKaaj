package com.harsh.KaamKaaj.invitation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<WorkspaceInvitation, String> {

    // Used by admin to list all invitations sent in their workspace
    List<WorkspaceInvitation> findByWorkspaceId(String workspaceId);

    // Used to check if a pending invitation already exists
    // before sending a new one — prevents duplicates
    Optional<WorkspaceInvitation> findByWorkspaceIdAndInvitedUserIdAndStatus(
            String workspaceId, String invitedUserId, InvitationStatus status);

    // User's inbox — all pending invitations addressed to them
    List<WorkspaceInvitation> findByInvitedUserIdAndStatus(
            String invitedUserId, InvitationStatus status);

    // Used when cancelling — admin fetches by ID but we also
    // verify workspace ownership in the service
    Optional<WorkspaceInvitation> findByIdAndWorkspaceId(
            String id, String workspaceId);

    Page<WorkspaceInvitation> findByWorkspaceId(String workspaceId, Pageable pageable);
}