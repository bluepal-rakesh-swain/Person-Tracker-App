// import { useRef, useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useSearchParams } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import {
//   Trash2, ShieldCheck, ShieldOff, CheckCircle, XCircle,
//   AlertCircle, Download, FileText, Users, BarChart3,
//   TrendingUp, Tag, Upload as UploadIcon,
//   Settings, Info, Mail, Shield, Database, Globe,
// } from 'lucide-react'
// import { adminApi } from '@/lib/api'
// import { useToast } from '@/components/Toaster'

// interface AdminUser {
//   id: number
//   email: string
//   fullName: string
//   currency: string
//   role: string
//   enabled: boolean
//   emailVerified: boolean
// }

// interface AdminStats {
//   totalUsers: number
//   totalTransactions: number
//   totalCategories: number
//   totalImports: number
// }

// interface ImportLog {
//   id: number
//   userId: number
//   userEmail: string
//   fileName: string
//   status: string
//   imported: number
//   skipped: number
//   errorMessage: string | null
//   importedAt: string
// }

// type Tab = 'users' | 'stats' | 'imports' | 'settings' | 'about'

// export default function AdminPanel() {
//   const [searchParams] = useSearchParams()
//   const tab = (searchParams.get('tab') as Tab) || 'users'
//   const qc = useQueryClient()
//   const { show } = useToast()

//   const { data: usersRes, isLoading: usersLoading } = useQuery({
//     queryKey: ['admin-users'],
//     queryFn: () => adminApi.getUsers(),
//     enabled: tab === 'users',
//   })

//   const { data: statsRes, isLoading: statsLoading } = useQuery({
//     queryKey: ['admin-stats'],
//     queryFn: () => adminApi.getStats(),
//     enabled: tab === 'stats',
//   })

//   const { data: logsRes, isLoading: logsLoading } = useQuery({
//     queryKey: ['admin-imports'],
//     queryFn: () => adminApi.getImportLogs(),
//     enabled: tab === 'imports',
//   })

//   const users: AdminUser[] = usersRes?.data?.data || []
//   const stats: AdminStats | null = statsRes?.data?.data || null
//   const logs: ImportLog[] = logsRes?.data?.data || []

//   const toggleEnabled = useMutation({
//     mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
//       adminApi.setEnabled(id, enabled),
//     onSuccess: (_, vars) => {
//       qc.invalidateQueries({ queryKey: ['admin-users'] })
//       show(vars.enabled ? 'User enabled' : 'User disabled', vars.enabled ? 'success' : 'warning')
//     },
//   })

//   const changeRole = useMutation({
//     mutationFn: ({ id, role }: { id: number; role: string }) =>
//       adminApi.changeRole(id, role),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
//   })

//   const deleteUser = useMutation({
//     mutationFn: (id: number) => adminApi.deleteUser(id),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['admin-users'] })
//       show('User deleted', 'warning')
//     },
//   })

//   const importFileRef = useRef<HTMLInputElement>(null)
//   const [importingUserId, setImportingUserId] = useState<number | null>(null)

//   const handleExport = async (u: AdminUser) => {
//     const res = await adminApi.exportUserCsv(u.id)
//     const url = URL.createObjectURL(new Blob([res.data]))
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `transactions_${u.email}.csv`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   const handleImportClick = (userId: number) => {
//     setImportingUserId(userId)
//     importFileRef.current?.click()
//   }

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file || importingUserId === null) return
//     e.target.value = ''
//     try {
//       const defaultMapping = { date: 'date', desc: 'description', amount: 'amount', defaultCategoryId: null }
//       await adminApi.importUserCsv(importingUserId, file, defaultMapping)
//       show('CSV imported successfully')
//     } catch {
//       show('CSV import failed', 'error')
//     } finally {
//       setImportingUserId(null)
//     }
//   }

