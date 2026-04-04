package com.harsh.KaamKaaj.exception;

// Thrown when a user tries to access a workspace they don't
// belong to, or perform an admin action as a regular member.
// GlobalExceptionHandler maps this → 403 Forbidden.
public class WorkspaceAccessDeniedException extends RuntimeException {
    public WorkspaceAccessDeniedException(String message) {
        super(message);
    }
}