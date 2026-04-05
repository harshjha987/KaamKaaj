package com.harsh.KaamKaaj.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.harsh.KaamKaaj.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

// -------------------------------------------------------
// AccessDeniedHandler is Spring Security's hook for
// handling requests that ARE authenticated but are trying
// to access something they don't have permission for.
//
// The key distinction from AuthenticationEntryPoint:
//
//   AuthenticationEntryPoint → WHO ARE YOU? (no/bad token)
//   AccessDeniedHandler      → YOU'RE KNOWN, BUT NO ACCESS
//
// When is this triggered?
//   1. @PreAuthorize expression returns false
//      e.g. user is a MEMBER but tries an ADMIN-only endpoint
//   2. URL-level rules block an authenticated user
//      e.g. hasRole('ADMIN') in SecurityConfig but user is USER
//
// Without this handler, Spring returns its default 403
// response which is also HTML/plain-text — not JSON.
//
// Note the class name: we can't call it AccessDeniedHandler
// because that's the name of the interface we're implementing.
// AppAccessDeniedHandler avoids the naming conflict.
// -------------------------------------------------------
@Component
public class AppAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public AppAccessDeniedHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);  // 403
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = new ErrorResponse(
                403,
                "Forbidden",
                "You do not have permission to access this resource."
        );

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}