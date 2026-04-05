package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.workspace.dto.ChangeRoleRequest;
import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
import com.harsh.KaamKaaj.workspace.dto.MemberResponse;
import com.harsh.KaamKaaj.workspace.dto.WorkspaceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Workspaces", description = "Create and manage workspaces and their members")
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    // ── Existing endpoints (all unchanged) ───────────────────

    @Operation(summary = "Create a workspace",
            description = "Any authenticated user can create a workspace. " +
                    "Creator automatically becomes ADMIN.")
    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workspaceService.createWorkspace(request, authentication));
    }

    @Operation(summary = "List my workspaces")
    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(
            Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(authentication));
    }

    @Operation(summary = "Get workspace by ID",
            description = "Caller must be an active member.")
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(
                workspaceService.getWorkspaceById(workspaceId, authentication));
    }

    @Operation(summary = "List workspace members", description = "ADMIN only.")
    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(
                workspaceService.getWorkspaceMembers(workspaceId, authentication));
    }

    @Operation(summary = "Get my membership",
            description = "Returns your own role and status in this workspace.")
    @GetMapping("/{workspaceId}/members/me")
    public ResponseEntity<MemberResponse> getMyMembership(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(
                workspaceService.getMyMembership(workspaceId, authentication));
    }

    @Operation(summary = "Remove a member",
            description = "ADMIN can remove any non-admin member. " +
                    "Any member can remove themselves (leave). " +
                    "Last admin cannot leave.")
    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String workspaceId,
            @PathVariable String userId,
            Authentication authentication) {
        workspaceService.removeMember(workspaceId, userId, authentication);
        return ResponseEntity.noContent().build();
    }

    // ── NEW endpoint ──────────────────────────────────────────

    @Operation(
            summary = "Change member role",
            description = """
            ADMIN only. Promote a MEMBER to ADMIN or demote an ADMIN to MEMBER.
            
            Rules:
            - Cannot change a role to what it already is (400)
            - Cannot demote the last admin of a workspace (403)
            - Only ADMINs can call this endpoint (403 for members)
            
            Body: { "role": "ADMIN" } or { "role": "MEMBER" }
            """
    )
    @PatchMapping("/{workspaceId}/members/{userId}/role")
    public ResponseEntity<MemberResponse> changeMemberRole(
            @PathVariable String workspaceId,
            @PathVariable String userId,
            @Valid @RequestBody ChangeRoleRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                workspaceService.changeMemberRole(workspaceId, userId, request, authentication));
    }
}