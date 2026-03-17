package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.User;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor

public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BudgetResponse>> upsert(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(budgetService.upsert(user, request)));
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getCurrent(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) String monthYear
    ) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getCurrentBudgets(user, monthYear)));
    }
}