//   const downloadBlob = (blob: Blob, filename: string) => {
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = filename
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   const handleExportAllCsv = async () => {
//     const res = await adminApi.exportAllUsersCsv()
//     downloadBlob(new Blob([res.data], { type: 'text/csv' }), 'all_users.csv')
//   }

//   const handleExportAllPdf = async () => {
//     const res = await adminApi.exportAllUsersPdf()
//     downloadBlob(new Blob([res.data], { type: 'application/pdf' }), 'all_users.pdf')
//   }

//   return (
//     <div className="space-y-8 animate-fade-in">

//       {/* ── Page Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
//             Admin Panel
//           </h1>
//           <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
//             Manage users, monitor platform activity, and review import history.
//           </p>
//         </div>

//         {/* Export buttons */}
//         <div className="flex items-center gap-2.5 flex-shrink-0">
//           <button
//             onClick={handleExportAllPdf}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
//               bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400
//               border border-red-100 dark:border-red-500/20
//               hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95
//               transition-all duration-150 shadow-sm"
//             title="Export all users as PDF"
//           >
//             <FileText size={14} />
//             Export PDF
//           </button>
//           <button
//             onClick={handleExportAllCsv}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
//               bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400
//               border border-emerald-100 dark:border-emerald-500/20
//               hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95
//               transition-all duration-150 shadow-sm"
//             title="Export all users as CSV"
//           >
//             <Download size={14} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       {/* Hidden file input */}
//       <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

//       {/* ── Users Tab ── */}
//       {tab === 'users' && (
//         <div className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//           {/* Card header */}
//           <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
//             <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
//               <Users size={15} className="text-purple-500" />
//             </div>
//             <div>
//               <p className="text-[14px] font-semibold text-gray-900 dark:text-white">All Users</p>
//               <p className="text-[12px] text-gray-400 dark:text-gray-500">{users.length} registered accounts</p>
//             </div>
//           </div>

//           {usersLoading ? (
//             <div className="py-16 text-center text-gray-400 text-sm">Loading users…</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-[13.5px]">
//                 <thead>
//                   <tr className="bg-gray-50/70 dark:bg-gray-800/40">
//                     {['Name', 'Email', 'Currency', 'Verified', 'Status', 'Actions'].map(h => (
//                       <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
//                   {users.map((u, i) => (
//                     <motion.tr
//                       key={u.id}
//                       initial={{ opacity: 0, y: 4 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: i * 0.03 }}
//                       className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-150"
//                     >
//                       {/* Name */}
//                       <td className="px-5 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                             {u.fullName?.charAt(0).toUpperCase()}
//                           </div>
//                           <span className="font-semibold text-gray-900 dark:text-white">{u.fullName}</span>
//                         </div>
//                       </td>

//                       {/* Email */}
//                       <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>

//                       {/* Currency */}
//                       <td className="px-5 py-4">
//                         <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[12px] font-medium">
//                           {u.currency}
//                         </span>
//                       </td>

//                       {/* Verified */}
//                       <td className="px-5 py-4">
//                         {u.emailVerified ? (
//                           <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[12px] font-medium">
//                             <CheckCircle size={14} /> Verified
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1.5 text-gray-400 text-[12px] font-medium">
//                             <XCircle size={14} /> Unverified
//                           </span>
//                         )}
//                       </td>

//                       {/* Status badge */}
//                       <td className="px-5 py-4">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-wide ${
//                           u.enabled
//                             ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
//                             : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
//                         }`}>
//                           <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
//                           {u.enabled ? 'Active' : 'Disabled'}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-5 py-4">
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             onClick={() => toggleEnabled.mutate({ id: u.id, enabled: !u.enabled })}
//                             title={u.enabled ? 'Disable user' : 'Enable user'}
//                             className={`p-2 rounded-lg transition-all duration-150 ${
//                               u.enabled
//                                 ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
//                                 : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
//                             }`}
//                           >
//                             {u.enabled ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
//                           </button>
//                           <button
//                             onClick={() => deleteUser.mutate(u.id)}
//                             title="Delete user"
//                             className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
//                           >
//                             <Trash2 size={15} />
//                           </button>
//                         </div>
//                       </td>
//                     </motion.tr>
//                   ))}
//                 </tbody>
//               </table>
//               {users.length === 0 && (
//                 <div className="py-16 text-center text-gray-400 text-sm">No users found</div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Stats Tab ── */}
//       {tab === 'stats' && (
//         <div className="space-y-6">
//           {statsLoading ? (
//             <div className="py-16 text-center text-gray-400 text-sm">Loading stats…</div>
//           ) : stats ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//                 {[
//                   { label: 'Total Users',        value: stats.totalUsers,        icon: Users,        from: 'from-violet-500', to: 'to-purple-600',  light: 'bg-violet-50 dark:bg-violet-500/10', iconColor: 'text-violet-500' },
//                   { label: 'Total Transactions', value: stats.totalTransactions, icon: TrendingUp,   from: 'from-emerald-500', to: 'to-teal-600',   light: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-500' },
//                   { label: 'Total Categories',   value: stats.totalCategories,   icon: Tag,          from: 'from-blue-500',   to: 'to-cyan-600',    light: 'bg-blue-50 dark:bg-blue-500/10', iconColor: 'text-blue-500' },
//                   { label: 'Total Imports',      value: stats.totalImports,      icon: UploadIcon,   from: 'from-orange-500', to: 'to-amber-500',   light: 'bg-orange-50 dark:bg-orange-500/10', iconColor: 'text-orange-500' },
//                 ].map(({ label, value, icon: Icon, from, to, light, iconColor }, i) => (
//                   <motion.div
//                     key={label}
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.07 }}
//                     className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-4"
//                   >
//                     <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center`}>
//                       <Icon size={18} className={iconColor} />
//                     </div>
//                     <div>
//                       <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
//                       <p className="text-[30px] font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
//                         {value.toLocaleString()}
//                       </p>
//                     </div>
//                     <div className={`h-1 rounded-full bg-gradient-to-r ${from} ${to} opacity-70`} />
//                   </motion.div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div className="py-16 text-center text-gray-400 text-sm">No stats available</div>
//           )}
//         </div>
//       )}

