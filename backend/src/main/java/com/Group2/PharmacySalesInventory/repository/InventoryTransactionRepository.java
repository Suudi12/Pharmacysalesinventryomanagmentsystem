package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByMedicine_MedicineId(Long medicineId);
}
