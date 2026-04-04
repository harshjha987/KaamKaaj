package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.LoginRequest;
import com.harsh.KaamKaaj.auth.dto.LoginResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
import com.harsh.KaamKaaj.exception.DuplicateResourceException;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.security.jwt.JWTService;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import com.harsh.KaamKaaj.user.mapper.UserMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder encoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepo userRepo, UserMapper userMapper, BCryptPasswordEncoder encoder,
                       JWTService jwtService, AuthenticationManager authenticationManager) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUserName().trim();

        // Throwing DuplicateResourceException instead of RuntimeException.
        // GlobalExceptionHandler maps this to 409 Conflict.
        // RuntimeException would give a 500 Internal Server Error.
        if (userRepo.existsByUsername(username)) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken");
        }
        if (userRepo.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(encoder.encode(request.getPassword()));
        return userMapper.toResponse(userRepo.save(user));
    }

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // authenticate() internally does two things:
        //   1. Calls loadUserByUsername(email) via MyUserDetailsService
        //   2. Calls passwordEncoder.matches(rawPwd, storedHash)
        // If either step fails, it throws BadCredentialsException,
        // which GlobalExceptionHandler maps to 401 Unauthorized.
        // We don't need to catch it here.
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtService.generateToken(
                principal.getUsername(),
                principal.getUserId(),
                principal.getRole()
        );

        return new LoginResponse(token, "Bearer", jwtService.getJwtExpiration(), principal.getUsername());
    }

    public UserResponse getProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }

    // Stateless JWT logout explanation:
    //
    // Our tokens travel in the Authorization header — we never
    // set a cookie at login, so clearing a cookie does nothing.
    //
    // For stateless JWT, "logout" means the CLIENT discards
    // the token. The server can't invalidate a token it already
    // issued unless it maintains a blocklist.
    //
    // Options:
    //   A) Short expiry (1hr) — rely on the token expiring.
    //      Simple, acceptable for most apps.
    //   B) Redis blocklist — store the token's JTI (JWT ID)
    //      claim in Redis with a TTL matching expiry. JwtFilter
    //      checks the blocklist on every request. True revocation.
    //
    // We'll implement option B as a learning exercise later.
    // For now this endpoint just instructs the client.
    public String logout() {
        return "Logout successful. Discard the token on the client.";
    }
}