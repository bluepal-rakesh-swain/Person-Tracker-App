package com.financetracker.dto.csv;

import lombok.Data;

@Data
public class CsvColumnMapping {
    private String date;
    private String desc;
    private String amount;
    private String debit;
    private String credit;
    private String dateFormat;
    private Long defaultCategoryId;
}
