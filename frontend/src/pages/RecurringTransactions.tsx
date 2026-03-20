import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader2, RefreshCw, Pause, Play, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { recurringApi, categoryApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatMoney, formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toaster'
import type { RecurringTransaction, Category } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

const schema = z.object({
  categoryId: z.coerce.number().min(1, 'Select category'),
  amount: z.coerce.number().min(0.01, 'Amount required'),
  description: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const FREQ_LABELS: Record<string, string> = { DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly' }

export default function RecurringTransactions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const qc = useQueryClient()
  const { show } = useToast()
  const [showModal, setShowModal] = useState(false)

  const { data: rtRes, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringApi.getAll(),
  })

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const categories: Category[] = catRes?.data?.data || []
  const items: RecurringTransaction[] = rtRes?.data?.data || []

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0] },
  })
  const selectedType = watch('type')

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: Record<string, unknown> = {
        categoryId: data.categoryId,
        amount: Math.round(data.amount * 100),
        description: data.description ?? '',
        type: data.type,
        frequency: data.frequency,
        startDate: data.startDate,
      }
      // Only include endDate if it has a value
      if (data.endDate && data.endDate.trim() !== '') {
        payload.endDate = data.endDate
      }
      return recurringApi.create(payload as any)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      setShowModal(false)
      reset()
      show('Recurring transaction created')
    },
    onError: () => show('Failed to create', 'error'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => recurringApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
    onError: () => show('Failed to update', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recurringApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      show('Deleted')
    },
    onError: () => show('Failed to delete', 'error'),
  })

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
            Recurring <span className="text-orange-500">Transactions</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            {items.length} Scheduled &bull; Auto-executes daily
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95">
            <Plus size={16} /> Schedule New
          </button>
        )}
      </div>

      {/* LIST */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <Loader2 size={30} className="animate-spin text-orange-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 py-24 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw size={32} className="text-slate-200" />
          </div>
          <p className="text-[12px] font-[1000] text-black uppercase tracking-widest">No Recurring Transactions</p>
          <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-tighter">Schedule your first recurring entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((rt, i) => (
            <motion.div key={rt.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn(
                'bg-white rounded-[2rem] border p-6 shadow-sm transition-all',
                rt.active ? 'border-gray-100' : 'border-slate-200 opacity-60'
              )}>
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center',
                    rt.type === 'INCOME' ? 'bg-orange-500' : 'bg-black'
                  )}>
                    {rt.type === 'INCOME'
                      ? <ArrowUpCircle size={18} className="text-white" />
                      : <ArrowDownCircle size={18} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-[1000] text-black uppercase tracking-tight">
                      {rt.description || rt.categoryName}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {rt.categoryName}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  'text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full',
                  rt.active ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-400'
                )}>
                  {rt.active ? 'Active' : 'Paused'}
                </span>
              </div>

              {/* Amount */}
              <p className={cn(
                'text-2xl font-[1000] font-mono mb-4',
                rt.type === 'INCOME' ? 'text-orange-500' : 'text-black'
              )}>
                {rt.type === 'INCOME' ? '+' : '-'}{formatMoney(rt.amount, user?.currency)}
              </p>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frequency</p>
                  <p className="text-[11px] font-[1000] text-black uppercase mt-1">{FREQ_LABELS[rt.frequency]}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Run</p>
                  <p className="text-[11px] font-[1000] text-black uppercase mt-1">{formatDate(rt.nextRunDate)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start</p>
                  <p className="text-[11px] font-[1000] text-black uppercase mt-1">{formatDate(rt.startDate)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End</p>
                  <p className="text-[11px] font-[1000] text-black uppercase mt-1">
                    {rt.endDate ? formatDate(rt.endDate) : 'No end'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => toggleMutation.mutate(rt.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 hover:text-orange-500 transition-all">
                    {rt.active ? <Pause size={12} /> : <Play size={12} />}
                    {rt.active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => deleteMutation.mutate(rt.id)}
                    className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:border-red-500 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-black p-8 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-[1000] text-white uppercase tracking-tighter">
                    Schedule <span className="text-orange-500">Recurring</span>
                  </h2>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">Auto-transaction setup</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="p-8 space-y-5">
                {/* Type */}
                <div className="grid grid-cols-2 gap-4">
                  {(['INCOME', 'EXPENSE'] as const).map(t => (
                    <label key={t} className="cursor-pointer group">
                      <input {...register('type')} type="radio" value={t} className="sr-only" />
                      <div className={cn(
                        'p-4 rounded-2xl border-2 text-center text-[10px] font-black uppercase tracking-widest transition-all',
                        selectedType === t
                          ? (t === 'INCOME' ? 'border-orange-500 bg-orange-500 text-white' : 'border-black bg-black text-white')
                          : 'border-slate-100 bg-slate-50 text-slate-400 group-hover:border-slate-200'
                      )}>
                        {t}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Category + Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
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

                {/* Frequency */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(f => (
                      <label key={f} className="cursor-pointer">
                        <input {...register('frequency')} type="radio" value={f} className="sr-only" />
                        <div className={cn(
                          'p-3 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-widest transition-all',
                          watch('frequency') === f
                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                        )}>
                          {FREQ_LABELS[f]}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input {...register('startDate')} type="date"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                    {errors.startDate && <p className="text-[10px] text-red-500 font-bold">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date (optional)</label>
                    <input {...register('endDate')} type="date"
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <input {...register('description')} type="text" placeholder="e.g. Monthly Rent"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>

                <button type="submit" disabled={isSubmitting || createMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  {(isSubmitting || createMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  Schedule Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
