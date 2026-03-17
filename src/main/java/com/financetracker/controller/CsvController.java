package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.response.ImportResult;
import com.financetracker.entity.User;
import com.financetracker.service.CsvExportService;
import com.financetracker.service.CsvImportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CsvController {

    private final CsvImportService csvImportService;
    private final CsvExportService csvExportService;

    @PostMapping("/import/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImportResult>> importCsv(
        @AuthenticationPrincipal User user,
        @RequestParam("file") MultipartFile file,
        @RequestParam("mapping") String mappingJson
    ) throws Exception {
        ImportResult result = csvImportService.importCsv(user, file, mappingJson);
        return ResponseEntity.ok(ApiResponse.ok("Import completed", result));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void exportCsv(
        @AuthenticationPrincipal User user,
        HttpServletResponse response
    ) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"transactions.csv\"");
        csvExportService.exportToCsv(user, response.getWriter());
    }
}
