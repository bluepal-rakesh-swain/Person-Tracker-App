package com.financetracker.service;

import com.financetracker.dto.request.LoginRequest;
import com.financetracker.dto.request.RefreshRequest;
import com.financetracker.dto.request.RegisterRequest;
import com.financetracker.dto.response.AuthResponse;
import com.financetracker.dto.response.RegisterResponse;
import com.financetracker.entity.RefreshToken;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.TokenException;
import com.financetracker.repository.UserRepository;
import com.financetracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            // Check if the existing user has not verified their email yet
            User existing = userRepository.findByEmail(request.getEmail()).orElseThrow();
            if (!existing.isEmailVerified()) {
                // Resend OTP so they can complete verification
                emailVerificationService.sendOtp(existing);
                return RegisterResponse.builder()
                    .id(existing.getId())
                    .email(existing.getEmail())
                    .fullName(existing.getFullName())
                    .currency(existing.getCurrency())
                    .role(existing.getRole().name())
                    .build();
            }
            throw new IllegalArgumentException("Email already registered");
        }
        User user = User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .currency(request.getCurrency())
            .role(Role.USER)
            .emailVerified(false)
            .enabled(true)
            .build();
        user = userRepository.save(user);

        // Send OTP — tokens are NOT issued until email is verified
        emailVerificationService.sendOtp(user);

        return RegisterResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .currency(user.getCurrency())
            .role(user.getRole().name())
            .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email not verified. Please check your inbox for the OTP.");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyAndGet(request.getRefreshToken());
        User user = userRepository.findById(refreshToken.getUserId())
            .orElseThrow(() -> new TokenException("User not found for refresh token"));
        // Revoke the used token (rotate refresh tokens)
        refreshTokenService.revokeToken(refreshToken);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenService.revokeAllByUserId(userId);
    }

    /** Called after email OTP verification — issues tokens without password re-check */
    @Transactional
    public AuthResponse loginAfterVerification(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken.getToken())
            .user(AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .currency(user.getCurrency())
                .role(user.getRole().name())
                .build())
            .build();
    }
}
