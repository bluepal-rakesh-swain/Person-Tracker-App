// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { AnimatePresence, motion } from 'framer-motion'
// import { Plus, X, Pencil, Trash2, Loader2, Download } from 'lucide-react'
// import { categoryApi } from '@/lib/api'
// import type { Category } from '@/types'
// import { useAuth } from '@/contexts/AuthContext'
// import { useToast } from '@/components/Toaster'
// import { clsx, type ClassValue } from 'clsx'
// import { twMerge } from 'tailwind-merge'

// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// const COLORS = ['#f97316', '#000000', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#475569']
// const ICONS = ['briefcase', 'shopping-cart', 'home', 'car', 'utensils', 'heart', 'book', 'music', 'plane', 'gift', 'zap', 'star']

// const schema = z.object({
//   name: z.string().min(1, 'Name required'),
//   type: z.enum(['INCOME', 'EXPENSE']),
//   color: z.string().min(1),
//   icon: z.string().min(1),
// })
// type FormData = z.infer<typeof schema>

// export default function Categories() {
//   const qc = useQueryClient()
//   const { show } = useToast()
//   const { user } = useAuth()
//   const isAdmin = user?.role === 'ADMIN'

//   const [showModal, setShowModal] = useState(false)
//   const [editing, setEditing] = useState<Category | null>(null)
//   const [apiError, setApiError] = useState('')

//   const { data: catRes, isLoading } = useQuery({
//     queryKey: ['categories'],
//     queryFn: () => categoryApi.getAll(),
//   })
//   const categories: Category[] = catRes?.data?.data || []

//   const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { type: 'EXPENSE', color: COLORS[0], icon: ICONS[0] },
//   })
//   const selectedColor = watch('color')

//   const openCreate = () => {
//     setEditing(null)
//     setApiError('')
//     reset({ type: 'EXPENSE', color: COLORS[0], icon: ICONS[0] })
//     setShowModal(true)
//   }

//   const openEdit = (c: Category) => {
//     setEditing(c)
//     setApiError('')
//     reset({ name: c.name, type: c.type, color: c.color, icon: c.icon })
//     setShowModal(true)
//   }

//   const saveMutation = useMutation({
//     mutationFn: (data: FormData) =>
//       editing ? categoryApi.update(editing.id, data) : categoryApi.create(data),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['categories'] })
//       setShowModal(false)
//       show(editing ? 'Category updated' : 'Category created')
//     },
//     onError: (e: any) => setApiError(e?.response?.data?.message || 'Failed to save'),
//   })

//   const deleteMutation = useMutation({
//     mutationFn: (id: number) => categoryApi.delete(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['categories'] })
//       show('Category deleted', 'warning')
//     },
//   })

//   const handleExportCsv = async () => {
//     try {
//       const res = await categoryApi.exportCsv()
//       const url = URL.createObjectURL(new Blob([res.data]))
//       const a = document.createElement('a')
//       a.href = url; a.download = 'categories.csv'; a.click()
//       URL.revokeObjectURL(url)
//       show('Exported as CSV')
//     } catch { show('CSV export failed', 'error') }
//   }

//   const handleExportPdf = async () => {
//     try {
//       const res = await categoryApi.exportPdf()
//       const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
//       const a = document.createElement('a')
//       a.href = url; a.download = 'categories.pdf'; a.click()
//       URL.revokeObjectURL(url)
//       show('Exported as PDF')
//     } catch { show('PDF export failed', 'error') }
//   }

//   const groups = [
//     { label: 'Income Clusters', type: 'INCOME', items: categories.filter(c => c.type === 'INCOME') },
//     { label: 'Expense Clusters', type: 'EXPENSE', items: categories.filter(c => c.type === 'EXPENSE') },
//   ]

//   return (
//     <div className="space-y-10 max-w-[1600px] mx-auto pb-20">

