package com.financetracker.repository;

import com.financetracker.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserIdOrderByNextRunDateAsc(Long userId);

    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);

    // Find all active recurring transactions due today or earlier (for scheduler)
    @Query("SELECT r FROM RecurringTransaction r WHERE r.active = true AND r.nextRunDate <= :today")
    List<RecurringTransaction> findDueRecurring(@Param("today") LocalDate today);
}
