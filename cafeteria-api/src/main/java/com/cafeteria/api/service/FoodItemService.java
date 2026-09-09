package com.cafeteria.api.service;

import com.cafeteria.api.dto.AvailabilityRequest;
import com.cafeteria.api.dto.FoodItemRequest;
import com.cafeteria.api.exception.ApiException;
import com.cafeteria.api.model.FoodItem;
import com.cafeteria.api.repository.FoodItemRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public FoodItemService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    public List<FoodItem> getAllItems() {
        return foodItemRepository.findAll();
    }

    public FoodItem getItem(Long itemId) {
        return foodItemRepository.findById(itemId)
                .orElseThrow(() -> new ApiException("Food item " + itemId + " not found", HttpStatus.NOT_FOUND));
    }

    /** Staff adds a brand new menu item. */
    @Transactional
    public FoodItem createItem(FoodItemRequest request) {
        FoodItem item = new FoodItem();
        item.setItemName(request.getItemName());
        item.setPrice(request.getPrice());
        item.setStockCount(request.getStockCount());
        item.setIsAvailable(request.getIsAvailable() == null ? Boolean.TRUE : request.getIsAvailable());
        return foodItemRepository.save(item);
    }

    /** Staff updates name/price/stock/availability of an existing item. */
    @Transactional
    public FoodItem updateItem(Long itemId, FoodItemRequest request) {
        FoodItem item = getItem(itemId);
        item.setItemName(request.getItemName());
        item.setPrice(request.getPrice());
        item.setStockCount(request.getStockCount());
        if (request.getIsAvailable() != null) {
            item.setIsAvailable(request.getIsAvailable());
        }
        return foodItemRepository.save(item);
    }

    /** Staff flips just the availability flag, e.g. "Sandwich just ran out" without touching price/stock. */
    @Transactional
    public FoodItem setAvailability(Long itemId, AvailabilityRequest request) {
        FoodItem item = getItem(itemId);
        item.setIsAvailable(request.getIsAvailable());
        return foodItemRepository.save(item);
    }

    /**
     * Removes a menu item entirely. Note: because order_items has
     * ON DELETE CASCADE on item_id, deleting an item that appears in past
     * orders will also delete those order_item rows, silently altering
     * historical order records. Prefer setAvailability(itemId, false)
     * ("soft delete") for items that already have order history.
     */
    @Transactional
    public void deleteItem(Long itemId) {
        FoodItem item = getItem(itemId);
        try {
            foodItemRepository.delete(item);
            foodItemRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(
                    "Cannot delete '" + item.getItemName() + "' — it's referenced by existing orders. "
                            + "Set it unavailable instead of deleting it.",
                    HttpStatus.CONFLICT);
        }
    }
}
