package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.CustomerRequest;
import com.Group2.PharmacySalesInventory.entity.Customer;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public Customer getById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer lama helin, ID: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest request) {
        validateNoDuplicate(request, null);

        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest request) {
        Customer customer = getById(id);
        validateNoDuplicate(request, id);

        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        return customerRepository.save(customer);
    }

    @Transactional
    public String delete(Long id) {
        Customer customer = getById(id);
        customerRepository.delete(customer);
        return "Customer '" + customer.getFullName() + "' (ID: " + id + ") si guul leh ayaa loo tirtiray.";
    }

    private void validateNoDuplicate(CustomerRequest request, Long excludeId) {
        if (StringUtils.hasText(request.getEmail())) {
            boolean exists = (excludeId == null)
                    ? customerRepository.existsByEmailIgnoreCase(request.getEmail())
                    : customerRepository.existsByEmailIgnoreCaseAndCustomerIdNot(request.getEmail(), excludeId);
            if (exists) {
                throw new DuplicateResourceException(
                        "Customer kale oo email-kiisu yahay '" + request.getEmail() + "' horey ayuu u jiraa.");
            }
        }
        if (StringUtils.hasText(request.getPhone())) {
            boolean exists = (excludeId == null)
                    ? customerRepository.existsByPhone(request.getPhone())
                    : customerRepository.existsByPhoneAndCustomerIdNot(request.getPhone(), excludeId);
            if (exists) {
                throw new DuplicateResourceException(
                        "Customer kale oo taleefankiisu yahay '" + request.getPhone() + "' horey ayuu u jiraa.");
            }
        }
    }
}
