import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Loader2, ArrowUpCircle, ArrowDownCircle,
  Filter, Upload, Download, Search, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { transactionApi, categoryApi, csvApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toaster'
import type { Transaction, Category } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const schema = z.object({
  categoryId: z.coerce.number().min(1, 'Select category'),
  amount: z.coerce.number().min(0.01, 'Amount required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date required'),
  type: z.enum(['INCOME', 'EXPENSE']),
})
type FormData = z.infer<typeof schema>
type SortField = 'date' | 'amount' | 'type' | 'categoryName'

export default function Transactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const { show } = useToast()

  const [showModal, setShowModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterCat, setFilterCat] = useState<number | undefined>()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(0)
  const [sortBy, setSortBy] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [saveError, setSaveError] = useState('')

  const PAGE_SIZE = 10

  // Sync search from URL param (navbar search)
  useEffect(() => {
    const s = searchParams.get('search') || ''
    setSearch(s)
    setPage(0)
  }, [searchParams])

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
    setPage(0)
  }

  // Always fetch ALL transactions — filter client-side to avoid backend date issues
  const { data: allTxRes, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll({}),
  })

  const { data: catRes, refetch: refetchCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const categories: Category[] = catRes?.data?.data || []
  const allTransactions: Transaction[] = allTxRes?.data?.data || []

  // Normalize date to YYYY-MM-DD string regardless of how backend returns it
  const toIso = (d: unknown): string => {
    if (!d) return ''
    if (Array.isArray(d)) {
      // Jackson array format [2026, 3, 15]
      const [y, m, day] = d as number[]
      return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    // Already a string like "2026-03-15"
    return String(d).slice(0, 10)
  }

  // Client-side filtering
  const filtered: Transaction[] = allTransactions.filter(tx => {
    const txDate = toIso(tx.date)
    if (startDate && txDate < startDate) return false
    if (endDate && txDate > endDate) return false
    if (filterCat && tx.categoryId !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !tx.description?.toLowerCase().includes(q) &&
        !tx.categoryName?.toLowerCase().includes(q) &&
        !tx.type?.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  // Client-side sorting
  const sorted: Transaction[] = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') cmp = a.date.localeCompare(b.date)
    else if (sortBy === 'amount') cmp = a.amount - b.amount
    else if (sortBy === 'type') cmp = a.type.localeCompare(b.type)
    else if (sortBy === 'categoryName') cmp = (a.categoryName || '').localeCompare(b.categoryName || '')
    return sortDir === 'asc' ? cmp : -cmp
  })

  // Client-side pagination
  const totalElements = sorted.length
  const totalPages = Math.ceil(totalElements / PAGE_SIZE)
  const transactions: Transaction[] = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalIncome = allTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = allTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  })
  const selectedType = watch('type')

  const handleExport = async () => {
    try {
      const res = await csvApi.export()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `ledger_export_${Date.now()}.csv`; a.click()
      show('Exported successfully')
    } catch { show('Export failed', 'error') }
  }

  const handleExportPdf = async () => {
    try {
      const res = await csvApi.exportPdf()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = 'transactions.pdf'; a.click()
      URL.revokeObjectURL(url)
      show('PDF exported successfully')
    } catch { show('PDF export failed', 'error') }
  }

  const createMutation = useMutation({
    mutationFn: (data: FormData) => transactionApi.create({
      ...data,
      description: data.description ?? '',
      amount: Math.round(data.amount * 100),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
      qc.invalidateQueries({ queryKey: ['dashboard-monthly'] })
      qc.invalidateQueries({ queryKey: ['dashboard-categories'] })
      qc.invalidateQueries({ queryKey: ['transactions-recent'] })
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setShowModal(false)
      reset()
      show('Transaction saved successfully')
    },
    onError: (e: any) => setSaveError(e.response?.data?.message || 'Write error'),
  })

  const handleCreate = (data: FormData) => {
    if (data.type === 'EXPENSE' && totalExpenses + Math.round(data.amount * 100) > totalIncome) {
      show('Insufficient balance for this operation', 'error')
      return
    }
    createMutation.mutate(data)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronUp size={10} className="text-slate-200" />
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-orange-500" />
      : <ChevronDown size={10} className="text-orange-500" />
  }

  const SORT_COLS: { key: SortField; label: string }[] = [
    { key: 'date', label: 'Timestamp' },
    { key: 'type', label: 'Classification' },
    { key: 'categoryName', label: 'Cluster' },
    { key: 'amount', label: 'Capital Flow' },
  ]

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
            Financial <span className="text-orange-500">Trasactions</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            {totalElements} Active Records &bull; Protocol SEC-206
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isAdmin && (
            <>
              <button onClick={() => navigate('/import')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
                <Upload size={14} /> Import
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
                <Download size={14} /> Export
              </button>
              <button onClick={handleExportPdf}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
                <Download size={14} /> Export PDF
              </button>
              <button onClick={() => { setShowModal(true); refetchCats() }}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95">
                <Plus size={16} /> Add Entry
              </button>
            </>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Filter size={14} className="text-orange-500" />
          <span className="text-[10px] font-[1000] uppercase tracking-widest text-slate-400">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(0) }}
            className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" />
          <span className="text-slate-300 font-black">/</span>
          <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(0) }}
            className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" />
        </div>
        <select value={filterCat || ''} onChange={e => { setFilterCat(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
          className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all min-w-[180px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus-within:border-orange-500 focus-within:bg-white transition-all">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search..."
            className="bg-transparent outline-none text-[11px] font-bold uppercase w-36 placeholder:text-slate-300"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(0); navigate('/transactions') }}>
              <X size={12} className="text-slate-400 hover:text-red-500" />
            </button>
          )}
        </div>
        {(startDate || endDate || filterCat || search) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setFilterCat(undefined); setSearch(''); setPage(0); navigate('/transactions') }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline px-4">
            Reset
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 size={30} className="animate-spin text-orange-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-[12px] font-[1000] text-black uppercase tracking-widest">No Records Found</p>
            <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-tighter">The vault is currently empty.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {SORT_COLS.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)}
                        className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-orange-500 transition-colors select-none">
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon field={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx, i) => (
                    <motion.tr key={tx.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className="group hover:bg-slate-50/80 transition-all">
                      <td className="px-8 py-6 text-[11px] font-bold text-slate-500 uppercase">{formatDate(tx.date)}</td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm',
                          tx.type === 'INCOME' ? 'bg-orange-500 text-white' : 'bg-black text-white'
                        )}>
                          {tx.type === 'INCOME' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                          {tx.type}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase border border-slate-100 px-3 py-1 rounded-lg bg-white group-hover:bg-slate-100 transition-colors">
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className={cn(
                        'px-8 py-6 text-right font-mono font-[1000] text-base',
                        tx.type === 'INCOME' ? 'text-orange-500' : 'text-black'
                      )}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, user?.currency)}
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[13px] font-black text-black uppercase tracking-tight truncate max-w-[200px]">
                          {tx.description || 'System Automated'}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {page + 1} of {totalPages} &bull; {totalElements} records
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:border-orange-500 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startIdx = Math.max(0, Math.min(page - 2, totalPages - 5))
                    const p = startIdx + i
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={cn(
                          'w-8 h-8 rounded-xl text-[10px] font-black transition-all',
                          p === page ? 'bg-black text-white' : 'bg-slate-50 border border-slate-100 text-slate-400 hover:border-orange-500'
                        )}>
                        {p + 1}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:border-orange-500 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="bg-black p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-[1000] text-white uppercase tracking-tighter">
                    Initialize <span className="text-orange-500">Entry</span>
                  </h2>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">Transaction Node Setup</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(handleCreate)} className="p-8 space-y-6 bg-white">
                {saveError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase">
                    {saveError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {(['INCOME', 'EXPENSE'] as const).map(t => (
                    <label key={t} className="cursor-pointer group">
                      <input {...register('type')} type="radio" value={t} className="sr-only" />
                      <div className={cn(
                        'p-4 rounded-2xl border-2 text-center text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                        selectedType === t
                          ? (t === 'INCOME' ? 'border-orange-500 bg-orange-500 text-white' : 'border-black bg-black text-white')
                          : 'border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200'
                      )}>
                        {t} Protocol
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cluster</label>
                    <select {...register('categoryId')}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-[10px] text-red-500 font-bold">{errors.categoryId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ({user?.currency})</label>
                    <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                    {errors.amount && <p className="text-[10px] text-red-500 font-bold">{errors.amount.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</label>
                  <input {...register('date')} type="date"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memo</label>
                  <input {...register('description')} type="text" placeholder="Entry Details..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>
                <button type="submit" disabled={isSubmitting || createMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  {(isSubmitting || createMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  Finalize Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
