package com.financetracker.service;

import com.financetracker.entity.EmailVerificationOtp;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.EmailVerificationOtpRepository;
import com.financetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-051 to TC-062 — EmailVerificationService unit tests
 */
@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock EmailVerificationOtpRepository otpRepository;
    @Mock UserRepository userRepository;
    @Mock EmailService emailService;

    @InjectMocks EmailVerificationService emailVerificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(false).enabled(true).build();
    }

    // ── TC-051: sendOtp deletes old OTPs and saves new one ────────────────────
    @Test
    void TC051_sendOtp_deletesOldAndSavesNew() {
        emailVerificationService.sendOtp(user);

        verify(otpRepository).deleteAllByUserId(1L);
        verify(otpRepository).save(any(EmailVerificationOtp.class));
        verify(emailService).sendVerificationOtpEmail(eq("u@test.com"), anyString());
    }

    // ── TC-052: sendOtp generates 6-digit OTP ─────────────────────────────────
    @Test
    void TC052_sendOtp_generates6DigitOtp() {
        ArgumentCaptor<EmailVerificationOtp> captor =
            ArgumentCaptor.forClass(EmailVerificationOtp.class);

        emailVerificationService.sendOtp(user);

        verify(otpRepository).save(captor.capture());
        String otp = captor.getValue().getOtp();
        assertThat(otp).hasSize(6);
        assertThat(otp).matches("\\d{6}");
    }

    // ── TC-053: sendOtp sets expiry to ~10 minutes from now ───────────────────
    @Test
    void TC053_sendOtp_expiryIsAbout10Minutes() {
        ArgumentCaptor<EmailVerificationOtp> captor =
            ArgumentCaptor.forClass(EmailVerificationOtp.class);

        emailVerificationService.sendOtp(user);

        verify(otpRepository).save(captor.capture());
        Instant expiry = captor.getValue().getExpiryDate();
        long diffSeconds = expiry.getEpochSecond() - Instant.now().getEpochSecond();
        assertThat(diffSeconds).isBetween(590L, 610L);
    }

    // ── TC-054: verifyOtp with valid OTP marks user as verified ───────────────
    @Test
    void TC054_verifyOtp_validOtp_marksUserVerified() {
        EmailVerificationOtp otp = EmailVerificationOtp.builder()
            .id(1L).userId(1L).otp("123456")
            .expiryDate(Instant.now().plusSeconds(300)).used(false).build();

        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        when(otpRepository.findByUserIdAndOtpAndUsedFalse(1L, "123456"))
            .thenReturn(Optional.of(otp));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        emailVerificationService.verifyOtp("u@test.com", "123456");

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(otp.isUsed()).isTrue();
    }

    // ── TC-055: verifyOtp with expired OTP throws TokenException ─────────────
    @Test
    void TC055_verifyOtp_expiredOtp_throwsTokenException() {
        EmailVerificationOtp otp = EmailVerificationOtp.builder()
            .id(1L).userId(1L).otp("123456")
            .expiryDate(Instant.now().minusSeconds(60)).used(false).build();

        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        when(otpRepository.findByUserIdAndOtpAndUsedFalse(1L, "123456"))
            .thenReturn(Optional.of(otp));

        assertThatThrownBy(() -> emailVerificationService.verifyOtp("u@test.com", "123456"))
            .isInstanceOf(TokenException.class)
            .hasMessageContaining("expired");
    }

    // ── TC-056: verifyOtp with wrong OTP throws TokenException ───────────────
    @Test
    void TC056_verifyOtp_wrongOtp_throwsTokenException() {
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        when(otpRepository.findByUserIdAndOtpAndUsedFalse(1L, "000000"))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.verifyOtp("u@test.com", "000000"))
            .isInstanceOf(TokenException.class)
            .hasMessageContaining("Invalid OTP");
    }

    // ── TC-057: verifyOtp with unknown email throws ResourceNotFoundException ──
    @Test
    void TC057_verifyOtp_unknownEmail_throwsResourceNotFound() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.verifyOtp("ghost@test.com", "123456"))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-058: verifyOtp is no-op if already verified ────────────────────────
    @Test
    void TC058_verifyOtp_alreadyVerified_noOp() {
        user.setEmailVerified(true);
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));

        emailVerificationService.verifyOtp("u@test.com", "123456");

        verify(otpRepository, never()).findByUserIdAndOtpAndUsedFalse(any(), any());
    }

    // ── TC-059: sendOtp sets used=false on new OTP ────────────────────────────
    @Test
    void TC059_sendOtp_newOtpIsNotUsed() {
        ArgumentCaptor<EmailVerificationOtp> captor =
            ArgumentCaptor.forClass(EmailVerificationOtp.class);

        emailVerificationService.sendOtp(user);

        verify(otpRepository).save(captor.capture());
        assertThat(captor.getValue().isUsed()).isFalse();
    }

    // ── TC-060: verifyOtp saves updated OTP record ────────────────────────────
    @Test
    void TC060_verifyOtp_savesUpdatedOtpRecord() {
        EmailVerificationOtp otp = EmailVerificationOtp.builder()
            .id(1L).userId(1L).otp("654321")
            .expiryDate(Instant.now().plusSeconds(300)).used(false).build();

        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        when(otpRepository.findByUserIdAndOtpAndUsedFalse(1L, "654321"))
            .thenReturn(Optional.of(otp));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        emailVerificationService.verifyOtp("u@test.com", "654321");

        verify(otpRepository).save(otp);
    }
}
