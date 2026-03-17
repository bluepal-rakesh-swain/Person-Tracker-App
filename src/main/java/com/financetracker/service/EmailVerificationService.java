package com.financetracker.service;

import com.financetracker.entity.EmailVerificationOtp;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.EmailVerificationOtpRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final long OTP_EXPIRY_MILLIS = 10 * 60 * 1000L; // 10 minutes
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailVerificationOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public void sendOtp(User user) {
        // Delete any existing OTPs for this user
        otpRepository.deleteAllByUserId(user.getId());

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        EmailVerificationOtp entity = EmailVerificationOtp.builder()
            .userId(user.getId())
            .otp(otp)
            .expiryDate(Instant.now().plusMillis(OTP_EXPIRY_MILLIS))
            .used(false)
            .build();

        otpRepository.save(entity);
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            return; // already verified, no-op
        }

        EmailVerificationOtp record = otpRepository
            .findByUserIdAndOtpAndUsedFalse(user.getId(), otp)
            .orElseThrow(() -> new TokenException("Invalid OTP"));

        if (record.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenException("OTP has expired. Please register again to get a new OTP.");
        }

        record.setUsed(true);
        otpRepository.save(record);

        user.setEmailVerified(true);
        userRepository.save(user);
    }
}
