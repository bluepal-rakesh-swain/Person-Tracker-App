package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.User;
import com.financetracker.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Create, view, and export monthly budgets")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create or update budget", description = "Upserts a budget for a category and month")
    public ResponseEntity<ApiResponse<BudgetResponse>> upsert(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(budgetService.upsert(user, request)));
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get current budgets", description = "Returns budgets for the given month (defaults to current month)")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getCurrent(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) String monthYear
    ) {
        return ResponseEntity.ok(ApiResponse.ok(budgetService.getCurrentBudgets(user, monthYear)));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Export budgets as CSV")
    public ResponseEntity<byte[]> exportCsv(
        @AuthenticationPrincipal User user
    ) throws Exception {
        byte[] csvBytes = budgetService.exportBudgetsToCsvBytes(user);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "budgets.csv");
        headers.setContentLength(csvBytes.length);
        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Export budgets as PDF")
    public ResponseEntity<byte[]> exportPdf(
        @AuthenticationPrincipal User user
    ) throws Exception {
        byte[] pdfBytes = budgetService.exportBudgetsToPdf(user);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "budgets.pdf");
        headers.setContentLength(pdfBytes.length);
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @PostMapping("/import/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Import budgets from CSV")
    public ResponseEntity<ApiResponse<String>> importCsv(
        @AuthenticationPrincipal User user,
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        int count = budgetService.importBudgetsFromCsv(user, file);
        return ResponseEntity.ok(ApiResponse.ok(count + " budgets imported"));
    }
}
