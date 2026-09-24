package com.cafeteria.entity;
import com.cafeteria.entity.enums.*; import jakarta.persistence.*; import java.math.BigDecimal; import java.time.*;
@Entity @Table(name="orders") public class Order {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="order_id") private Long orderId;
 @Column(name="token_number",nullable=false) private Integer tokenNumber; @Column(name="order_date",nullable=false) private LocalDate orderDate;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user;
 @Enumerated(EnumType.STRING) @Column(name="order_status",nullable=false) private OrderStatus orderStatus;
 @Enumerated(EnumType.STRING) @Column(name="payment_status",nullable=false) private PaymentStatus paymentStatus;
 @Enumerated(EnumType.STRING) @Column(name="payment_method") private PaymentMethod paymentMethod;
 @Column(name="total_amount",nullable=false,precision=10,scale=2) private BigDecimal totalAmount; @Column(name="notes") private String notes;
 @Column(name="created_at",insertable=false,updatable=false) private LocalDateTime createdAt; @Column(name="updated_at",insertable=false,updatable=false) private LocalDateTime updatedAt;
 public Long getOrderId(){return orderId;} public void setOrderId(Long v){orderId=v;} public Integer getTokenNumber(){return tokenNumber;} public void setTokenNumber(Integer v){tokenNumber=v;} public LocalDate getOrderDate(){return orderDate;} public void setOrderDate(LocalDate v){orderDate=v;} public User getUser(){return user;} public void setUser(User v){user=v;} public OrderStatus getOrderStatus(){return orderStatus;} public void setOrderStatus(OrderStatus v){orderStatus=v;} public PaymentStatus getPaymentStatus(){return paymentStatus;} public void setPaymentStatus(PaymentStatus v){paymentStatus=v;} public PaymentMethod getPaymentMethod(){return paymentMethod;} public void setPaymentMethod(PaymentMethod v){paymentMethod=v;} public BigDecimal getTotalAmount(){return totalAmount;} public void setTotalAmount(BigDecimal v){totalAmount=v;} public String getNotes(){return notes;} public void setNotes(String v){notes=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
