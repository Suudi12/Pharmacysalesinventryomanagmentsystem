package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class SaleRequest {
    @NotNull(message = "Customer waa lagama maarmaan")
    private Long customerId;

    @NotEmpty(message = "Sale-ku waa inuu yeeshaa ugu yaraan hal item")
    @Valid
    private List<SaleItemRequest> items;
}
