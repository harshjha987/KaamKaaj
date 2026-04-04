package com.harsh.KaamKaaj.task;

import com.harsh.KaamKaaj.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

// TaskAssignment represents a REQUEST to assign a task to a user.
// It is NOT the same as "the task is assigned to this user".
//
// Think of it as a job offer letter:
//   - Admin sends it (PENDING)
//   - User can accept or decline
//   - Only ACCEPTED assignments mean the task is "theirs"
//
// A task can have multiple assignments over its lifetime
// (if user1 declines, admin assigns to user2). The full
// history is preserved — we never delete assignment records.
// This gives you an audit trail of who was asked and what
// they said.
//
// At any given time, a task should have at most ONE PENDING
// or ACCEPTED assignment. We enforce this in the service layer.

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "task_assignments")
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    // Who the task is being assigned to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id", nullable = false)
    private User assignee;

    // Which admin sent this assignment request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private User assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private AssignmentStatus status = AssignmentStatus.PENDING;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    // Null until the user or admin takes action
    @Column(name = "responded_at")
    private Instant respondedAt;
}