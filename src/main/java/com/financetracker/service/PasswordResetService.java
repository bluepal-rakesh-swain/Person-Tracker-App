package com.financetracker.service;

import com.financetracker.entity.PasswordResetToken;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.PasswordResetTokenRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final long EXPIRY_MILLIS = 15 * 60 * 1000L; // 15 minutes
    private static final Random RANDOM = new Random();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("No account found with that email"));

        // Delete any existing tokens for this user
        tokenRepository.deleteAllByUserId(user.getId());

        String rawToken = String.format("%06d", RANDOM.nextInt(1_000_000));

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .userId(user.getId())
            .token(rawToken)
            .expiryDate(Instant.now().plusMillis(EXPIRY_MILLIS))
            .used(false)
            .build();

        tokenRepository.save(resetToken);

        // Send token via email
        emailService.sendPasswordResetEmail(email, rawToken);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(rawToken)
            .orElseThrow(() -> new TokenException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new TokenException("Reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenException("Reset token has expired");
        }

        User user = userRepository.findById(resetToken.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
