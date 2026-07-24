package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name waa lagama maarmaan")
    private String categoryName;
    private String description;
}
