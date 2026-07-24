package com.Group2.PharmacySalesInventory.dto.response;

import com.Group2.PharmacySalesInventory.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userId;
    private String fullName;
    private String username;
    private String email;
    private String role;
    private boolean status;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.isStatus())
                .build();
    }
}
