package com.financetracker.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.financetracker.entity.Frequency;
import com.financetracker.entity.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RecurringTransactionRequest {

    @NotNull
    private Long categoryId;

    @NotNull
    @Min(1)
    private Long amount; // paise/cents

    private String description;

    @NotNull
    private TransactionType type;

    @NotNull
    private Frequency frequency;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate; // optional
}
