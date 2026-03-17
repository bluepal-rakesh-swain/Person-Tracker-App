package com.financetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardSummary {
    private String monthYear;
    private Long totalIncome;
    private Long totalExpenses;
    private Long netBalance;
}
