package com.financetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CsvImportLogResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String fileName;
    private String status;
    private int imported;
    private int skipped;
    private String errorMessage;
    private String importedAt;
}
