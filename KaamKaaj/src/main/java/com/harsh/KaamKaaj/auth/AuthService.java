package com.harsh.KaamKaaj.auth;

import com.harsh.KaamKaaj.auth.dto.*;
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
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder encoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepo userRepo,
                       UserMapper userMapper,
                       BCryptPasswordEncoder encoder,
                       JWTService jwtService,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUserName().trim();

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

    // -------------------------------------------------------
    // Login now returns BOTH tokens:
    //   accessToken  — short-lived JWT (15 mins)
    //   refreshToken — long-lived opaque token (7 days)
    //
    // The client should:
    //   1. Store the access token in memory (not localStorage)
    //   2. Store the refresh token in an httpOnly cookie
    //      (prevents XSS from stealing it)
    //   3. On every API call, send the access token in the
    //      Authorization header
    //   4. When the API returns 401, use the refresh token
    //      to get a new access token silently
    // -------------------------------------------------------
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        String accessToken = jwtService.generateToken(
                principal.getUsername(),
                principal.getUserId(),
                principal.getRole()
        );

        // Create and persist the refresh token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(principal.getUser());

        return new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                jwtService.getJwtExpiration(),
                principal.getUsername()
        );
    }

    // -------------------------------------------------------
    // Refresh — the client calls this when the access token
    // expires. We:
    //   1. Validate the refresh token (exists, not revoked, not expired)
    //   2. Rotate it (revoke old, issue new)
    //   3. Issue a new access token
    //   4. Return both new tokens
    //
    // The client must replace its stored tokens with the new ones.
    // -------------------------------------------------------
    @Transactional
    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        // validate() throws if invalid or revoked
        RefreshToken oldToken = refreshTokenService.validateRefreshToken(request.getRefreshToken());

        // Rotate — old token is now revoked, new one is issued
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(oldToken);

        User user = oldToken.getUser();
        String newAccessToken = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );

        return new RefreshTokenResponse(
                newAccessToken,
                newRefreshToken.getToken(),
                "Bearer",
                jwtService.getJwtExpiration()
        );
    }

    // -------------------------------------------------------
    // Logout — revoke ALL refresh tokens for this user.
    // This invalidates all active sessions (all devices).
    //
    // The access token is still technically valid until it
    // expires (15 mins), but since it's short-lived this is
    // an acceptable tradeoff. If you need instant access token
    // revocation, you'd add a Redis blocklist (Option I later).
    // -------------------------------------------------------
    @Transactional
    public String logout(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        refreshTokenService.revokeAllTokensForUser(user);
        return "Logged out successfully. All sessions have been invalidated.";
    }

    public UserResponse getProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }
}