package com.financetracker.service;

import com.financetracker.dto.response.AdminStatsResponse;
import com.financetracker.dto.response.AdminUserResponse;
import com.financetracker.dto.response.CsvImportLogResponse;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.CsvImportLogRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CsvImportLogRepository csvImportLogRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public AdminUserResponse setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse changeUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(Role.valueOf(role.toUpperCase()));
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(userId);
    }

    public AdminStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalCategories = categoryRepository.count();
        long totalImports = csvImportLogRepository.count();
        return AdminStatsResponse.builder()
            .totalUsers(totalUsers)
            .totalTransactions(totalTransactions)
            .totalCategories(totalCategories)
            .totalImports(totalImports)
            .build();
    }

    public List<CsvImportLogResponse> getImportLogs() {
        return csvImportLogRepository.findAllByOrderByImportedAtDesc().stream()
            .map(log -> CsvImportLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userEmail(log.getUserEmail())
                .fileName(log.getFileName())
                .status(log.getStatus())
                .imported(log.getImported())
                .skipped(log.getSkipped())
                .errorMessage(log.getErrorMessage())
                .importedAt(log.getImportedAt().toString())
                .build())
            .collect(Collectors.toList());
    }

    private AdminUserResponse toUserResponse(User u) {
        return AdminUserResponse.builder()
            .id(u.getId())
            .email(u.getEmail())
            .fullName(u.getFullName())
            .currency(u.getCurrency())
            .role(u.getRole().name())
            .enabled(u.isEnabled())
            .emailVerified(u.isEmailVerified())
            .build();
    }
}
