package com.harsh.KaamKaaj.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshTokenRequest {

    // The client sends back the refresh token it received
    // at login. We look it up in the DB to validate it.
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}