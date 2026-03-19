package com.financetracker.config;

import com.financetracker.entity.Role;
import com.financetracker.entity.User;
import com.financetracker.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        // Backfill: mark all existing users (registered before email verification was added) as verified
        int updated = entityManager
            .createNativeQuery("UPDATE users SET email_verified = true WHERE email_verified IS NULL OR email_verified = false")
            .executeUpdate();
        if (updated > 0) {
            log.info("Backfilled email_verified=true for {} existing user(s)", updated);
        }

        // Backfill: set enabled=true for existing users that have NULL
        int enabledUpdated = entityManager
            .createNativeQuery("UPDATE users SET enabled = true WHERE enabled IS NULL")
            .executeUpdate();
        if (enabledUpdated > 0) {
            log.info("Backfilled enabled=true for {} existing user(s)", enabledUpdated);
        }

        if (!userRepository.existsByEmail("admin@financetracker.com")) {
            User admin = User.builder()
                .email("admin@financetracker.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Admin")
                .currency("INR")
                .role(Role.ADMIN)
                .emailVerified(true)
                .enabled(true)
                .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@financetracker.com / Admin@123");
        } else {
            // Update password if admin already exists (e.g. was created with old password)
            userRepository.findByEmail("admin@financetracker.com").ifPresent(admin -> {
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                userRepository.save(admin);
                log.info("Admin password updated to Admin@123");
            });
        }
    }
}
