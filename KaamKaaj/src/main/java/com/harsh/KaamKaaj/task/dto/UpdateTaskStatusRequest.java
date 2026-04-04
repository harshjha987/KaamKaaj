package com.harsh.KaamKaaj.task.dto;

import com.harsh.KaamKaaj.task.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Separate DTO for status updates — only users can call the
// endpoint that accepts this. Keeping it separate from
// UpdateTaskRequest makes the separation of concerns explicit
// at the API level, not just in the service.
@Getter
@Setter
public class UpdateTaskStatusRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}