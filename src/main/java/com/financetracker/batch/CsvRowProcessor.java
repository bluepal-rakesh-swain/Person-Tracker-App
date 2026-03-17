package com.financetracker.batch;

import com.financetracker.entity.Transaction;
import com.financetracker.entity.TransactionType;
import lombok.Setter;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@Setter
public class CsvRowProcessor implements ItemProcessor<CsvRow, Transaction> {

    private Long userId;
    private Long defaultCategoryId;
    private String dateFormat;

    @Override
    public Transaction process(CsvRow row) {
        if (row.isSkip()) return null;

        try {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern(
                dateFormat != null ? dateFormat : "yyyy-MM-dd"
            );
            LocalDate date = LocalDate.parse(row.getDate().trim(), fmt);

            long amount;
            TransactionType type;

            if (row.getDebit() != null && row.getCredit() != null) {
                // Bank format: separate debit/credit columns
                String debitStr = row.getDebit() == null ? "" : row.getDebit().trim();
                String creditStr = row.getCredit() == null ? "" : row.getCredit().trim();

                if (!creditStr.isEmpty() && !creditStr.equals("0") && !creditStr.equals("0.00")) {
                    amount = parsePaise(creditStr);
                    type = TransactionType.INCOME;
                } else if (!debitStr.isEmpty() && !debitStr.equals("0") && !debitStr.equals("0.00")) {
                    amount = parsePaise(debitStr);
                    type = TransactionType.EXPENSE;
                } else {
                    return null; // skip empty row
                }
            } else {
                // Single amount column
                String amtStr = row.getAmount() == null ? "" : row.getAmount().trim();
                if (amtStr.isEmpty()) return null;
                double val = Double.parseDouble(amtStr.replace(",", ""));
                if (val < 0) {
                    amount = Math.round(Math.abs(val) * 100);
                    type = TransactionType.EXPENSE;
                } else {
                    amount = Math.round(val * 100);
                    type = TransactionType.INCOME;
                }
            }

            return Transaction.builder()
                .userId(userId)
                .categoryId(defaultCategoryId)
                .amount(amount)
                .description(row.getDescription())
                .date(date)
                .type(type)
                .build();

        } catch (Exception e) {
            return null; // skip malformed rows
        }
    }

    private long parsePaise(String value) {
        double val = Double.parseDouble(value.replace(",", "").trim());
        return Math.round(val * 100);
    }
}
