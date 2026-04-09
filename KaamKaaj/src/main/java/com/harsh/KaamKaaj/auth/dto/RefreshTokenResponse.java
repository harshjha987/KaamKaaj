package com.harsh.KaamKaaj.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenResponse {
    // Tokens are refreshed via cookies — nothing needed in body
    private String message;
}