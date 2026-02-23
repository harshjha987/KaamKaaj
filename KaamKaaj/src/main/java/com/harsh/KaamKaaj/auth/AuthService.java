package com.harsh.KaamKaaj.auth;


import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.LoginRequest;
import com.harsh.KaamKaaj.auth.dto.LoginResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
//import com.harsh.KaamKaaj.security.jwt.JWTService;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.security.jwt.JWTService;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import com.harsh.KaamKaaj.user.mapper.UserMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {


    private final UserRepo userRepo;
    private final UserMapper userMapper;

    private final BCryptPasswordEncoder encoder;


     private final JWTService jwtService;

    private final AuthenticationManager authenticationManager;
    public AuthService(UserRepo userRepo, UserMapper userMapper, BCryptPasswordEncoder encoder, JWTService jwtService, AuthenticationManager authenticationManager) {
        this.userRepo = userRepo;

        this.encoder = encoder;

        this.userMapper = userMapper;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }





    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUserName().trim();

        if(userRepo.existsByUsername(username)){
            throw new RuntimeException("Username is already registered");
        }
        if(userRepo.existsByEmail(email)){
            throw new RuntimeException("Email is already registered");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(encoder.encode(request.getPassword()));

        User saved = userRepo.save(user);
//        System.out.println(saved);
        return userMapper.toResponse(saved);
    }



//    public String verify(User user) {
//        Authentication authentication =
//                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(),user.getPassword()));
////        if(authentication.isAuthenticated()){
////            return jwtService.generateToken(user.getUsername());
////        }
//        return "Failure";
//    }
public LoginResponse login(LoginRequest request) {

    String normalizedEmail = request.getEmail().trim().toLowerCase();

    Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
    );

    UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

    String principalEmail = principal.getUsername(); // in your setup this returns email
    String userId = principal.getUserId();

    String role = principal.getAuthorities()
            .iterator()
            .next()
            .getAuthority();

    String token = jwtService.generateToken(principalEmail, userId, role);

    return new LoginResponse(
            token,
            "Bearer",
            jwtService.getJwtExpiration(),
            principalEmail
    );
}

public UserResponse getProfile(String email){
    User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return userMapper.toUserResponse(user);
}

    public String logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("jwt", null);


        cookie.setMaxAge(0);


        cookie.setPath("/");


        cookie.setHttpOnly(true);

        response.addCookie(cookie);

        return "Logged out successfully";
    }
}
