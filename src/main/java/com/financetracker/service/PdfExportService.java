package com.financetracker.service;

import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.repository.CategoryRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final TransactionService transactionService;
    private final CategoryRepository categoryRepository;

    public void exportToPdf(User user, OutputStream out) throws Exception {
        List<Transaction> transactions = transactionService.getAllForUser(user.getId());
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        Map<Long, String> catNames = categories.stream()
            .collect(Collectors.toMap(Category::getId, Category::getName));

        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 30);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
        Paragraph title = new Paragraph("Transaction Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        doc.add(title);

        Font subFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(100, 100, 100));
        Paragraph sub = new Paragraph("Generated for: " + user.getEmail() + "  |  Currency: " + user.getCurrency(), subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        doc.add(sub);

        // Table
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 1.5f, 2f, 3f, 2f});

        Font headerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
        BaseColor headerBg = new BaseColor(30, 30, 30);
        for (String h : new String[]{"Date", "Type", "Category", "Description", "Amount"}) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(8);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }

        Font rowFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);
        Font incomeFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(234, 88, 12));
        Font expenseFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.BLACK);
        BaseColor rowAlt = new BaseColor(248, 248, 248);

        for (int i = 0; i < transactions.size(); i++) {
            Transaction tx = transactions.get(i);
            BaseColor rowBg = (i % 2 == 0) ? BaseColor.WHITE : rowAlt;
            boolean isIncome = "INCOME".equals(tx.getType().name());

            String[] cells = {
                tx.getDate().toString(),
                tx.getType().name(),
                catNames.getOrDefault(tx.getCategoryId(), ""),
                tx.getDescription() != null ? tx.getDescription() : "",
                (isIncome ? "+" : "-") + formatAmount(tx.getAmount(), user.getCurrency())
            };

            for (int j = 0; j < cells.length; j++) {
                Font f = (j == 4) ? (isIncome ? incomeFont : expenseFont) : rowFont;
                PdfPCell cell = new PdfPCell(new Phrase(cells[j], f));
                cell.setBackgroundColor(rowBg);
                cell.setPadding(7);
                cell.setBorder(Rectangle.BOTTOM);
                cell.setBorderColor(new BaseColor(230, 230, 230));
                if (j == 4) cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cell);
            }
        }

        doc.add(table);

        // Summary footer
        long totalIncome = transactions.stream().filter(t -> "INCOME".equals(t.getType().name())).mapToLong(Transaction::getAmount).sum();
        long totalExpense = transactions.stream().filter(t -> "EXPENSE".equals(t.getType().name())).mapToLong(Transaction::getAmount).sum();

        Font summaryFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.BLACK);
        Paragraph summary = new Paragraph(
            "\nTotal Income: " + formatAmount(totalIncome, user.getCurrency()) +
            "   |   Total Expenses: " + formatAmount(totalExpense, user.getCurrency()) +
            "   |   Net: " + formatAmount(totalIncome - totalExpense, user.getCurrency()),
            summaryFont
        );
        summary.setAlignment(Element.ALIGN_RIGHT);
        summary.setSpacingBefore(12);
        doc.add(summary);

        doc.close();
    }

    private String formatAmount(long paise, String currency) {
        return String.format("%s %.2f", currency != null ? currency : "INR", paise / 100.0);
    }
}
