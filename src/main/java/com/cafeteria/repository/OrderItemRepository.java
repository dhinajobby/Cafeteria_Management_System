package com.cafeteria.repository;
import com.cafeteria.entity.OrderItem; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.time.LocalDate; import java.util.List;
public interface OrderItemRepository extends JpaRepository<OrderItem,Long>{
 List<OrderItem> findByOrder_OrderId(Long orderId);
 @Query("SELECT oi.menuItem.itemId, oi.itemNameSnapshot, SUM(oi.quantity), SUM(oi.subtotal) FROM OrderItem oi JOIN oi.order o WHERE o.orderDate=:date AND o.orderStatus <> com.cafeteria.entity.enums.OrderStatus.CANCELLED GROUP BY oi.menuItem.itemId, oi.itemNameSnapshot")
 List<Object[]> findDailySalesSummary(@Param("date") LocalDate date);
}
