package com.financetracker.repository;

import com.financetracker.entity.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findByUserIdAndOtpAndUsedFalse(Long userId, String otp);

    @Modifying
    @Query("DELETE FROM EmailVerificationOtp e WHERE e.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
