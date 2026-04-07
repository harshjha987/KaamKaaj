package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.exception.DuplicateResourceException;
import com.harsh.KaamKaaj.exception.InvalidStatusTransitionException;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.exception.WorkspaceAccessDeniedException;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.dto.*;
import com.harsh.KaamKaaj.workspace.mapper.WorkspaceMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepo userRepo;
    private final WorkspaceMapper workspaceMapper;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository memberRepository,
                            UserRepo userRepo,
                            WorkspaceMapper workspaceMapper) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepo = userRepo;
        this.workspaceMapper = workspaceMapper;
    }

    // ── Existing methods (all unchanged) ─────────────────────

    @Transactional
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request,
                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User creator = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = workspaceMapper.toEntity(request, creator);
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember creatorMembership = new WorkspaceMember();
        creatorMembership.setWorkspace(saved);
        creatorMembership.setUser(creator);
        creatorMembership.setRole(WorkspaceRole.ADMIN);
        creatorMembership.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(creatorMembership);

        return workspaceMapper.toResponse(saved);
    }

    public List<WorkspaceResponse> getMyWorkspaces(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return workspaceRepository
                .findActiveWorkspacesByUserId(principal.getUserId())
                .stream()
                .map(workspaceMapper::toResponse)
                .toList();
    }

    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public WorkspaceResponse getWorkspaceById(String workspaceId,
                                              Authentication authentication) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));
        return workspaceMapper.toResponse(workspace);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public Page<MemberResponse> getWorkspaceMembers(String workspaceId,
                                                    int page, int size,
                                                    Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").ascending());
        return memberRepository
                .findByWorkspaceIdAndStatus(workspaceId, MemberStatus.ACTIVE, pageable)
                .map(workspaceMapper::toMemberResponse);
    }

    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public MemberResponse getMyMembership(String workspaceId,
                                          Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        WorkspaceMember member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        return workspaceMapper.toMemberResponse(member);
    }

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication) " +
            "|| @workspaceAuthz.isSelf(#userId, authentication)")
    @Transactional
    public void removeMember(String workspaceId,
                             String userId,
                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        WorkspaceMember targetMember = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active member not found in this workspace"));

        boolean callerIsAdmin = !principal.getUserId().equals(userId)
                && memberRepository.findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .map(m -> m.getRole() == WorkspaceRole.ADMIN)
                .orElse(false);

        if (callerIsAdmin && targetMember.getRole() == WorkspaceRole.ADMIN) {
            throw new WorkspaceAccessDeniedException(
                    "Admins cannot remove other admins. " +
                            "The target admin must leave voluntarily.");
        }

        if (targetMember.getRole() == WorkspaceRole.ADMIN) {
            long adminCount = memberRepository.countByWorkspaceIdAndRoleAndStatus(
                    workspaceId, WorkspaceRole.ADMIN, MemberStatus.ACTIVE);
            if (adminCount <= 1) {
                throw new WorkspaceAccessDeniedException(
                        "Cannot remove the last admin of a workspace. " +
                                "Promote another member to admin first.");
            }
        }

        memberRepository.delete(targetMember);
    }

    // ── NEW: Change member role ───────────────────────────────

    // Only ADMINs can change roles — @PreAuthorize enforces this.
    // The business rules inside handle the edge cases that
    // @PreAuthorize can't express (last admin, no-op, etc.)
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public MemberResponse changeMemberRole(String workspaceId,
                                           String userId,
                                           ChangeRoleRequest request,
                                           Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Fetch the target member — must be active in this workspace
        WorkspaceMember targetMember = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active member not found in this workspace"));

        // -------------------------------------------------------
        // Edge case 1: No-op check
        // If the target member already has the requested role,
        // return 400 instead of silently doing nothing.
        // Silent no-ops confuse API clients — they don't know
        // if the operation succeeded or was ignored.
        // -------------------------------------------------------
        if (targetMember.getRole() == request.getRole()) {
            throw new DuplicateResourceException(
                    "Member already has the role: " + request.getRole());
        }

        // -------------------------------------------------------
        // Edge case 2: Last admin demotion protection
        // An admin demoting themselves OR another admin to MEMBER
        // must not leave the workspace with zero admins.
        //
        // We check this only when the requested role is MEMBER
        // (i.e., a demotion is being requested).
        // -------------------------------------------------------
        if (request.getRole() == WorkspaceRole.MEMBER
                && targetMember.getRole() == WorkspaceRole.ADMIN) {

            long adminCount = memberRepository.countByWorkspaceIdAndRoleAndStatus(
                    workspaceId, WorkspaceRole.ADMIN, MemberStatus.ACTIVE);

            if (adminCount <= 1) {
                throw new WorkspaceAccessDeniedException(
                        "Cannot demote the last admin of a workspace. " +
                                "Promote another member to admin first.");
            }
        }

        // All checks passed — apply the role change
        targetMember.setRole(request.getRole());
        WorkspaceMember saved = memberRepository.save(targetMember);

        return workspaceMapper.toMemberResponse(saved);
    }

    // ── Delete workspace ──────────────────────────────────────
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public void deleteWorkspace(String workspaceId, Authentication authentication) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        // Deleting the workspace cascades to:
        // members, invitations, tasks, assignments, messages
        // Make sure your entities have CascadeType.ALL or orphanRemoval
        // on the workspace side, or use repository deletes here.
        workspaceRepository.delete(workspace);
    }

    // ── Update workspace ──────────────────────────────────────
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public WorkspaceResponse updateWorkspace(String workspaceId,
                                             UpdateWorkspaceRequest request,
                                             Authentication authentication) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        workspace.setName(request.getName().trim());
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription().trim());
        }

        return workspaceMapper.toResponse(workspaceRepository.save(workspace));
    }

    // ── Leave workspace ───────────────────────────────────────
    @Transactional
    public void leaveWorkspace(String workspaceId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        WorkspaceMember member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "You are not a member of this workspace"));

        // Admins cannot leave if they are the last admin.
        // They must promote someone else first.
        if (member.getRole() == WorkspaceRole.ADMIN) {
            long adminCount = memberRepository
                    .findByWorkspaceIdAndStatus(workspaceId, MemberStatus.ACTIVE)
                    .stream()
                    .filter(m -> m.getRole() == WorkspaceRole.ADMIN)
                    .count();

            if (adminCount <= 1) {
                throw new InvalidStatusTransitionException(
                        "You are the only admin. Promote another member to admin before leaving.");
            }
        }

        memberRepository.delete(member);
    }
}