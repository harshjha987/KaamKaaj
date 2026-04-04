package com.harsh.KaamKaaj.invitation;

import com.harsh.KaamKaaj.invitation.dto.InvitationResponse;
import com.harsh.KaamKaaj.invitation.dto.SendInvitationRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    // ── Admin endpoints (workspace-scoped) ──────────────────

    // POST /api/v1/workspaces/{workspaceId}/invitations
    @PostMapping("/api/v1/workspaces/{workspaceId}/invitations")
    public ResponseEntity<InvitationResponse> sendInvitation(
            @PathVariable String workspaceId,
            @Valid @RequestBody SendInvitationRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.sendInvitation(workspaceId, request, authentication));
    }

    // GET /api/v1/workspaces/{workspaceId}/invitations
    @GetMapping("/api/v1/workspaces/{workspaceId}/invitations")
    public ResponseEntity<List<InvitationResponse>> getWorkspaceInvitations(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.getWorkspaceInvitations(workspaceId, authentication));
    }

    // DELETE /api/v1/workspaces/{workspaceId}/invitations/{invitationId}
    @DeleteMapping("/api/v1/workspaces/{workspaceId}/invitations/{invitationId}")
    public ResponseEntity<InvitationResponse> cancelInvitation(
            @PathVariable String workspaceId,
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.cancelInvitation(workspaceId, invitationId, authentication));
    }

    // ── User inbox endpoints ─────────────────────────────────

    // GET /api/v1/me/invitations
    @GetMapping("/api/v1/me/invitations")
    public ResponseEntity<List<InvitationResponse>> getMyInvitations(
            Authentication authentication) {
        return ResponseEntity.ok(invitationService.getMyPendingInvitations(authentication));
    }

    // POST /api/v1/me/invitations/{invitationId}/accept
    @PostMapping("/api/v1/me/invitations/{invitationId}/accept")
    public ResponseEntity<InvitationResponse> acceptInvitation(
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.respondToInvitation(invitationId, true, authentication));
    }

    // POST /api/v1/me/invitations/{invitationId}/decline
    @PostMapping("/api/v1/me/invitations/{invitationId}/decline")
    public ResponseEntity<InvitationResponse> declineInvitation(
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.respondToInvitation(invitationId, false, authentication));
    }
}