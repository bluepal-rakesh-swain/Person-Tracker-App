import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader2, ArrowUpCircle, ArrowDownCircle, Filter, Upload, Download } from 'lucide-react'
import { transactionApi, categoryApi, csvApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toaster'
import type { Transaction, Category } from '@/types'

const schema = z.object({
  categoryId: z.coerce.number().min(1, 'Select category'),
  amount: z.coerce.number().min(1, 'Amount required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date required'),
  type: z.enum(['INCOME', 'EXPENSE']),
})
type FormData = z.infer<typeof schema>

export default function Transactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { show } = useToast()
  const [showModal, setShowModal] = useState(false)

  const handleExport = async () => {
    try {
      const res = await csvApi.export()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.csv'
      a.click()
      URL.revokeObjectURL(url)
      show('Transactions exported successfully')
    } catch {
      show('Export failed', 'error')
    }
  }

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterCat, setFilterCat] = useState<number | undefined>()

  const { data: txRes, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll({}),
    staleTime: 0,
  })

  const { data: catRes, isError: catError, refetch: refetchCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
    staleTime: 0,
    retry: 2,
  })

  const allTransactions: Transaction[] = txRes?.data?.data || []
  const categories: Category[] = catRes?.data?.data || []

  const transactions = allTransactions.filter(tx => {
    if (startDate && tx.date < startDate) return false
    if (endDate && tx.date > endDate) return false
    if (filterCat && tx.categoryId !== filterCat) return false
    return true
  })

  const [saveError, setSaveError] = useState('')
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  })
  const selectedType = watch('type')

  const totalIncome   = allTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = allTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  const handleCreate = (data: FormData) => {
    if (data.type === 'EXPENSE') {
      const newExpenseAmount = Math.round(data.amount * 100)
      if (totalExpenses + newExpenseAmount > totalIncome) {
        show('Expense exceeds your total income. Transaction not allowed.', 'error')
        return
      }
    }
    createMutation.mutate(data)
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
      setShowModal(false)
      setSaveError('')
      reset()
      show('Transaction saved successfully')
    },
    onError: (e: any) => {
      setSaveError(e.response?.data?.message || 'Failed to save transaction')
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">{transactions.length} records found</p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {!isAdmin && (
            <>
              <button onClick={() => navigate('/import')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm">
                <Upload size={14} /> Import CSV
              </button>
              <button onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm">
                <Download size={14} /> Export
              </button>
            </>
          )}
          {!isAdmin && (
            <button onClick={() => { setShowModal(true); refetchCats() }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-[13px] font-semibold shadow-md shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition-all">
              <Plus size={15} /> Add
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={15} />
          <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">Filter</span>
        </div>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
        <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {(startDate || endDate || filterCat) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setFilterCat(undefined) }}
            className="text-[12px] font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center">
            <ArrowLeftRight size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-[14px] font-semibold text-gray-500 dark:text-gray-400">No transactions yet</p>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-gray-800/40">
                  {['Date','Type','Category','Description','Amount'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {transactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-150">
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-5 py-4">
                      {tx.type === 'INCOME'
                        ? <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[12.5px]"><ArrowUpCircle size={14} />Income</span>
                        : <span className="inline-flex items-center gap-1.5 text-rose-500 font-semibold text-[12.5px]"><ArrowDownCircle size={14} />Expense</span>
                      }
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {tx.categoryName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{tx.description || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                    <td className={`px-5 py-4 font-mono font-bold ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, user?.currency)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setSaveError('') }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Add Transaction</h2>
                <button onClick={() => { setShowModal(false); setSaveError('') }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreate)} className="px-6 py-5 space-y-4">
                {saveError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">
                    {saveError}
                  </div>
                )}

                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-3">
                  {(['INCOME','EXPENSE'] as const).map(t => (
                    <label key={t} className="cursor-pointer">
                      <input {...register('type')} type="radio" value={t} className="sr-only" />
                      <div className={`p-3 rounded-xl border-2 text-center text-[13px] font-semibold transition-all
                        ${selectedType === t
                          ? t === 'INCOME'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}>
                        {t}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                  <select {...register('categoryId')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {catError && <p className="text-[12px] text-red-500">Failed to load — <button type="button" className="underline" onClick={() => refetchCats()}>retry</button></p>}
                  {errors.categoryId && <p className="text-[12px] text-red-500">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount ({user?.currency})</label>
                  <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                  {errors.amount && <p className="text-[12px] text-red-500">{errors.amount.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
                  <input {...register('date')} type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                  <input {...register('description')} type="text" placeholder="Optional note"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>

                <button type="submit" disabled={isSubmitting || createMutation.isPending}
                  className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-[13px] shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                  {(isSubmitting || createMutation.isPending) && <Loader2 size={15} className="animate-spin" />}
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ArrowLeftRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
    </svg>
  )
}
