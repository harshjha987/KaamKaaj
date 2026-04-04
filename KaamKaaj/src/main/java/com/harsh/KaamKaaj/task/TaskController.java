package com.harsh.KaamKaaj.task;

import com.harsh.KaamKaaj.task.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ── Admin: Task CRUD ──────────────────────────────────────

    @PostMapping("/api/v1/workspaces/{workspaceId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable String workspaceId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(workspaceId, request, authentication));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks")
    public ResponseEntity<List<TaskResponse>> getWorkspaceTasks(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getWorkspaceTasks(workspaceId, authentication));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskById(workspaceId, taskId, authentication));
    }

    @PutMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.updateTask(workspaceId, taskId, request, authentication));
    }

    @DeleteMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        taskService.deleteTask(workspaceId, taskId, authentication);
        return ResponseEntity.noContent().build();
    }

    // ── Admin: Assignment management ──────────────────────────

    @PostMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createAssignment(workspaceId, taskId, request, authentication));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentHistory(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.getTaskAssignmentHistory(workspaceId, taskId, authentication));
    }

    @DeleteMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> cancelAssignment(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.cancelAssignment(workspaceId, taskId, assignmentId, authentication));
    }

    // ── User: My tasks and inbox ──────────────────────────────

    @GetMapping("/api/v1/me/assignments")
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getMyPendingAssignments(authentication));
    }

    @PostMapping("/api/v1/me/assignments/{assignmentId}/accept")
    public ResponseEntity<AssignmentResponse> acceptAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.respondToAssignment(assignmentId, true, authentication));
    }

    @PostMapping("/api/v1/me/assignments/{assignmentId}/decline")
    public ResponseEntity<AssignmentResponse> declineAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.respondToAssignment(assignmentId, false, authentication));
    }

    @GetMapping("/api/v1/workspaces/{workspaceId}/me/tasks")
    public ResponseEntity<List<TaskResponse>> getMyAcceptedTasks(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getMyAcceptedTasks(workspaceId, authentication));
    }

    @PatchMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.updateTaskStatus(workspaceId, taskId, request, authentication));
    }
}