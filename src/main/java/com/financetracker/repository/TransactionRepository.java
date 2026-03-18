package com.financetracker.repository;

import com.financetracker.entity.Transaction;
import com.financetracker.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query(value = """
        SELECT * FROM transactions
        WHERE user_id = :userId
          AND (:start IS NULL OR date >= CAST(:start AS DATE))
          AND (:end IS NULL OR date <= CAST(:end AS DATE))
          AND (:categoryId IS NULL OR category_id = :categoryId)
        ORDER BY date DESC
        """, nativeQuery = true)
    List<Transaction> findFiltered(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("categoryId") Long categoryId
    );

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.userId = :userId
          AND (:start IS NULL OR t.date >= :start)
          AND (:end IS NULL OR t.date <= :end)
          AND (:categoryId IS NULL OR t.categoryId = :categoryId)
        """)
    Page<Transaction> findFilteredPaged(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("categoryId") Long categoryId,
        Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.userId = :userId AND t.type = :type
          AND t.date >= :start AND t.date <= :end
        """)
    Long sumByUserAndTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("type") TransactionType type,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query(value = """
        SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, SUM(amount)
        FROM transactions
        WHERE user_id = :userId AND CAST(EXTRACT(YEAR FROM date) AS INTEGER) = :year
        GROUP BY TO_CHAR(date, 'YYYY-MM'), type
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> monthlyChartData(
        @Param("userId") Long userId,
        @Param("year") int year
    );

    @Query("""
        SELECT t.categoryId, SUM(t.amount)
        FROM Transaction t
        WHERE t.userId = :userId AND t.date >= :start AND t.date <= :end
        GROUP BY t.categoryId
        """)
    List<Object[]> categoryChartData(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("""
        SELECT t.categoryId, SUM(t.amount)
        FROM Transaction t
        WHERE t.userId = :userId AND t.type = :expenseType
          AND t.date >= :start AND t.date <= :end
        GROUP BY t.categoryId
        """)
    List<Object[]> spentByCategoryInMonth(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("expenseType") TransactionType expenseType
    );

    @Query(value = """
        SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, SUM(amount)
        FROM transactions
        WHERE user_id = :userId AND CAST(EXTRACT(YEAR FROM date) AS INTEGER) = :year
        GROUP BY TO_CHAR(date, 'YYYY-MM'), type
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> yearlySummaryData(
        @Param("userId") Long userId,
        @Param("year") int year
    );

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    Page<Transaction> findByUserId(Long userId, Pageable pageable);

    // ── Platform-wide (admin) queries ──────────────────────────────────────────

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.type = :type AND t.date >= :start AND t.date <= :end
        """)
    Long sumByTypeAndDateRange(
        @Param("type") TransactionType type,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query(value = """
        SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, SUM(amount)
        FROM transactions
        WHERE CAST(EXTRACT(YEAR FROM date) AS INTEGER) = :year
        GROUP BY TO_CHAR(date, 'YYYY-MM'), type
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> monthlyChartDataAll(@Param("year") int year);

    @Query("""
        SELECT t.categoryId, SUM(t.amount)
        FROM Transaction t
        WHERE t.date >= :start AND t.date <= :end
        GROUP BY t.categoryId
        """)
    List<Object[]> categoryChartDataAll(
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );
}
