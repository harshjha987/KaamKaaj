package com.harsh.KaamKaaj.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, String> {

    // All assignments for a task — used for assignment history
    List<TaskAssignment> findByTaskId(String taskId);

    // Check if a task already has a PENDING or ACCEPTED assignment
    // before creating a new one — prevents double-assigning
    boolean existsByTaskIdAndStatusIn(String taskId, List<AssignmentStatus> statuses);

    // Used when user responds to an assignment —
    // verify it belongs to them before allowing action
    Optional<TaskAssignment> findByIdAndAssigneeId(String id, String assigneeId);

    // Used when admin cancels an assignment —
    // verify it belongs to their workspace's task
    Optional<TaskAssignment> findByIdAndTaskWorkspaceId(String id, String workspaceId);

    // User's assignment inbox — all pending requests for them
    List<TaskAssignment> findByAssigneeIdAndStatus(String assigneeId, AssignmentStatus status);
}