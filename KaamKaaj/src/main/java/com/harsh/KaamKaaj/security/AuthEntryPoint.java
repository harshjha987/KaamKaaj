package com.harsh.KaamKaaj.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.harsh.KaamKaaj.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

// -------------------------------------------------------
// AuthenticationEntryPoint is Spring Security's hook for
// handling requests that are NOT authenticated.
//
// "Entry point" is a misleading name — think of it as
// "the place Spring calls when authentication is missing
// or invalid and the resource requires authentication".
//
// When is this triggered?
//   1. No Authorization header at all
//   2. Authorization header present but token is malformed
//      (if JwtFilter lets it through without setting the
//       SecurityContext — which it does on parse failure)
//   3. Token is expired and JwtFilter didn't set the context
//
// What did Spring do before you implement this?
//   It called its default BasicAuthenticationEntryPoint
//   which returns a WWW-Authenticate header and a plain
//   text/HTML response — useless for a REST API.
//
// What we do instead:
//   Write a clean JSON ErrorResponse directly to the
//   HttpServletResponse output stream, bypassing the
//   normal MVC response pipeline entirely.
//   We can't use ResponseEntity here because we're outside
//   the controller layer — we write directly to the stream.
// -------------------------------------------------------
@Component
public class AuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public AuthEntryPoint() {
        // We create our own ObjectMapper here and register
        // JavaTimeModule so Instant serializes as a timestamp
        // string, not as an array of numbers.
        // Alternatively you could @Autowire the Spring-managed
        // ObjectMapper bean — but keeping it self-contained
        // avoids any circular dependency risk at startup.
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        // Set the response properties BEFORE writing the body.
        // Once you start writing to the output stream, headers
        // are committed and can't be changed.
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);  // 401
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = new ErrorResponse(
                401,
                "Unauthorized",
                "Authentication required. Please provide a valid Bearer token."
        );

        // ObjectMapper writes the ErrorResponse as JSON
        // directly into the response output stream.
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}