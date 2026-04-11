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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder encoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepo userRepo,
                       UserMapper userMapper,
                       BCryptPasswordEncoder encoder,
                       JWTService jwtService,
                       AuthenticationManager authenticationManager,
                       RefreshTokenService refreshTokenService, RefreshTokenRepository refreshTokenRepository) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUserName().trim();
        System.out.println("Received password: " + request.getPassword());

        if (userRepo.existsByUsername(username)) {
            throw new DuplicateResourceException("Username '" + username + "' is already taken");
        }
        if (userRepo.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered");
        }
        System.out.println("Received password: " + request.getPassword());
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

    private void setTokenCookie(HttpServletResponse response,
                                String name, String value,
                                int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("None")  // required for cross-domain cookies
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepo.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String accessToken = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

        // Set tokens as HttpOnly cookies — never exposed to JavaScript
        setTokenCookie(response, "accessToken",  accessToken,  900);           // 15 min
        setTokenCookie(response, "refreshToken", refreshToken, 7 * 24 * 3600); // 7 days

        return LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
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
    public RefreshTokenResponse refresh(HttpServletRequest request,
                                        HttpServletResponse response) {
        // Read refresh token from cookie
        String refreshTokenValue = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshTokenValue = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshTokenValue == null) {
            throw new ResourceNotFoundException("No refresh token found");
        }

        // Validate and rotate — existing refresh token logic
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            // Reuse detected — revoke all tokens for this user
            refreshTokenRepository.revokeAllByUser(refreshToken.getUser());
            throw new ResourceNotFoundException("Refresh token reuse detected. Please log in again.");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResourceNotFoundException("Refresh token expired. Please log in again.");
        }

        // Rotate — revoke old, issue new
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole().name()
        );
        String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();

        // Set new tokens as cookies
        setTokenCookie(response, "accessToken",  newAccessToken,  900);
        setTokenCookie(response, "refreshToken", newRefreshToken, 7 * 24 * 3600);

        return RefreshTokenResponse.builder()
                .message("Tokens refreshed successfully")
                .build();
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
    public String logout(String email, HttpServletResponse response) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUser(user);

        // Clear cookies by setting maxAge to 0
        setTokenCookie(response, "accessToken",  "", 0);
        setTokenCookie(response, "refreshToken", "", 0);

        return "Logged out successfully";
    }

    public UserResponse getProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }
}