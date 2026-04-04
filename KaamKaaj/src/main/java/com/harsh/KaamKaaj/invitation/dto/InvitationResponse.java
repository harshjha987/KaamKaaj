package com.harsh.KaamKaaj.invitation.dto;

import com.harsh.KaamKaaj.invitation.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    private String id;
    private String workspaceId;
    private String workspaceName;

    // Minimal user info — never expose membership in other
    // workspaces or any other sensitive details
    private String invitedUserId;
    private String invitedUserEmail;
    private String invitedUsername;

    private String invitedByUsername;
    private InvitationStatus status;
    private Instant createdAt;
    private Instant respondedAt;
}