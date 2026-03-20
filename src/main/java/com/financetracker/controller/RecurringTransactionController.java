package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.request.RecurringTransactionRequest;
import com.financetracker.dto.response.RecurringTransactionResponse;
import com.financetracker.entity.User;
import com.financetracker.service.RecurringTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
@Tag(name = "Recurring Transactions", description = "Manage recurring income/expense templates")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create recurring transaction", description = "Schedule a transaction to repeat DAILY, WEEKLY, or MONTHLY")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> create(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody RecurringTransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(recurringService.create(user, request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all recurring transactions")
    public ResponseEntity<ApiResponse<List<RecurringTransactionResponse>>> getAll(
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.getAll(user)));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Toggle active/paused state")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> toggle(
        @AuthenticationPrincipal User user,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.toggleActive(user, id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Delete recurring transaction")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal User user,
        @PathVariable Long id
    ) {
        recurringService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
