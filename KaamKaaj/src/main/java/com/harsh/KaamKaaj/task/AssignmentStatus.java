package com.harsh.KaamKaaj.task;

// The lifecycle of a task assignment request.
// Completely separate from TaskStatus.
//
// PENDING   → admin sent the request, user hasn't responded
// ACCEPTED  → user accepted, task now appears in their "my tasks"
// DECLINED  → user declined, admin can assign to someone else
// CANCELLED → admin withdrew the request before user responded
//
// All states except PENDING are terminal.
// There is intentionally no "REVOKED" after ACCEPTED —
// if an admin wants to unassign an accepted task, that's
// a product decision we'll handle later (out of scope now).

public enum AssignmentStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    CANCELLED
}