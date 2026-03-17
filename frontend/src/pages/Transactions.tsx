// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Plus, X, Loader2, ArrowUpCircle, ArrowDownCircle, Filter, Upload, Download } from 'lucide-react'
// import { transactionApi, categoryApi, csvApi } from '@/lib/api'
// import { useAuth } from '@/contexts/AuthContext'
// import { formatMoney, formatDate } from '@/lib/utils'
// import { useToast } from '@/components/Toaster'
// import type { Transaction, Category } from '@/types'

// const schema = z.object({
//   categoryId: z.coerce.number().min(1, 'Select category'),
//   amount: z.coerce.number().min(1, 'Amount required'),
//   description: z.string().optional(),
//   date: z.string().min(1, 'Date required'),
//   type: z.enum(['INCOME', 'EXPENSE']),
// })
// type FormData = z.infer<typeof schema>

// export default function Transactions() {
//   const { user } = useAuth()
//   const isAdmin = user?.role === 'ADMIN'
//   const navigate = useNavigate()
//   const qc = useQueryClient()
//   const { show } = useToast()
//   const [showModal, setShowModal] = useState(false)

//   const handleExport = async () => {
//     try {
//       const res = await csvApi.export()
//       const url = URL.createObjectURL(new Blob([res.data]))
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'transactions.csv'
//       a.click()
//       URL.revokeObjectURL(url)
//       show('Transactions exported successfully')
//     } catch {
//       show('Export failed', 'error')
//     }
//   }

//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [filterCat, setFilterCat] = useState<number | undefined>()

//   const { data: txRes, isLoading } = useQuery({
//     queryKey: ['transactions'],
//     queryFn: () => transactionApi.getAll({}),
//     staleTime: 0,
//   })

//   const { data: catRes, isError: catError, refetch: refetchCats } = useQuery({
//     queryKey: ['categories'],
//     queryFn: () => categoryApi.getAll(),
//     staleTime: 0,
//     retry: 2,
//   })

//   const allTransactions: Transaction[] = txRes?.data?.data || []
//   const categories: Category[] = catRes?.data?.data || []

//   const transactions = allTransactions.filter(tx => {
//     if (startDate && tx.date < startDate) return false
//     if (endDate && tx.date > endDate) return false
//     if (filterCat && tx.categoryId !== filterCat) return false
//     return true
//   })

//   const [saveError, setSaveError] = useState('')
//   const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
//   })
//   const selectedType = watch('type')

//   const totalIncome   = allTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
//   const totalExpenses = allTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

//   const handleCreate = (data: FormData) => {
//     if (data.type === 'EXPENSE') {
//       const newExpenseAmount = Math.round(data.amount * 100)
//       if (totalExpenses + newExpenseAmount > totalIncome) {
//         show('Expense exceeds your total income. Transaction not allowed.', 'error')
//         return
//       }
//     }
//     createMutation.mutate(data)
//   }

//   const createMutation = useMutation({
//     mutationFn: (data: FormData) => transactionApi.create({
//       ...data,
//       description: data.description ?? '',
//       amount: Math.round(data.amount * 100),
//     }),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['transactions'] })
//       qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
//       qc.invalidateQueries({ queryKey: ['dashboard-monthly'] })
//       qc.invalidateQueries({ queryKey: ['dashboard-categories'] })
//       qc.invalidateQueries({ queryKey: ['transactions-recent'] })
//       setShowModal(false)
//       setSaveError('')
//       reset()
//       show('Transaction saved successfully')
//     },
//     onError: (e: any) => {
//       setSaveError(e.response?.data?.message || 'Failed to save transaction')
//     },
//   })

//   return (
//     <div className="space-y-6 animate-fade-in">

