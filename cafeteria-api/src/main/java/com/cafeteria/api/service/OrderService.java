package com.cafeteria.api.service;

import com.cafeteria.api.dto.AddItemRequest;
import com.cafeteria.api.dto.CheckoutRequest;
import com.cafeteria.api.exception.ApiException;
import com.cafeteria.api.model.FoodItem;
import com.cafeteria.api.model.Order;
import com.cafeteria.api.model.OrderItem;
import com.cafeteria.api.model.OrderStatus;
import com.cafeteria.api.repository.FoodItemRepository;
import com.cafeteria.api.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;

    public OrderService(OrderRepository orderRepository, FoodItemRepository foodItemRepository) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
    }

    /** Called once when the UI starts a fresh order (e.g. page load / "New Order"). */
    @Transactional
    public Order createOrder() {
        return orderRepository.save(new Order());
    }

    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order " + orderId + " not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Called every time a menu button is clicked in the UI.
     * Adds the item to the order's cart (or bumps quantity if it's already in there),
     * deducts stock, and recalculates the running total.
     */
    @Transactional
    public Order addItemToOrder(Long orderId, AddItemRequest request) {
        Order order = getOrder(orderId);

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new ApiException("Order is already " + order.getOrderStatus() + " and can no longer be modified",
                    HttpStatus.CONFLICT);
        }

        FoodItem foodItem = foodItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ApiException("Food item " + request.getItemId() + " not found", HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(foodItem.getIsAvailable())) {
            throw new ApiException(foodItem.getItemName() + " is currently unavailable", HttpStatus.CONFLICT);
        }
        if (foodItem.getStockCount() < request.getQuantity()) {
            throw new ApiException("Not enough stock for " + foodItem.getItemName()
                    + " (only " + foodItem.getStockCount() + " left)", HttpStatus.CONFLICT);
        }

        // If this item is already a line in the cart, just bump the quantity instead of duplicating rows.
        OrderItem existingLine = order.getOrderItems().stream()
                .filter(line -> line.getFoodItem().getItemId().equals(foodItem.getItemId()))
                .findFirst()
                .orElse(null);

        if (existingLine != null) {
            existingLine.setQuantity(existingLine.getQuantity() + request.getQuantity());
            existingLine.setSubtotal(existingLine.getUnitPrice().multiply(BigDecimal.valueOf(existingLine.getQuantity())));
        } else {
            OrderItem line = new OrderItem();
            line.setOrder(order);
            line.setFoodItem(foodItem);
            line.setQuantity(request.getQuantity());
            line.setUnitPrice(foodItem.getPrice());
            line.setSubtotal(foodItem.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            order.getOrderItems().add(line);
        }

        foodItem.setStockCount(foodItem.getStockCount() - request.getQuantity());
        foodItemRepository.save(foodItem);

        recalculateTotal(order);
        return orderRepository.save(order);
    }

    /** Removes a line from the cart (e.g. an "x" button next to a row) and restores stock. */
    @Transactional
    public Order removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = getOrder(orderId);

        OrderItem line = order.getOrderItems().stream()
                .filter(l -> l.getOrderItemId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new ApiException("Order item " + orderItemId + " not found in order " + orderId,
                        HttpStatus.NOT_FOUND));

        FoodItem foodItem = line.getFoodItem();
        foodItem.setStockCount(foodItem.getStockCount() + line.getQuantity());
        foodItemRepository.save(foodItem);

        order.getOrderItems().remove(line);
        recalculateTotal(order);
        return orderRepository.save(order);
    }

    /**
     * Cancels the whole order: restores stock for every line item still in the cart
     * and marks the order CANCELLED (kept as a record rather than hard-deleted).
     */
    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = getOrder(orderId);

        if (order.getOrderStatus() == OrderStatus.COMPLETED) {
            throw new ApiException("Order is already completed and cannot be cancelled", HttpStatus.CONFLICT);
        }

        for (OrderItem line : order.getOrderItems()) {
            FoodItem foodItem = line.getFoodItem();
            foodItem.setStockCount(foodItem.getStockCount() + line.getQuantity());
            foodItemRepository.save(foodItem);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /** Finalizes the order: locks in the payment method and marks it COMPLETED. */
    @Transactional
    public Order checkout(Long orderId, CheckoutRequest request) {
        Order order = getOrder(orderId);

        if (order.getOrderItems().isEmpty()) {
            throw new ApiException("Cannot checkout an empty order", HttpStatus.BAD_REQUEST);
        }

        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderStatus(OrderStatus.COMPLETED);
        return orderRepository.save(order);
    }

    private void recalculateTotal(Order order) {
        BigDecimal total = order.getOrderItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalBill(total);
    }
}