//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div>
//           <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
//             Category <span className="text-orange-500">Clusters</span>
//           </h1>
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
//             System Classification Registry &bull; {categories.length} Active Nodes
//           </p>
//         </div>
//         <div className="flex items-center gap-3 flex-wrap justify-end">
//           <button onClick={handleExportCsv}
//             className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
//             <Download size={14} /> Export CSV
//           </button>
//           <button onClick={handleExportPdf}
//             className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
//             <Download size={14} /> Export PDF
//           </button>
//           {!isAdmin && (
//             <button onClick={openCreate}
//               className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center gap-3">
//               <Plus size={16} /> Add New Category
//             </button>
//           )}
//         </div>
//       </div>

//       {/* CATEGORY GRID */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[1, 2, 3].map(i => (
//             <div key={i} className="h-40 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
//           ))}
//         </div>
//       ) : (
//         <div className="space-y-12">
//           {groups.map(({ label, items, type }) => (
//             <div key={label} className="space-y-6">
//               <div className="flex items-center gap-4">
//                 <h2 className="text-[11px] font-[1000] text-black uppercase tracking-[0.3em]">{label}</h2>
//                 <div className="h-[1px] flex-1 bg-slate-100" />
//                 <span className="text-[10px] font-black text-slate-300 uppercase">{items.length} Nodes</span>
//               </div>
//               {items.length === 0 ? (
//                 <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
//                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data for {type}</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                   {items.map(c => (
//                     <motion.div
//                       key={c.id}
//                       whileHover={{ y: -5 }}
//                       className="group relative bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-2xl hover:border-orange-500/20"
//                     >
//                       <div className="flex items-start justify-between mb-4">
//                         <div
//                           className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg"
//                           style={{ backgroundColor: c.color }}
//                         >
//                           {c.name.charAt(0).toUpperCase()}
//                         </div>
//                         {!isAdmin && (
//                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
//                             <button onClick={() => openEdit(c)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-black hover:bg-slate-100">
//                               <Pencil size={14} />
//                             </button>
//                             <button onClick={() => deleteMutation.mutate(c.id)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50">
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Node Identifier</p>
//                         <h3 className="text-lg font-[1000] text-black uppercase tracking-tighter leading-tight truncate">{c.name}</h3>
//                       </div>
//                       <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
//                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.icon}</span>
//                         </div>
//                         <div className={cn(
//                           'px-3 py-1 rounded-full text-[8px] font-[1000] uppercase tracking-tighter',
//                           type === 'INCOME' ? 'bg-orange-500 text-white' : 'bg-black text-white'
//                         )}>
//                           {type}
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* MODAL */}
//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               className="absolute inset-0 bg-black/80 backdrop-blur-md"
//               onClick={() => setShowModal(false)}
//             />
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20"
//             >
//               <div className="bg-black p-8">
//                 <div className="flex items-center justify-between mb-1">
//                   <h2 className="text-xl font-[1000] text-white uppercase tracking-tighter">
//                     {editing ? 'Update' : 'Add'} <span className="text-orange-500">Category</span>
//                   </h2>
//                   <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
//                     <X size={20} />
//                   </button>
//                 </div>
//                 <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Category SetUp</p>
//               </div>
//               <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="p-8 space-y-6">
//                 {apiError && (
//                   <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100">{apiError}</div>
//                 )}
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category name</label>
//                   <input {...register('name')} placeholder="e.g. CORE ASSETS"
//                     className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
//                   {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cluster Type</label>
//                   <select {...register('type')} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all">
//                     <option value="EXPENSE">EXPENSE PROTOCOL</option>
//                     <option value="INCOME">INCOME PROTOCOL</option>
//                   </select>
//                 </div>
//                 <div className="space-y-3">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color Signature</label>
//                   <div className="flex flex-wrap gap-3">
//                     {COLORS.map(c => (
//                       <button key={c} type="button" onClick={() => setValue('color', c)}
//                         className={cn('w-8 h-8 rounded-xl transition-all hover:scale-110', selectedColor === c ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : 'opacity-60')}
//                         style={{ backgroundColor: c }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Vector</label>
//                   <select {...register('icon')} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-500 transition-all">
//                     {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
//                   </select>
//                 </div>
//                 <button type="submit" disabled={saveMutation.isPending}
//                   className="w-full py-5 rounded-2xl bg-black text-white font-[1000] text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4">
//                   {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
//                   {editing ? 'Update Node' : 'Confirm Initialization'}
//                 </button>
//               </form>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }




