package com.harsh.KaamKaaj.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.harsh.KaamKaaj.exception.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// -------------------------------------------------------
// OncePerRequestFilter guarantees this filter runs exactly
// once per request — Spring's filter chain can sometimes
// invoke filters multiple times (e.g. on forwards/includes).
// OncePerRequestFilter prevents that.
//
// The filter's job in the security pipeline:
//   1. Extract the token from the Authorization header
//   2. Parse and validate it
//   3. Load the user from DB
//   4. Set the Authentication in the SecurityContext
//
// If any step fails, we write a JSON 401 directly and
// stop the filter chain — no further filters run, no
// controller is reached.
//
// If no Authorization header is present at all, we let
// the request continue. Spring Security will then invoke
// AuthEntryPoint for protected endpoints.
// -------------------------------------------------------
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;

    public JwtFilter(JWTService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No Authorization header → let the request continue.
        // If the endpoint requires auth, Spring Security will
        // invoke AuthEntryPoint automatically after all filters run.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email;

        try {
            email = jwtService.extractUsername(token);

        } catch (ExpiredJwtException e) {
            // Token was valid but has passed its expiry time.
            // This is the most common real-world failure case —
            // the user was logged in but their token aged out.
            sendAuthError(response, "Token has expired. Please log in again.");
            return;

        } catch (MalformedJwtException | SignatureException e) {
            // MalformedJwtException: the token string isn't valid JWT structure
            // SignatureException: token structure is fine but the signature
            //   doesn't match our secret key — someone tampered with it,
            //   or it was issued by a different server
            sendAuthError(response, "Invalid token. Please log in again.");
            return;

        } catch (Exception e) {
            // Catch-all for any other JWT parsing issues
            sendAuthError(response, "Token processing failed. Please log in again.");
            return;
        }

        // Only set authentication if not already set.
        // This prevents re-processing on forwarded requests.
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            // If validateToken returns false (shouldn't happen after
            // the try/catch above, but defensive coding), we simply
            // don't set the authentication — Spring Security will
            // invoke AuthEntryPoint for protected endpoints.
        }

        filterChain.doFilter(request, response);
    }

    // -------------------------------------------------------
    // Writes a JSON 401 error directly to the response stream.
    // Called from the catch blocks above.
    //
    // We write directly to the stream here (not via ResponseEntity)
    // because we're inside a Filter — the MVC layer hasn't started
    // yet, so there's no DispatcherServlet to process a normal
    // controller response.
    // -------------------------------------------------------
    private void sendAuthError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = new ErrorResponse(401, "Unauthorized", message);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}