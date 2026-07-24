package com.Group2.PharmacySalesInventory.dto.request;

import com.Group2.PharmacySalesInventory.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    @NotNull(message = "Role waa lagama maarmaan")
    private Role role;
}
