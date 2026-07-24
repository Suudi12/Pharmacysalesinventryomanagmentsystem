package com.Group2.PharmacySalesInventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Magaca oo dhan waa lagama maarmaan")
    private String fullName;

    @NotBlank(message = "Username waa lagama maarmaan")
    private String username;

    @NotBlank(message = "Email waa lagama maarmaan")
    @Email(message = "Email sax ah geli")
    private String email;

    @NotBlank(message = "Password waa lagama maarmaan")
    @Size(min = 6, message = "Password ugu yaraan 6 xaraf")
    private String password;
}
