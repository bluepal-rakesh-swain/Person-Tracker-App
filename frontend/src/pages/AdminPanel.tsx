

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
            FINANCE <span className="text-orange-600">DASHBOARD</span>
          </h1>
          <p className="mt-1 text-[12px] font-black text-slate-500 uppercase tracking-[0.3em]">
            CENTRAL FINANCE TERMINAL
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
