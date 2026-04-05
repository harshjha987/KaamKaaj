package com.harsh.KaamKaaj.user;

import com.harsh.KaamKaaj.user.dto.UserResponse;
import com.harsh.KaamKaaj.user.dto.UserSearchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Users")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Search users by username or email")
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @Operation(summary = "Update my username")
    @PatchMapping("/me/username")
    public ResponseEntity<UserResponse> updateUsername(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateUsernameRequest request) {
        return ResponseEntity.ok(userService.updateUsername(principal.getUsername(), request.getUsername()));
    }

    @Operation(summary = "Update my password")
    @PatchMapping("/me/password")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(principal.getUsername(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password updated successfully.");
    }

    // ── Inner DTOs ──────────────────────────────────────────

    @Getter @Setter
    public static class UpdateUsernameRequest {
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
        private String username;
    }

    @Getter @Setter
    public static class UpdatePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 16, message = "Password must be 8-16 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$",
                message = "Password must contain uppercase, lowercase, number, and special character"
        )
        @ToString.Exclude
        private String newPassword;
    }
}