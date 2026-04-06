package com.harsh.KaamKaaj.invitation;

import com.harsh.KaamKaaj.invitation.dto.InvitationResponse;
import com.harsh.KaamKaaj.invitation.dto.SendInvitationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Invitations", description = "Send and manage workspace invitations")
@RestController
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @Operation(summary = "Send invitation",
            description = "ADMIN sends a workspace invitation to a registered user.")
    @PostMapping("/api/v1/workspaces/{workspaceId}/invitations")
    public ResponseEntity<InvitationResponse> sendInvitation(
            @PathVariable String workspaceId,
            @Valid @RequestBody SendInvitationRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.sendInvitation(workspaceId, request, authentication));
    }

    @Operation(summary = "List workspace invitations",
            description = "ADMIN views all invitations sent in their workspace.")
    @GetMapping("/api/v1/workspaces/{workspaceId}/invitations")
    public ResponseEntity<List<InvitationResponse>> getWorkspaceInvitations(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.getWorkspaceInvitations(workspaceId, authentication));
    }

    @Operation(summary = "Cancel invitation",
            description = "ADMIN cancels a pending invitation before the user responds.")
    @DeleteMapping("/api/v1/workspaces/{workspaceId}/invitations/{invitationId}")
    public ResponseEntity<InvitationResponse> cancelInvitation(
            @PathVariable String workspaceId,
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.cancelInvitation(workspaceId, invitationId, authentication));
    }

    @Operation(summary = "My pending invitations",
            description = "User views all pending workspace invitations addressed to them.")
    @GetMapping("/api/v1/me/invitations")
    public ResponseEntity<List<InvitationResponse>> getMyInvitations(
            Authentication authentication) {
        return ResponseEntity.ok(invitationService.getMyPendingInvitations(authentication));
    }

    @Operation(summary = "Accept invitation",
            description = "User accepts a pending invitation. " +
                    "Creates an active WorkspaceMember record.")
    @PostMapping("/api/v1/me/invitations/{invitationId}/accept")
    public ResponseEntity<InvitationResponse> acceptInvitation(
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.respondToInvitation(invitationId, true, authentication));
    }

    @Operation(summary = "Decline invitation",
            description = "User declines a pending invitation.")
    @PostMapping("/api/v1/me/invitations/{invitationId}/decline")
    public ResponseEntity<InvitationResponse> declineInvitation(
            @PathVariable String invitationId,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.respondToInvitation(invitationId, false, authentication));
    }

    @GetMapping
    public ResponseEntity<Page<InvitationResponse>> listInvitations(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        return ResponseEntity.ok(
                invitationService.listInvitations(workspaceId, page, size, authentication)
        );
    }
}