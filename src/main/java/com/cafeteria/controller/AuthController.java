package com.cafeteria.controller;
import com.cafeteria.dto.request.LoginRequest; import com.cafeteria.dto.response.LoginResponse; import com.cafeteria.service.AuthService; import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController{private final AuthService service;public AuthController(AuthService s){service=s;}@PostMapping("/login") public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest r){return ResponseEntity.ok(service.login(r.email(),r.password()));}}
