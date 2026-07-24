package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.SaleRequest;
import com.Group2.PharmacySalesInventory.entity.Sale;
import com.Group2.PharmacySalesInventory.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    // Admin, Pharmacist, Cashier oo dhan way sameyn karaan sale (waa shaqadooda ugu weyn)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST','ROLE_CASHIER')")
    @PostMapping
    public ResponseEntity<Sale> create(@Valid @RequestBody SaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }

    // Dhammaan roles way arki karaan sales-ka (reports)
    @GetMapping
    public ResponseEntity<List<Sale>> getAll() {
        return ResponseEntity.ok(saleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getById(id));
    }
}
