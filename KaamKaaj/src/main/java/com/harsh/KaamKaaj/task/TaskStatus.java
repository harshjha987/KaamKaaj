package com.harsh.KaamKaaj.task;

// The lifecycle of a task's progress.
// This is controlled ONLY by the assigned user — never by admin.
//
// Valid transitions (enforced in TaskService):
//   NOT_STARTED → IN_PROGRESS
//   IN_PROGRESS → COMPLETED
//
// Invalid transitions (throw InvalidStatusTransitionException):
//   NOT_STARTED → COMPLETED  (must go through IN_PROGRESS)
//   IN_PROGRESS → NOT_STARTED (no going back)
//   COMPLETED   → anything   (terminal state)
//
// Why enforce this? Because "completed" tasks should be
// immutable history. Allowing a user to mark something
// completed and then reopen it makes reporting unreliable.

public enum TaskStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED
}