package com.cafeteria.entity;
import jakarta.persistence.*; import java.math.BigDecimal;
@Entity @Table(name="order_items") public class OrderItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="order_item_id") private Long orderItemId;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="order_id",nullable=false) private Order order;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="item_id") private MenuItem menuItem;
 @Column(name="item_name_snapshot",nullable=false) private String itemNameSnapshot; @Column(name="quantity",nullable=false) private Integer quantity;
 @Column(name="unit_price",nullable=false,precision=10,scale=2) private BigDecimal unitPrice;
 @Column(name="subtotal",insertable=false,updatable=false,precision=10,scale=2) private BigDecimal subtotal;
 public Long getOrderItemId(){return orderItemId;} public void setOrderItemId(Long v){orderItemId=v;} public Order getOrder(){return order;} public void setOrder(Order v){order=v;} public MenuItem getMenuItem(){return menuItem;} public void setMenuItem(MenuItem v){menuItem=v;} public String getItemNameSnapshot(){return itemNameSnapshot;} public void setItemNameSnapshot(String v){itemNameSnapshot=v;} public Integer getQuantity(){return quantity;} public void setQuantity(Integer v){quantity=v;} public BigDecimal getUnitPrice(){return unitPrice;} public void setUnitPrice(BigDecimal v){unitPrice=v;} public BigDecimal getSubtotal(){return subtotal;}
}
