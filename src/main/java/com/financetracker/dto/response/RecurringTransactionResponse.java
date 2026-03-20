package com.financetracker.dto.response;

import com.financetracker.entity.Frequency;
import com.financetracker.entity.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class RecurringTransactionResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Long amount;
    private String description;
    private TransactionType type;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextRunDate;
    private boolean active;
}
