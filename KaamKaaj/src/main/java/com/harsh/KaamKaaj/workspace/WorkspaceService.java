package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
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

    // @Transactional means both the workspace save AND the
    // member save happen in one DB transaction. If the member
    // save fails, the workspace insert is rolled back too.
    // You never end up with a workspace that has no admin.
    @Transactional
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request,
                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User creator = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Workspace workspace = workspaceMapper.toEntity(request, creator);
        Workspace saved = workspaceRepository.save(workspace);

        // The creator automatically becomes an ACTIVE ADMIN.
        // This is the only way to be an ADMIN — when you create
        // the workspace. Invitations always create MEMBERs.
        WorkspaceMember creatorMembership = new WorkspaceMember();
        creatorMembership.setWorkspace(saved);
        creatorMembership.setUser(creator);
        creatorMembership.setRole(WorkspaceRole.ADMIN);
        creatorMembership.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(creatorMembership);

        return workspaceMapper.toResponse(saved);
    }

    // Lists all workspaces the calling user is an active member of.
    // No @PreAuthorize needed — the query is already scoped to
    // the authenticated user's own workspaces.
    public List<WorkspaceResponse> getMyWorkspaces(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return workspaceRepository
                .findActiveWorkspacesByUserId(principal.getUserId())
                .stream()
                .map(workspaceMapper::toResponse)
                .toList();
    }

    // -------------------------------------------------------
    // @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    //
    // Breaking this down:
    //   @workspaceAuthz → the bean named "workspaceAuthz"
    //                     (WorkspaceAuthorizationService)
    //   #workspaceId    → the value of the method parameter
    //                     with that exact name
    //   authentication  → Spring injects the current Security
    //                     context's Authentication automatically
    //
    // This runs BEFORE the method body. If the user is not a
    // member of the workspace, Spring throws AccessDeniedException
    // → 403. The method body never executes.
    // -------------------------------------------------------
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public WorkspaceResponse getWorkspaceById(String workspaceId, Authentication authentication) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));
        return workspaceMapper.toResponse(workspace);
    }
}