package com.cafeteria.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="menu_items")
public class MenuItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="item_id") private Long itemId;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id",nullable=false) private Category category;
 @Column(name="name",nullable=false) private String name;
 @Column(name="description") private String description;
 @Column(name="price",nullable=false,precision=10,scale=2) private BigDecimal price;
 @Column(name="image_url") private String imageUrl;
 @Column(name="is_available",nullable=false) private Boolean isAvailable;
 @Column(name="stock_quantity") private Integer stockQuantity;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt;
 @Column(name="updated_at",insertable=false,updatable=false) private LocalDateTime updatedAt;
 public Long getItemId(){return itemId;} public void setItemId(Long v){itemId=v;} public Category getCategory(){return category;} public void setCategory(Category v){category=v;}
 public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public BigDecimal getPrice(){return price;} public void setPrice(BigDecimal v){price=v;} public String getImageUrl(){return imageUrl;} public void setImageUrl(String v){imageUrl=v;}
 public Boolean getIsAvailable(){return isAvailable;} public void setIsAvailable(Boolean v){isAvailable=v;} public Integer getStockQuantity(){return stockQuantity;} public void setStockQuantity(Integer v){stockQuantity=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
