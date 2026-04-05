package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("workspaceAuthz")
public class WorkspaceAuthorizationService {

    private final WorkspaceMemberRepository memberRepository;

    public WorkspaceAuthorizationService(WorkspaceMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // Is the caller an ACTIVE member of this workspace?
    public boolean isMember(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(wm -> wm.getStatus() == MemberStatus.ACTIVE)
                .orElse(false);
    }

    // Is the caller an ACTIVE ADMIN of this workspace?
    public boolean isAdmin(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(wm -> wm.getStatus() == MemberStatus.ACTIVE
                        && wm.getRole() == WorkspaceRole.ADMIN)
                .orElse(false);
    }

    // -------------------------------------------------------
    // NEW: Is the caller the same person as the target userId?
    //
    // Used for the "leave workspace" endpoint so a member can
    // remove themselves without needing admin rights.
    //
    // Example usage in @PreAuthorize:
    //   @PreAuthorize(
    //     "@workspaceAuthz.isAdmin(#workspaceId, authentication) " +
    //     "|| @workspaceAuthz.isSelf(#userId, authentication)"
    //   )
    //
    // The || short-circuits — if isAdmin() returns true,
    // isSelf() is never even evaluated (no extra DB call).
    // -------------------------------------------------------
    public boolean isSelf(String userId, Authentication authentication) {
        return extractUserId(authentication).equals(userId);
    }

    // Get the WorkspaceMember record or throw 403.
    // Used in service methods that need both the check
    // AND the member details.
    public WorkspaceMember getMemberOrThrow(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(wm -> wm.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new com.harsh.KaamKaaj.exception
                        .WorkspaceAccessDeniedException(
                        "You are not an active member of this workspace"));
    }

    private String extractUserId(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }
}