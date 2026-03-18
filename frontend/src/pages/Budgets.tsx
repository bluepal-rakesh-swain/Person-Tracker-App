

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Target, Loader2, AlertTriangle, ChevronLeft, ChevronRight, Activity, Download } from 'lucide-react'
import { budgetApi, categoryApi } from '@/lib/api'
import { formatMoney, currentMonthYear, formatMonthYear } from '@/lib/utils'
import type { Budget, Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toaster'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** ── Utility for merging tailwind classes ── */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

  return (
    <motion.div layout
      className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group transition-all hover:shadow-2xl hover:border-orange-500/20"
    >
      {/* ── Progress Bar Background Glow ── */}
      {isOver && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-black/5"
            style={{ background: budget.categoryColor || '#f97316' }}>
            {budget.categoryName.charAt(0)}
          </div>
          <div>
            <h3 className="font-[1000] text-lg text-black uppercase tracking-tighter leading-tight">{budget.categoryName}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Classification Node</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-[1000] uppercase tracking-tighter",
          isOver ? "bg-red-500 text-white" : isNear ? "bg-orange-500 text-white" : "bg-black text-white"
        )}>
          {pct.toFixed(0)}% Used
        </div>
      </div>

      <div className="space-y-2 mt-8 relative z-10">
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "h-full rounded-full transition-colors",
              isOver ? "bg-red-500" : isNear ? "bg-orange-500" : "bg-black"
            )}
          />
        </div>
        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
          <span>0%</span>
          <span>Budget Capacity</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-50 relative z-10">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Threshold</p>
          <p className="text-sm font-[1000] text-black font-mono tracking-tighter">{formatMoney(budget.limitAmount, currency)}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isOver ? 'Deficit' : 'Available'}</p>
          <p className={cn(
            "text-sm font-[1000] font-mono tracking-tighter",
            isOver ? "text-red-500" : "text-orange-500"
          )}>
            {formatMoney(Math.abs(budget.remaining), currency)}
          </p>
        </div>
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

  const handleExportCsv = async () => {
    try {
      const res = await budgetApi.exportCsv()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'budgets.csv'
      a.click()
      URL.revokeObjectURL(url)
      show('Budgets exported as CSV')
    } catch {
      show('CSV export failed', 'error')
    }
  }

  const handleExportPdf = async () => {
    try {
      const res = await budgetApi.exportPdf()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'budgets.pdf'
      a.click()
      URL.revokeObjectURL(url)
      show('Budgets exported as PDF')
    } catch {
      show('PDF export failed', 'error')
    }
  }

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
      show('Budget parameters updated')
    },
  })

  const totalBudget = budgets.reduce((s, b) => s + b.limitAmount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter(b => b.usagePercent > 100).length

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
            Spending <span className="text-orange-500">Limits</span>
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-100 transition-all">
              <ChevronLeft size={18} />
            </button>
            <span className="text-[11px] font-black text-black uppercase tracking-[0.3em] min-w-[140px] text-center">
              {formatMonthYear(selectedMonth)}
            </span>
            <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-100 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleExportCsv}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={handleExportPdf}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => { reset({ monthYear: selectedMonth }); setShowModal(true) }}
              className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center gap-3">
              <Plus size={16} /> New Parameter
            </button>
          </div>
        )}
      </div>

      {/* ── SUMMARY DASHBOARD ── */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Cumulative Limit', value: formatMoney(totalBudget, currency), icon: <Target size={14}/>, color: 'text-black' },
            { label: 'Utilized Capital', value: formatMoney(totalSpent, currency), icon: <Activity size={14}/>, color: 'text-orange-500' },
            { label: 'Integrity Alerts', value: `${overBudget} Violations`, icon: <AlertTriangle size={14}/>, color: overBudget > 0 ? 'text-red-500' : 'text-emerald-500' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                 <div className="text-slate-300">{icon}</div>
              </div>
              <p className={cn("text-2xl font-[1000] font-mono tracking-tighter uppercase", color)}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-[2.5rem] bg-slate-50 animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-slate-50 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center border border-dashed border-slate-200">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
            <Target size={32} className="text-orange-500" />
          </div>
          <h3 className="text-xl font-[1000] text-black uppercase tracking-tighter mb-2">No Thresholds Configured</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed mb-8">
            Deploy budget protocols to monitor resource depletion across clusters.
          </p>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)}
              className="bg-black text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
              Initialize Protocols
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(b => <BudgetCard key={b.id} budget={b} currency={currency} />)}
        </div>
      )}

      {/* ── MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
              
              <div className="bg-black p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-[1000] text-white uppercase tracking-tighter">
                    Set <span className="text-orange-500">Threshold</span>
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Resource allocation protocol</p>
              </div>

              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Classification Cluster</label>
                  <select {...register('categoryId')}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none">
                    <option value="">Select target cluster</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-[10px] text-red-500 font-bold">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Temporal Window</label>
                  <input type="month" {...register('monthYear')}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Limit Amount ({currency})</label>
                  <input type="number" step="0.01" {...register('limitAmount')} placeholder="0.00"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                  {errors.limitAmount && <p className="text-[10px] text-red-500 font-bold">{errors.limitAmount.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting || saveMutation.isPending}
                  className="w-full py-5 rounded-2xl bg-black text-white font-[1000] text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  {(isSubmitting || saveMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  Deploy Protocol
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
