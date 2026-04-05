package com.harsh.KaamKaaj.user;

import com.harsh.KaamKaaj.exception.DuplicateResourceException;
import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import com.harsh.KaamKaaj.user.dto.UserSearchResponse;
import com.harsh.KaamKaaj.user.mapper.UserMapper;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder encoder;
    private final UserMapper userMapper;

    public UserService(UserRepo userRepo, BCryptPasswordEncoder encoder, UserMapper userMapper) {

        this.userRepo = userRepo;
        this.encoder = encoder;
        this.userMapper = userMapper;
    }

    // Global user search — returns ONLY minimal identity info.
    //
    // This is intentionally limited. See UserSearchResponse
    // for the full explanation of why we return so little.
    //
    // The query parameter must be at least 2 characters to
    // prevent full-table scans on large user datasets.
    // A 1-char search like "a" could match millions of users.
    public List<UserSearchResponse> searchUsers(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return userRepo.searchByUsernameOrEmail(query.trim())
                .stream()
                .map(u -> new UserSearchResponse(u.getId(), u.getUsername(), u.getEmail()))
                .toList();
    }

    // Add these two methods to your existing UserService

    @Transactional
    public UserResponse updateUsername(String email, String newUsername) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if username is already taken by someone else
        userRepo.findByUsername(newUsername).ifPresent(existing -> {
            if (!existing.getId().equals(user.getId())) {
                throw new DuplicateResourceException("Username '" + newUsername + "' is already taken");
            }
        });

        user.setUsername(newUsername);
        userRepo.save(user);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public void updatePassword(String email, String currentPassword, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password is correct before allowing change
        if (!encoder.matches(currentPassword, user.getPasswordHash())) {
            throw new DuplicateResourceException("Current password is incorrect");
            // Using DuplicateResourceException here gives a 409 — you can also throw
            // a custom BadRequestException if you have one, or just RuntimeException
        }

        user.setPasswordHash(encoder.encode(newPassword));
        userRepo.save(user);
    }
}