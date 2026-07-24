package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByCustomer_CustomerId(Long customerId);
    List<Sale> findBySoldBy_UserId(Long userId);
}
