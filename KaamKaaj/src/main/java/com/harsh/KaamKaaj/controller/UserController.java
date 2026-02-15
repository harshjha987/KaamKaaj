package com.harsh.KaamKaaj.controller;


import com.harsh.KaamKaaj.model.Users;
import com.harsh.KaamKaaj.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/")
public class UserController {

    private final List<String> Students = List.of("Harsh","Rahul","Rohit");
     UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/students")

    public List<String> getStudents(){
        return Students;
    }



    @PostMapping("/register")
    public Users registerUser(@RequestBody Users user){
        return userService.register(user);
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody Users user){
        return userService.verify(user);
    }


}
