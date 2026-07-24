package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.SupplierRequest;
import com.Group2.PharmacySalesInventory.entity.Supplier;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Supplier getById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier lama helin, ID: " + id));
    }

    @Transactional
    public Supplier create(SupplierRequest request) {
        if (supplierRepository.existsBySupplierNameIgnoreCase(request.getSupplierName())) {
            throw new DuplicateResourceException(
                    "Supplier magaciisu yahay '" + request.getSupplierName() + "' horey ayaa loo diiwaan geliyay.");
        }
        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier update(Long id, SupplierRequest request) {
        Supplier supplier = getById(id);

        if (supplierRepository.existsBySupplierNameIgnoreCaseAndSupplierIdNot(request.getSupplierName(), id)) {
            throw new DuplicateResourceException(
                    "Supplier kale oo magaciisu yahay '" + request.getSupplierName() + "' horey ayuu u jiraa.");
        }

        supplier.setSupplierName(request.getSupplierName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public String delete(Long id) {
        Supplier supplier = getById(id);
        supplierRepository.delete(supplier);
        return "Supplier '" + supplier.getSupplierName() + "' (ID: " + id + ") si guul leh ayaa loo tirtiray.";
    }
}
