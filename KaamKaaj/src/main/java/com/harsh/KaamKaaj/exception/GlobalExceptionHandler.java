package com.harsh.KaamKaaj.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

// @RestControllerAdvice = @ControllerAdvice + @ResponseBody
//
// How it works:
// Spring wraps every @RestController in an AOP proxy. When
// an exception escapes a controller method, Spring checks
// this class for a matching @ExceptionHandler. The most
// specific type match wins. Its return value becomes the
// HTTP response — completely replacing Spring's default
// Whitelabel error page.
//
// Why centralize here instead of try/catch in services?
//   - No duplication across every service/controller
//   - Controllers describe only the happy path
//   - Change the error format in one place
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 — @Valid failures on request DTOs
    //
    // When @Valid fails, Spring throws MethodArgumentNotValidException.
    // getBindingResult() gives a list of field-level errors.
    // We map them to our FieldError record for clean JSON output.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .toList();

        return ResponseEntity.badRequest().body(
                new ErrorResponse(400, "Validation Failed", "One or more fields are invalid", fieldErrors)
        );
    }

    // 400 — Illegal task status transition
    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransition(InvalidStatusTransitionException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Bad Request", ex.getMessage()));
    }

    // 401 — Authentication failures
    //
    // We return the same generic message for ALL auth failures.
    // If we said "email not found" vs "wrong password", attackers
    // could enumerate valid emails — a user enumeration attack.
    // Generic "Invalid credentials" reveals nothing.
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<ErrorResponse> handleAuthFailure(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Unauthorized", "Invalid credentials"));
    }

    // 403 — Workspace access denied
    @ExceptionHandler(WorkspaceAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(WorkspaceAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Forbidden", ex.getMessage()));
    }

    // 404 — Entity not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, "Not Found", ex.getMessage()));
    }

    // 409 — Duplicate resource (email/username already exists)
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(409, "Conflict", ex.getMessage()));
    }

    // 500 — Catch-all for anything unexpected
    //
    // Log the full exception server-side for debugging, but
    // return a generic message to the client. Never send stack
    // traces or internal details — that leaks implementation
    // info to attackers.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        ex.printStackTrace(); // replace with log.error() later
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Internal Server Error",
                        "Something went wrong. Please try again later."));
    }
}