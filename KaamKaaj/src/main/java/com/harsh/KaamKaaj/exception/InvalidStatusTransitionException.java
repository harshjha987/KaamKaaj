package com.harsh.KaamKaaj.exception;

// Thrown when a task status transition is illegal.
// e.g. COMPLETED -> NOT_STARTED is not allowed.
// GlobalExceptionHandler maps this → 400 Bad Request.
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}