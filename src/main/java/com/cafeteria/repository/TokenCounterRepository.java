package com.cafeteria.repository;
import com.cafeteria.entity.TokenCounter; import jakarta.persistence.LockModeType; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Lock; import org.springframework.data.jpa.repository.Modifying; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.time.LocalDate; import java.util.Optional;
public interface TokenCounterRepository extends JpaRepository<TokenCounter,LocalDate>{
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("SELECT t FROM TokenCounter t WHERE t.orderDate = :orderDate") Optional<TokenCounter> findByOrderDateForUpdate(@Param("orderDate") LocalDate orderDate);
 @Modifying @Query(value="INSERT INTO token_counters (order_date,last_token) VALUES (:orderDate,1) ON DUPLICATE KEY UPDATE last_token=last_token+1",nativeQuery=true) void upsertAndIncrement(@Param("orderDate") LocalDate orderDate);
}
