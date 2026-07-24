package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Full name waa lagama maarmaan")
    private String fullName;
    private String phone;

    @Email(message = "Email sax ah geli")
    private String email;
    private String address;
}
