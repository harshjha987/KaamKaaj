package com.harsh.KaamKaaj.user;

import com.harsh.KaamKaaj.user.dto.UserSearchResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepo;

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
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
}