package com.harsh.KaamKaaj.task;

// Priority is set by the admin at task creation or update.
// Users cannot change this — they can only change status.
// We store as STRING for the same reason as other enums —
// ordinal storage breaks if you reorder values.

public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}