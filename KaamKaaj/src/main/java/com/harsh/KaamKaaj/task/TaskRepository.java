package com.harsh.KaamKaaj.task;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, String> {

    // Workspace-scoped task lookup — the workspaceId parameter
    // is MANDATORY on every query. Never fetch tasks without it.
    // This is what enforces tenant isolation at the DB layer.
    List<Task> findByWorkspaceId(String workspaceId);

    // Used when admin fetches a specific task — must verify
    // it belongs to their workspace, not just any task by ID
    Optional<Task> findByIdAndWorkspaceId(String id, String workspaceId);

    // Finds all tasks accepted by a specific user in a workspace.
    // Used for "my tasks" view — only ACCEPTED assignments appear.
    // This joins Task → TaskAssignment to find the accepted ones.
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON ta.task.id = t.id
        WHERE t.workspace.id = :workspaceId
        AND ta.assignee.id = :userId
        AND ta.status = 'ACCEPTED'
    """)
    List<Task> findAcceptedTasksByWorkspaceAndUser(
            @Param("workspaceId") String workspaceId,
            @Param("userId") String userId);

    // Add this alongside your existing findByWorkspaceId
    Page<Task> findByWorkspaceId(String workspaceId, Pageable pageable);
}