package com.financetracker.service;

import com.financetracker.entity.RefreshToken;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-101 to TC-107 — RefreshTokenService unit tests
 * TC-108 to TC-114 — CsvExportService + CategoryService edge cases
 */
@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock RefreshTokenRepository refreshTokenRepository;

    @InjectMocks RefreshTokenService refreshTokenService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
        // inject the @Value field
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 604800000L);
    }

    // ── TC-101: createRefreshToken saves and returns a token ──────────────────
    @Test
    void TC101_createRefreshToken_savesAndReturnsToken() {
        when(refreshTokenRepository.save(any(RefreshToken.class)))
            .thenAnswer(i -> i.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(user);

        assertThat(token.getUserId()).isEqualTo(1L);
        assertThat(token.getToken()).isNotBlank();
        assertThat(token.isRevoked()).isFalse();
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    // ── TC-102: createRefreshToken sets future expiry ─────────────────────────
    @Test
    void TC102_createRefreshToken_expiryIsInFuture() {
        when(refreshTokenRepository.save(any(RefreshToken.class)))
            .thenAnswer(i -> i.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(user);

        assertThat(token.getExpiryDate()).isAfter(Instant.now());
    }

    // ── TC-103: verifyAndGet returns valid non-revoked token ──────────────────
    @Test
    void TC103_verifyAndGet_validToken_returnsToken() {
        RefreshToken rt = RefreshToken.builder()
            .token("valid").userId(1L).revoked(false)
            .expiryDate(Instant.now().plusSeconds(3600)).build();
        when(refreshTokenRepository.findByToken("valid")).thenReturn(Optional.of(rt));

        RefreshToken result = refreshTokenService.verifyAndGet("valid");

        assertThat(result.getToken()).isEqualTo("valid");
    }

    // ── TC-104: verifyAndGet throws for unknown token ─────────────────────────
    @Test
    void TC104_verifyAndGet_unknownToken_throwsTokenException() {
        when(refreshTokenRepository.findByToken("bad")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.verifyAndGet("bad"))
            .isInstanceOf(TokenException.class);
    }

    // ── TC-105: verifyAndGet throws for revoked token ─────────────────────────
    @Test
    void TC105_verifyAndGet_revokedToken_throwsTokenException() {
        RefreshToken rt = RefreshToken.builder()
            .token("revoked").userId(1L).revoked(true)
            .expiryDate(Instant.now().plusSeconds(3600)).build();
        when(refreshTokenRepository.findByToken("revoked")).thenReturn(Optional.of(rt));

        assertThatThrownBy(() -> refreshTokenService.verifyAndGet("revoked"))
            .isInstanceOf(TokenException.class);
    }

    // ── TC-106: verifyAndGet throws for expired token and marks it revoked ─────
    @Test
    void TC106_verifyAndGet_expiredToken_throwsAndRevokes() {
        RefreshToken rt = RefreshToken.builder()
            .token("expired").userId(1L).revoked(false)
            .expiryDate(Instant.now().minusSeconds(60)).build();
        when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(rt));
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        assertThatThrownBy(() -> refreshTokenService.verifyAndGet("expired"))
            .isInstanceOf(TokenException.class);

        assertThat(rt.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(rt);
    }

    // ── TC-107: revokeAllByUserId delegates to repository ─────────────────────
    @Test
    void TC107_revokeAllByUserId_callsRepository() {
        refreshTokenService.revokeAllByUserId(1L);
        verify(refreshTokenRepository).revokeAllByUserId(1L);
    }
}
