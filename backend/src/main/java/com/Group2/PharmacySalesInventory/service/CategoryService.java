package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.CategoryRequest;
import com.Group2.PharmacySalesInventory.entity.Category;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category lama helin, ID: " + id));
    }

    @Transactional
    public Category create(CategoryRequest request) {

        if (categoryRepository.existsByCategoryNameIgnoreCase(request.getCategoryName())) {
            throw new DuplicateResourceException(
                    "Category magaceeda '" + request.getCategoryName() + "' horey ayaa loo abuuray. Fadlan magac kale isticmaal.");
        }
        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, CategoryRequest request) {
        Category category = getById(id);

        if (categoryRepository.existsByCategoryNameIgnoreCaseAndCategoryIdNot(request.getCategoryName(), id)) {
            throw new DuplicateResourceException(
                    "Category kale oo magaceedu yahay '" + request.getCategoryName() + "' horey ayuu u jiraa.");
        }

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        return categoryRepository.save(category);
    }

    @Transactional
    public String delete(Long id) {
        Category category = getById(id);
        categoryRepository.delete(category);
        return "Category '" + category.getCategoryName() + "' (ID: " + id + ") si guul leh ayaa loo tirtiray.";
    }
}
