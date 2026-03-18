package com.financetracker.service;

import com.financetracker.dto.request.BudgetRequest;
import com.financetracker.dto.response.BudgetResponse;
import com.financetracker.entity.Budget;
import com.financetracker.entity.Category;
import com.financetracker.entity.TransactionType;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public BudgetResponse upsert(User user, BudgetRequest request) {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Budget budget = budgetRepository
            .findByUserIdAndCategoryIdAndMonthYear(user.getId(), request.getCategoryId(), request.getMonthYear())
            .orElse(Budget.builder()
                .userId(user.getId())
                .categoryId(request.getCategoryId())
                .monthYear(request.getMonthYear())
                .build());

        budget.setLimitAmount(request.getLimitAmount());
        budget = budgetRepository.save(budget);

        return toBudgetResponse(budget, category, 0L);
    }

    public List<BudgetResponse> getCurrentBudgets(User user, String monthYearParam) {
        String currentMonth = (monthYearParam != null && !monthYearParam.isBlank())
            ? monthYearParam
            : YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(user.getId(), currentMonth);

        // Get spending for current month via DB aggregation
        YearMonth ym = YearMonth.parse(currentMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Object[]> spentRows = transactionRepository.spentByCategoryInMonth(user.getId(), start, end, TransactionType.EXPENSE);
        Map<Long, Long> spentMap = spentRows.stream()
            .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        return budgets.stream().map(b -> {
            Category cat = categoryRepository.findById(b.getCategoryId()).orElse(null);
            long spent = spentMap.getOrDefault(b.getCategoryId(), 0L);
            return toBudgetResponse(b, cat, spent);
        }).collect(Collectors.toList());
    }

    // ── CSV Export ────────────────────────────────────────────────────────────
    public byte[] exportBudgetsToCsvBytes(User user) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(baos);
        exportBudgetsToCsv(user, writer);
        writer.flush();
        return baos.toByteArray();
    }

    public void exportBudgetsToCsv(User user, PrintWriter writer) {
        List<BudgetResponse> budgets = getAllBudgets(user);
        writer.println("categoryName,monthYear,limitAmount,spent,remaining,usagePercent");
        for (BudgetResponse b : budgets) {
            writer.printf("%s,%s,%.2f,%.2f,%.2f,%.1f%n",
                escapeCsv(b.getCategoryName()),
                b.getMonthYear(),
                b.getLimitAmount() / 100.0,
                b.getSpent() / 100.0,
                b.getRemaining() / 100.0,
                b.getUsagePercent()
            );
        }
    }

    // ── PDF Export ────────────────────────────────────────────────────────────
    public byte[] exportBudgetsToPdf(User user) throws Exception {
        List<BudgetResponse> budgets = getAllBudgets(user);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 50, 36);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
        Paragraph title = new Paragraph("Budget Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        doc.add(title);

        Font subFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(100, 100, 100));
        Paragraph sub = new Paragraph("User: " + user.getEmail() + "  |  Currency: " + user.getCurrency(), subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        doc.add(sub);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2.5f, 1.5f, 2f, 2f, 2f, 1.5f});

        Font headerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
        BaseColor headerBg = new BaseColor(30, 30, 30);
        for (String h : new String[]{"Category", "Month", "Limit", "Spent", "Remaining", "Usage %"}) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(8);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }

        Font rowFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);
        Font overFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(220, 38, 38));
        Font okFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(234, 88, 12));
        BaseColor rowAlt = new BaseColor(248, 248, 248);

        for (int i = 0; i < budgets.size(); i++) {
            BudgetResponse b = budgets.get(i);
            BaseColor rowBg = (i % 2 == 0) ? BaseColor.WHITE : rowAlt;
            boolean isOver = b.getUsagePercent() > 100;
            Font amtFont = isOver ? overFont : okFont;
            String cur = user.getCurrency() != null ? user.getCurrency() : "INR";

            String[][] cells = {
                {b.getCategoryName() != null ? b.getCategoryName() : "", "normal"},
                {b.getMonthYear(), "normal"},
                {cur + " " + String.format("%.2f", b.getLimitAmount() / 100.0), "normal"},
                {cur + " " + String.format("%.2f", b.getSpent() / 100.0), "amt"},
                {cur + " " + String.format("%.2f", b.getRemaining() / 100.0), "amt"},
                {String.format("%.1f%%", b.getUsagePercent()), "amt"},
            };

            for (String[] cellData : cells) {
                Font f = "amt".equals(cellData[1]) ? amtFont : rowFont;
                PdfPCell cell = new PdfPCell(new Phrase(cellData[0], f));
                cell.setBackgroundColor(rowBg);
                cell.setPadding(7);
                cell.setBorder(Rectangle.BOTTOM);
                cell.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cell);
            }
        }
        doc.add(table);
        doc.close();
        return baos.toByteArray();
    }

    // ── CSV Import ────────────────────────────────────────────────────────────
    @Transactional
    public int importBudgetsFromCsv(User user, MultipartFile file) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String header = reader.readLine(); // skip header
        if (header == null) return 0;

        List<Category> userCategories = categoryRepository.findByUserId(user.getId());
        Map<String, Long> catByName = userCategories.stream()
            .collect(Collectors.toMap(c -> c.getName().toLowerCase(), Category::getId, (a, b2) -> a));

        int count = 0;
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split(",", -1);
            if (parts.length < 3) continue;

            String catName = parts[0].trim().replaceAll("^\"|\"$", "");
            String monthYear = parts[1].trim();
            String amtStr = parts[2].trim();

            Long catId = catByName.get(catName.toLowerCase());
            if (catId == null) continue;

            long limitAmount;
            try {
                limitAmount = Math.round(Double.parseDouble(amtStr) * 100);
            } catch (NumberFormatException e) {
                continue;
            }

            Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndMonthYear(user.getId(), catId, monthYear)
                .orElse(Budget.builder().userId(user.getId()).categoryId(catId).monthYear(monthYear).build());
            budget.setLimitAmount(limitAmount);
            budgetRepository.save(budget);
            count++;
        }
        return count;
    }

    // ── Helper: get all budgets across all months ─────────────────────────────
    private List<BudgetResponse> getAllBudgets(User user) {
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        return budgets.stream().map(b -> {
            Category cat = categoryRepository.findById(b.getCategoryId()).orElse(null);
            YearMonth ym = YearMonth.parse(b.getMonthYear());
            List<Object[]> rows = transactionRepository.spentByCategoryInMonth(
                user.getId(), ym.atDay(1), ym.atEndOfMonth(), TransactionType.EXPENSE);
            long spent = rows.stream()
                .filter(r -> b.getCategoryId().equals(r[0]))
                .mapToLong(r -> (Long) r[1]).sum();
            return toBudgetResponse(b, cat, spent);
        }).collect(Collectors.toList());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"")) return "\"" + value.replace("\"", "\"\"") + "\"";
        return value;
    }

    private BudgetResponse toBudgetResponse(Budget b, Category cat, long spent) {
        long remaining = b.getLimitAmount() - spent;
        double usagePercent = b.getLimitAmount() > 0
            ? Math.round((spent * 100.0 / b.getLimitAmount()) * 10.0) / 10.0
            : 0.0;

        return BudgetResponse.builder()
            .id(b.getId())
            .categoryId(b.getCategoryId())
            .categoryName(cat != null ? cat.getName() : null)
            .categoryColor(cat != null ? cat.getColor() : null)
            .monthYear(b.getMonthYear())
            .limitAmount(b.getLimitAmount())
            .spent(spent)
            .remaining(remaining)
            .usagePercent(usagePercent)
            .build();
    }
}