//       {/* ── Import Logs Tab ── */}
//       {tab === 'imports' && (
//         <div className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//           {/* Card header */}
//           <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
//             <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
//               <BarChart3 size={15} className="text-blue-500" />
//             </div>
//             <div>
//               <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Import History</p>
//               <p className="text-[12px] text-gray-400 dark:text-gray-500">All CSV import activity across users</p>
//             </div>
//           </div>

//           {logsLoading ? (
//             <div className="py-16 text-center text-gray-400 text-sm">Loading import logs…</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-[13.5px]">
//                 <thead>
//                   <tr className="bg-gray-50/70 dark:bg-gray-800/40">
//                     {['User', 'File', 'Status', 'Imported', 'Skipped', 'Date', 'Error'].map(h => (
//                       <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
//                   {logs.map((log, i) => (
//                     <motion.tr
//                       key={log.id}
//                       initial={{ opacity: 0, y: 4 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: i * 0.03 }}
//                       className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors duration-150"
//                     >
//                       <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-[12.5px]">{log.userEmail}</td>
//                       <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-[160px] truncate font-medium">{log.fileName}</td>
//                       <td className="px-5 py-4">
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold ${
//                           log.status === 'COMPLETED'
//                             ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
//                             : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
//                         }`}>
//                           {log.status === 'COMPLETED'
//                             ? <CheckCircle size={11} />
//                             : <AlertCircle size={11} />}
//                           {log.status}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         <span className="font-semibold text-emerald-600 dark:text-emerald-400">{log.imported}</span>
//                       </td>
//                       <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{log.skipped}</td>
//                       <td className="px-5 py-4 text-gray-400 dark:text-gray-500 text-[12px] whitespace-nowrap">
//                         {new Date(log.importedAt).toLocaleString()}
//                       </td>
//                       <td className="px-5 py-4 text-red-500 text-[12px] max-w-[180px] truncate" title={log.errorMessage || ''}>
//                         {log.errorMessage || <span className="text-gray-300 dark:text-gray-600">—</span>}
//                       </td>
//                     </motion.tr>
//                   ))}
//                 </tbody>
//               </table>
//               {logs.length === 0 && (
//                 <div className="py-16 text-center text-gray-400 text-sm">No import history yet</div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Settings Tab ── */}
//       {tab === 'settings' && (
//         <div className="space-y-5">
//           <div className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
//             <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
//               <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-500/10 flex items-center justify-center">
//                 <Settings size={15} className="text-slate-500" />
//               </div>
//               <div>
//                 <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Platform Settings</p>
//                 <p className="text-[12px] text-gray-400 dark:text-gray-500">Configuration for the Finance Tracker platform</p>
//               </div>
//             </div>
//             <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
//               {[
//                 { icon: Mail,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-500/10',    label: 'Email Notifications',  desc: 'Budget alerts and system emails are sent via configured SMTP',  value: 'Enabled' },
//                 { icon: Shield,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'JWT Authentication', desc: 'Access tokens expire after 2 hours, refresh tokens after 7 days', value: 'Active' },
//                 { icon: Database, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-500/10',  label: 'Database',           desc: 'PostgreSQL — managed via Spring Data JPA with Hibernate ORM',    value: 'Connected' },
//                 { icon: Globe,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-500/10',  label: 'API',                desc: 'REST API served at /api — secured with role-based access control', value: 'Running' },
//               ].map(({ icon: Icon, color, bg, label, desc, value }) => (
//                 <div key={label} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors">
//                   <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
//                     <Icon size={16} className={color} />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[13.5px] font-semibold text-gray-900 dark:text-white">{label}</p>
//                     <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
//                   </div>
//                   <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
//                     {value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── About Tab ── */}
//       {tab === 'about' && (
//         <div className="space-y-6">

//           {/* Hero banner */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl"
//           >
//             {/* decorative circles */}
//             <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
//             <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
//             <div className="relative">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
//                   <TrendingUp size={22} className="text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-[22px] font-bold leading-tight">Finance Tracker</h2>
//                   <p className="text-white/60 text-[13px]">Personal Finance Management Platform</p>
//                 </div>
//               </div>
//               <p className="text-white/80 text-[14px] leading-relaxed max-w-2xl">
//                 A modern, full-stack web application designed to help individuals take full control of their financial life.
//                 Track every rupee, set smart budgets, and get notified before you overspend — all in one clean dashboard.
//               </p>
//               <div className="flex items-center gap-3 mt-5">
//                 <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[12px] font-semibold">v1.0.0</span>
//                 <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[12px] font-semibold">Spring Boot + React</span>
//                 <span className="px-3 py-1 rounded-full bg-emerald-400/25 text-emerald-200 text-[12px] font-semibold">● Live</span>
//               </div>
//             </div>
//           </motion.div>

//           {/* What this app does */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
//             className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6"
//           >
//             <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1">What is Finance Tracker?</h3>
//             <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5">A complete overview of the platform's purpose and capabilities</p>
//             <div className="space-y-4 text-[13.5px] text-gray-600 dark:text-gray-300 leading-relaxed">
//               <p>
//                 Finance Tracker was built to solve a simple but important problem — most people don't know where their money goes.
//                 This platform gives users a clear, real-time picture of their income and spending, organized by custom categories
//                 they define themselves.
//               </p>
//               <p>
//                 Users can create transactions, assign them to categories, and set monthly budgets per category. When spending
//                 reaches <span className="font-semibold text-amber-500">80% of a budget</span>, the system automatically sends
//                 an email alert — so users can course-correct before they overspend.
//               </p>
//               <p>
//                 For power users, bulk CSV import makes it easy to bring in historical data. Transactions can also be exported
//                 as CSV for spreadsheet analysis. Admins get a dedicated control panel to manage all registered users,
//                 view platform-wide statistics, and export full user reports as PDF or CSV.
//               </p>
//             </div>
//           </motion.div>

//           {/* Key features */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
//             className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6"
//           >
//             <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1">Key Features</h3>
//             <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5">Everything the platform offers, at a glance</p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {[
//                 { emoji: '💰', title: 'Income & Expense Tracking',  desc: 'Log every transaction with amount, date, category, and notes' },
//                 { emoji: '🗂️', title: 'Custom Categories',          desc: 'Create and manage your own spending categories with icons' },
//                 { emoji: '🎯', title: 'Monthly Budgets',            desc: 'Set per-category budgets and track progress in real time' },
//                 { emoji: '📧', title: 'Smart Email Alerts',         desc: 'Auto email when spending hits 80% of any budget limit' },
//                 { emoji: '📥', title: 'CSV Import',                 desc: 'Bulk-import historical transactions from any CSV file' },
//                 { emoji: '📤', title: 'CSV & PDF Export',           desc: 'Download your data anytime in CSV or PDF format' },
//                 { emoji: '🔐', title: 'Secure Authentication',      desc: 'JWT-based login with email verification and password reset' },
//                 { emoji: '🛡️', title: 'Admin Control Panel',        desc: 'Manage users, view stats, and export platform-wide reports' },
//               ].map(({ emoji, title, desc }) => (
//                 <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors">
//                   <span className="text-[20px] flex-shrink-0 mt-0.5">{emoji}</span>
//                   <div>
//                     <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{title}</p>
//                     <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Tech stack */}
//           <motion.div
//             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
//             className="bg-white dark:bg-[#0d1424] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6"
//           >
//             <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1">Tech Stack</h3>
//             <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5">Technologies powering this platform</p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {[
//                 { label: 'Frontend',  value: 'React 18 + TypeScript + Vite',      bar: 'from-cyan-500 to-blue-500' },
//                 { label: 'Styling',   value: 'Tailwind CSS + Framer Motion',       bar: 'from-violet-500 to-purple-500' },
//                 { label: 'Backend',   value: 'Spring Boot 3 + Spring Security',    bar: 'from-emerald-500 to-teal-500' },
//                 { label: 'Database',  value: 'PostgreSQL + Spring Data JPA',       bar: 'from-orange-500 to-amber-500' },
//                 { label: 'Auth',      value: 'JWT — Access + Refresh tokens',      bar: 'from-rose-500 to-pink-500' },
//                 { label: 'Email',     value: 'Spring Mail (SMTP) — budget alerts', bar: 'from-sky-500 to-indigo-500' },
//                 { label: 'CSV',       value: 'Spring Batch — bulk import/export',  bar: 'from-lime-500 to-green-500' },
//                 { label: 'PDF',       value: 'iText 7 — user data export',         bar: 'from-red-500 to-rose-500' },
//               ].map(({ label, value, bar }) => (
//                 <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
//                   <div className={`w-1 min-h-[38px] rounded-full bg-gradient-to-b ${bar} flex-shrink-0`} />
//                   <div>
//                     <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
//                     <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Footer */}
//           <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//             className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 pb-2"
//           >
//             <p className="text-[12px] text-gray-400 dark:text-gray-600">© 2026 Finance Tracker · All rights reserved</p>
//             <p className="text-[12px] text-gray-400 dark:text-gray-600">Crafted with ❤️ using Spring Boot + React</p>
//           </motion.div>

//         </div>
//       )}

//     </div>
//   )
// }



// import { useRef, useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { useSearchParams } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import {
//   Trash2, ShieldCheck, ShieldOff, CheckCircle, XCircle,
//   AlertCircle, Download, FileText, Users, BarChart3,
//   TrendingUp, Tag, Upload as UploadIcon,
//   Settings, Mail, Shield, Database, Globe,
// } from 'lucide-react'
// import { adminApi } from '@/lib/api'
// import { useToast } from '@/components/Toaster'

// // ... (Interfaces remain the same)

// export default function AdminPanel() {
//   const [searchParams] = useSearchParams()
//   const tab = (searchParams.get('tab') as Tab) || 'users'
//   const qc = useQueryClient()
//   const { show } = useToast()

//   // ... (Queries and Mutations remain the same)

//   return (
//     <div className="space-y-8 animate-fade-in text-slate-400">

//       {/* ── Page Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-[28px] font-black tracking-tighter text-white uppercase leading-tight">
//             System <span className="text-orange-500">Command</span>
//           </h1>
//           <p className="mt-1 text-[13px] font-medium text-slate-500 uppercase tracking-widest">
//             Platform governance & neural analytics
//           </p>
//         </div>

//         {/* Export buttons */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={handleExportAllPdf}
//             className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest
//               bg-white/5 text-white border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
//           >
//             <FileText size={14} className="group-hover:text-orange-500" />
//             Export PDF
//           </button>
//           <button
//             onClick={handleExportAllCsv}
//             className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest
//               bg-orange-500 text-black hover:bg-orange-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)]"
//           >
//             <Download size={14} />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

//       {/* ── Users Tab ── */}
//       {tab === 'users' && (
//         <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
//           <div className="flex items-center gap-4 px-8 py-6 border-b border-white/5 bg-white/[0.01]">
//             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
//               <Users size={18} className="text-orange-500" />
//             </div>
//             <div>
//               <p className="text-[14px] font-black text-white uppercase tracking-tight">Personnel Directory</p>
//               <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em]">{users.length} Active Nodes</p>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-[13px]">
//               <thead>
//                 <tr className="bg-black/40">
//                   {['User Node', 'Access Key', 'Currency', 'Status', 'Risk Level', 'Actions'].map(h => (
//                     <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/5">
//                 {users.map((u, i) => (
//                   <motion.tr
//                     key={u.id}
//                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
//                     className="group hover:bg-orange-500/[0.02] transition-colors"
//                   >
//                     <td className="px-8 py-5">
//                       <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-black text-xs font-black">
//                           {u.fullName?.charAt(0).toUpperCase()}
//                         </div>
//                         <span className="font-bold text-white tracking-tight">{u.fullName}</span>
//                       </div>
//                     </td>
//                     <td className="px-8 py-5 font-mono text-slate-500 text-[12px]">{u.email}</td>
//                     <td className="px-8 py-5">
//                       <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-bold">
//                         {u.currency}
//                       </span>
//                     </td>
//                     <td className="px-8 py-5">
//                       {u.emailVerified ? (
//                         <span className="flex items-center gap-1.5 text-orange-500 text-[11px] font-bold uppercase tracking-wider">
//                           <CheckCircle size={12} strokeWidth={3} /> Verified
//                         </span>
//                       ) : (
//                         <span className="text-slate-700 text-[11px] font-bold uppercase tracking-wider">Unverified</span>
//                       )}
//                     </td>
//                     <td className="px-8 py-5">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                         u.enabled 
//                           ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
//                           : 'bg-red-500/10 text-red-500 border border-red-500/20'
//                       }`}>
//                         {u.enabled ? 'Operational' : 'Restricted'}
//                       </span>
//                     </td>
//                     <td className="px-8 py-5">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => toggleEnabled.mutate({ id: u.id, enabled: !u.enabled })}
//                           className="p-2 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-black transition-all"
//                         >
//                           {u.enabled ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
//                         </button>
//                         <button
//                           onClick={() => deleteUser.mutate(u.id)}
//                           className="p-2 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white transition-all"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ── Stats Tab ── */}
//       {tab === 'stats' && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             { label: 'Total Nodes', value: stats?.totalUsers, icon: Users },
//             { label: 'Network Throughput', value: stats?.totalTransactions, icon: TrendingUp },
//             { label: 'Data Clusters', value: stats?.totalCategories, icon: Tag },
//             { label: 'Relay Ingress', value: stats?.totalImports, icon: UploadIcon },
//           ].map((s, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//               className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
//             >
//               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors" />
//               <s.icon className="text-orange-500 mb-6" size={24} />
//               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-1">{s.label}</p>
//               <p className="text-4xl font-black text-white tracking-tighter">
//                 {s.value?.toLocaleString()}<span className="text-orange-500">.</span>
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* ── Settings Tab ── */}
//       {tab === 'settings' && (
//         <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
//           <div className="px-8 py-8 border-b border-white/5">
//              <h3 className="text-white font-black uppercase tracking-tight text-lg">System Configuration</h3>
//           </div>
//           <div className="divide-y divide-white/5">
//             {[
//               { icon: Mail, label: 'Neural Alerts', desc: 'SMTP Relay Protocol', value: 'Online' },
//               { icon: Shield, label: 'Access Control', desc: 'JWT Encrypted Tunnels', value: 'Secure' },
//               { icon: Database, label: 'Data Core', desc: 'PostgreSQL Mainframe', value: 'Stable' },
//             ].map((set, i) => (
//               <div key={i} className="flex items-center justify-between px-8 py-6 hover:bg-white/[0.01]">
//                 <div className="flex items-center gap-5">
//                   <div className="p-3 bg-white/5 rounded-2xl">
//                     <set.icon size={20} className="text-orange-500" />
//                   </div>
//                   <div>
//                     <p className="text-white font-bold text-sm uppercase tracking-tight">{set.label}</p>
//                     <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">{set.desc}</p>
//                   </div>
//                 </div>
//                 <span className="text-[10px] font-black text-orange-500 border border-orange-500/20 bg-orange-500/5 px-3 py-1 rounded-full uppercase tracking-tighter">
//                   {set.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trash2, ShieldCheck, ShieldOff, CheckCircle, XCircle,
  AlertCircle, Download, FileText, Users as UsersIcon, BarChart3,
  TrendingUp, Tag, Upload as UploadIcon,
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useToast } from '@/components/Toaster'

