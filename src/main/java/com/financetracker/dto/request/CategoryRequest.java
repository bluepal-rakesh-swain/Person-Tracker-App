package com.financetracker.dto.request;

import com.financetracker.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    private String name;

    @NotNull
    private TransactionType type;

    private String color;
    private String icon;
}
