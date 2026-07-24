package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineRequest {
    @NotBlank(message = "Medicine name waa lagama maarmaan")
    private String medicineName;

    @NotNull(message = "Category waa lagama maarmaan")
    private Long categoryId;

    @NotNull(message = "Supplier waa lagama maarmaan")
    private Long supplierId;

    @NotNull(message = "Price waa lagama maarmaan")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price waa inuu ka weyn yahay 0")
    private BigDecimal price;

    @NotNull(message = "Quantity waa lagama maarmaan")
    @Min(value = 0, message = "Quantity ma noqon karto negative")
    private Integer quantity;

    private LocalDate expiryDate;
}
