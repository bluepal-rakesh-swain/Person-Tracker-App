package com.financetracker.service;

import com.financetracker.dto.response.AdminUserResponse;
import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-083 to TC-100 — AdminService unit tests
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock UserRepository userRepository;
    @Mock com.financetracker.repository.TransactionRepository transactionRepository;
    @Mock com.financetracker.repository.CategoryRepository categoryRepository;
    @Mock com.financetracker.repository.CsvImportLogRepository csvImportLogRepository;

    @InjectMocks AdminService adminService;

    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        regularUser = User.builder().id(2L).email("user@test.com").password("encoded")
            .fullName("Regular User").currency("INR").role(Role.USER)
            .emailVerified(true).enabled(true).build();
        adminUser = User.builder().id(1L).email("admin@test.com").password("encoded")
            .fullName("Admin").currency("INR").role(Role.ADMIN)
            .emailVerified(true).enabled(true).build();
    }

    // ── TC-083: getAllUsers returns all users ──────────────────────────────────
    @Test
    void TC083_getAllUsers_returnsAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, regularUser));

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result).hasSize(2);
    }

    // ── TC-084: getAllUsers returns empty list when no users ──────────────────
    @Test
    void TC084_getAllUsers_noUsers_returnsEmpty() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result).isEmpty();
    }

    // ── TC-085: getUserById returns user for valid id ─────────────────────────
    @Test
    void TC085_getUserById_validId_returnsUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        User result = adminService.getUserById(2L);

        assertThat(result.getEmail()).isEqualTo("user@test.com");
    }

    // ── TC-086: getUserById throws ResourceNotFoundException for unknown id ────
    @Test
    void TC086_getUserById_unknownId_throwsResourceNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getUserById(999L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-087: setUserEnabled disables a user ────────────────────────────────
    @Test
    void TC087_setUserEnabled_false_disablesUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AdminUserResponse res = adminService.setUserEnabled(2L, false);

        assertThat(regularUser.isEnabled()).isFalse();
        verify(userRepository).save(regularUser);
    }

    // ── TC-088: setUserEnabled enables a user ─────────────────────────────────
    @Test
    void TC088_setUserEnabled_true_enablesUser() {
        regularUser.setEnabled(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        adminService.setUserEnabled(2L, true);

        assertThat(regularUser.isEnabled()).isTrue();
    }

    // ── TC-089: setUserEnabled throws for unknown user ────────────────────────
    @Test
    void TC089_setUserEnabled_unknownUser_throwsResourceNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.setUserEnabled(999L, false))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-090: changeUserRole changes role to ADMIN ──────────────────────────
    @Test
    void TC090_changeUserRole_toAdmin_changesRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AdminUserResponse res = adminService.changeUserRole(2L, "ADMIN");

        assertThat(regularUser.getRole()).isEqualTo(Role.ADMIN);
    }

    // ── TC-091: changeUserRole changes role to USER ───────────────────────────
    @Test
    void TC091_changeUserRole_toUser_changesRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        adminService.changeUserRole(1L, "USER");

        assertThat(adminUser.getRole()).isEqualTo(Role.USER);
    }

    // ── TC-092: changeUserRole throws for unknown user ────────────────────────
    @Test
    void TC092_changeUserRole_unknownUser_throwsResourceNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.changeUserRole(999L, "ADMIN"))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-093: deleteUser removes user ───────────────────────────────────────
    @Test
    void TC093_deleteUser_validId_deletesUser() {
        when(userRepository.existsById(2L)).thenReturn(true);

        adminService.deleteUser(2L);

        verify(userRepository).deleteById(2L);
    }

    // ── TC-094: deleteUser throws for unknown user ────────────────────────────
    @Test
    void TC094_deleteUser_unknownId_throwsResourceNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> adminService.deleteUser(999L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-095: getPlatformStats returns stats with user count ────────────────
    @Test
    void TC095_getPlatformStats_returnsStatsWithUserCount() {
        when(userRepository.count()).thenReturn(2L);
        when(transactionRepository.count()).thenReturn(50L);
        when(categoryRepository.count()).thenReturn(10L);
        when(csvImportLogRepository.count()).thenReturn(3L);

        var stats = adminService.getPlatformStats();

        assertThat(stats.getTotalUsers()).isEqualTo(2L);
        assertThat(stats.getTotalTransactions()).isEqualTo(50L);
    }

    // ── TC-096: getPlatformStats counts categories ─────────────────────────────
    @Test
    void TC096_getPlatformStats_countsCategoriesAndImports() {
        when(userRepository.count()).thenReturn(5L);
        when(transactionRepository.count()).thenReturn(100L);
        when(categoryRepository.count()).thenReturn(20L);
        when(csvImportLogRepository.count()).thenReturn(7L);

        var stats = adminService.getPlatformStats();

        assertThat(stats.getTotalCategories()).isEqualTo(20L);
        assertThat(stats.getTotalImports()).isEqualTo(7L);
    }

    // ── TC-097: getImportLogs returns all import logs ─────────────────────────
    @Test
    void TC097_getImportLogs_returnsAllLogs() {
        when(csvImportLogRepository.findAllByOrderByImportedAtDesc()).thenReturn(List.of());

        var logs = adminService.getImportLogs();

        assertThat(logs).isEmpty();
        verify(csvImportLogRepository).findAllByOrderByImportedAtDesc();
    }

    // ── TC-098: getAllUsers maps email correctly ───────────────────────────────
    @Test
    void TC098_getAllUsers_mapsEmailCorrectly() {
        when(userRepository.findAll()).thenReturn(List.of(regularUser));

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result.get(0).getEmail()).isEqualTo("user@test.com");
    }

    // ── TC-099: getAllUsers maps role correctly ────────────────────────────────
    @Test
    void TC099_getAllUsers_mapsRoleCorrectly() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser));

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result.get(0).getRole()).isEqualTo("ADMIN");
    }

    // ── TC-100: getAllUsers maps enabled status correctly ─────────────────────
    @Test
    void TC100_getAllUsers_mapsEnabledStatusCorrectly() {
        regularUser.setEnabled(false);
        when(userRepository.findAll()).thenReturn(List.of(regularUser));

        List<AdminUserResponse> result = adminService.getAllUsers();

        assertThat(result.get(0).isEnabled()).isFalse();
    }
}
