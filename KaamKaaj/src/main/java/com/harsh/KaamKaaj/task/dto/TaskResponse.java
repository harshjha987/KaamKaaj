package com.harsh.KaamKaaj.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private String id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private String workspaceId;
    private String createdByUsername;
    private Instant createdAt;
    private Instant updatedAt;

    // Username of the member this task is currently assigned to.
    // Null if the task has no active assignment (PENDING or ACCEPTED).
    // Populated by TaskMapper from the latest non-cancelled, non-declined assignment.
    private String assignedToUsername;
}