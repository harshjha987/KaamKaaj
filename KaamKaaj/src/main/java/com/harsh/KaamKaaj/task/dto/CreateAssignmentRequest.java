package com.harsh.KaamKaaj.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAssignmentRequest {

    @NotBlank(message = "Assignee user ID is required")
    private String assigneeId;
}