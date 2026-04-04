package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

// This service is the brain of workspace-level authorization.
//
// WHY A SEPARATE SERVICE FOR THIS?
//
// You might think: "just put the membership check inside
// WorkspaceService". But authorization logic and business
// logic should be separate. Here's why:
//
//   1. @PreAuthorize on WorkspaceService methods references
//      this bean by name: @PreAuthorize("@workspaceAuthz.isMember(...)")
//      If the check lived inside WorkspaceService itself,
//      you'd have a self-reference which breaks Spring's AOP proxy.
//
//   2. Many services need the same check — TaskService,
//      AssignmentService, InvitationService all need to verify
//      workspace membership. One service, used everywhere.
//
//   3. Easy to test in isolation — you can unit test these
//      authorization rules without loading the full context.
//
// HOW @PreAuthorize WORKS WITH THIS BEAN:
//
//   @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
//
//   @workspaceAuthz → Spring looks up the bean named "workspaceAuthz"
//                     (Spring bean names are camelCase of class name)
//   #workspaceId    → the value of the method parameter named workspaceId
//   authentication  → Spring Security injects the current Authentication
//                     object automatically — no need to pass it yourself
//
//   Spring evaluates this SpEL (Spring Expression Language) expression
//   BEFORE the method body runs. If it returns false, Spring throws
//   AccessDeniedException (→ 403) and the method never executes.

@Service("workspaceAuthz")  // explicit bean name used in @PreAuthorize
public class WorkspaceAuthorizationService {

    private final WorkspaceMemberRepository memberRepository;

    public WorkspaceAuthorizationService(WorkspaceMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // Returns true if the authenticated user is an ACTIVE
    // member of the workspace (any role — ADMIN or MEMBER).
    public boolean isMember(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(wm -> wm.getStatus() == MemberStatus.ACTIVE)
                .orElse(false);
    }

    // Returns true only if the user is an ACTIVE ADMIN of
    // the workspace. Used for admin-only operations like
    // creating tasks and managing invitations.
    public boolean isAdmin(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(wm -> wm.getStatus() == MemberStatus.ACTIVE
                        && wm.getRole() == WorkspaceRole.ADMIN)
                .orElse(false);
    }

    // Convenience: get the WorkspaceMember record itself.
    // Used in service methods that need both the check AND
    // the member details (e.g., to get the member's role).
    public WorkspaceMember getMemberOrThrow(String workspaceId, Authentication authentication) {
        String userId = extractUserId(authentication);
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(wm -> wm.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new com.harsh.KaamKaaj.exception
                        .WorkspaceAccessDeniedException(
                        "You are not an active member of this workspace"));
    }

    // Extract userId from the Authentication object.
    // The principal is the UserPrincipal we placed in the
    // SecurityContext inside JwtFilter. Casting is safe
    // because we control what goes in there.
    private String extractUserId(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }
}