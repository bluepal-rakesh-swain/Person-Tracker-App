import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { budgetApi, categoryApi } from '@/lib/api'
import { formatMoney, currentMonthYear, formatMonthYear } from '@/lib/utils'
import type { Budget, Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toaster'

const schema = z.object({
  categoryId: z.coerce.number().min(1, 'Select a category'),
  monthYear: z.string().min(1),
  limitAmount: z.coerce.number().min(1, 'Amount must be > 0'),
})
type FormData = z.infer<typeof schema>

function BudgetCard({ budget, currency }: { budget: Budget; currency: string }) {
  const pct = Math.min(budget.usagePercent, 100)
  const isOver = budget.usagePercent > 100
  const isNear = budget.usagePercent >= 80 && !isOver

  const barColor = isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
  const textColor = isOver ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-emerald-500'

  return (
    <motion.div layout
      className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ background: budget.categoryColor || '#10b981' }}>
            {budget.categoryName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-[14px] text-gray-900 dark:text-white">{budget.categoryName}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{formatMonthYear(budget.monthYear)}</p>
          </div>
        </div>
        {(isOver || isNear) && (
          <AlertTriangle size={15} className={isOver ? 'text-red-500' : 'text-amber-500'} />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[12px]">
          <span className="text-gray-400">Spent</span>
          <span className={`font-bold ${textColor}`}>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Spent',  value: formatMoney(budget.spent, currency),       color: 'text-gray-900 dark:text-white' },
          { label: 'Budget', value: formatMoney(budget.limitAmount, currency),  color: 'text-gray-900 dark:text-white' },
          { label: isOver ? 'Over' : 'Left', value: formatMoney(Math.abs(budget.remaining), currency), color: isOver ? 'text-red-500' : 'text-emerald-500' },
        ].map(({ label, value, color }, i) => (
          <div key={label} className={`text-center ${i === 1 ? 'border-x border-gray-100 dark:border-gray-800' : ''}`}>
            <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
            <p className={`text-[13px] font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Budgets() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const { show } = useToast()
  const currency = user?.currency || 'INR'
  const isAdmin = user?.role === 'ADMIN'
  const [showModal, setShowModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYear())

  const prevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const { data: budgetRes, isLoading } = useQuery({
    queryKey: ['budgets', selectedMonth],
    queryFn: () => budgetApi.getCurrent(selectedMonth),
    staleTime: 0, gcTime: 0, refetchOnMount: 'always',
  })
  const budgets: Budget[] = (budgetRes?.data?.data || []).filter((b: Budget) => b.monthYear === selectedMonth)

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })
  const categories: Category[] = (catRes?.data?.data || []).filter((c: Category) => c.type === 'EXPENSE')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { monthYear: selectedMonth },
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => budgetApi.upsert({ ...data, limitAmount: data.limitAmount * 100 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setShowModal(false)
      reset({ monthYear: selectedMonth })
      show('Budget saved successfully')
    },
  })

  const totalBudget = budgets.reduce((s, b) => s + b.limitAmount, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget  = budgets.filter(b => b.usagePercent > 100).length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">Budgets</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold min-w-[110px] text-center">
              {formatMonthYear(selectedMonth)}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
        {!isAdmin && (
          <button onClick={() => { reset({ monthYear: selectedMonth }); setShowModal(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-[13px] font-semibold shadow-md shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition-all">
            <Plus size={15} /> Set Budget
          </button>
        )}
      </div>

      {/* ── Summary strip ── */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budget', value: formatMoney(totalBudget, currency), color: 'text-gray-900 dark:text-white' },
            { label: 'Total Spent',  value: formatMoney(totalSpent, currency),  color: 'text-rose-500' },
            { label: 'Over Budget',  value: `${overBudget} categories`,         color: overBudget > 0 ? 'text-red-500' : 'text-emerald-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 text-center">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
              <p className={`text-[15px] font-bold font-mono ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Budget cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
            <Target size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
            No budgets for {formatMonthYear(selectedMonth)}
          </h3>
          <p className="text-[13px] text-gray-400 mb-6 max-w-xs leading-relaxed">
            {selectedMonth === currentMonthYear()
              ? 'Set monthly spending limits per category to stay on track.'
              : 'No budgets were set for this month.'}
          </p>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl gradient-brand text-white text-[13px] font-semibold shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all">
              Set your first budget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => <BudgetCard key={b.id} budget={b} currency={currency} />)}
        </div>
      )}

      {/* ── Modal ── */}
      {!isAdmin && (
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Set Budget</h2>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={17} /></button>
                </div>
                <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="px-6 py-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                    <select {...register('categoryId')}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-[12px] text-red-500">{errors.categoryId.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</label>
                    <input type="month" {...register('monthYear')}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Limit Amount ({currency})</label>
                    <input type="number" step="0.01" min="0" {...register('limitAmount')} placeholder="e.g. 5000"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    {errors.limitAmount && <p className="text-[12px] text-red-500">{errors.limitAmount.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting || saveMutation.isPending}
                    className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-[13px] shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                    {(isSubmitting || saveMutation.isPending) && <Loader2 size={15} className="animate-spin" />}
                    Save Budget
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
