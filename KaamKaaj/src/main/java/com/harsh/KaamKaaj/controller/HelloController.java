package com.harsh.KaamKaaj.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String greet(HttpServletRequest request){
        return "Let's Start this project. " + request.getSession().getId();
    }

    @GetMapping("/csrf")
    public CsrfToken getCSRF(HttpServletRequest request){
        return (CsrfToken) request.getAttribute("_csrf");
    }
}
