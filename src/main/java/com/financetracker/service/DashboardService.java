package com.financetracker.service;

import com.financetracker.dto.response.CategoryChartData;
import com.financetracker.dto.response.DashboardSummary;
import com.financetracker.dto.response.MonthlyChartData;
import com.financetracker.dto.response.YearlySummaryData;
import com.financetracker.entity.Category;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public DashboardSummary getCurrentMonthSummary(User user) {
        YearMonth current = YearMonth.now();
        String monthYear = current.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate start = current.atDay(1);
        LocalDate end = current.atEndOfMonth();

        Long income = transactionRepository.sumByUserAndTypeAndDateRange(user.getId(), TransactionType.INCOME, start, end);
        Long expense = transactionRepository.sumByUserAndTypeAndDateRange(user.getId(), TransactionType.EXPENSE, start, end);

        income = income == null ? 0L : income;
        expense = expense == null ? 0L : expense;

        return DashboardSummary.builder()
            .monthYear(monthYear)
            .totalIncome(income)
            .totalExpenses(expense)
            .netBalance(income - expense)
            .build();
    }

    public List<MonthlyChartData> getMonthlyChart(User user, int year) {
        List<Object[]> rows = transactionRepository.monthlyChartData(user.getId(), year);

        // Build a map: month -> {income, expense}
        Map<String, MonthlyChartData> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String month = (String) row[0];
            String typeStr = (String) row[1];
            Long amount = ((Number) row[2]).longValue();

            map.computeIfAbsent(month, m -> MonthlyChartData.builder()
                .month(m).income(0L).expense(0L).build());

            MonthlyChartData data = map.get(month);
            if ("INCOME".equals(typeStr)) data.setIncome(amount);
            else data.setExpense(amount);
        }

        return new ArrayList<>(map.values());
    }

    public List<CategoryChartData> getCategoryChart(User user, String monthYear) {
        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Object[]> rows = transactionRepository.categoryChartData(user.getId(), start, end);
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        Map<Long, Category> catMap = categories.stream()
            .collect(Collectors.toMap(Category::getId, c -> c));

        return rows.stream().map(row -> {
            Long catId = (Long) row[0];
            Long total = ((Number) row[1]).longValue();
            Category cat = catMap.get(catId);
            return CategoryChartData.builder()
                .categoryId(catId)
                .categoryName(cat != null ? cat.getName() : null)
                .color(cat != null ? cat.getColor() : null)
                .type(cat != null ? cat.getType() : null)
                .total(total)
                .build();
        }).collect(Collectors.toList());
    }

    public DashboardSummary getMonthlySummary(User user, String monthYear) {
        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Long income = transactionRepository.sumByUserAndTypeAndDateRange(user.getId(), TransactionType.INCOME, start, end);
        Long expense = transactionRepository.sumByUserAndTypeAndDateRange(user.getId(), TransactionType.EXPENSE, start, end);
        income = income == null ? 0L : income;
        expense = expense == null ? 0L : expense;

        return DashboardSummary.builder()
            .monthYear(monthYear)
            .totalIncome(income)
            .totalExpenses(expense)
            .netBalance(income - expense)
            .build();
    }

    public List<YearlySummaryData> getYearlySummary(User user, int year) {
        List<Object[]> rows = transactionRepository.yearlySummaryData(user.getId(), year);

        Map<String, YearlySummaryData> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String month = (String) row[0];
            String typeStr = (String) row[1];
            Long amount = ((Number) row[2]).longValue();

            map.computeIfAbsent(month, m -> YearlySummaryData.builder()
                .month(m).income(0L).expense(0L).net(0L).build());

            YearlySummaryData data = map.get(month);
            if ("INCOME".equals(typeStr)) {
                data.setIncome(amount);
            } else {
                data.setExpense(amount);
            }
            data.setNet(data.getIncome() - data.getExpense());
        }

        return new ArrayList<>(map.values());
    }

    // ── Platform-wide (admin) methods ─────────────────────────────────────────

    public DashboardSummary getCurrentMonthSummaryAll() {
        YearMonth current = YearMonth.now();
        String monthYear = current.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate start = current.atDay(1);
        LocalDate end = current.atEndOfMonth();

        Long income = transactionRepository.sumByTypeAndDateRange(TransactionType.INCOME, start, end);
        Long expense = transactionRepository.sumByTypeAndDateRange(TransactionType.EXPENSE, start, end);
        income = income == null ? 0L : income;
        expense = expense == null ? 0L : expense;

        return DashboardSummary.builder()
            .monthYear(monthYear)
            .totalIncome(income)
            .totalExpenses(expense)
            .netBalance(income - expense)
            .build();
    }

    public List<MonthlyChartData> getMonthlyChartAll(int year) {
        List<Object[]> rows = transactionRepository.monthlyChartDataAll(year);
        Map<String, MonthlyChartData> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String month = (String) row[0];
            String typeStr = (String) row[1];
            Long amount = ((Number) row[2]).longValue();
            map.computeIfAbsent(month, m -> MonthlyChartData.builder()
                .month(m).income(0L).expense(0L).build());
            MonthlyChartData data = map.get(month);
            if ("INCOME".equals(typeStr)) data.setIncome(amount);
            else data.setExpense(amount);
        }
        return new ArrayList<>(map.values());
    }

    public List<CategoryChartData> getCategoryChartAll(String monthYear) {
        YearMonth ym = YearMonth.parse(monthYear);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Object[]> rows = transactionRepository.categoryChartDataAll(start, end);
        Map<Long, Category> catMap = categoryRepository.findAll().stream()
            .collect(Collectors.toMap(Category::getId, c -> c));

        return rows.stream().map(row -> {
            Long catId = (Long) row[0];
            Long total = ((Number) row[1]).longValue();
            Category cat = catMap.get(catId);
            return CategoryChartData.builder()
                .categoryId(catId)
                .categoryName(cat != null ? cat.getName() : null)
                .color(cat != null ? cat.getColor() : null)
                .type(cat != null ? cat.getType() : null)
                .total(total)
                .build();
        }).collect(Collectors.toList());
    }
}
