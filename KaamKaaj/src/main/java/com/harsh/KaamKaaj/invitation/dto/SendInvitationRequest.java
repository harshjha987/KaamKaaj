package com.harsh.KaamKaaj.invitation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendInvitationRequest {

    // Admin provides the userId of the person to invite.
    // We use userId (not email) because the admin finds the
    // user through the global search endpoint which returns
    // userId. This avoids a second lookup by email.
    @NotBlank(message = "Invited user ID is required")
    private String invitedUserId;
}