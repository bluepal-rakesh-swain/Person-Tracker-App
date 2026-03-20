package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "recurring_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long categoryId;

    @Column(nullable = false)
    private Long amount; // BIGINT — paise/cents

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency; // DAILY, WEEKLY, MONTHLY

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate; // null = no end

    @Column(nullable = false)
    private LocalDate nextRunDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
