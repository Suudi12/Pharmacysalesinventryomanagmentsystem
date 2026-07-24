package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username waa lagama maarmaan")
    private String username;

    @NotBlank(message = "Password waa lagama maarmaan")
    private String password;
}
