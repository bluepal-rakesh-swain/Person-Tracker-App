package com.financetracker.service;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.Role;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-013 to TC-026 — CategoryService unit tests
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @InjectMocks CategoryService categoryService;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
        category = Category.builder().id(10L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#ff0000").icon("utensils").build();
    }

    // ── TC-013: getAll returns user's categories ───────────────────────────────
    @Test
    void TC013_getAll_returnsUserCategories() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAll(user);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Food");
    }

    // ── TC-014: getAll returns empty list when no categories ──────────────────
    @Test
    void TC014_getAll_noCategories_returnsEmpty() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());

        List<CategoryResponse> result = categoryService.getAll(user);

        assertThat(result).isEmpty();
    }

    // ── TC-015: create saves new category ─────────────────────────────────────
    @Test
    void TC015_create_newCategory_savesAndReturns() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Travel"); req.setType(TransactionType.EXPENSE);
        req.setColor("#0000ff"); req.setIcon("plane");

        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());
        when(categoryRepository.save(any())).thenReturn(
            Category.builder().id(11L).userId(1L).name("Travel")
                .type(TransactionType.EXPENSE).color("#0000ff").icon("plane").build());

        CategoryResponse res = categoryService.create(user, req);

        assertThat(res.getName()).isEqualTo("Travel");
        assertThat(res.getId()).isEqualTo(11L);
    }

    // ── TC-016: create duplicate name throws IllegalArgumentException ──────────
    @Test
    void TC016_create_duplicateName_throwsIllegalArgument() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Food"); req.setType(TransactionType.EXPENSE);
        req.setColor("#ff0000"); req.setIcon("utensils");

        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        assertThatThrownBy(() -> categoryService.create(user, req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");
    }

    // ── TC-017: create is case-insensitive for duplicate check ────────────────
    @Test
    void TC017_create_duplicateNameCaseInsensitive_throws() {
        CategoryRequest req = new CategoryRequest();
        req.setName("FOOD"); req.setType(TransactionType.EXPENSE);
        req.setColor("#ff0000"); req.setIcon("utensils");

        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        assertThatThrownBy(() -> categoryService.create(user, req))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // ── TC-018: update existing category ──────────────────────────────────────
    @Test
    void TC018_update_existingCategory_updatesFields() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Groceries"); req.setType(TransactionType.EXPENSE);
        req.setColor("#00ff00"); req.setIcon("shopping-cart");

        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CategoryResponse res = categoryService.update(user, 10L, req);

        assertThat(res.getName()).isEqualTo("Groceries");
        assertThat(res.getColor()).isEqualTo("#00ff00");
    }

    // ── TC-019: update non-existent category throws ResourceNotFoundException ──
    @Test
    void TC019_update_notFound_throwsResourceNotFound() {
        CategoryRequest req = new CategoryRequest();
        req.setName("X"); req.setType(TransactionType.EXPENSE);
        req.setColor("#000"); req.setIcon("x");

        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.update(user, 99L, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-020: delete existing category removes it ───────────────────────────
    @Test
    void TC020_delete_existingCategory_deletesIt() {
        when(categoryRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(category));

        categoryService.delete(user, 10L);

        verify(categoryRepository).delete(category);
    }

    // ── TC-021: delete non-existent category throws ResourceNotFoundException ──
    @Test
    void TC021_delete_notFound_throwsResourceNotFound() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(user, 99L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-022: exportToCsvBytes returns non-empty bytes ──────────────────────
    @Test
    void TC022_exportToCsvBytes_returnsNonEmpty() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        byte[] csv = categoryService.exportToCsvBytes(user);

        assertThat(csv).isNotEmpty();
        String content = new String(csv);
        assertThat(content).contains("name,type,color,icon");
        assertThat(content).contains("Food");
    }

    // ── TC-023: exportToCsvBytes with no categories returns header only ────────
    @Test
    void TC023_exportToCsvBytes_noCategories_returnsHeaderOnly() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());

        byte[] csv = categoryService.exportToCsvBytes(user);
        String content = new String(csv);

        assertThat(content.trim()).isEqualTo("name,type,color,icon");
    }

    // ── TC-024: exportToPdfBytes returns valid PDF bytes ──────────────────────
    @Test
    void TC024_exportToPdfBytes_returnsValidPdf() throws Exception {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        byte[] pdf = categoryService.exportToPdfBytes(user);

        assertThat(pdf).isNotEmpty();
        // PDF magic bytes: %PDF
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    // ── TC-025: toResponse maps all fields correctly ───────────────────────────
    @Test
    void TC025_toResponse_mapsAllFields() {
        CategoryResponse res = categoryService.toResponse(category);

        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getName()).isEqualTo("Food");
        assertThat(res.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(res.getColor()).isEqualTo("#ff0000");
        assertThat(res.getIcon()).isEqualTo("utensils");
    }

    // ── TC-026: create INCOME category works ──────────────────────────────────
    @Test
    void TC026_create_incomeCategory_works() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Salary"); req.setType(TransactionType.INCOME);
        req.setColor("#00ff00"); req.setIcon("briefcase");

        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());
        when(categoryRepository.save(any())).thenReturn(
            Category.builder().id(12L).userId(1L).name("Salary")
                .type(TransactionType.INCOME).color("#00ff00").icon("briefcase").build());

        CategoryResponse res = categoryService.create(user, req);

        assertThat(res.getType()).isEqualTo(TransactionType.INCOME);
    }
}
