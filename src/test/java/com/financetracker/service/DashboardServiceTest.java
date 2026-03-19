package com.financetracker.service;

import com.financetracker.dto.response.DashboardSummary;
import com.financetracker.dto.response.MonthlyChartData;
import com.financetracker.dto.response.CategoryChartData;
import com.financetracker.entity.*;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-061 to TC-078 — DashboardService unit tests
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock CategoryRepository categoryRepository;

    @InjectMocks DashboardService dashboardService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
    }

    // ── TC-061: getCurrentMonthSummary returns correct totals ─────────────────
    @Test
    void TC061_getCurrentMonthSummary_returnsCorrectTotals() {
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.INCOME), any(), any())).thenReturn(150000L);
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.EXPENSE), any(), any())).thenReturn(74000L);

        DashboardSummary summary = dashboardService.getCurrentMonthSummary(user);

        assertThat(summary.getTotalIncome()).isEqualTo(150000L);
        assertThat(summary.getTotalExpenses()).isEqualTo(74000L);
        assertThat(summary.getNetBalance()).isEqualTo(76000L);
    }

    // ── TC-062: getCurrentMonthSummary handles null DB results as 0 ───────────
    @Test
    void TC062_getCurrentMonthSummary_nullResults_treatedAsZero() {
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.INCOME), any(), any())).thenReturn(null);
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.EXPENSE), any(), any())).thenReturn(null);

        DashboardSummary summary = dashboardService.getCurrentMonthSummary(user);

        assertThat(summary.getTotalIncome()).isEqualTo(0L);
        assertThat(summary.getTotalExpenses()).isEqualTo(0L);
        assertThat(summary.getNetBalance()).isEqualTo(0L);
    }

    // ── TC-063: getCurrentMonthSummary sets monthYear field ───────────────────
    @Test
    void TC063_getCurrentMonthSummary_setsMonthYear() {
        when(transactionRepository.sumByUserAndTypeAndDateRange(any(), any(), any(), any()))
            .thenReturn(0L);

        DashboardSummary summary = dashboardService.getCurrentMonthSummary(user);

        assertThat(summary.getMonthYear()).matches("\\d{4}-\\d{2}");
    }

    // ── TC-064: getMonthlyChart returns aggregated monthly data ───────────────
    @Test
    void TC064_getMonthlyChart_returnsMonthlyData() {
        List<Object[]> chartRows = new ArrayList<>();
        chartRows.add(new Object[]{"2026-01", "INCOME", 100000L});
        chartRows.add(new Object[]{"2026-01", "EXPENSE", 50000L});
        when(transactionRepository.monthlyChartData(1L, 2026)).thenReturn(chartRows);

        List<MonthlyChartData> result = dashboardService.getMonthlyChart(user, 2026);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIncome()).isEqualTo(100000L);
        assertThat(result.get(0).getExpense()).isEqualTo(50000L);
    }

    // ── TC-065: getMonthlyChart returns empty list when no data ───────────────
    @Test
    void TC065_getMonthlyChart_noData_returnsEmpty() {
        when(transactionRepository.monthlyChartData(1L, 2020)).thenReturn(List.of());

        List<MonthlyChartData> result = dashboardService.getMonthlyChart(user, 2020);

        assertThat(result).isEmpty();
    }

    // ── TC-066: getCategoryChart returns category breakdown ───────────────────
    @Test
    void TC066_getCategoryChart_returnsCategoryBreakdown() {
        Category cat = Category.builder().id(5L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#f00").icon("utensils").build();

        List<Object[]> catRows = new ArrayList<>();
        catRows.add(new Object[]{5L, 200000L});
        when(transactionRepository.categoryChartData(eq(1L), any(), any()))
            .thenReturn(catRows);
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of(cat));

        List<CategoryChartData> result = dashboardService.getCategoryChart(user, "2026-03");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategoryName()).isEqualTo("Food");
        assertThat(result.get(0).getTotal()).isEqualTo(200000L);
    }

    // ── TC-067: getCategoryChart returns empty when no transactions ───────────
    @Test
    void TC067_getCategoryChart_noTransactions_returnsEmpty() {
        when(transactionRepository.categoryChartData(eq(1L), any(), any()))
            .thenReturn(List.of());
        when(categoryRepository.findByUserId(1L)).thenReturn(List.of());

        List<CategoryChartData> result = dashboardService.getCategoryChart(user, "2026-03");

        assertThat(result).isEmpty();
    }

    // ── TC-068: getMonthlySummary returns correct totals for given month ───────
    @Test
    void TC068_getMonthlySummary_specificMonth_returnsCorrectTotals() {
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.INCOME), any(), any())).thenReturn(200000L);
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.EXPENSE), any(), any())).thenReturn(80000L);

        DashboardSummary summary = dashboardService.getMonthlySummary(user, "2026-01");

        assertThat(summary.getTotalIncome()).isEqualTo(200000L);
        assertThat(summary.getTotalExpenses()).isEqualTo(80000L);
        assertThat(summary.getNetBalance()).isEqualTo(120000L);
        assertThat(summary.getMonthYear()).isEqualTo("2026-01");
    }

    // ── TC-069: getYearlySummary aggregates all months ────────────────────────
    @Test
    void TC069_getYearlySummary_aggregatesAllMonths() {
        List<Object[]> yearlyRows = new ArrayList<>();
        yearlyRows.add(new Object[]{"2026-01", "INCOME", 100000L});
        yearlyRows.add(new Object[]{"2026-02", "EXPENSE", 50000L});
        when(transactionRepository.yearlySummaryData(1L, 2026)).thenReturn(yearlyRows);

        var result = dashboardService.getYearlySummary(user, 2026);

        assertThat(result).hasSize(2);
    }

    // ── TC-070: getCurrentMonthSummaryAll returns platform-wide totals ─────────
    @Test
    void TC070_getCurrentMonthSummaryAll_returnsPlatformTotals() {
        when(transactionRepository.sumByTypeAndDateRange(
            eq(TransactionType.INCOME), any(), any())).thenReturn(500000L);
        when(transactionRepository.sumByTypeAndDateRange(
            eq(TransactionType.EXPENSE), any(), any())).thenReturn(300000L);

        DashboardSummary summary = dashboardService.getCurrentMonthSummaryAll();

        assertThat(summary.getTotalIncome()).isEqualTo(500000L);
        assertThat(summary.getTotalExpenses()).isEqualTo(300000L);
        assertThat(summary.getNetBalance()).isEqualTo(200000L);
    }

    // ── TC-071: getMonthlyChartAll returns platform-wide monthly data ──────────
    @Test
    void TC071_getMonthlyChartAll_returnsPlatformMonthlyData() {
        List<Object[]> allRows = new ArrayList<>();
        allRows.add(new Object[]{"2026-03", "EXPENSE", 750000L});
        when(transactionRepository.monthlyChartDataAll(2026)).thenReturn(allRows);

        var result = dashboardService.getMonthlyChartAll(2026);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getExpense()).isEqualTo(750000L);
    }

    // ── TC-072: getCategoryChartAll returns platform-wide category data ────────
    @Test
    void TC072_getCategoryChartAll_returnsPlatformCategoryData() {
        Category cat = Category.builder().id(5L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#f00").icon("utensils").build();

        List<Object[]> allCatRows = new ArrayList<>();
        allCatRows.add(new Object[]{5L, 300000L});
        when(transactionRepository.categoryChartDataAll(any(), any())).thenReturn(allCatRows);
        when(categoryRepository.findAll()).thenReturn(List.of(cat));

        var result = dashboardService.getCategoryChartAll("2026-03");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTotal()).isEqualTo(300000L);
    }

    // ── TC-073: netBalance is negative when expenses exceed income ────────────
    @Test
    void TC073_getCurrentMonthSummary_negativeNetBalance() {
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.INCOME), any(), any())).thenReturn(50000L);
        when(transactionRepository.sumByUserAndTypeAndDateRange(
            eq(1L), eq(TransactionType.EXPENSE), any(), any())).thenReturn(80000L);

        DashboardSummary summary = dashboardService.getCurrentMonthSummary(user);

        assertThat(summary.getNetBalance()).isEqualTo(-30000L);
    }
}
