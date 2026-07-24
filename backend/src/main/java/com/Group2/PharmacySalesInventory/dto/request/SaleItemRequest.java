package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaleItemRequest {
    @NotNull(message = "Medicine waa lagama maarmaan")
    private Long medicineId;

    @NotNull(message = "Quantity waa lagama maarmaan")
    @Min(value = 1, message = "Quantity waa inuu ka weyn yahay 0")
    private Integer quantity;
}
