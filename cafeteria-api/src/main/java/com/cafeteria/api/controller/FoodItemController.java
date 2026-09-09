package com.cafeteria.api.controller;

import com.cafeteria.api.dto.AvailabilityRequest;
import com.cafeteria.api.dto.FoodItemRequest;
import com.cafeteria.api.model.FoodItem;
import com.cafeteria.api.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "*")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    /** Menu for customers/UI to render one button per item. */
    @GetMapping
    public List<FoodItem> getAllItems() {
        return foodItemService.getAllItems();
    }

    @GetMapping("/{itemId}")
    public FoodItem getItem(@PathVariable Long itemId) {
        return foodItemService.getItem(itemId);
    }

    /** Admin/staff: add a new item to the menu. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FoodItem createItem(@Valid @RequestBody FoodItemRequest request) {
        return foodItemService.createItem(request);
    }

    /** Admin/staff: update an item's name, price, stock, and/or availability. */
    @PutMapping("/{itemId}")
    public FoodItem updateItem(@PathVariable Long itemId, @Valid @RequestBody FoodItemRequest request) {
        return foodItemService.updateItem(itemId, request);
    }

    /** Admin/staff: mark an item available/unavailable without touching price or stock. */
    @PatchMapping("/{itemId}/availability")
    public FoodItem setAvailability(@PathVariable Long itemId, @Valid @RequestBody AvailabilityRequest request) {
        return foodItemService.setAvailability(itemId, request);
    }

    /** Admin/staff: remove an item from the menu entirely. */
    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long itemId) {
        foodItemService.deleteItem(itemId);
    }
}
