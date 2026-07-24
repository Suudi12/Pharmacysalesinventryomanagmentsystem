package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.MedicineRequest;
import com.Group2.PharmacySalesInventory.entity.Category;
import com.Group2.PharmacySalesInventory.entity.Medicine;
import com.Group2.PharmacySalesInventory.entity.Supplier;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.CategoryRepository;
import com.Group2.PharmacySalesInventory.repository.MedicineRepository;
import com.Group2.PharmacySalesInventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public List<Medicine> getAll() {
        return medicineRepository.findAll();
    }

    public Medicine getById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine lama helin, ID: " + id));
    }

    @Transactional
    public Medicine create(MedicineRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category lama helin, ID: " + request.getCategoryId()));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier lama helin, ID: " + request.getSupplierId()));


        if (medicineRepository.existsByMedicineNameIgnoreCaseAndSupplier_SupplierId(
                request.getMedicineName(), request.getSupplierId())) {
            throw new DuplicateResourceException(
                    "Medicine '" + request.getMedicineName() + "' oo supplier-kan ('" + supplier.getSupplierName()
                            + "') laga soo iibsaday horey ayuu u jiraa. Fadlan cusboonaysii diiwaanka jira.");
        }

        Medicine medicine = Medicine.builder()
                .medicineName(request.getMedicineName())
                .category(category)
                .supplier(supplier)
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .expiryDate(request.getExpiryDate())
                .build();
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine update(Long id, MedicineRequest request) {
        Medicine medicine = getById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category lama helin, ID: " + request.getCategoryId()));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier lama helin, ID: " + request.getSupplierId()));

        if (medicineRepository.existsByMedicineNameIgnoreCaseAndSupplier_SupplierIdAndMedicineIdNot(
                request.getMedicineName(), request.getSupplierId(), id)) {
            throw new DuplicateResourceException(
                    "Medicine kale oo magaciisu yahay '" + request.getMedicineName() + "' oo isla supplier-kan ah horey ayuu u jiraa.");
        }

        medicine.setMedicineName(request.getMedicineName());
        medicine.setCategory(category);
        medicine.setSupplier(supplier);
        medicine.setPrice(request.getPrice());
        medicine.setQuantity(request.getQuantity());
        medicine.setExpiryDate(request.getExpiryDate());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public String delete(Long id) {
        Medicine medicine = getById(id);
        medicineRepository.delete(medicine);
        return "Medicine '" + medicine.getMedicineName() + "' (ID: " + id + ") si guul leh ayaa loo tirtiray.";
    }

    public List<Medicine> search(String name) {
        return medicineRepository.findByMedicineNameContainingIgnoreCase(name);
    }
}
