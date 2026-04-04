package com.harsh.KaamKaaj.task.mapper;

import com.harsh.KaamKaaj.task.Task;
import com.harsh.KaamKaaj.task.TaskAssignment;
import com.harsh.KaamKaaj.task.dto.AssignmentResponse;
import com.harsh.KaamKaaj.task.dto.TaskResponse;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getWorkspace().getId(),
                task.getCreatedBy().getUsername(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public AssignmentResponse toAssignmentResponse(TaskAssignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getTask().getId(),
                assignment.getTask().getTitle(),
                assignment.getAssignee().getId(),
                assignment.getAssignee().getUsername(),
                assignment.getAssignedBy().getUsername(),
                assignment.getStatus(),
                assignment.getRequestedAt(),
                assignment.getRespondedAt()
        );
    }
}