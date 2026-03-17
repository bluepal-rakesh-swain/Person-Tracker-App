import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader2, ArrowUpCircle, ArrowDownCircle, Filter, Upload, Download } from 'lucide-react'
import { transactionApi, categoryApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'
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
  const [showModal, setShowModal] = useState(false)
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

  // Client-side filtering
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

  const createMutation = useMutation({
    mutationFn: (data: FormData) => transactionApi.create({
      ...data,
      description: data.description ?? '',
      amount: Math.round(data.amount * 100), // convert to paise
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
    },
    onError: (e: any) => {
      setSaveError(e.response?.data?.message || 'Failed to save transaction')
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{transactions.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <>
              <button onClick={() => navigate('/import')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Upload size={15} /> Import CSV
              </button>
              <button onClick={() => navigate('/export')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download size={15} /> Export
              </button>
            </>
          )}
          <button onClick={() => { setShowModal(true); refetchCats() }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all"
            style={{ display: isAdmin ? 'none' : undefined }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base p-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-gray-400" />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <span className="text-gray-400 text-sm">to</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {(startDate || endDate || filterCat) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setFilterCat(undefined) }}
            className="text-xs text-red-500 hover:underline">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowLeftRight size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Date','Type','Category','Description','Amount'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      {tx.type === 'INCOME'
                        ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><ArrowUpCircle size={14} />Income</span>
                        : <span className="inline-flex items-center gap-1 text-red-500 font-medium"><ArrowDownCircle size={14} />Expense</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {tx.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{tx.description || '—'}</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, user?.currency)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setSaveError('') }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative card-base p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Transaction</h2>
                <button onClick={() => { setShowModal(false); setSaveError('') }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
                {saveError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {saveError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {(['INCOME','EXPENSE'] as const).map(t => (
                    <label key={t} className="cursor-pointer">
                      <input {...register('type')} type="radio" value={t} className="sr-only" />
                      <div className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all
                        ${selectedType === t
                          ? t === 'INCOME'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-500'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {t}
                      </div>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select {...register('categoryId')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {catError && <p className="mt-1 text-xs text-red-500">Failed to load categories — <button type="button" className="underline" onClick={() => refetchCats()}>retry</button></p>}
                  {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (₹)</label>
                  <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                  <input {...register('date')} type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <input {...register('description')} type="text" placeholder="Optional note"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <button type="submit" disabled={isSubmitting || createMutation.isPending}
                  className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {(isSubmitting || createMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
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
