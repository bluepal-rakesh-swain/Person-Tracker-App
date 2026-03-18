// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Plus, X, Target, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
// import { budgetApi, categoryApi } from '@/lib/api'
// import { formatMoney, currentMonthYear, formatMonthYear } from '@/lib/utils'
// import type { Budget, Category } from '@/types'
// import { useAuth } from '@/contexts/AuthContext'
// import { useToast } from '@/components/Toaster'

// const schema = z.object({
//   categoryId: z.coerce.number().min(1, 'Select a category'),
//   monthYear: z.string().min(1),
//   limitAmount: z.coerce.number().min(1, 'Amount must be > 0'),
// })
// type FormData = z.infer<typeof schema>

// function BudgetCard({ budget, currency }: { budget: Budget; currency: string }) {
//   const pct = Math.min(budget.usagePercent, 100)
//   const isOver = budget.usagePercent > 100
//   const isNear = budget.usagePercent >= 80 && !isOver

//   const barColor = isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
//   const textColor = isOver ? 'text-red-500' : isNear ? 'text-amber-500' : 'text-emerald-500'

//   return (
//     <motion.div layout
//       className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200"
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
//             style={{ background: budget.categoryColor || '#10b981' }}>
//             {budget.categoryName.charAt(0)}
//           </div>
//           <div>
//             <p className="font-semibold text-[14px] text-gray-900 dark:text-white">{budget.categoryName}</p>
//             <p className="text-[12px] text-gray-400 mt-0.5">{formatMonthYear(budget.monthYear)}</p>
//           </div>
//         </div>
//         {(isOver || isNear) && (
//           <AlertTriangle size={15} className={isOver ? 'text-red-500' : 'text-amber-500'} />
//         )}
//       </div>

//       <div className="space-y-1.5">
//         <div className="flex justify-between text-[12px]">
//           <span className="text-gray-400">Spent</span>
//           <span className={`font-bold ${textColor}`}>{pct.toFixed(0)}%</span>
//         </div>
//         <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${pct}%` }}
//             transition={{ duration: 0.8, ease: 'easeOut' }}
//             className={`h-full rounded-full ${barColor}`}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-2 pt-1">
//         {[
//           { label: 'Spent',  value: formatMoney(budget.spent, currency),       color: 'text-gray-900 dark:text-white' },
//           { label: 'Budget', value: formatMoney(budget.limitAmount, currency),  color: 'text-gray-900 dark:text-white' },
//           { label: isOver ? 'Over' : 'Left', value: formatMoney(Math.abs(budget.remaining), currency), color: isOver ? 'text-red-500' : 'text-emerald-500' },
//         ].map(({ label, value, color }, i) => (
//           <div key={label} className={`text-center ${i === 1 ? 'border-x border-gray-100 dark:border-gray-800' : ''}`}>
//             <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
//             <p className={`text-[13px] font-bold font-mono ${color}`}>{value}</p>
//           </div>
//         ))}
//       </div>
//     </motion.div>
//   )
// }

// export default function Budgets() {
//   const qc = useQueryClient()
//   const { user } = useAuth()
//   const { show } = useToast()
//   const currency = user?.currency || 'INR'
//   const isAdmin = user?.role === 'ADMIN'
//   const [showModal, setShowModal] = useState(false)
//   const [selectedMonth, setSelectedMonth] = useState(currentMonthYear())

//   const prevMonth = () => {
//     const [y, m] = selectedMonth.split('-').map(Number)
//     const d = new Date(y, m - 2, 1)
//     setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
//   }
//   const nextMonth = () => {
//     const [y, m] = selectedMonth.split('-').map(Number)
//     const d = new Date(y, m, 1)
//     setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
//   }

//   const { data: budgetRes, isLoading } = useQuery({
//     queryKey: ['budgets', selectedMonth],
//     queryFn: () => budgetApi.getCurrent(selectedMonth),
//     staleTime: 0, gcTime: 0, refetchOnMount: 'always',
//   })
//   const budgets: Budget[] = (budgetRes?.data?.data || []).filter((b: Budget) => b.monthYear === selectedMonth)

//   const { data: catRes } = useQuery({
//     queryKey: ['categories'],
//     queryFn: () => categoryApi.getAll(),
//   })
//   const categories: Category[] = (catRes?.data?.data || []).filter((c: Category) => c.type === 'EXPENSE')