//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">Transactions</h1>
//           <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">{transactions.length} records found</p>
//         </div>
//         <div className="flex items-center gap-2.5 flex-shrink-0">
//           {!isAdmin && (
//             <>
//               <button onClick={() => navigate('/import')}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm">
//                 <Upload size={14} /> Import CSV
//               </button>
//               <button onClick={handleExport}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm">
//                 <Download size={14} /> Export
//               </button>
//             </>
//           )}
//           {!isAdmin && (
//             <button onClick={() => { setShowModal(true); refetchCats() }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-[13px] font-semibold shadow-md shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition-all">
//               <Plus size={15} /> Add
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Filters ── */}
//       <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-wrap gap-3 items-center">
//         <div className="flex items-center gap-2 text-gray-400">
//           <Filter size={15} />
//           <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">Filter</span>
//         </div>
//         <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
//           className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//         <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
//         <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
//           className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//         <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
//           className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
//           <option value="">All categories</option>
//           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//         </select>
//         {(startDate || endDate || filterCat) && (
//           <button onClick={() => { setStartDate(''); setEndDate(''); setFilterCat(undefined) }}
//             className="text-[12px] font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
//             Clear filters
//           </button>
//         )}
//       </div>

//       {/* ── Table ── */}
//       <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//         {isLoading ? (
//           <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
//         ) : transactions.length === 0 ? (
//           <div className="py-20 text-center">
//             <ArrowLeftRight size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
//             <p className="text-[14px] font-semibold text-gray-500 dark:text-gray-400">No transactions yet</p>
//             <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">Add your first transaction to get started</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-[13.5px]">
//               <thead>
//                 <tr className="bg-gray-50/70 dark:bg-gray-800/40">
//                   {['Date','Type','Category','Description','Amount'].map(h => (
//                     <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
//                 {transactions.map((tx, i) => (
//                   <motion.tr key={tx.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
//                     className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-150">
//                     <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
//                     <td className="px-5 py-4">
//                       {tx.type === 'INCOME'
//                         ? <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[12.5px]"><ArrowUpCircle size={14} />Income</span>
//                         : <span className="inline-flex items-center gap-1.5 text-rose-500 font-semibold text-[12.5px]"><ArrowDownCircle size={14} />Expense</span>
//                       }
//                     </td>
//                     <td className="px-5 py-4">
//                       <span className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
//                         {tx.categoryName}
//                       </span>
//                     </td>
//                     <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{tx.description || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
//                     <td className={`px-5 py-4 font-mono font-bold ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
//                       {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, user?.currency)}
//                     </td>
//                   </motion.tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ── Add Modal ── */}
//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setSaveError('') }} />
//             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
//               className="relative bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden">

//               {/* Modal header */}
//               <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
//                 <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Add Transaction</h2>
//                 <button onClick={() => { setShowModal(false); setSaveError('') }}
//                   className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
//                   <X size={17} />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit(handleCreate)} className="px-6 py-5 space-y-4">
//                 {saveError && (
//                   <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px]">
//                     {saveError}
//                   </div>
//                 )}

//                 {/* Type toggle */}
//                 <div className="grid grid-cols-2 gap-3">
//                   {(['INCOME','EXPENSE'] as const).map(t => (
//                     <label key={t} className="cursor-pointer">
//                       <input {...register('type')} type="radio" value={t} className="sr-only" />
//                       <div className={`p-3 rounded-xl border-2 text-center text-[13px] font-semibold transition-all
//                         ${selectedType === t
//                           ? t === 'INCOME'
//                             ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
//                             : 'border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-500'
//                           : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
//                         }`}>
//                         {t}
//                       </div>
//                     </label>
//                   ))}
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
//                   <select {...register('categoryId')}
//                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
//                     <option value="">Select category</option>
//                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                   </select>
//                   {catError && <p className="text-[12px] text-red-500">Failed to load — <button type="button" className="underline" onClick={() => refetchCats()}>retry</button></p>}
//                   {errors.categoryId && <p className="text-[12px] text-red-500">{errors.categoryId.message}</p>}
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount ({user?.currency})</label>
//                   <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
//                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//                   {errors.amount && <p className="text-[12px] text-red-500">{errors.amount.message}</p>}
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
//                   <input {...register('date')} type="date"
//                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
//                   <input {...register('description')} type="text" placeholder="Optional note"
//                     className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
//                 </div>

//                 <button type="submit" disabled={isSubmitting || createMutation.isPending}
//                   className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-[13px] shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
//                   {(isSubmitting || createMutation.isPending) && <Loader2 size={15} className="animate-spin" />}
//                   Save Transaction
//                 </button>
//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// function ArrowLeftRight({ size, className }: { size: number; className?: string }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
//       <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
//     </svg>
//   )
// }



