package com.financetracker.service;

import com.financetracker.entity.PasswordResetToken;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.PasswordResetTokenRepository;
import com.financetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-074 to TC-082 — PasswordResetService unit tests
 */
@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock PasswordResetTokenRepository tokenRepository;
    @Mock UserRepository userRepository;
    @Mock EmailService emailService;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks PasswordResetService passwordResetService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").password("encoded")
            .fullName("Test").currency("INR").role(Role.USER)
            .emailVerified(true).enabled(true).build();
    }

    // ── TC-074: forgotPassword sends reset email for known user ───────────────
    @Test
    void TC074_forgotPassword_knownEmail_sendsResetEmail() {
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        passwordResetService.forgotPassword("u@test.com");

        verify(emailService).sendPasswordResetEmail(eq("u@test.com"), anyString());
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    // ── TC-075: forgotPassword throws ResourceNotFoundException for unknown email
    @Test
    void TC075_forgotPassword_unknownEmail_noException() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.forgotPassword("ghost@test.com"))
            .isInstanceOf(com.financetracker.exception.ResourceNotFoundException.class);
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    // ── TC-076: resetPassword with valid token updates password ───────────────
    @Test
    void TC076_resetPassword_validToken_updatesPassword() {
        PasswordResetToken token = PasswordResetToken.builder()
            .id(1L).userId(1L).token("valid-token")
            .expiryDate(Instant.now().plusSeconds(300)).used(false).build();

        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("new-encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        passwordResetService.resetPassword("valid-token", "NewPass@123");

        assertThat(user.getPassword()).isEqualTo("new-encoded");
        assertThat(token.isUsed()).isTrue();
        verify(tokenRepository).save(token);
    }

    // ── TC-077: resetPassword with expired token throws TokenException ─────────
    @Test
    void TC077_resetPassword_expiredToken_throwsTokenException() {
        PasswordResetToken token = PasswordResetToken.builder()
            .id(1L).userId(1L).token("expired-token")
            .expiryDate(Instant.now().minusSeconds(60)).used(false).build();

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword("expired-token", "NewPass@123"))
            .isInstanceOf(TokenException.class);
    }

    // ── TC-078: resetPassword with already-used token throws TokenException ────
    @Test
    void TC078_resetPassword_usedToken_throwsTokenException() {
        PasswordResetToken token = PasswordResetToken.builder()
            .id(1L).userId(1L).token("used-token")
            .expiryDate(Instant.now().plusSeconds(300)).used(true).build();

        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> passwordResetService.resetPassword("used-token", "NewPass@123"))
            .isInstanceOf(TokenException.class);
    }

    // ── TC-079: resetPassword with unknown token throws TokenException ─────────
    @Test
    void TC079_resetPassword_unknownToken_throwsTokenException() {
        when(tokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.resetPassword("bad-token", "NewPass@123"))
            .isInstanceOf(TokenException.class);
    }

    // ── TC-080: forgotPassword generates unique token each time ───────────────
    @Test
    void TC080_forgotPassword_generatesUniqueToken() {
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));

        ArgumentCaptor<PasswordResetToken> captor =
            ArgumentCaptor.forClass(PasswordResetToken.class);
        when(tokenRepository.save(captor.capture())).thenAnswer(i -> i.getArgument(0));

        passwordResetService.forgotPassword("u@test.com");
        String token1 = captor.getValue().getToken();

        passwordResetService.forgotPassword("u@test.com");
        String token2 = captor.getValue().getToken();

        assertThat(token1).isNotEqualTo(token2);
    }

    // ── TC-081: resetPassword encodes new password ─────────────────────────────
    @Test
    void TC081_resetPassword_encodesNewPassword() {
        PasswordResetToken token = PasswordResetToken.builder()
            .id(1L).userId(1L).token("t")
            .expiryDate(Instant.now().plusSeconds(300)).used(false).build();

        when(tokenRepository.findByToken("t")).thenReturn(Optional.of(token));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        passwordResetService.resetPassword("t", "NewPass@123");

        verify(passwordEncoder).encode("NewPass@123");
        assertThat(user.getPassword()).isEqualTo("$2a$encoded");
    }

    // ── TC-082: forgotPassword saves token with used=false ────────────────────
    @Test
    void TC082_forgotPassword_savedTokenIsNotUsed() {
        when(userRepository.findByEmail("u@test.com")).thenReturn(Optional.of(user));
        ArgumentCaptor<PasswordResetToken> captor =
            ArgumentCaptor.forClass(PasswordResetToken.class);
        when(tokenRepository.save(captor.capture())).thenAnswer(i -> i.getArgument(0));

        passwordResetService.forgotPassword("u@test.com");

        assertThat(captor.getValue().isUsed()).isFalse();
    }
}
