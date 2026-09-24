package com.cafeteria.entity;
import jakarta.persistence.*; import java.time.LocalDate;
@Entity @Table(name="token_counters") public class TokenCounter {
 @Id @Column(name="order_date") private LocalDate orderDate; @Column(name="last_token",nullable=false) private Integer lastToken;
 public LocalDate getOrderDate(){return orderDate;} public void setOrderDate(LocalDate v){orderDate=v;} public Integer getLastToken(){return lastToken;} public void setLastToken(Integer v){lastToken=v;}
}
