package com.financetracker.service;

import com.financetracker.entity.User;
import com.financetracker.repository.UserRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminExportService {

    private final UserRepository userRepository;

    public void exportUsersCsv(PrintWriter writer) {
        List<User> users = userRepository.findAll();
        writer.println("id,fullName,email,currency,role,verified,status");
        for (User u : users) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s%n",
                u.getId(),
                escapeCsv(u.getFullName()),
                escapeCsv(u.getEmail()),
                u.getCurrency(),
                u.getRole().name(),
                u.isEmailVerified() ? "Verified" : "Unverified",
                u.isEnabled() ? "Active" : "Disabled"
            );
        }
    }

    public void exportUsersPdf(OutputStream out) throws Exception {
        List<User> users = userRepository.findAll();

        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 30);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(17, 24, 39));
        Paragraph title = new Paragraph("All Users Report", titleFont);
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingAfter(16);
        doc.add(title);

        // Table
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 3f, 4f, 2f, 2f, 2f, 2f});

        String[] headers = {"ID", "Name", "Email", "Currency", "Role", "Verified", "Status"};
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.WHITE);
        BaseColor headerBg = new BaseColor(16, 185, 129); // emerald-500

        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(headerBg);
            cell.setPadding(7);
            cell.setBorder(Rectangle.NO_BORDER);
            table.addCell(cell);
        }

        Font rowFont = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(55, 65, 81));
        BaseColor rowAlt = new BaseColor(243, 244, 246);

        for (int i = 0; i < users.size(); i++) {
            User u = users.get(i);
            BaseColor bg = (i % 2 == 0) ? BaseColor.WHITE : rowAlt;
            String[] vals = {
                String.valueOf(u.getId()),
                u.getFullName(),
                u.getEmail(),
                u.getCurrency(),
                u.getRole().name(),
                u.isEmailVerified() ? "Yes" : "No",
                u.isEnabled() ? "Active" : "Disabled"
            };
            for (String v : vals) {
                PdfPCell cell = new PdfPCell(new Phrase(v, rowFont));
                cell.setBackgroundColor(bg);
                cell.setPadding(6);
                cell.setBorder(Rectangle.NO_BORDER);
                table.addCell(cell);
            }
        }

        doc.add(table);
        doc.close();
    }

    private String escapeCsv(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n"))
            return "\"" + v.replace("\"", "\"\"") + "\"";
        return v;
    }
}
