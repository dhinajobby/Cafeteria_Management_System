package com.cafeteria.dto.response; import com.cafeteria.entity.enums.Role; public record LoginResponse(Long userId,String fullName,String email,Role role,String message){}