import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, X, Pencil, Trash2, Loader2, Download,
  Briefcase, Home, Car, Coffee, Heart, Zap,
  BookOpen, Music, Phone, Plane, Gift, Wallet,
} from 'lucide-react'
import { categoryApi } from '@/lib/api'
import type { Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toaster'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLORS = [
  '#f97316', '#e05c6a', '#4a7c3f', '#3b82f6',
  '#8b5cf6', '#10b981', '#ec4899', '#f59e0b',
  '#6b7280', '#c2410c',
]

const ICON_OPTIONS = [
  { key: 'briefcase', label: 'Briefcase', Icon: Briefcase },
  { key: 'home',      label: 'Home',      Icon: Home      },
  { key: 'car',       label: 'Car',        Icon: Car       },
  { key: 'coffee',    label: 'Coffee',     Icon: Coffee    },
  { key: 'heart',     label: 'Heart',      Icon: Heart     },
  { key: 'zap',       label: 'Zap',        Icon: Zap       },
  { key: 'book',      label: 'Book',       Icon: BookOpen  },
  { key: 'music',     label: 'Music',      Icon: Music     },
  { key: 'phone',     label: 'Phone',      Icon: Phone     },
  { key: 'plane',     label: 'Plane',      Icon: Plane     },
  { key: 'gift',      label: 'Gift',       Icon: Gift      },
  { key: 'wallet',    label: 'Wallet',     Icon: Wallet    },
]

const schema = z.object({
  name: z.string().min(1, 'Name required').max(30),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().min(1),
  icon: z.string().min(1),
})
type FormData = z.infer<typeof schema>

function IconComponent({ iconKey, size = 20 }: { iconKey: string; size?: number }) {
  const found = ICON_OPTIONS.find(o => o.key === iconKey)
  if (!found) return <BookOpen size={size} />
  const { Icon } = found
  return <Icon size={size} />
}

