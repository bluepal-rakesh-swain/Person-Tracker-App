package com.financetracker.batch;

import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Batch is enabled for its infrastructure (JobRepository, JobLauncher, etc.).
 * The actual CSV import logic runs directly in CsvImportService using
 * FlatFileItemReader inline — this avoids complex StepScope wiring while
 * still leveraging Spring Batch's reader/processor/writer pipeline.
 */
@Configuration
@EnableBatchProcessing
public class CsvImportJobConfig {
    // Batch infrastructure beans (JobRepository, JobLauncher) are
    // auto-configured by spring-boot-starter-batch.
}
