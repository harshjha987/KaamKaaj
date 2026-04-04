package com.harsh.KaamKaaj.user;

import com.harsh.KaamKaaj.user.dto.UserSearchResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/v1/users/search?q=harsh
    //
    // Any authenticated user can search — admins use this to
    // find users to invite. The response shape (UserSearchResponse)
    // enforces the privacy rule: only userId, username, email.
    // No workspace membership info is ever returned here.
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}