package com.harsh.KaamKaaj.invitation.mapper;

import com.harsh.KaamKaaj.invitation.WorkspaceInvitation;
import com.harsh.KaamKaaj.invitation.dto.InvitationResponse;
import org.springframework.stereotype.Component;

@Component
public class InvitationMapper {

    public InvitationResponse toResponse(WorkspaceInvitation invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getWorkspace().getId(),
                invitation.getWorkspace().getName(),
                invitation.getInvitedUser().getId(),
                invitation.getInvitedUser().getEmail(),
                invitation.getInvitedUser().getUsername(),
                invitation.getInvitedBy().getUsername(),
                invitation.getStatus(),
                invitation.getCreatedAt(),
                invitation.getRespondedAt()
        );
    }
}