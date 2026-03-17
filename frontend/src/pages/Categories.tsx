import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { categoryApi } from '@/lib/api'
import type { Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16']
const ICONS  = ['briefcase','shopping-cart','home','car','utensils','heart','book','music','plane','gift','zap','star']

const schema = z.object({
  name:  z.string().min(1, 'Name required'),
  type:  z.enum(['INCOME','EXPENSE']),
  color: z.string().min(1),
  icon:  z.string().min(1),
})
type FormData = z.infer<typeof schema>

export default function Categories() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Category | null>(null)
  const [apiError, setApiError]   = useState('')

  const { data: catRes, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })
  const categories: Category[] = catRes?.data?.data || []

  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: COLORS[0], icon: ICONS[0] },
  })
  const selectedColor = watch('color')

  const openCreate = () => {
    setEditing(null)
    setApiError('')
    reset({ type: 'EXPENSE', color: COLORS[0], icon: ICONS[0] })
    setShowModal(true)
  }
  const openEdit = (c: Category) => {
    setEditing(c)
    setApiError('')
    reset({ name: c.name, type: c.type, color: c.color, icon: c.icon })
    setShowModal(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editing ? categoryApi.update(editing.id, data) : categoryApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
      setApiError('')
    },
    onError: (e: any) => {
      setApiError(e?.response?.data?.message || e?.response?.data?.error || 'Failed to save category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  const income  = categories.filter(c => c.type === 'INCOME')
  const expense = categories.filter(c => c.type === 'EXPENSE')

  const groups = [
    { label: 'Income',  items: income,  badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { label: 'Expense', items: expense, badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
        {!isAdmin && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {/* Category groups */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card-base h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items, badge }) => (
            <div key={label}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>{label}</span>
                <span className="text-xs text-gray-400 font-medium">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <div className="card-base p-8 text-center text-gray-400 text-sm">
                  No {label.toLowerCase()} categories yet
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map(c => (
                    <motion.div key={c.id} layout
                      className="group relative rounded-2xl p-5 flex flex-col justify-between cursor-default select-none bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                      style={{
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        minHeight: '140px',
                        transition: 'all 0.2s ease-in-out',
                      }}
                      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.11)' }}
                    >
                      {/* Left color accent bar */}
                      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ background: c.color }} />

                      {/* Top row: icon badge + name */}
                      <div className="flex items-start gap-3 pl-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                          style={{ background: c.color }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Category</p>
                          <p className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">{c.name}</p>
                        </div>
                      </div>

                      {/* Bottom row: type + icon */}
                      <div className="flex items-center justify-between pl-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Type</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'}`}>
                            {c.type === 'INCOME' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">Icon</p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{c.icon}</p>
                        </div>
                      </div>

                      {/* Actions overlay on hover */}
                      {!isAdmin && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(c.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {!isAdmin && (
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)} />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {editing ? 'Edit Category' : 'New Category'}
                </h2>
                <button onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={17} />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="px-6 py-5 space-y-4">

                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {apiError}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</label>
                  <input {...register('name')} placeholder="e.g. Groceries"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</label>
                  <select {...register('type')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2.5 flex-nowrap">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setValue('color', c)}
                        className={`w-7 h-7 rounded-full flex-shrink-0 transition-all hover:scale-110 ${selectedColor === c ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : ''}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Icon</label>
                  <select {...register('icon')}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Submit */}
                <button type="submit" disabled={saveMutation.isPending}
                  className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                  {saveMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  {editing ? 'Update Category' : 'Create Category'}
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
