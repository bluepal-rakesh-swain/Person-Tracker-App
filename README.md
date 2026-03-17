# Personal Finance Tracker — Backend

Spring Boot 3 + Spring Security 6 + JWT + Spring Batch + PostgreSQL

---

## Quick Start (Docker Compose)

```bash
# Clone and start everything with one command
docker-compose up --build
```

The API will be available at `http://localhost:8080`.

---

## Environment Variables

| Variable       | Default     | Description                        |
|----------------|-------------|------------------------------------|
| `DB_HOST`      | `localhost` | PostgreSQL host                    |
| `DB_PORT`      | `5432`      | PostgreSQL port                    |
| `DB_NAME`      | `financedb` | Database name                      |
| `DB_USER`      | `postgres`  | Database username                  |
| `DB_PASSWORD`  | `postgres`  | Database password                  |
| `JWT_SECRET`   | (see yml)   | Base64-encoded HMAC secret (≥256b) |

Set them in a `.env` file next to `docker-compose.yml`:

```env
JWT_SECRET=your_super_secret_base64_key_here
DB_PASSWORD=strongpassword
```

---

## BIGINT Money Storage

All monetary values are stored as **BIGINT** representing **paise (INR) or cents (USD)**.

| Display | Stored |
|---------|--------|
| ₹500    | 50000  |
| ₹10.50  | 1050   |
| $100    | 10000  |

**Never** use Float, Double, or BigDecimal in entity classes.

---

## RBAC Roles

| Role    | Access                                      |
|---------|---------------------------------------------|
| `USER`  | Own transactions, categories, budgets, CSV  |
| `ADMIN` | Everything + `/api/admin/users`             |

Default admin: `admin@financetracker.com` / `admin123`

---

## Postman Testing Guide

### Setup
Create a Collection variable: `baseUrl = http://localhost:8080`

---

### 1. Register
```
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123",
  "fullName": "Jane Doe",
  "currency": "INR"
}
```
→ Copy `data.accessToken` into a `token` variable.

---

### 2. Login
```
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{ "email": "jane@example.com", "password": "secret123" }
```

---

### 3. Refresh Token
```
POST {{baseUrl}}/api/auth/refresh
Content-Type: application/json

{ "refreshToken": "<your-refresh-token>" }
```
Old refresh token is revoked. Always use the latest one.

---

### 4. Create Category
```
POST {{baseUrl}}/api/categories
Authorization: Bearer {{token}}

{ "name": "Salary", "type": "INCOME", "color": "#22c55e", "icon": "briefcase" }
```

---

### 5. Create Transaction (amount in paise — ₹500 = 50000)
```
POST {{baseUrl}}/api/transactions
Authorization: Bearer {{token}}

{
  "categoryId": "<category-uuid>",
  "amount": 5000000,
  "description": "March Salary",
  "date": "2026-03-01",
  "type": "INCOME"
}
```

---

### 6. Get Transactions (with filters)
```
GET {{baseUrl}}/api/transactions?start=2026-03-01&end=2026-03-31&categoryId=<uuid>
Authorization: Bearer {{token}}
```

---

### 7. Set Budget
```
POST {{baseUrl}}/api/budgets
Authorization: Bearer {{token}}

{ "categoryId": "<uuid>", "monthYear": "2026-03", "limitAmount": 1000000 }
```
Calling again for same category+month performs an upsert.

---

### 8. Get Current Budgets with Usage
```
GET {{baseUrl}}/api/budgets/current
Authorization: Bearer {{token}}
```

---

### 9. Dashboard Summary
```
GET {{baseUrl}}/api/dashboard/summary
Authorization: Bearer {{token}}
```

---

### 10. Monthly Bar Chart
```
GET {{baseUrl}}/api/dashboard/chart/monthly?year=2026
Authorization: Bearer {{token}}
```

---

