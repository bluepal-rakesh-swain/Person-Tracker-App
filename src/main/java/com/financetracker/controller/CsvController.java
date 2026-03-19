package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.response.ImportResult;
import com.financetracker.entity.User;
import com.financetracker.service.CsvExportService;
import com.financetracker.service.CsvImportService;
import com.financetracker.service.PdfExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Tag(name = "CSV / PDF Export", description = "Import and export transactions as CSV or PDF")
public class CsvController {

    private final CsvImportService csvImportService;
    private final CsvExportService csvExportService;
    private final PdfExportService pdfExportService;

    @PostMapping("/import/csv")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Import transactions from CSV", description = "Upload a CSV file with column mapping JSON")
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
    @Operation(summary = "Export transactions as CSV")
    public void exportCsv(
        @AuthenticationPrincipal User user,
        HttpServletResponse response
    ) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"transactions.csv\"");
        csvExportService.exportToCsv(user, response.getWriter());
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Export transactions as PDF")
    public ResponseEntity<byte[]> exportPdf(
        @AuthenticationPrincipal User user
    ) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        pdfExportService.exportToPdf(user, baos);
        byte[] pdfBytes = baos.toByteArray();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "transactions.pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
