package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.CreateUserRequest;
import com.Group2.PharmacySalesInventory.dto.request.UpdateRoleRequest;
import com.Group2.PharmacySalesInventory.dto.response.UserResponse;
import com.Group2.PharmacySalesInventory.entity.User;
import com.Group2.PharmacySalesInventory.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoint-yadan oo dhan waxay hoos yimaadaan "/api/admin/**" ee SecurityConfig
// horaantiiba u xaddiday ROLE_ADMIN kaliya. @PreAuthorize halkan waa xoojin dheeraad ah.
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserAdminService userAdminService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        List<UserResponse> users = userAdminService.getAll().stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        User user = userAdminService.getById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    // Admin-ka kaliya ayaa halkan si toos ah ku abuuraya Pharmacist, Cashier,
    // ama Admin kale — fullName/username/email/password/role oo dhan hal mar.
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userAdminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(user));
    }

    // Admin-ku halkan wuxuu ka dhigi karaa user PHARMACIST, CASHIER, ama ADMIN
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        User user = userAdminService.updateRole(id, request.getRole());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    // Admin-ku wuxuu user-ka firfircooneyn kara ama joojin kara (active/inactive)
    @PutMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activate(@PathVariable Long id) {
        User user = userAdminService.setStatus(id, true);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivate(@PathVariable Long id) {
        User user = userAdminService.setStatus(id, false);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String message = userAdminService.deleteUser(id);

        return ResponseEntity.ok(message);
    }
}
