package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "categoryId", "monthYear"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long categoryId;

    @Column(nullable = false)
    private String monthYear; // e.g. "2026-03"

    @Column(nullable = false)
    private Long limitAmount; // BIGINT — paise/cents
}
