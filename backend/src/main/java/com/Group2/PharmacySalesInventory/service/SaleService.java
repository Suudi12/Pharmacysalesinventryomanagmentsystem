package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.SaleItemRequest;
import com.Group2.PharmacySalesInventory.dto.request.SaleRequest;
import com.Group2.PharmacySalesInventory.entity.*;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;


    @Transactional
    public Sale createSale(SaleRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer lama helin, ID: " + request.getCustomerId()));

        validateNoDuplicateItems(request.getItems());

        User currentUser = getCurrentUser();

        Sale sale = Sale.builder()
                .customer(customer)
                .soldBy(currentUser)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (SaleItemRequest item : request.getItems()) {
            Medicine medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine lama helin, ID: " + item.getMedicineId()));

            if (medicine.getQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException(
                        "Stock kuma filna '" + medicine.getMedicineName() + "'. Hadhay: "
                                + medicine.getQuantity() + ", la codsaday: " + item.getQuantity());
            }

            BigDecimal unitPrice = medicine.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            SaleDetail saleDetail = SaleDetail.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();
            sale.getSaleDetails().add(saleDetail);

            // Update stock
            medicine.setQuantity(medicine.getQuantity() - item.getQuantity());
            medicineRepository.save(medicine);

            // Log inventory transaction
            InventoryTransaction transaction = InventoryTransaction.builder()
                    .medicine(medicine)
                    .transactionType(TransactionType.STOCK_OUT)
                    .quantity(item.getQuantity())
                    .reason("Sale")
                    .build();
            inventoryTransactionRepository.save(transaction);

            grandTotal = grandTotal.add(subtotal);
        }

        sale.setTotalAmount(grandTotal);
        return saleRepository.save(sale);
    }

    public List<Sale> getAll() {
        return saleRepository.findAll();
    }

    public Sale getById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale lama helin, ID: " + id));
    }


    private void validateNoDuplicateItems(List<SaleItemRequest> items) {
        Set<Long> seenMedicineIds = new HashSet<>();
        for (SaleItemRequest item : items) {
            if (!seenMedicineIds.add(item.getMedicineId())) {
                throw new DuplicateResourceException(
                        "Medicine ID " + item.getMedicineId() + " waxaa lagu daabacay sale-kan hal mar ka badan. "
                                + "Fadlan isku ku dar quantity-ga hal item.");
            }
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User lama helin: " + username));
    }
}