// ── TYPE DEFINITIONS (Fixes "Cannot find name" errors) ──
interface AdminUser {
  id: number
  email: string
  fullName: string
  currency: string
  role: string
  enabled: boolean
  emailVerified: boolean
}

interface AdminStats {
  totalUsers: number
  totalTransactions: number
  totalCategories: number
  totalImports: number
}

interface ImportLog {
  id: number
  userId: number
  userEmail: string
  fileName: string
  status: string
  imported: number
  skipped: number
  errorMessage: string | null
  importedAt: string
}

type Tab = 'users' | 'stats' | 'imports' | 'settings' | 'about'

export default function AdminPanel() {
  const [searchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as Tab) || 'users'
  const qc = useQueryClient()
  const { show } = useToast()

  // ── Queries ──
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: tab === 'users',
  })

  const { data: statsRes } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: tab === 'stats',
  })

  const { data: logsRes } = useQuery({
    queryKey: ['admin-imports'],
    queryFn: () => adminApi.getImportLogs(),
    enabled: tab === 'imports',
  })

  const users: AdminUser[] = usersRes?.data?.data || []
  const stats: AdminStats | null = statsRes?.data?.data || null
  const logs: ImportLog[] = logsRes?.data?.data || []

  const importFileRef = useRef<HTMLInputElement>(null)
  const [importingUserId, setImportingUserId] = useState<number | null>(null)

  // ── Mutations & Handlers ──
  const toggleEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      adminApi.setEnabled(id, enabled),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      show(vars.enabled ? 'User enabled' : 'User disabled', vars.enabled ? 'success' : 'warning')
    },
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      show('User deleted', 'warning')
    },
  })

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAllCsv = async () => {
    const res = await adminApi.exportAllUsersCsv()
    downloadBlob(new Blob([res.data], { type: 'text/csv' }), 'all_users.csv')
  }

  const handleExportAllPdf = async () => {
    const res = await adminApi.exportAllUsersPdf()
    downloadBlob(new Blob([res.data], { type: 'application/pdf' }), 'all_users.pdf')
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-400">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* SYSTEM NAME IN SOLID BLACK */}
          <h1 className="text-[32px] font-[1000] tracking-tighter text-black uppercase leading-tight">
            System <span className="text-orange-600">Command</span>
          </h1>
          <p className="mt-1 text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Central Intelligence Terminal
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* EXPORT PDF IN BLACK */}
          <button
            onClick={handleExportAllPdf}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest
              bg-slate-200 text-black border-2 border-slate-300 hover:bg-white transition-all active:scale-95"
          >
            <FileText size={14} className="text-black" />
            Export PDF
          </button>
          
          <button
            onClick={handleExportAllCsv}
            className="bg-orange-500 text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-lg"
          >
            <Download size={14} className="inline mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <input ref={importFileRef} type="file" accept=".csv" className="hidden" />

      {/* ── Main Dashboard Content ── */}
      {tab === 'users' && (
        <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 bg-black/20">
            <p className="text-[14px] font-black text-white uppercase tracking-tight">Personnel Stream</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-black/40">
                  {['User', 'Email', 'Currency', 'Security', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-orange-500/[0.03]">
                    <td className="px-8 py-5 font-bold text-white">{u.fullName}</td>
                    <td className="px-8 py-5 font-mono text-slate-500">{u.email}</td>
                    <td className="px-8 py-5 text-slate-400">{u.currency}</td>
                    <td className="px-8 py-5">
                      <span className={u.emailVerified ? "text-orange-500 font-bold" : "text-slate-700"}>
                        {u.emailVerified ? "SECURE" : "UNVERIFIED"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${u.enabled ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                        {u.enabled ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td className="px-8 py-5 flex gap-2">
                      <button onClick={() => toggleEnabled.mutate({ id: u.id, enabled: !u.enabled })} className="hover:text-orange-500"><ShieldCheck size={16}/></button>
                      <button onClick={() => deleteUser.mutate(u.id)} className="hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Stats Tab ── */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Network Nodes', value: stats?.totalUsers },
            { label: 'Transactions', value: stats?.totalTransactions },
            { label: 'Data Clusters', value: stats?.totalCategories },
            { label: 'Relay Ingress', value: stats?.totalImports },
          ].map((s, i) => (
            <div key={i} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-3xl font-black text-white">{s.value || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
