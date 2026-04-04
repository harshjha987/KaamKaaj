package com.harsh.KaamKaaj.task.dto;

import com.harsh.KaamKaaj.task.TaskPriority;
import com.harsh.KaamKaaj.task.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private String workspaceId;
    private String createdByUsername;
    private Instant createdAt;
    private Instant updatedAt;
}