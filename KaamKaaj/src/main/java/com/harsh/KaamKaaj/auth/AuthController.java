package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.*;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Register, login, refresh tokens, and logout")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register", description = "No token required.")
    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(
            summary = "Login",
            description = "Returns an access token (15 min) and a refresh token (7 days)."
    )
    @SecurityRequirements
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // -------------------------------------------------------
    // Refresh endpoint — NO auth required on this endpoint.
    //
    // Why? Because this endpoint is called specifically when
    // the access token has ALREADY expired. If we required
    // a valid access token to refresh, there'd be no way to
    // refresh an expired token — defeating the whole purpose.
    //
    // Security comes from the refresh token itself, which is
    // validated in RefreshTokenService.
    // -------------------------------------------------------
    @Operation(
            summary = "Refresh access token",
            description = "Exchange a valid refresh token for a new access token + new refresh token. " +
                    "No Authorization header needed. " +
                    "Old refresh token is invalidated after use (rotation)."
    )
    @SecurityRequirements
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @Operation(summary = "Get current user profile")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getUsername()));
    }

    @Operation(
            summary = "Logout",
            description = "Revokes all refresh tokens for the current user. " +
                    "All devices will need to log in again."
    )
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.logout(principal.getUsername()));
    }
}