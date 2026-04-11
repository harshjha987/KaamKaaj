package com.harsh.KaamKaaj.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
public class RegisterRequest {


    @NotBlank(message = "Username is required")
    @Size(min = 3 , max = 15, message = "Username must be 3-15 characters")
    private String userName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 254, message = "Email is too long")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 16, message = "Password must be 8-16 characters")

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&]).{8,16}$",
            message = "Password must have uppercase, lowercase, number, and special character"
    )
    @ToString.Exclude
    private String password;
}
