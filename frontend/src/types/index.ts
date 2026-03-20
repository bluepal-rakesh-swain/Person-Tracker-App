export interface User {
  id: number
  email: string
  fullName: string
  currency: string
  role: 'USER' | 'ADMIN'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface Category {
  id: number
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
}

export interface Transaction {
  id: number
  categoryId: number
  categoryName: string
  amount: number   // BIGINT paise/cents
  description: string
  date: string     // YYYY-MM-DD
  type: 'INCOME' | 'EXPENSE'
}

export interface Budget {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string
  monthYear: string
  limitAmount: number
  spent: number
  remaining: number
  usagePercent: number
}

export interface DashboardSummary {
  monthYear: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export interface MonthlyChartData {
  month: string
  income: number
  expense: number
}

export interface CategoryChartData {
  categoryId: number
  categoryName: string
  color: string
  type: 'INCOME' | 'EXPENSE'
  total: number
}

export interface YearlySummaryData {
  month: string
  income: number
  expense: number
  net: number
}

export interface ImportResult {
  status: string
  imported: number
  skipped: number
}

export interface RecurringTransaction {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  startDate: string
  endDate: string | null
  nextRunDate: string
  active: boolean
}

export interface CsvColumnMapping {
  date: string
  desc: string
  amount?: string
  debit?: string
  credit?: string
  dateFormat: string
  defaultCategoryId: number
}
