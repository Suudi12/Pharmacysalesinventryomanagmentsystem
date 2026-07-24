package com.Group2.PharmacySalesInventory.repository;

import com.Group2.PharmacySalesInventory.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByCategoryName(String categoryName);

    // Loo isticmaalo marka la abuurayo (create) — duplicate check, case-insensitive
    boolean existsByCategoryNameIgnoreCase(String categoryName);

    // Loo isticmaalo marka la cusboonaysiinayo (update) — isla category-ga qudhiisa ha lagu tirin duplicate
    boolean existsByCategoryNameIgnoreCaseAndCategoryIdNot(String categoryName, Long categoryId);
}
