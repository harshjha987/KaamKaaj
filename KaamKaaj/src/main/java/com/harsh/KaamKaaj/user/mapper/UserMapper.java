package com.harsh.KaamKaaj.user.mapper;


import com.harsh.KaamKaaj.auth.dto.AuthResponse;
import com.harsh.KaamKaaj.auth.dto.RegisterRequest;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request){
        User user = new User();
        user.setUsername(request.getUserName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setEmailVerified(false);
        return user;
    }

    public AuthResponse toResponse(User user) {
        return new AuthResponse(user.getId(), user.getUsername(), user.getEmail(), user.isEmailVerified());
    }

    public UserResponse toUserResponse(User user){
        return new UserResponse(user.getEmail(),user.getUsername());
    }


}
