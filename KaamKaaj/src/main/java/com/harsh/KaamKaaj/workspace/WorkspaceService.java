package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.exception.WorkspaceAccessDeniedException;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
import com.harsh.KaamKaaj.workspace.dto.MemberResponse;
import com.harsh.KaamKaaj.workspace.dto.WorkspaceResponse;
import com.harsh.KaamKaaj.workspace.mapper.WorkspaceMapper;
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

    // ── Existing methods (unchanged) ─────────────────────────

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

    // ── NEW: Member management methods ───────────────────────

    // List all active members — admin only.
    // Members shouldn't be able to enumerate all other members
    // for privacy reasons. Only admins manage the roster.
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    public List<MemberResponse> getWorkspaceMembers(String workspaceId,
                                                    Authentication authentication) {
        return memberRepository
                .findByWorkspaceIdAndStatus(workspaceId, MemberStatus.ACTIVE)
                .stream()
                .map(workspaceMapper::toMemberResponse)
                .toList();
    }

    // Get the calling user's own membership details.
    // Any active member can call this — useful for the frontend
    // to know "am I an admin or member in this workspace?"
    // without fetching the full member list.
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public MemberResponse getMyMembership(String workspaceId,
                                          Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        WorkspaceMember member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membership not found"));
        return workspaceMapper.toMemberResponse(member);
    }

    // -------------------------------------------------------
    // Remove a member from the workspace.
    //
    // @PreAuthorize allows this if EITHER:
    //   - the caller is an admin of the workspace (removing someone)
    //   - the caller is the same person as userId (leaving)
    //
    // The service layer then applies additional business rules
    // that @PreAuthorize can't express:
    //   - Can't remove the last admin (workspace becomes orphaned)
    //   - An admin can't remove another admin (only themselves)
    // -------------------------------------------------------
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

        // -------------------------------------------------------
        // Business rule 1:
        // An admin cannot remove another admin.
        // To remove an admin, they must first be demoted to MEMBER.
        // (We'll add a "change role" endpoint if needed later.)
        // This prevents admins from sabotaging each other.
        // -------------------------------------------------------
        if (callerIsAdmin && targetMember.getRole() == WorkspaceRole.ADMIN) {
            throw new WorkspaceAccessDeniedException(
                    "Admins cannot remove other admins. " +
                            "The target admin must leave voluntarily.");
        }

        // -------------------------------------------------------
        // Business rule 2:
        // Can't remove the last admin.
        // If only 1 admin exists and they try to leave, block it.
        // The workspace would have no one to manage it.
        // -------------------------------------------------------
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
}