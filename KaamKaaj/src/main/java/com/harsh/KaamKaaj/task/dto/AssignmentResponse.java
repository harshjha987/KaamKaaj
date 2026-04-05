package com.harsh.KaamKaaj.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {

    private String id;
    private String taskId;
    private String taskTitle;
    private String workspaceId;

    private String assigneeId;
    private String assigneeUsername;
    private String assignedByUsername;

    private String status;

    private Instant requestedAt;
    private Instant respondedAt;
}