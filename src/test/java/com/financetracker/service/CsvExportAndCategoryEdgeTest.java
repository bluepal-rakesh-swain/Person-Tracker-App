package com.financetracker.service;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.*;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-108 to TC-114 — CsvExportService and CategoryService edge case tests
 */
@ExtendWith(MockitoExtension.class)
class CsvExportAndCategoryEdgeTest {

    // ── CsvExportService mocks ────────────────────────────────────────────────
    @Mock TransactionService transactionService;
    @Mock CategoryRepository categoryRepository;

    @InjectMocks CsvExportService csvExportService;

    // ── CategoryService (separate InjectMocks not possible in same class) ─────
    // We test CategoryService directly using a spy/manual mock approach
    CategoryService categoryService;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
        category = Category.builder().id(5L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#f00").icon("utensils").build();
        categoryService = new CategoryService(categoryRepository);
    }

    // ── TC-108: exportToCsv writes header and transaction rows ────────────────
    @Test
    void TC108_exportToCsv_writesHeaderAndRows() {
        Transaction tx = Transaction.builder().id(1L).userId(1L).categoryId(5L)
            .amount(50000L).description("Lunch").date(LocalDate.of(2026, 3, 15))
            .type(TransactionType.EXPENSE).build();

        when(transactionService.getAllForUser(1L)).thenReturn(List.of(tx));
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        StringWriter sw = new StringWriter();
        csvExportService.exportToCsv(user, new PrintWriter(sw));
        String csv = sw.toString();

        assertThat(csv).contains("id,date,type,category,amount,description");
        assertThat(csv).contains("Food");
        assertThat(csv).contains("50000");
    }

    // ── TC-109: exportToCsv with no transactions writes only header ───────────
    @Test
    void TC109_exportToCsv_noTransactions_writesOnlyHeader() {
        when(transactionService.getAllForUser(1L)).thenReturn(List.of());
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());

        StringWriter sw = new StringWriter();
        csvExportService.exportToCsv(user, new PrintWriter(sw));

        assertThat(sw.toString().trim()).isEqualTo("id,date,type,category,amount,description");
    }

    // ── TC-110: exportToCsv escapes commas in description ─────────────────────
    @Test
    void TC110_exportToCsv_descriptionWithComma_isEscaped() {
        Transaction tx = Transaction.builder().id(2L).userId(1L).categoryId(5L)
            .amount(10000L).description("Bread, Butter").date(LocalDate.of(2026, 3, 1))
            .type(TransactionType.EXPENSE).build();

        when(transactionService.getAllForUser(1L)).thenReturn(List.of(tx));
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        StringWriter sw = new StringWriter();
        csvExportService.exportToCsv(user, new PrintWriter(sw));

        assertThat(sw.toString()).contains("\"Bread, Butter\"");
    }

    // ── TC-111: CategoryService.create throws when duplicate name ─────────────
    @Test
    void TC111_categoryCreate_duplicateName_throwsIllegalArgument() {
        CategoryRequest req = new CategoryRequest();
        req.setName("Food"); req.setType(TransactionType.EXPENSE);
        req.setColor("#f00"); req.setIcon("utensils");

        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        assertThatThrownBy(() -> categoryService.create(user, req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Food");
    }

    // ── TC-112: CategoryService.update throws for unknown category ─────────────
    @Test
    void TC112_categoryUpdate_unknownId_throwsResourceNotFound() {
        CategoryRequest req = new CategoryRequest();
        req.setName("New"); req.setType(TransactionType.EXPENSE);
        req.setColor("#000"); req.setIcon("star");

        when(categoryRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.update(user, 999L, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-113: CategoryService.delete throws for unknown category ─────────────
    @Test
    void TC113_categoryDelete_unknownId_throwsResourceNotFound() {
        when(categoryRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(user, 999L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-114: CategoryService.exportToCsvBytes returns valid CSV ─────────────
    @Test
    void TC114_categoryExportToCsvBytes_returnsValidCsv() {
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(category));

        byte[] csv = categoryService.exportToCsvBytes(user);
        String content = new String(csv);

        assertThat(content).contains("name,type,color,icon");
        assertThat(content).contains("Food");
        assertThat(content).contains("EXPENSE");
    }
}
