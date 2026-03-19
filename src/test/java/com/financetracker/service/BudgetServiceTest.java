package com.financetracker.service;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.*;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-041 to TC-058 — BudgetService unit tests
 */
@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock BudgetRepository budgetRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock TransactionRepository transactionRepository;

    @InjectMocks BudgetService budgetService;

    private User user;
    private Category category;
    private Budget budget;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
        category = Category.builder().id(5L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#f00").icon("utensils").build();
        budget = Budget.builder().id(1L).userId(1L).categoryId(5L)
            .monthYear("2026-03").limitAmount(500000L).build();
    }

    // ── TC-041: upsert creates new budget when none exists ────────────────────
    @Test
    void TC041_upsert_newBudget_createsAndReturns() {
        BudgetRequest req = new BudgetRequest();
        req.setCategoryId(5L); req.setMonthYear("2026-03"); req.setLimitAmount(500000L);

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(category));
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthYear(1L, 5L, "2026-03"))
            .thenReturn(Optional.empty());
        when(budgetRepository.save(any())).thenReturn(budget);

        BudgetResponse res = budgetService.upsert(user, req);

        assertThat(res.getLimitAmount()).isEqualTo(500000L);
        assertThat(res.getCategoryName()).isEqualTo("Food");
        verify(budgetRepository).save(any(Budget.class));
    }

    // ── TC-042: upsert updates existing budget ────────────────────────────────
    @Test
    void TC042_upsert_existingBudget_updatesLimit() {
        BudgetRequest req = new BudgetRequest();
        req.setCategoryId(5L); req.setMonthYear("2026-03"); req.setLimitAmount(800000L);

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(category));
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthYear(1L, 5L, "2026-03"))
            .thenReturn(Optional.of(budget));

        Budget updated = Budget.builder().id(1L).userId(1L).categoryId(5L)
            .monthYear("2026-03").limitAmount(800000L).build();
        when(budgetRepository.save(any())).thenReturn(updated);

        BudgetResponse res = budgetService.upsert(user, req);

        assertThat(res.getLimitAmount()).isEqualTo(800000L);
    }

    // ── TC-043: upsert with invalid category throws ResourceNotFoundException ──
    @Test
    void TC043_upsert_invalidCategory_throwsResourceNotFound() {
        BudgetRequest req = new BudgetRequest();
        req.setCategoryId(999L); req.setMonthYear("2026-03"); req.setLimitAmount(100000L);

        when(categoryRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.upsert(user, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-044: getCurrentBudgets returns budgets with spending ───────────────
    @Test
    void TC044_getCurrentBudgets_returnsBudgetsWithSpending() {
        when(budgetRepository.findByUserIdAndMonthYear(1L, "2026-03"))
            .thenReturn(List.of(budget));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        List<Object[]> spentRows44 = new ArrayList<>();
        spentRows44.add(new Object[]{5L, 200000L});
        when(transactionRepository.spentByCategoryInMonth(eq(1L), any(), any(), eq(TransactionType.EXPENSE)))
            .thenReturn(spentRows44);

        List<BudgetResponse> result = budgetService.getCurrentBudgets(user, "2026-03");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSpent()).isEqualTo(200000L);
        assertThat(result.get(0).getRemaining()).isEqualTo(300000L);
    }

    // ── TC-045: getCurrentBudgets uses current month when param is null ────────
    @Test
    void TC045_getCurrentBudgets_nullParam_usesCurrentMonth() {
        when(budgetRepository.findByUserIdAndMonthYear(eq(1L), anyString()))
            .thenReturn(List.of());
        when(transactionRepository.spentByCategoryInMonth(any(), any(), any(), any()))
            .thenReturn(List.of());

        List<BudgetResponse> result = budgetService.getCurrentBudgets(user, null);

        assertThat(result).isEmpty();
        verify(budgetRepository).findByUserIdAndMonthYear(eq(1L), anyString());
    }

    // ── TC-046: getCurrentBudgets calculates usagePercent correctly ───────────
    @Test
    void TC046_getCurrentBudgets_usagePercentCalculated() {
        when(budgetRepository.findByUserIdAndMonthYear(1L, "2026-03"))
            .thenReturn(List.of(budget)); // limit = 500000
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        List<Object[]> spentRows46 = new ArrayList<>();
        spentRows46.add(new Object[]{5L, 400000L});
        when(transactionRepository.spentByCategoryInMonth(eq(1L), any(), any(), eq(TransactionType.EXPENSE)))
            .thenReturn(spentRows46); // spent = 400000

        List<BudgetResponse> result = budgetService.getCurrentBudgets(user, "2026-03");

        assertThat(result.get(0).getUsagePercent()).isEqualTo(80.0);
    }

    // ── TC-047: exportBudgetsToCsvBytes returns CSV with header ───────────────
    @Test
    void TC047_exportBudgetsToCsvBytes_returnsValidCsv() throws Exception {
        when(budgetRepository.findByUserId(1L)).thenReturn(List.of(budget));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(transactionRepository.spentByCategoryInMonth(any(), any(), any(), any()))
            .thenReturn(List.of());

        byte[] csv = budgetService.exportBudgetsToCsvBytes(user);
        String content = new String(csv);

        assertThat(content).contains("categoryName,monthYear,limitAmount");
        assertThat(content).contains("Food");
    }

    // ── TC-048: exportBudgetsToPdf returns valid PDF bytes ────────────────────
    @Test
    void TC048_exportBudgetsToPdf_returnsValidPdf() throws Exception {
        when(budgetRepository.findByUserId(1L)).thenReturn(List.of(budget));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(transactionRepository.spentByCategoryInMonth(any(), any(), any(), any()))
            .thenReturn(List.of());

        byte[] pdf = budgetService.exportBudgetsToPdf(user);

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    // ── TC-049: usagePercent is 0 when limitAmount is 0 ──────────────────────
    @Test
    void TC049_getCurrentBudgets_zeroLimit_usagePercentIsZero() {
        Budget zeroBudget = Budget.builder().id(2L).userId(1L).categoryId(5L)
            .monthYear("2026-03").limitAmount(0L).build();

        when(budgetRepository.findByUserIdAndMonthYear(1L, "2026-03"))
            .thenReturn(List.of(zeroBudget));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(transactionRepository.spentByCategoryInMonth(any(), any(), any(), any()))
            .thenReturn(List.of());

        List<BudgetResponse> result = budgetService.getCurrentBudgets(user, "2026-03");

        assertThat(result.get(0).getUsagePercent()).isEqualTo(0.0);
    }

    // ── TC-050: getCurrentBudgets with no spending shows 0 spent ─────────────
    @Test
    void TC050_getCurrentBudgets_noSpending_spentIsZero() {
        when(budgetRepository.findByUserIdAndMonthYear(1L, "2026-03"))
            .thenReturn(List.of(budget));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
        when(transactionRepository.spentByCategoryInMonth(any(), any(), any(), any()))
            .thenReturn(List.of());

        List<BudgetResponse> result = budgetService.getCurrentBudgets(user, "2026-03");

        assertThat(result.get(0).getSpent()).isEqualTo(0L);
        assertThat(result.get(0).getRemaining()).isEqualTo(500000L);
    }
}
