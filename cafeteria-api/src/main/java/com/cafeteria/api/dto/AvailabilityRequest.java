package com.cafeteria.api.dto;

import jakarta.validation.constraints.NotNull;

public class AvailabilityRequest {

    @NotNull
    private Boolean isAvailable;

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
