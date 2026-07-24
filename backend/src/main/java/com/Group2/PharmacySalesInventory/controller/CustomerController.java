package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.CustomerRequest;
import com.Group2.PharmacySalesInventory.entity.Customer;
import com.Group2.PharmacySalesInventory.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // Admin, Pharmacist, Cashier oo dhan way arki karaan
    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        return ResponseEntity.ok(customerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    // Admin, Pharmacist, Cashier dhamaantood way dari karaan customer cusub
    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    // Admin + Pharmacist ayaa wax ka beddeli kara customer
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_PHARMACIST')")
    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    // Kaliya Admin ayaa tirtiri kara customer
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        String message = customerService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
