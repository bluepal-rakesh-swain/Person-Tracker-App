package com.financetracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BudgetRequest {
    @NotNull
    private Long categoryId;

    @NotBlank
    private String monthYear; // e.g. "2026-03"

    @NotNull @Positive
    private Long limitAmount;
}
