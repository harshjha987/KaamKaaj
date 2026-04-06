package com.harsh.KaamKaaj.task.mapper;

import com.harsh.KaamKaaj.task.AssignmentStatus;
import com.harsh.KaamKaaj.task.Task;
import com.harsh.KaamKaaj.task.TaskAssignment;
import com.harsh.KaamKaaj.task.TaskStatus;
import com.harsh.KaamKaaj.task.dto.AssignmentResponse;
import com.harsh.KaamKaaj.task.dto.TaskResponse;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        List<TaskAssignment> assignments = task.getAssignments();

        String assignedToUsername    = null;
        String lastAssignmentStatus  = null;
        String completedByUsername   = null;

        if (assignments != null && !assignments.isEmpty()) {

            // Most recent assignment overall — used to get lastAssignmentStatus
            Optional<TaskAssignment> latest = assignments.stream()
                    .max(Comparator.comparing(TaskAssignment::getRequestedAt));

            latest.ifPresent(a -> {
                // intentionally left blank — handled below with named vars
            });

            TaskAssignment latestAssignment = assignments.stream()
                    .max(Comparator.comparing(TaskAssignment::getRequestedAt))
                    .orElse(null);

            if (latestAssignment != null) {
                lastAssignmentStatus = latestAssignment.getStatus().name();
            }

            // Current active assignee — PENDING or ACCEPTED
            assignedToUsername = assignments.stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.PENDING
                            || a.getStatus() == AssignmentStatus.ACCEPTED)
                    .max(Comparator.comparing(TaskAssignment::getRequestedAt))
                    .map(a -> a.getAssignee().getUsername())
                    .orElse(null);

            // Completed by — only relevant when task is COMPLETED
            // Find the ACCEPTED assignment — that person completed it
            if (task.getStatus() == TaskStatus.COMPLETED) {
                completedByUsername = assignments.stream()
                        .filter(a -> a.getStatus() == AssignmentStatus.ACCEPTED)
                        .max(Comparator.comparing(TaskAssignment::getRequestedAt))
                        .map(a -> a.getAssignee().getUsername())
                        .orElse(null);
            }
        }

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .dueDate(task.getDueDate())
                .workspaceId(task.getWorkspace().getId())
                .createdByUsername(task.getCreatedBy().getUsername())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .assignedToUsername(assignedToUsername)
                .lastAssignmentStatus(lastAssignmentStatus)
                .completedByUsername(completedByUsername)
                .build();
    }

    public AssignmentResponse toAssignmentResponse(TaskAssignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .taskId(assignment.getTask().getId())
                .taskTitle(assignment.getTask().getTitle())
                .workspaceId(assignment.getTask().getWorkspace().getId())
                .assigneeId(assignment.getAssignee().getId())
                .assigneeUsername(assignment.getAssignee().getUsername())
                .assignedByUsername(assignment.getAssignedBy().getUsername())
                .status(assignment.getStatus().name())
                .requestedAt(assignment.getRequestedAt())
                .respondedAt(assignment.getRespondedAt())
                .build();
    }
}