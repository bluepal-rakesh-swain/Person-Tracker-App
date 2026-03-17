package com.financetracker.service;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Category;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public BudgetResponse upsert(User user, BudgetRequest request) {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Budget budget = budgetRepository
            .findByUserIdAndCategoryIdAndMonthYear(user.getId(), request.getCategoryId(), request.getMonthYear())
            .orElse(Budget.builder()
                .userId(user.getId())
                .categoryId(request.getCategoryId())
                .monthYear(request.getMonthYear())
                .build());

        budget.setLimitAmount(request.getLimitAmount());
        budget = budgetRepository.save(budget);

        return toBudgetResponse(budget, category, 0L);
    }

    public List<BudgetResponse> getCurrentBudgets(User user, String monthYearParam) {
        String currentMonth = (monthYearParam != null && !monthYearParam.isBlank())
            ? monthYearParam
            : YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(user.getId(), currentMonth);

        // Get spending for current month via DB aggregation
        YearMonth ym = YearMonth.parse(currentMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Object[]> spentRows = transactionRepository.spentByCategoryInMonth(user.getId(), start, end, TransactionType.EXPENSE);
        Map<Long, Long> spentMap = spentRows.stream()
            .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        return budgets.stream().map(b -> {
            Category cat = categoryRepository.findById(b.getCategoryId()).orElse(null);
            long spent = spentMap.getOrDefault(b.getCategoryId(), 0L);
            return toBudgetResponse(b, cat, spent);
        }).collect(Collectors.toList());
    }

    private BudgetResponse toBudgetResponse(Budget b, Category cat, long spent) {
        long remaining = b.getLimitAmount() - spent;
        double usagePercent = b.getLimitAmount() > 0
            ? Math.round((spent * 100.0 / b.getLimitAmount()) * 10.0) / 10.0
            : 0.0;

        return BudgetResponse.builder()
            .id(b.getId())
            .categoryId(b.getCategoryId())
            .categoryName(cat != null ? cat.getName() : null)
            .categoryColor(cat != null ? cat.getColor() : null)
            .monthYear(b.getMonthYear())
            .limitAmount(b.getLimitAmount())
            .spent(spent)
            .remaining(remaining)
            .usagePercent(usagePercent)
            .build();
    }
}
