package com.harsh.KaamKaaj.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkspaceRequest {

    @NotBlank(message = "Workspace name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}