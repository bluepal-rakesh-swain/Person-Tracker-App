package com.financetracker.service;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.dto.response.RegisterResponse;
import com.financetracker.entity.RefreshToken;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-001 to TC-018 — AuthService unit tests
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock RefreshTokenService refreshTokenService;
    @Mock AuthenticationManager authenticationManager;
    @Mock EmailVerificationService emailVerificationService;

    @InjectMocks AuthService authService;

    private User verifiedUser;
    private User unverifiedUser;

    @BeforeEach
    void setUp() {
        verifiedUser = User.builder()
            .id(1L).email("user@test.com").password("encoded")
            .fullName("Test User").currency("INR").role(Role.USER)
            .emailVerified(true).enabled(true).build();

        unverifiedUser = User.builder()
            .id(2L).email("new@test.com").password("encoded")
            .fullName("New User").currency("INR").role(Role.USER)
            .emailVerified(false).enabled(true).build();
    }

    // ── TC-001: Register new user successfully ────────────────────────────────
    @Test
    void TC001_register_newEmail_savesUserAndSendsOtp() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@test.com"); req.setPassword("Pass@123");
        req.setFullName("New User"); req.setCurrency("INR");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Pass@123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(unverifiedUser);

        RegisterResponse res = authService.register(req);

        assertThat(res.getEmail()).isEqualTo("new@test.com");
        verify(emailVerificationService).sendOtp(any(User.class));
        verify(userRepository).save(any(User.class));
    }

    // ── TC-002: Register with already-verified email throws exception ─────────
    @Test
    void TC002_register_verifiedEmailExists_throwsIllegalArgument() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("user@test.com"); req.setPassword("Pass@123");
        req.setFullName("Test"); req.setCurrency("INR");

        when(userRepository.existsByEmail("user@test.com")).thenReturn(true);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(verifiedUser));

        assertThatThrownBy(() -> authService.register(req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already registered");
    }

    // ── TC-003: Register with unverified email resends OTP ────────────────────
    @Test
    void TC003_register_unverifiedEmailExists_resendsOtp() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@test.com"); req.setPassword("Pass@123");
        req.setFullName("New User"); req.setCurrency("INR");

        when(userRepository.existsByEmail("new@test.com")).thenReturn(true);
        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.of(unverifiedUser));

        RegisterResponse res = authService.register(req);

        assertThat(res.getEmail()).isEqualTo("new@test.com");
        verify(emailVerificationService).sendOtp(unverifiedUser);
        verify(userRepository, never()).save(any());
    }

    // ── TC-004: Login with verified user returns tokens ───────────────────────
    @Test
    void TC004_login_verifiedUser_returnsAuthResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@test.com"); req.setPassword("Pass@123");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(verifiedUser));
        when(jwtService.generateAccessToken(verifiedUser)).thenReturn("access-token");
        RefreshToken rt = RefreshToken.builder().token("refresh-token")
            .userId(1L).expiryDate(Instant.now().plusSeconds(3600)).revoked(false).build();
        when(refreshTokenService.createRefreshToken(verifiedUser)).thenReturn(rt);

        AuthResponse res = authService.login(req);

        assertThat(res.getAccessToken()).isEqualTo("access-token");
        assertThat(res.getRefreshToken()).isEqualTo("refresh-token");
    }

    // ── TC-005: Login with unverified email throws IllegalStateException ───────
    @Test
    void TC005_login_unverifiedEmail_throwsIllegalState() {
        LoginRequest req = new LoginRequest();
        req.setEmail("new@test.com"); req.setPassword("Pass@123");

        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.of(unverifiedUser));

        assertThatThrownBy(() -> authService.login(req))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Email not verified");
    }

    // ── TC-006: Login with wrong password throws BadCredentialsException ───────
    @Test
    void TC006_login_wrongPassword_throwsBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@test.com"); req.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials"))
            .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(req))
            .isInstanceOf(BadCredentialsException.class);
    }

    // ── TC-007: Logout revokes all refresh tokens ─────────────────────────────
    @Test
    void TC007_logout_revokesAllTokens() {
        authService.logout(1L);
        verify(refreshTokenService).revokeAllByUserId(1L);
    }

    // ── TC-008: loginAfterVerification returns tokens for valid email ──────────
    @Test
    void TC008_loginAfterVerification_validEmail_returnsTokens() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(verifiedUser));
        when(jwtService.generateAccessToken(verifiedUser)).thenReturn("access-token");
        RefreshToken rt = RefreshToken.builder().token("rt").userId(1L)
            .expiryDate(Instant.now().plusSeconds(3600)).revoked(false).build();
        when(refreshTokenService.createRefreshToken(verifiedUser)).thenReturn(rt);

        AuthResponse res = authService.loginAfterVerification("user@test.com");

        assertThat(res.getAccessToken()).isEqualTo("access-token");
    }

    // ── TC-009: loginAfterVerification with unknown email throws exception ─────
    @Test
    void TC009_loginAfterVerification_unknownEmail_throws() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.loginAfterVerification("ghost@test.com"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // ── TC-010: Register sets enabled=true on new user ────────────────────────
    @Test
    void TC010_register_newUser_enabledIsTrue() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("enabled@test.com"); req.setPassword("Pass@123");
        req.setFullName("Enabled User"); req.setCurrency("USD");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(captor.capture())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(99L);
            return u;
        });

        authService.register(req);

        assertThat(captor.getValue().isEnabled()).isTrue();
        assertThat(captor.getValue().isEmailVerified()).isFalse();
    }

    // ── TC-011: Register sets role=USER on new user ───────────────────────────
    @Test
    void TC011_register_newUser_roleIsUser() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("role@test.com"); req.setPassword("Pass@123");
        req.setFullName("Role User"); req.setCurrency("INR");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(captor.capture())).thenAnswer(i -> {
            User u = i.getArgument(0); u.setId(10L); return u;
        });

        authService.register(req);

        assertThat(captor.getValue().getRole()).isEqualTo(Role.USER);
    }

    // ── TC-012: Register encodes password ─────────────────────────────────────
    @Test
    void TC012_register_passwordIsEncoded() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("enc@test.com"); req.setPassword("PlainPass@1");
        req.setFullName("Enc User"); req.setCurrency("INR");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("PlainPass@1")).thenReturn("$2a$hashed");
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(captor.capture())).thenAnswer(i -> {
            User u = i.getArgument(0); u.setId(11L); return u;
        });

        authService.register(req);

        assertThat(captor.getValue().getPassword()).isEqualTo("$2a$hashed");
    }
}
