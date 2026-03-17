package com.financetracker.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.financetracker.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull
    private Long categoryId;

    @NotNull @Positive
    private Long amount;

    private String description;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotNull
    private TransactionType type;
}
