package com.harsh.KaamKaaj.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
public class ResetPasswordRequest {

    // Token from the reset email link
    @NotBlank(message = "Reset token is required")
    private String token;

    // Same password rules as registration
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 16, message = "Password must be 8-16 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$",
            message = "Password must contain uppercase, lowercase, number, and special character"
    )
    @ToString.Exclude
    private String newPassword;
}