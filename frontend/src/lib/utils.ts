import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert paise/cents (BIGINT) to display string */
export function formatMoney(amount: number, currency = 'INR'): string {
  const value = amount / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Format YYYY-MM to "March 2026" */
export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function currentMonthYear(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function currentYear(): number {
  return new Date().getFullYear()
}

export function formatDate(date: string): string {
  // Parse as local date to avoid UTC midnight shifting to previous day in IST
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
