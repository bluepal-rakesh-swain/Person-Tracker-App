package com.financetracker.service;

import com.financetracker.dto.request.TransactionRequest;
import com.financetracker.dto.response.PagedResponse;
import com.financetracker.dto.response.TransactionResponse;
import com.financetracker.entity.*;
import com.financetracker.exception.ResourceNotFoundException;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * TC-027 to TC-048 — TransactionService unit tests
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock BudgetRepository budgetRepository;
    @Mock WebSocketNotificationService webSocketNotificationService;

    @InjectMocks TransactionService transactionService;

    private User user;
    private Category category;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("u@test.com").currency("INR")
            .role(Role.USER).emailVerified(true).enabled(true).build();
        category = Category.builder().id(5L).userId(1L).name("Food")
            .type(TransactionType.EXPENSE).color("#f00").icon("utensils").build();
        transaction = Transaction.builder().id(100L).userId(1L).categoryId(5L)
            .amount(50000L).description("Lunch").date(LocalDate.of(2026, 3, 15))
            .type(TransactionType.EXPENSE).build();
    }

    // ── TC-027: create EXPENSE transaction saves and returns response ──────────
    @Test
    void TC027_create_expenseTransaction_savesAndReturns() {
        TransactionRequest req = new TransactionRequest();
        req.setCategoryId(5L); req.setAmount(50000L);
        req.setDescription("Lunch"); req.setDate(LocalDate.of(2026, 3, 15));
        req.setType(TransactionType.EXPENSE);

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any())).thenReturn(transaction);
        lenient().when(budgetRepository.findByUserIdAndCategoryIdAndMonthYear(any(), any(), any()))
            .thenReturn(Optional.empty());

        TransactionResponse res = transactionService.create(user, req);

        assertThat(res.getAmount()).isEqualTo(50000L);
        assertThat(res.getType()).isEqualTo(TransactionType.EXPENSE);
        verify(transactionRepository).save(any(Transaction.class));
    }

    // ── TC-028: create INCOME transaction does not trigger budget check ────────
    @Test
    void TC028_create_incomeTransaction_noBudgetCheck() {
        TransactionRequest req = new TransactionRequest();
        req.setCategoryId(5L); req.setAmount(100000L);
        req.setDescription("Salary"); req.setDate(LocalDate.of(2026, 3, 1));
        req.setType(TransactionType.INCOME);

        Category incCat = Category.builder().id(5L).userId(1L).name("Salary")
            .type(TransactionType.INCOME).color("#0f0").icon("briefcase").build();
        Transaction incTx = Transaction.builder().id(101L).userId(1L).categoryId(5L)
            .amount(100000L).description("Salary").date(LocalDate.of(2026, 3, 1))
            .type(TransactionType.INCOME).build();

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(incCat));
        when(transactionRepository.save(any())).thenReturn(incTx);

        TransactionResponse res = transactionService.create(user, req);

        assertThat(res.getType()).isEqualTo(TransactionType.INCOME);
        // Budget check should NOT be triggered for INCOME
        verify(budgetRepository, never()).findByUserIdAndCategoryIdAndMonthYear(any(), any(), any());
    }

    // ── TC-029: create with invalid category throws ResourceNotFoundException ──
    @Test
    void TC029_create_invalidCategory_throwsResourceNotFound() {
        TransactionRequest req = new TransactionRequest();
        req.setCategoryId(999L); req.setAmount(1000L);
        req.setDescription("X"); req.setDate(LocalDate.now());
        req.setType(TransactionType.EXPENSE);

        when(categoryRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.create(user, req))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── TC-030: getFiltered with no filters returns all user transactions ──────
    @Test
    void TC030_getFiltered_noFilters_returnsAll() {
        when(transactionRepository.findByUserIdOrderByDateDesc(1L))
            .thenReturn(List.of(transaction));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        List<TransactionResponse> result = transactionService.getFiltered(user, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategoryName()).isEqualTo("Food");
    }

    // ── TC-031: getFiltered with date range uses filtered query ───────────────
    @Test
    void TC031_getFiltered_withDateRange_usesFilteredQuery() {
        LocalDate start = LocalDate.of(2026, 3, 1);
        LocalDate end = LocalDate.of(2026, 3, 31);

        when(transactionRepository.findFiltered(1L, start, end, null))
            .thenReturn(List.of(transaction));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        List<TransactionResponse> result = transactionService.getFiltered(user, start, end, null);

        assertThat(result).hasSize(1);
        verify(transactionRepository).findFiltered(1L, start, end, null);
    }

    // ── TC-032: getFiltered with categoryId filter ────────────────────────────
    @Test
    void TC032_getFiltered_withCategoryId_filtersCorrectly() {
        when(transactionRepository.findFiltered(1L, null, null, 5L))
            .thenReturn(List.of(transaction));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        List<TransactionResponse> result = transactionService.getFiltered(user, null, null, 5L);

        assertThat(result).hasSize(1);
        verify(transactionRepository).findFiltered(1L, null, null, 5L);
    }

    // ── TC-033: getFiltered returns empty list when no transactions ───────────
    @Test
    void TC033_getFiltered_noTransactions_returnsEmpty() {
        when(transactionRepository.findByUserIdOrderByDateDesc(1L)).thenReturn(List.of());

        List<TransactionResponse> result = transactionService.getFiltered(user, null, null, null);

        assertThat(result).isEmpty();
    }

    // ── TC-034: getFilteredPaged returns paged response ───────────────────────
    @Test
    void TC034_getFilteredPaged_returnsPagedResponse() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction),
            PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "date")), 1);

        when(transactionRepository.findFilteredPaged(eq(1L), isNull(), isNull(), isNull(), any()))
            .thenReturn(page);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        PagedResponse<TransactionResponse> result =
            transactionService.getFilteredPaged(user, null, null, null, 0, 10, "date", "desc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getPage()).isEqualTo(0);
    }

    // ── TC-035: getFilteredPaged sorts by amount ──────────────────────────────
    @Test
    void TC035_getFilteredPaged_sortByAmount_usesAmountField() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction),
            PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "amount")), 1);

        when(transactionRepository.findFilteredPaged(eq(1L), isNull(), isNull(), isNull(), any()))
            .thenReturn(page);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        PagedResponse<TransactionResponse> result =
            transactionService.getFilteredPaged(user, null, null, null, 0, 10, "amount", "asc");

        assertThat(result.getContent()).hasSize(1);
    }

    // ── TC-036: getAllPlatform returns all transactions ────────────────────────
    @Test
    void TC036_getAllPlatform_returnsAllTransactions() {
        when(transactionRepository.findAll(any(Sort.class))).thenReturn(List.of(transaction));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        List<TransactionResponse> result = transactionService.getAllPlatform();

        assertThat(result).hasSize(1);
    }

    // ── TC-037: getAllForUser returns user's transactions ─────────────────────
    @Test
    void TC037_getAllForUser_returnsUserTransactions() {
        when(transactionRepository.findByUserIdOrderByDateDesc(1L))
            .thenReturn(List.of(transaction));

        List<Transaction> result = transactionService.getAllForUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1L);
    }

    // ── TC-038: create transaction maps categoryName in response ──────────────
    @Test
    void TC038_create_responseContainsCategoryName() {
        TransactionRequest req = new TransactionRequest();
        req.setCategoryId(5L); req.setAmount(20000L);
        req.setDescription("Dinner"); req.setDate(LocalDate.now());
        req.setType(TransactionType.EXPENSE);

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any())).thenReturn(transaction);
        lenient().when(budgetRepository.findByUserIdAndCategoryIdAndMonthYear(any(), any(), any()))
            .thenReturn(Optional.empty());

        TransactionResponse res = transactionService.create(user, req);

        assertThat(res.getCategoryName()).isEqualTo("Food");
    }

    // ── TC-039: getAllPlatformPaged returns paged response ────────────────────
    @Test
    void TC039_getAllPlatformPaged_returnsPagedResponse() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction),
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date")), 1);

        when(transactionRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));

        PagedResponse<TransactionResponse> result =
            transactionService.getAllPlatformPaged(0, 5, "date", "desc");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getSize()).isEqualTo(5);
    }

    // ── TC-040: budget alert fires when expense crosses 80% ───────────────────
    @Test
    void TC040_create_expenseOver80Percent_sendsBudgetAlert() throws InterruptedException {
        TransactionRequest req = new TransactionRequest();
        req.setCategoryId(5L); req.setAmount(85000L);
        req.setDescription("Big spend"); req.setDate(LocalDate.of(2026, 3, 15));
        req.setType(TransactionType.EXPENSE);

        Budget budget = Budget.builder().id(1L).userId(1L).categoryId(5L)
            .monthYear("2026-03").limitAmount(100000L).build();

        when(categoryRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any())).thenReturn(transaction);
        when(budgetRepository.findByUserIdAndCategoryIdAndMonthYear(1L, 5L, "2026-03"))
            .thenReturn(Optional.of(budget));
        List<Object[]> spentRows = new ArrayList<>();
        spentRows.add(new Object[]{5L, 85000L});
        when(transactionRepository.spentByCategoryInMonth(eq(1L), any(), any(), eq(TransactionType.EXPENSE)))
            .thenReturn(spentRows);

        transactionService.create(user, req);

        // Allow async to complete
        Thread.sleep(200);

        verify(webSocketNotificationService, atLeastOnce()).sendBudgetAlert(
            eq("u@test.com"), eq("Food"), anyDouble(), anyLong(), anyLong(), anyString());
    }
}
