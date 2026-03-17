package com.financetracker.service;

import com.financetracker.entity.Category;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CsvExportService {

    private final TransactionService transactionService;
    private final CategoryRepository categoryRepository;

    public void exportToCsv(User user, PrintWriter writer) {
        List<Transaction> transactions = transactionService.getAllForUser(user.getId());
        List<Category> categories = categoryRepository.findByUserId(user.getId());
        Map<Long, String> catNames = categories.stream()
            .collect(Collectors.toMap(Category::getId, Category::getName));

        writer.println("id,date,type,category,amount,description");
        for (Transaction tx : transactions) {
            writer.printf("%s,%s,%s,%s,%d,%s%n",
                tx.getId(),
                tx.getDate(),
                tx.getType(),
                catNames.getOrDefault(tx.getCategoryId(), ""),
                tx.getAmount(),
                escapeCSV(tx.getDescription())
            );
        }
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
