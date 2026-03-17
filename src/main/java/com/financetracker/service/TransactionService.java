package com.financetracker.service;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

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

        return toResponse(transactionRepository.save(tx), category);
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
