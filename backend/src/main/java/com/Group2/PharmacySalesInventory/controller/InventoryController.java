package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.StockRequest;
import com.Group2.PharmacySalesInventory.entity.InventoryTransaction;
import com.Group2.PharmacySalesInventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Kaliya Admin ayaa maamula inventory-ga (stock in/out manual)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/stock-in")
    public ResponseEntity<InventoryTransaction> stockIn(@Valid @RequestBody StockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.stockIn(request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/stock-out")
    public ResponseEntity<InventoryTransaction> stockOut(@Valid @RequestBody StockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.stockOut(request));
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST')")
    @GetMapping
    public ResponseEntity<List<InventoryTransaction>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST')")
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<InventoryTransaction>> getByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(inventoryService.getByMedicine(medicineId));
    }
}
