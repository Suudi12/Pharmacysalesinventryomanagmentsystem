package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.StockRequest;
import com.Group2.PharmacySalesInventory.entity.InventoryTransaction;
import com.Group2.PharmacySalesInventory.entity.Medicine;
import com.Group2.PharmacySalesInventory.entity.TransactionType;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.InventoryTransactionRepository;
import com.Group2.PharmacySalesInventory.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MedicineRepository medicineRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;


    @Transactional
    public InventoryTransaction stockIn(StockRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine lama helin, ID: " + request.getMedicineId()));

        medicine.setQuantity(medicine.getQuantity() + request.getQuantity());
        medicineRepository.save(medicine);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .medicine(medicine)
                .transactionType(TransactionType.STOCK_IN)
                .quantity(request.getQuantity())
                .reason(request.getReason() != null ? request.getReason() : "Stock In")
                .build();

        return inventoryTransactionRepository.save(transaction);
    }


    @Transactional
    public InventoryTransaction stockOut(StockRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine lama helin, ID: " + request.getMedicineId()));

        if (medicine.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Stock kuma filna medicine-kan");
        }

        medicine.setQuantity(medicine.getQuantity() - request.getQuantity());
        medicineRepository.save(medicine);

        InventoryTransaction transaction = InventoryTransaction.builder()
                .medicine(medicine)
                .transactionType(TransactionType.STOCK_OUT)
                .quantity(request.getQuantity())
                .reason(request.getReason() != null ? request.getReason() : "Manual Stock Out")
                .build();

        return inventoryTransactionRepository.save(transaction);
    }

    public List<InventoryTransaction> getAll() {
        return inventoryTransactionRepository.findAll();
    }

    public List<InventoryTransaction> getByMedicine(Long medicineId) {
        return inventoryTransactionRepository.findByMedicine_MedicineId(medicineId);
    }
}
