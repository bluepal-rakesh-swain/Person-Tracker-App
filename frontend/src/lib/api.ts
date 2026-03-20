import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401 — access token expired, use refresh token (valid 7 days)
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

// Weak ref to AuthContext updater — set by AuthProvider via setAuthUpdater()
let _updateTokens: ((access: string, refresh: string) => void) | null = null
export function setAuthUpdater(fn: (access: string, refresh: string) => void) {
  _updateTokens = fn
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Skip refresh loop for the refresh endpoint itself
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      // Check if token was already refreshed by a concurrent request —
      // compare what we sent vs what's now in localStorage
      const currentToken = localStorage.getItem('accessToken')
      const sentToken = (original.headers?.Authorization as string)?.replace('Bearer ', '')
      if (currentToken && sentToken && currentToken !== sentToken) {
        original.headers.Authorization = `Bearer ${currentToken}`
        return api(original)
      }

      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newAccess = data.data.accessToken
        const newRefresh = data.data.refreshToken

        localStorage.setItem('accessToken', newAccess)
        localStorage.setItem('refreshToken', newRefresh)
        _updateTokens?.(newAccess, newRefresh)

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; fullName: string; currency: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-email', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; type: string; color: string; icon: string }) =>
    api.post('/categories', data),
  update: (id: number, data: { name: string; type: string; color: string; icon: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  exportCsv: () => api.get('/categories/export/csv', { responseType: 'blob' }),
  exportPdf: () => api.get('/categories/export/pdf', { responseType: 'blob' }),
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionApi = {
  getAll: (params?: { start?: string; end?: string; categoryId?: number }) =>
    api.get('/transactions', { params }),
  getPaged: (params: { start?: string; end?: string; categoryId?: number; page?: number; size?: number; sortBy?: string; sortDir?: string }) =>
    api.get('/transactions/paged', { params }),
  create: (data: { categoryId: number; amount: number; description: string; date: string; type: string }) =>
    api.post('/transactions', data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getMonthlyChart: (year: number) => api.get('/dashboard/chart/monthly', { params: { year } }),
  getCategoryChart: (monthYear: string) => api.get('/dashboard/chart/categories', { params: { monthYear } }),
  getMonthlySummary: (monthYear?: string) => api.get('/summary/monthly', { params: monthYear ? { monthYear } : {} }),
  getYearlySummary: (year: number) => api.get('/summary/yearly', { params: { year } }),
}

// ── Budgets ───────────────────────────────────────────────────────────────────
export const budgetApi = {
  getCurrent: (monthYear?: string) => api.get('/budgets/current', { params: monthYear ? { monthYear } : {} }),
  upsert: (data: { categoryId: number; monthYear: string; limitAmount: number }) =>
    api.post('/budgets', data),
  exportCsv: () => api.get('/budgets/export/csv', { responseType: 'blob' }),
  exportPdf: () => api.get('/budgets/export/pdf', { responseType: 'blob' }),
  importCsv: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/budgets/import/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ── CSV ───────────────────────────────────────────────────────────────────────
export const csvApi = {
  import: (file: File, mapping: object) => {
    const form = new FormData()
    form.append('file', file)
    form.append('mapping', JSON.stringify(mapping))
    return api.post('/import/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  export: () => api.get('/export/csv', { responseType: 'blob' }),
  exportPdf: () => api.get('/export/pdf', { responseType: 'blob' }),
}

// ── Recurring Transactions ────────────────────────────────────────────────────
export const recurringApi = {
  getAll: () => api.get('/recurring'),
  create: (data: Record<string, unknown>) => api.post('/recurring', data),
  toggle: (id: number) => api.patch(`/recurring/${id}/toggle`),
  delete: (id: number) => api.delete(`/recurring/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  setEnabled: (id: number, enabled: boolean) => api.patch(`/admin/users/${id}/enabled`, { enabled }),
  changeRole: (id: number, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
  getImportLogs: () => api.get('/admin/imports'),
  exportUserCsv: (id: number) =>
    api.get(`/admin/users/${id}/export/csv`, { responseType: 'blob' }),
  importUserCsv: (id: number, file: File, mapping: object) => {
    const form = new FormData()
    form.append('file', file)
    form.append('mapping', JSON.stringify(mapping))
    return api.post(`/admin/users/${id}/import/csv`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  exportAllUsersCsv: () =>
    api.get('/admin/export/users/csv', { responseType: 'blob' }),
  exportAllUsersPdf: () =>
    api.get('/admin/export/users/pdf', { responseType: 'blob' }),
}
