package com.financetracker.batch;

import lombok.Data;

@Data
public class CsvRow {
    private String date;
    private String description;
    private String amount;      // single amount column (signed)
    private String debit;       // withdrawal column
    private String credit;      // deposit column
    private boolean skip;       // flag to skip invalid rows
}
