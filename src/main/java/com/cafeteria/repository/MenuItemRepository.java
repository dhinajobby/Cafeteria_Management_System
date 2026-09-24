package com.cafeteria.repository;
import com.cafeteria.entity.MenuItem; import jakarta.persistence.LockModeType; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Lock; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.util.*;
public interface MenuItemRepository extends JpaRepository<MenuItem,Long>{
 List<MenuItem> findByCategory_CategoryIdAndIsAvailableTrue(Long categoryId);
 List<MenuItem> findByIsAvailableTrue();
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("SELECT m FROM MenuItem m WHERE m.itemId = :itemId") Optional<MenuItem> findByIdForUpdate(@Param("itemId") Long itemId);
}
