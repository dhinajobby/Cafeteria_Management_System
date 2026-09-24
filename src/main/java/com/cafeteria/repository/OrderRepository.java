package com.cafeteria.repository;
import com.cafeteria.entity.Order; import com.cafeteria.entity.enums.OrderStatus; import org.springframework.data.jpa.repository.JpaRepository; import java.time.LocalDate; import java.util.List;
public interface OrderRepository extends JpaRepository<Order,Long>{ List<Order> findByOrderDate(LocalDate date); List<Order> findByOrderStatus(OrderStatus status); List<Order> findByOrderDateAndOrderStatus(LocalDate date,OrderStatus status); }
