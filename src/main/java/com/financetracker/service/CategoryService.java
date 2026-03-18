package com.financetracker.service;

import com.financetracker.dto.request.CategoryRequest;
import com.financetracker.dto.response.CategoryResponse;
import com.financetracker.entity.Category;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAll(User user) {
        return categoryRepository.findByUserId(user.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse create(User user, CategoryRequest request) {
        boolean exists = categoryRepository.findByUserId(user.getId())
            .stream().anyMatch(c -> c.getName().equalsIgnoreCase(request.getName()));
        if (exists) {
            throw new IllegalArgumentException("A category named '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
            .userId(user.getId())
            .name(request.getName())
            .type(request.getType())
            .color(request.getColor())
            .icon(request.getIcon())
            .build();
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(User user, Long id, CategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setType(request.getType());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(User user, Long id) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    public CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .type(c.getType())
            .color(c.getColor())
            .icon(c.getIcon())
            .build();
    }

    // ── CSV Export ────────────────────────────────────────────────────────────
    public byte[] exportToCsvBytes(User user) {
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(baos);
        writer.println("name,type,color,icon");
        for (Category c : categories) {
            writer.printf("%s,%s,%s,%s%n",
                escapeCsv(c.getName()), c.getType().name(), c.getColor(), c.getIcon());
        }
        writer.flush();
        return baos.toByteArray();
    }

    // ── PDF Export ────────────────────────────────────────────────────────────
    public byte[] exportToPdfBytes(User user) throws Exception {
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 50, 36);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
        Paragraph title = new Paragraph("Category Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        doc.add(title);

        Font subFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(100, 100, 100));
        Paragraph sub = new Paragraph("User: " + user.getEmail(), subFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(16);
        doc.add(sub);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 2f, 2f, 2f});

        Font headerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
        BaseColor headerBg = new BaseColor(30, 30, 30);
        for (String h : new String[]{"Name", "Type", "Color", "Icon"}) {
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

        for (int i = 0; i < categories.size(); i++) {
            Category c = categories.get(i);
            BaseColor rowBg = (i % 2 == 0) ? BaseColor.WHITE : rowAlt;
            boolean isIncome = "INCOME".equals(c.getType().name());
            Font typeFont = isIncome ? incomeFont : expenseFont;

            String[] vals = {c.getName(), c.getType().name(), c.getColor(), c.getIcon()};
            for (int j = 0; j < vals.length; j++) {
                Font f = (j == 1) ? typeFont : rowFont;
                PdfPCell cell = new PdfPCell(new Phrase(vals[j] != null ? vals[j] : "", f));
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

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"")) return "\"" + value.replace("\"", "\"\"") + "\"";
        return value;
    }
}