### 11. Category Pie Chart
```
GET {{baseUrl}}/api/dashboard/chart/categories?monthYear=2026-03
Authorization: Bearer {{token}}
```

---

### 12. Monthly Summary
```
GET {{baseUrl}}/api/summary/monthly?monthYear=2026-03
Authorization: Bearer {{token}}
```

---

### 13. Yearly Summary
```
GET {{baseUrl}}/api/summary/yearly?year=2026
Authorization: Bearer {{token}}
```

---

### 14. CSV Import

In Postman → Body → form-data:

| Key     | Type | Value                    |
|---------|------|--------------------------|
| file    | File | your .csv file           |
| mapping | Text | JSON mapping (see below) |

Bank format mapping:
```json
{
  "date": "Transaction Date",
  "debit": "Withdrawal",
  "credit": "Deposit",
  "desc": "Narration",
  "dateFormat": "dd/MM/yyyy",
  "defaultCategoryId": "<category-uuid>"
}
```

Simple format mapping:
```json
{
  "date": "Date",
  "amount": "Amount",
  "desc": "Description",
  "dateFormat": "yyyy-MM-dd",
  "defaultCategoryId": "<category-uuid>"
}
```

Sample CSV (bank format):
```
Transaction Date,Narration,Withdrawal,Deposit
01/03/2026,Grocery Store,1500.00,
02/03/2026,March Salary,,50000.00
05/03/2026,Electricity Bill,800.00,
```

---

### 15. CSV Export
```
GET {{baseUrl}}/api/export/csv
Authorization: Bearer {{token}}
```
In Postman → Send and Download → saves `transactions.csv`

---

## Database Schema Notes

Tables auto-created by Hibernate (`ddl-auto: update`):

- `users` — id (UUID), email, password, full_name, currency, role
- `categories` — id, user_id, name, type, color, icon
- `transactions` — id, user_id, category_id, amount (BIGINT), description, date, type
- `budgets` — id, user_id, category_id, month_year, limit_amount (BIGINT)
- `refresh_tokens` — id, user_id, token, expiry_date, revoked
- Spring Batch tables — auto-created by `spring.batch.jdbc.initialize-schema: always`

---

## Project Structure

```
src/main/java/com/financetracker/
├── PersonalFinanceTrackerApplication.java
├── batch/
│   ├── CsvImportJobConfig.java
│   ├── CsvRow.java
│   └── CsvRowProcessor.java
├── config/
│   └── DataInitializer.java
├── controller/
│   ├── AdminController.java
│   ├── AuthController.java
│   ├── BudgetController.java
│   ├── CategoryController.java
│   ├── CsvController.java
│   ├── DashboardController.java
│   └── TransactionController.java
├── dto/
│   ├── ApiResponse.java
│   ├── auth/  (RegisterRequest, LoginRequest, RefreshRequest, AuthResponse)
│   ├── budget/ (BudgetRequest, BudgetResponse)
│   ├── category/ (CategoryRequest, CategoryResponse)
│   ├── csv/ (CsvColumnMapping, ImportResult)
│   ├── dashboard/ (DashboardSummary, MonthlyChartData, CategoryChartData, YearlySummaryData)
│   └── transaction/ (TransactionRequest, TransactionResponse)
├── entity/
│   ├── Budget.java
│   ├── Category.java
│   ├── RefreshToken.java
│   ├── Role.java
│   ├── Transaction.java
│   ├── TransactionType.java
│   └── User.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── TokenException.java
├── repository/
│   ├── BudgetRepository.java
│   ├── CategoryRepository.java
│   ├── RefreshTokenRepository.java
│   ├── TransactionRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthFilter.java
│   ├── JwtService.java
│   └── SecurityConfig.java
└── service/
    ├── AuthService.java
    ├── BudgetService.java
    ├── CategoryService.java
    ├── CsvExportService.java
    ├── CsvImportService.java
    ├── DashboardService.java
    ├── RefreshTokenService.java
    └── TransactionService.java
```
