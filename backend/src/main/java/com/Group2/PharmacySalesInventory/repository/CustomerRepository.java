package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndCustomerIdNot(String email, Long customerId);

    boolean existsByPhone(String phone);
    boolean existsByPhoneAndCustomerIdNot(String phone, Long customerId);
}
