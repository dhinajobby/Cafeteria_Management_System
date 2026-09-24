package com.cafeteria.service;
import com.cafeteria.dto.response.LoginResponse;
public interface AuthService { LoginResponse login(String email,String password); }
