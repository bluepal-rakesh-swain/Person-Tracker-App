package com.financetracker.dto.response;

import com.financetracker.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryChartData {
    private Long categoryId;
    private String categoryName;
    private String color;
    private TransactionType type;
    private Long total;
}
