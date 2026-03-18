package com.financetracker.service;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final WebSocketNotificationService webSocketNotificationService;

    @Transactional
    public TransactionResponse create(User user, TransactionRequest request) {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Transaction tx = Transaction.builder()
            .userId(user.getId())
            .categoryId(category.getId())
            .amount(request.getAmount())
            .description(request.getDescription())
            .date(request.getDate())
            .type(request.getType())
            .build();

        TransactionResponse response = toResponse(transactionRepository.save(tx), category);

        // Fire budget alert check async — don't block the HTTP response
        if (TransactionType.EXPENSE == request.getType()) {
            final User u = user;
            final Category c = category;
            final LocalDate d = request.getDate();
            CompletableFuture.runAsync(() -> checkAndSendBudgetAlert(u, c, d));
        }

        return response;
    }

    private void checkAndSendBudgetAlert(User user, Category category, LocalDate txDate) {
        try {
            String monthYear = YearMonth.from(txDate).format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Optional<Budget> budgetOpt = budgetRepository
                .findByUserIdAndCategoryIdAndMonthYear(user.getId(), category.getId(), monthYear);

            if (budgetOpt.isEmpty()) return;

            Budget budget = budgetOpt.get();
            YearMonth ym = YearMonth.parse(monthYear);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            List<Object[]> spentRows = transactionRepository.spentByCategoryInMonth(
                user.getId(), start, end, TransactionType.EXPENSE);
            Map<Long, Long> spentMap = spentRows.stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

            long spent = spentMap.getOrDefault(category.getId(), 0L);
            long limit = budget.getLimitAmount();
            if (limit <= 0) return;

            double usagePercent = (spent * 100.0) / limit;

            // Send alert when crossing 80% threshold
            if (usagePercent >= 80.0) {
                webSocketNotificationService.sendBudgetAlert(
                    user.getEmail(),
                    category.getName(),
                    usagePercent,
                    spent,
                    limit,
                    monthYear
                );
            }
        } catch (Exception e) {
            log.error("Budget alert check failed for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public List<TransactionResponse> getFiltered(User user, LocalDate start, LocalDate end, Long categoryId) {
        List<Transaction> txs;
        if (start == null && end == null && categoryId == null) {
            txs = transactionRepository.findByUserIdOrderByDateDesc(user.getId());
        } else {
            txs = transactionRepository.findFiltered(user.getId(), start, end, categoryId);
        }
        return txs.stream().map(tx -> {
            Category cat = categoryRepository.findById(tx.getCategoryId()).orElse(null);
            return toResponse(tx, cat);
        }).collect(Collectors.toList());
    }

    public List<TransactionResponse> getAllPlatform() {
        List<Transaction> txs = transactionRepository.findAll(
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "date"));
        return txs.stream().map(tx -> {
            Category cat = categoryRepository.findById(tx.getCategoryId()).orElse(null);
            return toResponse(tx, cat);
        }).collect(Collectors.toList());
    }

    public List<Transaction> getAllForUser(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    private TransactionResponse toResponse(Transaction tx, Category category) {
        return TransactionResponse.builder()
            .id(tx.getId())
            .categoryId(tx.getCategoryId())
            .categoryName(category != null ? category.getName() : null)
            .amount(tx.getAmount())
            .description(tx.getDescription())
            .date(tx.getDate())
            .type(tx.getType())
            .build();
    }
}
