package com.harsh.KaamKaaj.task.mapper;

import com.harsh.KaamKaaj.task.AssignmentStatus;
import com.harsh.KaamKaaj.task.Task;
import com.harsh.KaamKaaj.task.TaskAssignment;
import com.harsh.KaamKaaj.task.dto.AssignmentResponse;
import com.harsh.KaamKaaj.task.dto.TaskResponse;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        // Find the most recent PENDING or ACCEPTED assignment
        // to show who the task is currently assigned to
        String assignedToUsername = null;

        if (task.getAssignments() != null && !task.getAssignments().isEmpty()) {
            assignedToUsername = task.getAssignments().stream()
                    .filter(a -> a.getStatus() == AssignmentStatus.PENDING
                            || a.getStatus() == AssignmentStatus.ACCEPTED)
                    .max(Comparator.comparing(TaskAssignment::getRequestedAt))
                    .map(a -> a.getAssignee().getUsername())
                    .orElse(null);
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