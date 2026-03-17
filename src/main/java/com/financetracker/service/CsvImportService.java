package com.financetracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.batch.CsvRow;
import com.financetracker.batch.CsvRowProcessor;
import com.financetracker.dto.csv.CsvColumnMapping;
import com.financetracker.dto.response.ImportResult;
import com.financetracker.entity.CsvImportLog;
import com.financetracker.entity.Transaction;
import com.financetracker.entity.User;
import com.financetracker.repository.CsvImportLogRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.mapping.FieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final CsvRowProcessor csvRowProcessor;
    private final TransactionRepository transactionRepository;
    private final CsvImportLogRepository csvImportLogRepository;
    private final ObjectMapper objectMapper;

    public ImportResult importCsv(User user, MultipartFile file, String mappingJson) throws Exception {
        CsvColumnMapping mapping = objectMapper.readValue(mappingJson, CsvColumnMapping.class);
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown.csv";

        // Save temp file
        File tempFile = File.createTempFile("csv_import_", ".csv");
        file.transferTo(tempFile);

        try {
            List<String> lines = Files.readAllLines(tempFile.toPath());
            if (lines.isEmpty()) {
                saveLog(user, fileName, "COMPLETED", 0, 0, null);
                return ImportResult.builder().status("COMPLETED").imported(0).skipped(0).build();
            }

            String[] headers = lines.get(0).split(",");
            for (int i = 0; i < headers.length; i++) headers[i] = headers[i].trim();

            csvRowProcessor.setUserId(user.getId());
            csvRowProcessor.setDefaultCategoryId(mapping.getDefaultCategoryId());
            csvRowProcessor.setDateFormat(mapping.getDateFormat() != null ? mapping.getDateFormat() : "yyyy-MM-dd");

            FlatFileItemReader<CsvRow> reader = buildReader(tempFile, headers, mapping);
            reader.open(new ExecutionContext());

            List<Transaction> toSave = new ArrayList<>();
            int skipped = 0;
            CsvRow row;

            while ((row = reader.read()) != null) {
                Transaction tx = csvRowProcessor.process(row);
                if (tx != null) toSave.add(tx);
                else skipped++;
            }

            reader.close();
            transactionRepository.saveAll(toSave);

            saveLog(user, fileName, "COMPLETED", toSave.size(), skipped, null);
            return ImportResult.builder()
                .status("COMPLETED")
                .imported(toSave.size())
                .skipped(skipped)
                .build();

        } catch (Exception e) {
            saveLog(user, fileName, "FAILED", 0, 0, e.getMessage());
            throw e;
        } finally {
            tempFile.delete();
        }
    }

    private void saveLog(User user, String fileName, String status, int imported, int skipped, String error) {
        csvImportLogRepository.save(CsvImportLog.builder()
            .userId(user.getId())
            .userEmail(user.getEmail())
            .fileName(fileName)
            .status(status)
            .imported(imported)
            .skipped(skipped)
            .errorMessage(error)
            .importedAt(Instant.now())
            .build());
    }

    private FlatFileItemReader<CsvRow> buildReader(File file, String[] headers, CsvColumnMapping mapping) {
        boolean isBankFormat = mapping.getDebit() != null && mapping.getCredit() != null;

        FieldSetMapper<CsvRow> fieldSetMapper = fieldSet -> {
            CsvRow row = new CsvRow();
            try {
                row.setDate(getFieldValue(fieldSet.getValues(), headers, mapping.getDate()));
                row.setDescription(getFieldValue(fieldSet.getValues(), headers, mapping.getDesc()));
                if (isBankFormat) {
                    row.setDebit(getFieldValue(fieldSet.getValues(), headers, mapping.getDebit()));
                    row.setCredit(getFieldValue(fieldSet.getValues(), headers, mapping.getCredit()));
                } else {
                    row.setAmount(getFieldValue(fieldSet.getValues(), headers, mapping.getAmount()));
                }
            } catch (Exception e) {
                row.setSkip(true);
            }
            return row;
        };

        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames(headers);

        DefaultLineMapper<CsvRow> lineMapper = new DefaultLineMapper<>();
        lineMapper.setLineTokenizer(tokenizer);
        lineMapper.setFieldSetMapper(fieldSetMapper);

        return new FlatFileItemReaderBuilder<CsvRow>()
            .name("csvReader")
            .resource(new FileSystemResource(file))
            .linesToSkip(1) // skip header
            .lineMapper(lineMapper)
            .build();
    }

    private String getFieldValue(String[] values, String[] headers, String columnName) {
        if (columnName == null) return null;
        for (int i = 0; i < headers.length; i++) {
            if (headers[i].equalsIgnoreCase(columnName.trim())) {
                return i < values.length ? values[i] : null;
            }
        }
        return null;
    }
}
