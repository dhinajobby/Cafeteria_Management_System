package com.cafeteria.api.controller;

import com.cafeteria.api.dto.AddItemRequest;
import com.cafeteria.api.dto.CheckoutRequest;
import com.cafeteria.api.model.Order;
import com.cafeteria.api.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Starts a new empty order (called once when the ordering screen loads). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder() {
        return orderService.createOrder();
    }

    @GetMapping("/{orderId}")
    public Order getOrder(@PathVariable Long orderId) {
        return orderService.getOrder(orderId);
    }

    /** Called on every menu button click. Adds the item and returns the updated cart + total. */
    @PostMapping("/{orderId}/items")
    public Order addItem(@PathVariable Long orderId, @Valid @RequestBody AddItemRequest request) {
        return orderService.addItemToOrder(orderId, request);
    }

    /** Removes one cart row (e.g. a "remove" button on that row). */
    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public Order removeItem(@PathVariable Long orderId, @PathVariable Long orderItemId) {
        return orderService.removeItemFromOrder(orderId, orderItemId);
    }

    /** Finalizes the order once the customer confirms. */
    @PutMapping("/{orderId}/checkout")
    public Order checkout(@PathVariable Long orderId, @RequestBody CheckoutRequest request) {
        return orderService.checkout(orderId, request);
    }

    /** Cancels the whole order (e.g. customer walks away) and restores stock for every item in it. */
    @DeleteMapping("/{orderId}")
    public Order cancelOrder(@PathVariable Long orderId) {
        return orderService.cancelOrder(orderId);
    }
}