export default function Categories() {
  const qc = useQueryClient()
  const { show } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [apiError, setApiError] = useState('')

  const { data: catRes, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })
  const categories: Category[] = catRes?.data?.data || []

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: COLORS[0], icon: ICON_OPTIONS[0].key },
  })
  const selectedColor = watch('color')
  const selectedIcon  = watch('icon')
  const selectedType  = watch('type')
  const nameValue     = watch('name') || ''

  const openCreate = () => {
    setEditing(null)
    setApiError('')
    reset({ type: 'EXPENSE', color: COLORS[0], icon: ICON_OPTIONS[0].key, name: '' })
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
      show(editing ? 'Category updated' : 'Category created')
    },
    onError: (e: any) => setApiError(e?.response?.data?.message || 'Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      show('Category deleted', 'warning')
    },
  })

  const handleExportCsv = async () => {
    try {
      const res = await categoryApi.exportCsv()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = 'categories.csv'; a.click()
      URL.revokeObjectURL(url)
      show('Exported as CSV')
    } catch { show('CSV export failed', 'error') }
  }

  const handleExportPdf = async () => {
    try {
      const res = await categoryApi.exportPdf()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = 'categories.pdf'; a.click()
      URL.revokeObjectURL(url)
      show('Exported as PDF')
    } catch { show('PDF export failed', 'error') }
  }

  const groups = [
    { label: 'Income Clusters', type: 'INCOME', items: categories.filter(c => c.type === 'INCOME') },
    { label: 'Expense Clusters', type: 'EXPENSE', items: categories.filter(c => c.type === 'EXPENSE') },
  ]

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
            Category <span className="text-orange-500">Clusters</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
            System Classification Registry &bull; {categories.length} Active Nodes
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button onClick={handleExportCsv}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleExportPdf}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-500 transition-all shadow-sm">
            <Download size={14} /> Export PDF
          </button>
          {!isAdmin && (
            <button onClick={openCreate}
              className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center gap-3">
              <Plus size={16} /> Add New Category
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map(({ label, items, type }) => (
            <div key={label} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[11px] font-[1000] text-black uppercase tracking-[0.3em]">{label}</h2>
                <div className="h-[1px] flex-1 bg-slate-100" />
                <span className="text-[10px] font-black text-slate-300 uppercase">{items.length} Nodes</span>
              </div>
              {items.length === 0 ? (
                <div className="bg-slate-50 rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data for {type}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map(c => (
                    <motion.div
                      key={c.id}
                      whileHover={{ y: -5 }}
                      className="group relative bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-2xl hover:border-orange-500/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg"
                          style={{ backgroundColor: c.color }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {!isAdmin && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => openEdit(c)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-black hover:bg-slate-100">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteMutation.mutate(c.id)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Node Identifier</p>
                        <h3 className="text-lg font-[1000] text-black uppercase tracking-tighter leading-tight truncate">{c.name}</h3>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.icon}</span>
                        </div>
                        <div className={cn(
                          'px-3 py-1 rounded-full text-[8px] font-[1000] uppercase tracking-tighter',
                          type === 'INCOME' ? 'bg-orange-500 text-white' : 'bg-black text-white'
                        )}>
                          {type}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Black header */}
              <div className="bg-black px-7 py-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editing ? 'Edit' : 'Add'} <span className="text-orange-500">Category</span>
                  </h2>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.25em] mt-0.5">Category Setup</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors mt-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
                {apiError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100">{apiError}</div>
                )}

                {/* Preview card */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: selectedColor + '22' }}
                  >
                    <span style={{ color: selectedColor }}>
                      <IconComponent iconKey={selectedIcon} size={22} />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {nameValue || 'Category name'}
                    </p>
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mt-0.5 inline-block',
                      selectedType === 'EXPENSE' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'
                    )}>
                      {selectedType}
                    </span>
                  </div>
                </div>

                {/* Category Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Name</label>
                    <span className="text-[11px] text-slate-300 font-medium">{nameValue.length} / 30</span>
                  </div>
                  <input
                    {...register('name')}
                    maxLength={30}
                    placeholder="e.g. Groceries, Rent, Salary..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                </div>

                {/* Category Type toggle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Type</label>
                  <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setValue('type', 'EXPENSE')}
                      className={cn(
                        'py-3 text-sm font-semibold transition-all',
                        selectedType === 'EXPENSE'
                          ? 'bg-red-50 text-red-500 border border-red-300 rounded-xl'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      )}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('type', 'INCOME')}
                      className={cn(
                        'py-3 text-sm font-semibold transition-all',
                        selectedType === 'INCOME'
                          ? 'bg-green-50 text-green-600 border border-green-300 rounded-xl'
                          : 'bg-white text-slate-400 hover:text-slate-600'
                      )}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValue('color', c)}
                        className={cn(
                          'w-10 h-10 rounded-full transition-all hover:scale-110',
                          selectedColor === c ? 'ring-[3px] ring-offset-2 ring-slate-900 scale-110' : ''
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon grid */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setValue('icon', key)}
                        className={cn(
                          'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all',
                          selectedIcon === key
                            ? 'border-orange-400 bg-orange-50 text-orange-500'
                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-[8px] font-semibold leading-none">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  {editing ? 'Update Category' : 'Confirm Category'} ↗
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
