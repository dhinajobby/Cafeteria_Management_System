package com.cafeteria.entity;

import com.cafeteria.entity.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="user_id") private Long userId;
 @Column(name="full_name",nullable=false) private String fullName;
 @Column(name="email",nullable=false,unique=true) private String email;
 @Column(name="password_hash",nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(name="role",nullable=false) private Role role;
 @Column(name="is_active",nullable=false) private Boolean isActive;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
 @Column(name="updated_at",insertable=false,updatable=false) private LocalDateTime updatedAt;
 public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
 public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
 public Role getRole(){return role;} public void setRole(Role v){role=v;}
 public Boolean getIsActive(){return isActive;} public void setIsActive(Boolean v){isActive=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
