package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.response.AdminStatsResponse;
import com.financetracker.dto.response.AdminUserResponse;
import com.financetracker.dto.response.CsvImportLogResponse;
import com.financetracker.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── Users ──────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<ApiResponse<AdminUserResponse>> setEnabled(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setUserEnabled(id, body.get("enabled"))));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> changeRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.changeUserRole(id, body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    // ── Platform Stats ─────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPlatformStats()));
    }

    // ── CSV Import Logs ────────────────────────────────────────────────────────

    @GetMapping("/imports")
    public ResponseEntity<ApiResponse<List<CsvImportLogResponse>>> getImportLogs() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getImportLogs()));
    }
}