import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader2, ArrowUpCircle, ArrowDownCircle, Filter, Upload, Download, Search } from 'lucide-react'
import { transactionApi, categoryApi, csvApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toaster'
import type { Transaction, Category } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind merging
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

export default function Transactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { show } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterCat, setFilterCat] = useState<number | undefined>()

  // Queries
  const { data: txRes, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll({}),
  })

  const { data: catRes, refetch: refetchCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const allTransactions: Transaction[] = txRes?.data?.data || []
  const categories: Category[] = catRes?.data?.data || []

  // Filtering Logic
  const transactions = allTransactions.filter(tx => {
    if (startDate && tx.date < startDate) return false
    if (endDate && tx.date > endDate) return false
    if (filterCat && tx.categoryId !== filterCat) return false
    return true
  })

  // Form setup
  const [saveError, setSaveError] = useState('')
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  })
  const selectedType = watch('type')

  const totalIncome = allTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = allTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  const handleExport = async () => {
    try {
      const res = await csvApi.export()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `ledger_export_${new Date().getTime()}.csv`
      a.click()
      show('Data protocol exported')
    } catch {
      show('Export sequence failed', 'error')
    }
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
      setShowModal(false)
      reset()
      show('Transaction written to ledger')
    },
    onError: (e: any) => setSaveError(e.response?.data?.message || 'Write error')
  })

  const handleCreate = (data: FormData) => {
    if (data.type === 'EXPENSE' && totalExpenses + Math.round(data.amount * 100) > totalIncome) {
      show('Insufficient balance for this operation', 'error')
      return
    }
    createMutation.mutate(data)
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
            Financial <span className="text-orange-500">Ledger</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            {transactions.length} Active Records Found • Protocol SEC-206
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isAdmin && (
            <>
              <button onClick={() => navigate('/import')} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
                <Upload size={14} /> Import
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
                <Download size={14} /> Export
              </button>
              <button onClick={() => { setShowModal(true); refetchCats() }} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95">
                <Plus size={16} /> Add Entry
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Filter size={14} className="text-orange-500" />
          <span className="text-[10px] font-[1000] uppercase tracking-widest text-slate-400">Filters</span>
        </div>
        
        <div className="flex items-center gap-2">
           <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
             className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" />
           <span className="text-slate-300 font-black">/</span>
           <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
             className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" />
        </div>

        <select value={filterCat || ''} onChange={e => setFilterCat(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all min-w-[180px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {(startDate || endDate || filterCat) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setFilterCat(undefined) }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline px-4">
            Reset Protocol
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Timestamp','Classification','Cluster','Details','Capital Flow'].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx, i) => (
                  <motion.tr 
                    key={tx.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-8 py-6 text-[11px] font-bold text-slate-500 uppercase">{formatDate(tx.date)}</td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        tx.type === 'INCOME' ? "bg-orange-500 text-white" : "bg-black text-white"
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
                    <td className="px-8 py-6">
                      <p className="text-[13px] font-black text-black uppercase tracking-tight truncate max-w-[250px]">
                        {tx.description || "System Automated"}
                      </p>
                    </td>
                    <td className={cn(
                      "px-8 py-6 text-right font-mono font-[1000] text-base",
                      tx.type === 'INCOME' ? "text-orange-500" : "text-black"
                    )}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, user?.currency)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20">

              <div className="bg-black p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-[1000] text-white uppercase tracking-tighter">Initialize <span className="text-orange-500">Entry</span></h2>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">Transaction Node Setup</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleCreate)} className="p-8 space-y-6 bg-white">
                {saveError && <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase">{saveError}</div>}

                {/* TYPE TOGGLE */}
                <div className="grid grid-cols-2 gap-4">
                  {(['INCOME','EXPENSE'] as const).map(t => (
                    <label key={t} className="cursor-pointer group">
                      <input {...register('type')} type="radio" value={t} className="sr-only" />
                      <div className={cn(
                        "p-4 rounded-2xl border-2 text-center text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        selectedType === t 
                          ? (t === 'INCOME' ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "border-black bg-black text-white shadow-lg shadow-black/20")
                          : "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200"
                      )}>
                        {t} Protocol
                      </div>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cluster</label>
                    <select {...register('categoryId')} className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all">
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ({user?.currency})</label>
                    <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</label>
                  <input {...register('date')} type="date" className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
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
