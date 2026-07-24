package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank(message = "Supplier name waa lagama maarmaan")
    private String supplierName;
    private String phone;

    @Email(message = "Email sax ah geli")
    private String email;
    private String address;
}
