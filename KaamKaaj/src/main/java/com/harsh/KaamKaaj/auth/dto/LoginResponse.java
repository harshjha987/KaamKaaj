package com.harsh.KaamKaaj.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    // No tokens here — they are set as HttpOnly cookies by the controller
    private String userId;
    private String username;
    private String email;
    private String role;
}