package com.financetracker.controller;

import com.financetracker.dto.ApiResponse;
import com.financetracker.dto.response.CategoryChartData;
import com.financetracker.dto.response.DashboardSummary;
import com.financetracker.dto.response.MonthlyChartData;
import com.financetracker.dto.response.YearlySummaryData;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardSummary>> getSummary(@AuthenticationPrincipal User user) {
        DashboardSummary summary = isAdmin(user)
            ? dashboardService.getCurrentMonthSummaryAll()
            : dashboardService.getCurrentMonthSummary(user);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/dashboard/chart/monthly")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MonthlyChartData>>> getMonthlyChart(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false, defaultValue = "0") int year
    ) {
        if (year == 0) year = YearMonth.now().getYear();
        List<MonthlyChartData> data = isAdmin(user)
            ? dashboardService.getMonthlyChartAll(year)
            : dashboardService.getMonthlyChart(user, year);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/dashboard/chart/categories")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryChartData>>> getCategoryChart(
        @AuthenticationPrincipal User user,
        @RequestParam String monthYear
    ) {
        List<CategoryChartData> data = isAdmin(user)
            ? dashboardService.getCategoryChartAll(monthYear)
            : dashboardService.getCategoryChart(user, monthYear);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/summary/monthly")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardSummary>> getMonthlySummary(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) String monthYear
    ) {
        if (monthYear == null) {
            monthYear = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        }
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getMonthlySummary(user, monthYear)));
    }

    @GetMapping("/summary/yearly")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<YearlySummaryData>>> getYearlySummary(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false, defaultValue = "0") int year
    ) {
        if (year == 0) year = YearMonth.now().getYear();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getYearlySummary(user, year)));
    }
}
