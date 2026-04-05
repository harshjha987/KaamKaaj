package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.LoginRequest;
import com.harsh.KaamKaaj.auth.dto.LoginResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

// -------------------------------------------------------
// @Tag groups all endpoints in this controller under one
// section in Swagger UI. Without it, SpringDoc still shows
// the endpoints but they're grouped by class name which
// looks ugly ("auth-controller" instead of "Authentication").
// -------------------------------------------------------
@Tag(name = "Authentication", description = "Register, login, and manage your session")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // -------------------------------------------------------
    // @SecurityRequirements({}) overrides the global security
    // requirement we set in OpenApiConfig for THIS endpoint only.
    // Empty array means "no security required".
    //
    // Without this, Swagger UI shows a lock icon on register
    // and login — implying you need a token to register, which
    // is obviously wrong and confusing.
    // -------------------------------------------------------
    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account. No token required."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed",
                    content = @Content(schema = @Schema(implementation = com.harsh.KaamKaaj.exception.ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email or username already exists",
                    content = @Content(schema = @Schema(implementation = com.harsh.KaamKaaj.exception.ErrorResponse.class)))
    })
    @SecurityRequirements   // no auth needed — overrides the global requirement
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(
            summary = "Login",
            description = "Authenticate with email and password. Returns a JWT token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful — copy the accessToken"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @SecurityRequirements   // no auth needed
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Get current user profile",
            description = "Returns the profile of the currently authenticated user."
    )
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getUsername()));
    }

    @Operation(summary = "Logout", description = "Invalidate the current session.")
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok(authService.logout());
    }
}