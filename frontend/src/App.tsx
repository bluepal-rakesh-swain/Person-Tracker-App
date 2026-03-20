import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { ToastProvider } from '@/components/Toaster'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import VerifyEmail from '@/pages/VerifyEmail'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Categories from '@/pages/Categories'
import Budgets from '@/pages/Budgets'
import ImportCsv from '@/pages/ImportCsv'
import Export from '@/pages/Export'
import AdminPanel from '@/pages/AdminPanel'
import RecurringTransactions from '@/pages/RecurringTransactions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                 // always refetch on mount
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep cache for persister
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// Persist cache to localStorage so data shows instantly on page refresh
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'finance-tracker-cache',
  throttleTime: 1000,
})

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return <>{children}</>
}

function RoleRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: '2',                  // bump this string to invalidate old cache
      }}
    >
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<AdminGuard><Dashboard /></AdminGuard>} />
                <Route path="/transactions" element={<AdminGuard><Transactions /></AdminGuard>} />
                <Route path="/categories" element={<AdminGuard><Categories /></AdminGuard>} />
                <Route path="/budgets" element={<AdminGuard><Budgets /></AdminGuard>} />
                <Route path="/import" element={<AdminGuard><ImportCsv /></AdminGuard>} />
                <Route path="/export" element={<AdminGuard><Export /></AdminGuard>} />
                <Route path="/recurring" element={<AdminGuard><RecurringTransactions /></AdminGuard>} />
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>

            {/* Fallback — send admin to /admin, users to /dashboard */}
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  )
}
