package com.financetracker.service;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAll(User user) {
        return categoryRepository.findByUserId(user.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(User user, CategoryRequest request) {
        boolean exists = categoryRepository.findByUserId(user.getId())
            .stream().anyMatch(c -> c.getName().equalsIgnoreCase(request.getName()));
        if (exists) {
            throw new IllegalArgumentException("A category named '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
            .userId(user.getId())
            .name(request.getName())
            .type(request.getType())
            .color(request.getColor())
            .icon(request.getIcon())
            .build();
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(User user, Long id, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setType(request.getType());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(User user, Long id) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    public CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .type(c.getType())
            .color(c.getColor())
            .icon(c.getIcon())
            .build();
    }
}
