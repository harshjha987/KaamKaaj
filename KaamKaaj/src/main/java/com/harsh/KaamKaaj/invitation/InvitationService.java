package com.harsh.KaamKaaj.invitation;

import com.harsh.KaamKaaj.exception.DuplicateResourceException;
import com.harsh.KaamKaaj.exception.InvalidStatusTransitionException;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.exception.WorkspaceAccessDeniedException;
import com.harsh.KaamKaaj.invitation.dto.InvitationResponse;
import com.harsh.KaamKaaj.invitation.dto.SendInvitationRequest;
import com.harsh.KaamKaaj.invitation.mapper.InvitationMapper;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepo userRepo;
    private final InvitationMapper invitationMapper;

    public InvitationService(InvitationRepository invitationRepository,
                             WorkspaceRepository workspaceRepository,
                             WorkspaceMemberRepository memberRepository,
                             UserRepo userRepo,
                             InvitationMapper invitationMapper) {
        this.invitationRepository = invitationRepository;
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepo = userRepo;
        this.invitationMapper = invitationMapper;
    }

    // Only workspace ADMINs can send invitations.
    // @PreAuthorize runs before this method.
    // If the caller is not an admin, Spring throws 403
    // before a single line of this method executes.
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public InvitationResponse sendInvitation(String workspaceId,
                                             SendInvitationRequest request,
                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        User invitedUser = userRepo.findById(request.getInvitedUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + request.getInvitedUserId()));

        // Guard 1: Can't invite yourself
        if (invitedUser.getId().equals(principal.getUserId())) {
            throw new DuplicateResourceException("You cannot invite yourself");
        }

        // Guard 2: Can't invite someone who is already an ACTIVE member
        // Note: if they LEFT (status != ACTIVE) they can be re-invited
        boolean isActiveMember = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, invitedUser.getId())
                .map(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElse(false);

        if (isActiveMember) {
            throw new DuplicateResourceException(
                    "This user is already an active member of the workspace");
        }

        // Guard 3: Can't send duplicate PENDING invitation
        // DECLINED, CANCELLED, ACCEPTED are all fine — allow re-invite
        boolean hasPendingInvitation = invitationRepository
                .findByWorkspaceIdAndInvitedUserIdAndStatus(
                        workspaceId, invitedUser.getId(), InvitationStatus.PENDING)
                .isPresent();

        if (hasPendingInvitation) {
            throw new DuplicateResourceException(
                    "A pending invitation already exists for this user. " +
                            "Cancel it first before sending a new one.");
        }

        User invitedBy = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkspaceInvitation invitation = new WorkspaceInvitation();
        invitation.setWorkspace(workspace);
        invitation.setInvitedUser(invitedUser);
        invitation.setInvitedBy(invitedBy);
        invitation.setStatus(InvitationStatus.PENDING);

        return invitationMapper.toResponse(invitationRepository.save(invitation));
    }
    // Admin views all invitations sent in their workspace
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    public List<InvitationResponse> getWorkspaceInvitations(String workspaceId,
                                                            Authentication authentication) {
        return invitationRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(invitationMapper::toResponse)
                .toList();
    }

    // Admin cancels a pending invitation
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public InvitationResponse cancelInvitation(String workspaceId,
                                               String invitationId,
                                               Authentication authentication) {
        WorkspaceInvitation invitation = invitationRepository
                .findByIdAndWorkspaceId(invitationId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invitation not found: " + invitationId));

        // Only PENDING invitations can be cancelled.
        // This enforces our state machine — once an invitation
        // is ACCEPTED/DECLINED it's a done deal.
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidStatusTransitionException(
                    "Only PENDING invitations can be cancelled. Current status: "
                            + invitation.getStatus());
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitation.setRespondedAt(Instant.now());
        return invitationMapper.toResponse(invitationRepository.save(invitation));
    }

    // User views their own pending invitations — their inbox.
    // No @PreAuthorize needed — the query is scoped to the
    // calling user's own invitations.
    public List<InvitationResponse> getMyPendingInvitations(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return invitationRepository
                .findByInvitedUserIdAndStatus(principal.getUserId(), InvitationStatus.PENDING)
                .stream()
                .map(invitationMapper::toResponse)
                .toList();
    }

    // User accepts or declines an invitation.
    // @Transactional because accepting creates a WorkspaceMember
    // AND updates the invitation — both must succeed or both fail.
    @Transactional
    public InvitationResponse respondToInvitation(String invitationId,
                                                  boolean accept,
                                                  Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        WorkspaceInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invitation not found: " + invitationId));

        // Security check: the invitation must belong to the caller.
        // Without this, any authenticated user could accept
        // someone else's invitation.
        if (!invitation.getInvitedUser().getId().equals(principal.getUserId())) {
            throw new WorkspaceAccessDeniedException(
                    "This invitation does not belong to you");
        }

        // State machine: only PENDING invitations can be responded to
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidStatusTransitionException(
                    "This invitation is no longer pending. Current status: "
                            + invitation.getStatus());
        }

        if (accept) {
            // Create the WorkspaceMember record — user is now ACTIVE
            WorkspaceMember member = new WorkspaceMember();
            member.setWorkspace(invitation.getWorkspace());
            member.setUser(invitation.getInvitedUser());
            member.setRole(WorkspaceRole.MEMBER); // invitations always create MEMBERs
            member.setStatus(MemberStatus.ACTIVE);
            memberRepository.save(member);

            invitation.setStatus(InvitationStatus.ACCEPTED);
        } else {
            invitation.setStatus(InvitationStatus.DECLINED);
        }

        invitation.setRespondedAt(Instant.now());
        return invitationMapper.toResponse(invitationRepository.save(invitation));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    public Page<InvitationResponse> listInvitations(String workspaceId,
                                                    int page, int size,
                                                    Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return invitationRepository
                .findByWorkspaceId(workspaceId, pageable)
                .map(invitationMapper::toResponse);
    }
}