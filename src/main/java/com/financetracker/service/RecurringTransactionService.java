package com.financetracker.service;

import com.financetracker.dto.request.RecurringTransactionRequest;
import com.financetracker.dto.response.RecurringTransactionResponse;
import com.financetracker.entity.*;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.RecurringTransactionRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepo;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public RecurringTransactionResponse create(User user, RecurringTransactionRequest request) {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        RecurringTransaction rt = RecurringTransaction.builder()
            .userId(user.getId())
            .categoryId(category.getId())
            .amount(request.getAmount())
            .description(request.getDescription())
            .type(request.getType())
            .frequency(request.getFrequency())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .nextRunDate(request.getStartDate())
            .active(true)
            .build();

        return toResponse(recurringRepo.save(rt), category);
    }

    public List<RecurringTransactionResponse> getAll(User user) {
        return recurringRepo.findByUserIdOrderByNextRunDateAsc(user.getId()).stream()
            .map(rt -> {
                Category cat = categoryRepository.findById(rt.getCategoryId()).orElse(null);
                return toResponse(rt, cat);
            }).collect(Collectors.toList());
    }

    @Transactional
    public RecurringTransactionResponse toggleActive(User user, Long id) {
        RecurringTransaction rt = recurringRepo.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));
        rt.setActive(!rt.isActive());
        return toResponse(recurringRepo.save(rt), categoryRepository.findById(rt.getCategoryId()).orElse(null));
    }

    @Transactional
    public void delete(User user, Long id) {
        RecurringTransaction rt = recurringRepo.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));
        recurringRepo.delete(rt);
    }

    /**
     * Runs every day at midnight — processes all due recurring transactions.
     * Creates actual Transaction records and advances nextRunDate.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void processDueRecurring() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> due = recurringRepo.findDueRecurring(today);

        for (RecurringTransaction rt : due) {
            try {
                // Stop if past end date
                if (rt.getEndDate() != null && rt.getNextRunDate().isAfter(rt.getEndDate())) {
                    rt.setActive(false);
                    recurringRepo.save(rt);
                    continue;
                }

                // Create the actual transaction
                Transaction tx = Transaction.builder()
                    .userId(rt.getUserId())
                    .categoryId(rt.getCategoryId())
                    .amount(rt.getAmount())
                    .description(rt.getDescription())
                    .date(rt.getNextRunDate())
                    .type(rt.getType())
                    .build();
                transactionRepository.save(tx);

                // Advance nextRunDate
                LocalDate next = switch (rt.getFrequency()) {
                    case DAILY -> rt.getNextRunDate().plusDays(1);
                    case WEEKLY -> rt.getNextRunDate().plusWeeks(1);
                    case MONTHLY -> rt.getNextRunDate().plusMonths(1);
                };

                // Deactivate if next run is past end date
                if (rt.getEndDate() != null && next.isAfter(rt.getEndDate())) {
                    rt.setActive(false);
                } else {
                    rt.setNextRunDate(next);
                }
                recurringRepo.save(rt);

                log.info("Processed recurring tx id={} for user={} date={}", rt.getId(), rt.getUserId(), rt.getNextRunDate());
            } catch (Exception e) {
                log.error("Failed to process recurring tx id={}: {}", rt.getId(), e.getMessage());
            }
        }
    }

    private RecurringTransactionResponse toResponse(RecurringTransaction rt, Category cat) {
        return RecurringTransactionResponse.builder()
            .id(rt.getId())
            .categoryId(rt.getCategoryId())
            .categoryName(cat != null ? cat.getName() : null)
            .categoryColor(cat != null ? cat.getColor() : null)
            .amount(rt.getAmount())
            .description(rt.getDescription())
            .type(rt.getType())
            .frequency(rt.getFrequency())
            .startDate(rt.getStartDate())
            .endDate(rt.getEndDate())
            .nextRunDate(rt.getNextRunDate())
            .active(rt.isActive())
            .build();
    }
}
