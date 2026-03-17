package com.financetracker.repository;

import com.financetracker.entity.CsvImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CsvImportLogRepository extends JpaRepository<CsvImportLog, Long> {
    List<CsvImportLog> findAllByOrderByImportedAtDesc();
    List<CsvImportLog> findByUserIdOrderByImportedAtDesc(Long userId);
}
