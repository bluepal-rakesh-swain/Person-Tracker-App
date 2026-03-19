package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.response.AdminStatsResponse;
import com.financetracker.dto.response.AdminUserResponse;
import com.financetracker.dto.response.CsvImportLogResponse;
import com.financetracker.dto.response.ImportResult;
import com.financetracker.service.AdminExportService;
import com.financetracker.service.AdminService;
import com.financetracker.service.CsvExportService;
import com.financetracker.service.CsvImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only: user management, platform stats, exports")
public class AdminController {

    private final AdminService adminService;
    private final CsvExportService csvExportService;
    private final CsvImportService csvImportService;
    private final AdminExportService adminExportService;

    // ── Users ──────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/enabled")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<ApiResponse<AdminUserResponse>> setEnabled(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setUserEnabled(id, body.get("enabled"))));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change user role (USER / ADMIN)")
    public ResponseEntity<ApiResponse<AdminUserResponse>> changeRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.changeUserRole(id, body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user and all their data")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    // ── Platform Stats ─────────────────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Get platform stats", description = "Total users, transactions, income, expenses across all users")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPlatformStats()));
    }

    // ── CSV Import Logs ────────────────────────────────────────────────────────

    @GetMapping("/imports")
    @Operation(summary = "Get CSV import logs")
    public ResponseEntity<ApiResponse<List<CsvImportLogResponse>>> getImportLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getImportLogs()));
    }

    // ── Per-user CSV Export ────────────────────────────────────────────────────

    @GetMapping("/users/{id}/export/csv")
    @Operation(summary = "Export a specific user's transactions as CSV")
    public void exportUserCsv(@PathVariable Long id, HttpServletResponse response) throws Exception {
        com.financetracker.entity.User user = adminService.getUserById(id);
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition",
            "attachment; filename=\"transactions_" + user.getEmail() + ".csv\"");
        csvExportService.exportToCsv(user, response.getWriter());
    }

    // ── Per-user CSV Import ────────────────────────────────────────────────────

    @PostMapping("/users/{id}/import/csv")
    @Operation(summary = "Import CSV transactions for a specific user")
    public ResponseEntity<ApiResponse<ImportResult>> importUserCsv(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file,
        @RequestParam("mapping") String mappingJson
    ) throws Exception {
        com.financetracker.entity.User user = adminService.getUserById(id);
        ImportResult result = csvImportService.importCsv(user, file, mappingJson);
        return ResponseEntity.ok(ApiResponse.ok("Import completed", result));
    }

    // ── All-users Export ───────────────────────────────────────────────────────

    @GetMapping("/export/users/csv")
    @Operation(summary = "Export all users as CSV")
    public void exportAllUsersCsv(HttpServletResponse response) throws Exception {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"all_users.csv\"");
        adminExportService.exportUsersCsv(response.getWriter());
    }

    @GetMapping("/export/users/pdf")
    @Operation(summary = "Export all users as PDF")
    public void exportAllUsersPdf(HttpServletResponse response) throws Exception {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"all_users.pdf\"");
        adminExportService.exportUsersPdf(response.getOutputStream());
    }
}
