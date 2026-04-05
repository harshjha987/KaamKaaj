package com.harsh.KaamKaaj.user;

import com.harsh.KaamKaaj.user.dto.UserSearchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Users", description = "Global user search for finding people to invite")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Search users",
            description = "Search the global user directory by username or email. " +
                    "Returns only minimal identity info (userId, username, email). " +
                    "Minimum 2 characters required. " +
                    "Use the returned userId to send a workspace invitation."
    )
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}