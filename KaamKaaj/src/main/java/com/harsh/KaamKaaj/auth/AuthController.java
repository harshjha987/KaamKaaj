package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.LoginRequest;
import com.harsh.KaamKaaj.auth.dto.LoginResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // @AuthenticationPrincipal injects the UserDetails object that
    // JwtFilter placed into the SecurityContext. Spring Security
    // resolves this automatically — no manual token parsing needed
    // in the controller. The principal.getUsername() returns email
    // because that's what UserPrincipal.getUsername() returns.
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok(authService.logout());
    }
}