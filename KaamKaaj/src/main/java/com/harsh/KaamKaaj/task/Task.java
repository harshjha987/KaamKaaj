package com.harsh.KaamKaaj.task;

import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.workspace.Workspace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    // Which workspace this task belongs to.
    // ALL repository queries for tasks must be scoped by
    // workspaceId — this is what enforces tenant isolation.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    // Who created this task (always an admin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private TaskStatus status = TaskStatus.NOT_STARTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private TaskPriority priority = TaskPriority.MEDIUM;

    // LocalDate (not Instant) because due dates are
    // calendar dates — no time component needed.
    // "Due by April 10" doesn't mean "due at 00:00:00 UTC".
    @Column(name = "due_date")
    private LocalDate dueDate;

    // @CreationTimestamp and @UpdateTimestamp are Hibernate
    // annotations that automatically manage these fields.
    // updatable = false on createdAt ensures Hibernate never
    // issues an UPDATE for that column after initial insert.
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}