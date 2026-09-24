package com.cafeteria.controller.admin;

import com.cafeteria.dto.request.MenuItemRequest;
import com.cafeteria.dto.response.MenuItemResponse;
import com.cafeteria.service.MenuItemService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/items")
public class AdminMenuItemController {

    private final MenuItemService s;

    public AdminMenuItemController(MenuItemService s) {
        this.s = s;
    }

    @GetMapping
    public List<MenuItemResponse> all() {
        return s.getAllItemsForAdmin();
    }

    @PostMapping
    public MenuItemResponse add(@RequestBody MenuItemRequest r) {
        return s.addItem(r);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(@PathVariable Long id,
                                   @RequestBody MenuItemRequest r) {
        return s.updateItem(id, r);
    }

    @PatchMapping("/{id}/price")
    public MenuItemResponse price(@PathVariable Long id,
                                  @RequestParam BigDecimal value) {
        return s.updatePrice(id, value);
    }

    @PatchMapping("/{id}/stock")
    public MenuItemResponse stock(@PathVariable Long id,
                                  @RequestParam Integer value) {
        return s.updateStock(id, value);
    }

    @PatchMapping("/{id}/availability")
    public MenuItemResponse availability(@PathVariable Long id,
                                         @RequestParam boolean value) {
        return s.setAvailability(id, value);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        s.deleteItem(id);
    }
}