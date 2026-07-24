package com.Group2.PharmacySalesInventory.controller;

import com.Group2.PharmacySalesInventory.dto.request.MedicineRequest;
import com.Group2.PharmacySalesInventory.entity.Medicine;
import com.Group2.PharmacySalesInventory.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    // Admin, Pharmacist, Cashier oo dhan way arki karaan (loo baahan yahay sale-ka)
    @GetMapping
    public ResponseEntity<List<Medicine>> getAll() {
        return ResponseEntity.ok(medicineService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> search(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.search(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getById(id));
    }

    // Kaliya Admin ayaa dari kara / wax ka beddeli kara / tirtiri kara medicines
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Medicine> create(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.create(request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> update(@PathVariable Long id, @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.update(id, request));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        String message = medicineService.delete(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
