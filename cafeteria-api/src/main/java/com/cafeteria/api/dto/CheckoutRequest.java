package com.cafeteria.api.dto;

public class CheckoutRequest {

    private String paymentMethod = "CASH ON DELIVERY";

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