//   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { monthYear: selectedMonth },
//   })

//   const saveMutation = useMutation({
//     mutationFn: (data: FormData) => budgetApi.upsert({ ...data, limitAmount: data.limitAmount * 100 }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['budgets'] })
//       setShowModal(false)
//       reset({ monthYear: selectedMonth })
//       show('Budget saved successfully')
//     },
//   })

//   const totalBudget = budgets.reduce((s, b) => s + b.limitAmount, 0)
//   const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
//   const overBudget  = budgets.filter(b => b.usagePercent > 100).length

//   return (
//     <div className="space-y-6 animate-fade-in">

//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">Budgets</h1>
//           <div className="flex items-center gap-1.5 mt-1.5">
//             <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
//               <ChevronLeft size={15} />
//             </button>
//             <span className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold min-w-[110px] text-center">
//               {formatMonthYear(selectedMonth)}
//             </span>
//             <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
//               <ChevronRight size={15} />
//             </button>
//           </div>
//         </div>
//         {!isAdmin && (
//           <button onClick={() => { reset({ monthYear: selectedMonth }); setShowModal(true) }}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-[13px] font-semibold shadow-md shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition-all">
//             <Plus size={15} /> Set Budget
//           </button>
//         )}
//       </div>

//       {/* ── Summary strip ── */}
//       {budgets.length > 0 && (
//         <div className="grid grid-cols-3 gap-4">
//           {[
//             { label: 'Total Budget', value: formatMoney(totalBudget, currency), color: 'text-gray-900 dark:text-white' },
//             { label: 'Total Spent',  value: formatMoney(totalSpent, currency),  color: 'text-rose-500' },
//             { label: 'Over Budget',  value: `${overBudget} categories`,         color: overBudget > 0 ? 'text-red-500' : 'text-emerald-500' },
//           ].map(({ label, value, color }) => (
//             <div key={label} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 text-center">
//               <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
//               <p className={`text-[15px] font-bold font-mono ${color}`}>{value}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Budget cards ── */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl animate-pulse bg-gray-100 dark:bg-gray-800" />)}
//         </div>
//       ) : budgets.length === 0 ? (
//         <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 flex flex-col items-center justify-center text-center">
//           <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
//             <Target size={28} className="text-emerald-500" />
//           </div>
//           <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-2">
//             No budgets for {formatMonthYear(selectedMonth)}
//           </h3>
//           <p className="text-[13px] text-gray-400 mb-6 max-w-xs leading-relaxed">
//             {selectedMonth === currentMonthYear()
//               ? 'Set monthly spending limits per category to stay on track.'
//               : 'No budgets were set for this month.'}
//           </p>
//           {!isAdmin && (
//             <button onClick={() => setShowModal(true)}
//               className="px-5 py-2.5 rounded-xl gradient-brand text-white text-[13px] font-semibold shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all">
//               Set your first budget
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {budgets.map(b => <BudgetCard key={b.id} budget={b} currency={currency} />)}
//         </div>
//       )}

//       {/* ── Modal ── */}
//       {!isAdmin && (
//         <AnimatePresence>
//           {showModal && (
//             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
//               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
//                 className="relative bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm shadow-2xl overflow-hidden">
//                 <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
//                   <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Set Budget</h2>
//                   <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={17} /></button>
//                 </div>
//                 <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="px-6 py-5 space-y-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
//                     <select {...register('categoryId')}
//                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
//                       <option value="">Select category</option>
//                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                     </select>
//                     {errors.categoryId && <p className="text-[12px] text-red-500">{errors.categoryId.message}</p>}
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</label>
//                     <input type="month" {...register('monthYear')}
//                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Limit Amount ({currency})</label>
//                     <input type="number" step="0.01" min="0" {...register('limitAmount')} placeholder="e.g. 5000"
//                       className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//                     {errors.limitAmount && <p className="text-[12px] text-red-500">{errors.limitAmount.message}</p>}
//                   </div>
//                   <button type="submit" disabled={isSubmitting || saveMutation.isPending}
//                     className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-[13px] shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
//                     {(isSubmitting || saveMutation.isPending) && <Loader2 size={15} className="animate-spin" />}
//                     Save Budget
//                   </button>
//                 </form>
//               </motion.div>
//             </div>
//           )}
//         </AnimatePresence>
//       )}
//     </div>
//   )
// }



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
