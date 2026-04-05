package com.harsh.KaamKaaj.workspace.dto;

import com.harsh.KaamKaaj.workspace.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeRoleRequest {

    // NotNull rather than NotBlank because this is an enum,
    // not a String. Jackson deserializes "ADMIN" / "MEMBER"
    // directly into WorkspaceRole. If the value doesn't match
    // a valid enum constant, Jackson throws a 400 automatically
    // before our validation even runs.
    @NotNull(message = "Role is required")
    private WorkspaceRole role;
}