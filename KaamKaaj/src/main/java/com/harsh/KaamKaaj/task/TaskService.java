package com.harsh.KaamKaaj.task;

import com.harsh.KaamKaaj.exception.InvalidStatusTransitionException;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.exception.WorkspaceAccessDeniedException;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.task.dto.*;
import com.harsh.KaamKaaj.task.mapper.TaskMapper;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepo userRepo;
    private final TaskMapper taskMapper;

    public TaskService(TaskRepository taskRepository,
                       TaskAssignmentRepository assignmentRepository,
                       WorkspaceRepository workspaceRepository,
                       WorkspaceMemberRepository memberRepository,
                       UserRepo userRepo,
                       TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.assignmentRepository = assignmentRepository;
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepo = userRepo;
        this.taskMapper = taskMapper;
    }

    // ── Admin operations ─────────────────────────────────────

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public TaskResponse createTask(String workspaceId,
                                   CreateTaskRequest request,
                                   Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        User creator = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null
                ? request.getDescription().trim() : null);
        task.setWorkspace(workspace);
        task.setCreatedBy(creator);
        task.setPriority(request.getPriority() != null
                ? request.getPriority() : TaskPriority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setStatus(TaskStatus.NOT_STARTED);

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    public List<TaskResponse> getWorkspaceTasks(String workspaceId,
                                                Authentication authentication) {
        return taskRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    // Admins see any task in workspace. Members see only their accepted tasks.
    // We handle both cases in one method by checking membership role.
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    public TaskResponse getTaskById(String workspaceId,
                                    String taskId,
                                    Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));

        // If the caller is a MEMBER (not admin), verify they have
        // an accepted assignment for this task. If not, 403.
        WorkspaceMember member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .orElseThrow(() -> new WorkspaceAccessDeniedException(
                        "Not a member of this workspace"));

        if (member.getRole() == WorkspaceRole.MEMBER) {
            boolean hasAcceptedAssignment = assignmentRepository
                    .existsByTaskIdAndStatusIn(
                            taskId, List.of(AssignmentStatus.ACCEPTED));
            if (!hasAcceptedAssignment) {
                throw new WorkspaceAccessDeniedException(
                        "You do not have an accepted assignment for this task");
            }
        }

        return taskMapper.toResponse(task);
    }

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public TaskResponse updateTask(String workspaceId,
                                   String taskId,
                                   UpdateTaskRequest request,
                                   Authentication authentication) {
        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));

        // Partial update — only apply fields that were provided.
        // If the client only sends priority, title stays untouched.
        if (request.getTitle() != null) task.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) task.setDescription(request.getDescription().trim());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        return taskMapper.toResponse(taskRepository.save(task));
    }

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public void deleteTask(String workspaceId,
                           String taskId,
                           Authentication authentication) {
        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));
        taskRepository.delete(task);
    }

    // ── Assignment operations ─────────────────────────────────

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public AssignmentResponse createAssignment(String workspaceId,
                                               String taskId,
                                               CreateAssignmentRequest request,
                                               Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));

        // Guard: task must not already have a PENDING or ACCEPTED assignment.
        // You can't assign a task that's already spoken for.
        boolean alreadyAssigned = assignmentRepository.existsByTaskIdAndStatusIn(
                taskId, List.of(AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED));
        if (alreadyAssigned) {
            throw new InvalidStatusTransitionException(
                    "Task already has a pending or accepted assignment. " +
                            "Cancel the existing assignment before reassigning.");
        }

        // Guard: assignee must be an ACTIVE MEMBER of the workspace.
        // Can't assign tasks to outsiders or invited-but-not-accepted members.
        WorkspaceMember assigneeMember = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, request.getAssigneeId())
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignee is not an active member of this workspace"));

        User assignedBy = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setAssignee(assigneeMember.getUser());
        assignment.setAssignedBy(assignedBy);
        assignment.setStatus(AssignmentStatus.PENDING);

        return taskMapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    public List<AssignmentResponse> getTaskAssignmentHistory(String workspaceId,
                                                             String taskId,
                                                             Authentication authentication) {
        // Verify the task belongs to this workspace first
        taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));

        return assignmentRepository.findByTaskId(taskId)
                .stream()
                .map(taskMapper::toAssignmentResponse)
                .toList();
    }

    @PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
    @Transactional
    public AssignmentResponse cancelAssignment(String workspaceId,
                                               String taskId,
                                               String assignmentId,
                                               Authentication authentication) {
        TaskAssignment assignment = assignmentRepository
                .findByIdAndTaskWorkspaceId(assignmentId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment not found: " + assignmentId));

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new InvalidStatusTransitionException(
                    "Only PENDING assignments can be cancelled. Current status: "
                            + assignment.getStatus());
        }

        assignment.setStatus(AssignmentStatus.CANCELLED);
        assignment.setRespondedAt(Instant.now());
        return taskMapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    // ── User inbox operations ─────────────────────────────────

    // No @PreAuthorize — query is already scoped to the calling user
    public List<AssignmentResponse> getMyPendingAssignments(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return assignmentRepository
                .findByAssigneeIdAndStatus(principal.getUserId(), AssignmentStatus.PENDING)
                .stream()
                .map(taskMapper::toAssignmentResponse)
                .toList();
    }

    @Transactional
    public AssignmentResponse respondToAssignment(String assignmentId,
                                                  boolean accept,
                                                  Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // findByIdAndAssigneeId verifies BOTH that the assignment
        // exists AND that it belongs to the calling user.
        // If you only did findById, any user could respond to
        // anyone else's assignment — a serious security hole.
        TaskAssignment assignment = assignmentRepository
                .findByIdAndAssigneeId(assignmentId, principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment not found or does not belong to you"));

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new InvalidStatusTransitionException(
                    "This assignment is no longer pending. Current status: "
                            + assignment.getStatus());
        }

        assignment.setStatus(accept ? AssignmentStatus.ACCEPTED : AssignmentStatus.DECLINED);
        assignment.setRespondedAt(Instant.now());
        return taskMapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    // User updates task status — the ONLY thing users can change.
    // Must have an ACCEPTED assignment for the task.
    @Transactional
    public TaskResponse updateTaskStatus(String workspaceId,
                                         String taskId,
                                         UpdateTaskStatusRequest request,
                                         Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Task task = taskRepository.findByIdAndWorkspaceId(taskId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Task not found: " + taskId));

        // Verify the user has an accepted assignment for this task.
        // Without this check, any workspace member could update
        // the status of any task — even ones assigned to others.
        boolean hasAccepted = assignmentRepository
                .findByAssigneeIdAndStatus(principal.getUserId(), AssignmentStatus.ACCEPTED)
                .stream()
                .anyMatch(a -> a.getTask().getId().equals(taskId));

        if (!hasAccepted) {
            throw new WorkspaceAccessDeniedException(
                    "You do not have an accepted assignment for this task");
        }

        // Validate the status transition state machine.
        validateStatusTransition(task.getStatus(), request.getStatus());
        task.setStatus(request.getStatus());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getMyAcceptedTasks(String workspaceId,
                                                 Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Verify membership before showing tasks
        memberRepository.findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .orElseThrow(() -> new WorkspaceAccessDeniedException(
                        "You are not an active member of this workspace"));

        return taskRepository
                .findAcceptedTasksByWorkspaceAndUser(workspaceId, principal.getUserId())
                .stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    // ── Private helpers ───────────────────────────────────────

    // The state machine enforcer. Called before every status update.
    // This is the single source of truth for valid transitions.
    // Adding a new allowed transition means changing only this method.
    private void validateStatusTransition(TaskStatus current, TaskStatus requested) {
        boolean valid = switch (current) {
            case NOT_STARTED -> requested == TaskStatus.IN_PROGRESS;
            case IN_PROGRESS -> requested == TaskStatus.COMPLETED;
            case COMPLETED   -> false; // terminal — no transitions allowed
        };

        if (!valid) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition: " + current + " → " + requested +
                            ". Allowed: NOT_STARTED→IN_PROGRESS, IN_PROGRESS→COMPLETED");
        }
    }
}