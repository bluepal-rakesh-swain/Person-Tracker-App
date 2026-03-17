package com.financetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String monthYear;
    private Long limitAmount;
    private Long spent;
    private Long remaining;
    private Double usagePercent;
}
