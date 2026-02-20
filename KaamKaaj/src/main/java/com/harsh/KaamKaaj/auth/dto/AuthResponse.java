package com.harsh.KaamKaaj.auth.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthResponse {

    private String id;
    private String userName;

    private String email;

    private boolean emailVerified;
}
