package com.harsh.KaamKaaj.task.dto;

import com.harsh.KaamKaaj.task.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private String id;
    private String taskId;
    private String taskTitle;
    private String assigneeId;
    private String assigneeUsername;
    private String assignedByUsername;
    private AssignmentStatus status;
    private Instant requestedAt;
    private Instant respondedAt;
}