package com.financetracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "email_verification_otps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailVerificationOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String otp; // 6-digit code

    @Column(nullable = false)
    private Instant expiryDate; // 10 minutes

    @Column(nullable = false)
    private boolean used;
}
