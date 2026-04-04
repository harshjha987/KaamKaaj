package com.harsh.KaamKaaj.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

// The consistent shape every error response returns:
// {
//   "status": 409,
//   "error": "Conflict",
//   "message": "Email is already registered",
//   "timestamp": "2026-04-04T10:30:00Z",
//   "fieldErrors": [          <- only present on validation failures
//     { "field": "email", "message": "Email should be valid" }
//   ]
// }
//
// @JsonInclude(NON_NULL) means fieldErrors is omitted from
// the JSON entirely when null — so a 404 response doesn't
// have an ugly "fieldErrors": null in the body.
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final int status;
    private final String error;
    private final String message;
    private final Instant timestamp;
    private final List<FieldError> fieldErrors;

    // For simple errors (404, 409, 403, 401, 500)
    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now();
        this.fieldErrors = null;
    }

    // For validation errors (400) with per-field detail
    public ErrorResponse(int status, String error, String message, List<FieldError> fieldErrors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.timestamp = Instant.now();
        this.fieldErrors = fieldErrors;
    }

    // Getters (no Lombok here — this is a value object,
    // we want explicit control over what gets serialized)
    public int getStatus()                  { return status; }
    public String getError()                { return error; }
    public String getMessage()              { return message; }
    public Instant getTimestamp()           { return timestamp; }
    public List<FieldError> getFieldErrors(){ return fieldErrors; }

    // Nested record for per-field validation errors
    public record FieldError(String field, String message) {}
}