import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { budgetApi } from '@/lib/api'
import { currentMonthYear, formatMoney, formatMonthYear } from '@/lib/utils'
import type { Budget } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

type AuditLog = {
  id: string
  timestamp: string
  action: string
  detail?: string
}

const STORAGE_KEY = 'budgets.audit.logs'
const BUDGET_CACHE_KEY = 'budgets.snapshot.current'

export default function Audit() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [fallbackBudgets, setFallbackBudgets] = useState<Budget[]>([])

  const { data: budgetData, isLoading, isError } = useQuery<Budget[], Error>({
    queryKey: ['auditBudgetFallback', currentMonthYear()],
    queryFn: async () => {
      const res = await budgetApi.getCurrent(currentMonthYear())
      const raw = res?.data?.data || []
      const list: Budget[] = Array.isArray(raw) ? raw : []
      return list.filter((b: Budget) => b.monthYear === currentMonthYear())
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  // Always try to use fresh data, fallback to cache
  const budgets: Budget[] = (budgetData && budgetData.length > 0) ? budgetData : fallbackBudgets

  // Load cache on mount
  useEffect(() => {
    try {
      const rawCache = localStorage.getItem(BUDGET_CACHE_KEY)
      if (rawCache) {
        const parsedCache = JSON.parse(rawCache) as Budget[]
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          setFallbackBudgets(parsedCache)
        }
      }
    } catch {
      setFallbackBudgets([])
    }
  }, [])

  // Persist fresh budget data to cache
  useEffect(() => {
    if (budgetData && budgetData.length > 0) {
      try {
        localStorage.setItem(BUDGET_CACHE_KEY, JSON.stringify(budgetData))
      } catch {
        // ignore
      }
    }
  }, [budgetData])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as AuditLog[]
      if (Array.isArray(parsed)) setLogs(parsed)
    } catch {
      setLogs([])
    }
  }, [])

  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    }
  }, [logs])

  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-[1000] uppercase tracking-tighter">Audit Logs</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            User: {user?.email || 'N/A'} | {formatMonthYear(currentMonthYear())}
          </p>
        </div>
        <button
          onClick={clearLogs}
          className="text-[11px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-700"
        >
          Clear Logs
        </button>
      </div>

      {/* Audit Logs Section */}
      <div>
        <h2 className="text-lg font-[1000] uppercase tracking-widest text-black mb-3">Action History</h2>
        {logs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <p className="text-slate-500 uppercase tracking-widest text-sm">No audit entries found.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {logs.map(entry => (
              <li key={entry.id} className="bg-white border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">{entry.action}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{entry.timestamp}</p>
                </div>
                {entry.detail && <p className="mt-2 text-sm text-slate-700">{entry.detail}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Budget Snapshot Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-[1000] uppercase tracking-widest text-black">Budget Snapshot (Current Month)</h2>
          {isError && <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded font-black uppercase">Using Cached Data</span>}
        </div>
        
        {isLoading ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex justify-center">
            <p className="text-slate-600 text-sm">Loading budget data...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <p className="text-slate-500 uppercase tracking-widest text-sm">No budgets configured for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => (
              <div key={b.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">{b.categoryName || 'Uncategorized'}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-800"><span className="font-bold">Limit:</span> {formatMoney(b.limitAmount)}</p>
                  <p className="text-slate-600"><span className="font-bold">Spent:</span> {formatMoney(b.spent)}</p>
                  <p className="text-slate-600"><span className="font-bold">Remaining:</span> {formatMoney(b.remaining)}</p>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-widest font-bold">Usage: {b.usagePercent}%</p>
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${b.usagePercent > 100 ? 'bg-red-500' : b.usagePercent >= 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(b.usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

