package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsBySupplierNameIgnoreCase(String supplierName);

    boolean existsBySupplierNameIgnoreCaseAndSupplierIdNot(String supplierName, Long supplierId);
}
