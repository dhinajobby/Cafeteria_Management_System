package com.cafeteria.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class FoodItemRequest {

    @NotBlank
    private String itemName;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "price must be greater than 0")
    private BigDecimal price;

    @NotNull
    @Min(value = 0, message = "stockCount cannot be negative")
    private Integer stockCount;

    private Boolean isAvailable = true;

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockCount() { return stockCount; }
    public void setStockCount(Integer stockCount) { this.stockCount = stockCount; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
