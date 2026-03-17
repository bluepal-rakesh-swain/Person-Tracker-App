import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'
import { setAuthUpdater } from '@/lib/api'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  )

  const login = useCallback((token: string, refresh: string, userData: User) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setAccessToken(token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    // Also clear the persisted React Query cache
    localStorage.removeItem('finance-tracker-cache')
    setAccessToken(null)
    setUser(null)
  }, [])

  // Called by api.ts interceptor after a silent token refresh
  const updateTokens = useCallback((newAccess: string, newRefresh: string) => {
    localStorage.setItem('accessToken', newAccess)
    localStorage.setItem('refreshToken', newRefresh)
    setAccessToken(newAccess)
  }, [])

  // Register the updater synchronously on every render so it's never null
  // when the axios interceptor fires (avoids the useEffect timing gap on refresh)
  setAuthUpdater(updateTokens)

  // Sync state if another tab logs out or refreshes tokens
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        setAccessToken(e.newValue)
        if (!e.newValue) setUser(null)
      }
      if (e.key === 'user' && e.newValue) {
        try { setUser(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!accessToken, login, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
