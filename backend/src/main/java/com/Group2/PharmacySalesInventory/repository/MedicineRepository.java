package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByCategory_CategoryId(Long categoryId);
    List<Medicine> findBySupplier_SupplierId(Long supplierId);
    List<Medicine> findByMedicineNameContainingIgnoreCase(String name);

    // Isla medicine-ka (isku magac + isku supplier) ha lagu daabicin (duplicate)
    boolean existsByMedicineNameIgnoreCaseAndSupplier_SupplierId(String medicineName, Long supplierId);

    boolean existsByMedicineNameIgnoreCaseAndSupplier_SupplierIdAndMedicineIdNot(
            String medicineName, Long supplierId, Long medicineId);
}
