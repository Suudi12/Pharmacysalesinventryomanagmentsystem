package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.SupplierRequest;
import com.Group2.PharmacySalesInventory.entity.Supplier;
import com.Group2.PharmacySalesInventory.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    // Admin + Pharmacist ayaa arki kara (Pharmacist u baahan yahay ogaanshaha suppliers)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST')")
    @GetMapping
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST')")
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    // Kaliya Admin ayaa CRUD sameyn kara suppliers
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        String message = supplierService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
