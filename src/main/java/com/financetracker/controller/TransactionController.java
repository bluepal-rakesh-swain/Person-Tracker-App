package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.PagedResponse;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Create and retrieve financial transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create transaction", description = "Add a new income or expense transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(transactionService.create(user, request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get all transactions", description = "Returns all transactions with optional date/category filters")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAll(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
        @RequestParam(required = false) Long categoryId
    ) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(ApiResponse.ok(transactionService.getAllPlatform()));
        }
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getFiltered(user, start, end, categoryId)));
    }

    @GetMapping("/paged")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get paged transactions", description = "Returns paginated and sorted transactions")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getPaged(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "date") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(ApiResponse.ok(
                transactionService.getAllPlatformPaged(page, size, sortBy, sortDir)));
        }
        return ResponseEntity.ok(ApiResponse.ok(
            transactionService.getFilteredPaged(user, start, end, categoryId, page, size, sortBy, sortDir)));
    }
}
