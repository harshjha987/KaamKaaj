package com.harsh.KaamKaaj.task;

import com.harsh.KaamKaaj.task.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Tasks", description = "Task creation, management, assignment, and status updates")
@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ── Admin: Task CRUD ──────────────────────────────────────

    @Operation(summary = "Create task", description = "ADMIN only.")
    @PostMapping("/api/v1/workspaces/{workspaceId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable String workspaceId,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(workspaceId, request, authentication));
    }

    @Operation(summary = "List workspace tasks",
            description = "ADMIN only. Returns all tasks in the workspace.")
    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks")
    public ResponseEntity<List<TaskResponse>> getWorkspaceTasks(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getWorkspaceTasks(workspaceId, authentication));
    }

    @Operation(summary = "Get task by ID",
            description = "ADMIN sees any task. MEMBER sees only their accepted tasks.")
    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getTaskById(workspaceId, taskId, authentication));
    }

    @Operation(summary = "Update task",
            description = "ADMIN only. Update title, description, priority, or due date. " +
                    "Status cannot be changed here — use PATCH /status.")
    @PutMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.updateTask(workspaceId, taskId, request, authentication));
    }

    @Operation(summary = "Delete task", description = "ADMIN only.")
    @DeleteMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        taskService.deleteTask(workspaceId, taskId, authentication);
        return ResponseEntity.noContent().build();
    }

    // ── Admin: Assignment management ──────────────────────────

    @Operation(summary = "Assign task",
            description = "ADMIN sends an assignment request to a workspace member.")
    @PostMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createAssignment(workspaceId, taskId, request, authentication));
    }

    @Operation(summary = "Assignment history",
            description = "ADMIN views the full assignment history for a task.")
    @GetMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentHistory(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.getTaskAssignmentHistory(workspaceId, taskId, authentication));
    }

    @Operation(summary = "Cancel assignment",
            description = "ADMIN cancels a pending assignment request.")
    @DeleteMapping("/api/v1/workspaces/{workspaceId}/tasks/{taskId}/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> cancelAssignment(
            @PathVariable String workspaceId,
            @PathVariable String taskId,
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.cancelAssignment(workspaceId, taskId, assignmentId, authentication));
    }

    // ── User: Inbox and task management ──────────────────────

    @Operation(summary = "My pending assignments",
            description = "User views all pending assignment requests in their inbox.")
    @GetMapping("/api/v1/me/assignments")
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getMyPendingAssignments(authentication));
    }

    @Operation(summary = "Accept assignment",
            description = "User accepts a pending assignment. " +
                    "Task now appears in their active tasks.")
    @PostMapping("/api/v1/me/assignments/{assignmentId}/accept")
    public ResponseEntity<AssignmentResponse> acceptAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.respondToAssignment(assignmentId, true, authentication));
    }

    @Operation(summary = "Decline assignment",
            description = "User declines a pending assignment.")
    @PostMapping("/api/v1/me/assignments/{assignmentId}/decline")
    public ResponseEntity<AssignmentResponse> declineAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        return ResponseEntity.ok(
                taskService.respondToAssignment(assignmentId, false, authentication));
    }

    @Operation(summary = "My accepted tasks",
            description = "User views all tasks they have an accepted assignment for " +
                    "in this workspace.")
    @GetMapping("/api/v1/workspaces/{workspaceId}/me/tasks")
    public ResponseEntity<List<TaskResponse>> getMyAcceptedTasks(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(taskService.getMyAcceptedTasks(workspaceId, authentication));
    }

    @Operation(summary = "Update task status",
            description = "MEMBER only. Allowed transitions: " +
                    "NOT_STARTED → IN_PROGRESS → COMPLETED. No going back.")
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