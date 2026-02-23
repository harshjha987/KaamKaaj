package com.harsh.KaamKaaj.auth;


import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.LoginRequest;
import com.harsh.KaamKaaj.auth.dto.LoginResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

//    private final List<String> Students = List.of("Harsh","Rahul","Rohit");
     private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }





    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request){
        AuthResponse res =  authService.register(request);
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@Valid @RequestBody LoginRequest request){
        LoginResponse res = authService.login(request);
        return  new ResponseEntity<>(res,HttpStatus.OK);
    }

    @GetMapping("/me")
        public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails principal){
            UserResponse user = authService.getProfile(principal.getUsername());
            return new ResponseEntity<>(user,HttpStatus.OK);
        }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        String message = authService.logout(response);
        return ResponseEntity.ok(message);
    }



}
