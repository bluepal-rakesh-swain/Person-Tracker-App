package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "csv_import_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CsvImportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String userEmail;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String status; // COMPLETED, FAILED

    private int imported;
    private int skipped;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private Instant importedAt;
}
