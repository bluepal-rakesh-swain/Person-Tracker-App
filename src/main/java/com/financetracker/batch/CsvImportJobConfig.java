package com.financetracker.batch;

import org.springframework.context.annotation.Configuration;

/**
 * Spring Batch infrastructure (JobRepository, JobLauncher) is
 * auto-configured by spring-boot-starter-batch in Spring Boot 3.x.
 * @EnableBatchProcessing is intentionally omitted — it conflicts with
 * Boot's auto-configuration and breaks springdoc in Boot 3.
 */
@Configuration
public class CsvImportJobConfig {
    // Batch infrastructure beans (JobRepository, JobLauncher) are
    // auto-configured by spring-boot-starter-batch.
}
