package com.cafeteria.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="categories")
public class Category {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="category_id") private Long categoryId;
 @Column(name="name",nullable=false) private String name;
 @Column(name="description") private String description;
 @Column(name="display_order") private Integer displayOrder;
 @Column(name="is_active",nullable=false) private Boolean isActive;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
 public Long getCategoryId(){return categoryId;} public void setCategoryId(Long v){categoryId=v;}
 public String getName(){return name;} public void setName(String v){name=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public Integer getDisplayOrder(){return displayOrder;} public void setDisplayOrder(Integer v){displayOrder=v;}
 public Boolean getIsActive(){return isActive;} public void setIsActive(Boolean v){isActive=v;}
 public LocalDateTime getCreatedAt(){return createdAt;}
}
