import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, BarChart3, FileText, Trash2, ShieldCheck, ShieldOff, UserCog, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { adminApi } from '@/lib/api'

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

type Tab = 'users' | 'stats' | 'imports'

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('users')
  const qc = useQueryClient()

  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: tab === 'users',
  })

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: tab === 'stats',
  })

  const { data: logsRes, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-imports'],
    queryFn: () => adminApi.getImportLogs(),
    enabled: tab === 'imports',
  })

  const users: AdminUser[] = usersRes?.data?.data || []
  const stats: AdminStats | null = statsRes?.data?.data || null
  const logs: ImportLog[] = logsRes?.data?.data || []

  const toggleEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      adminApi.setEnabled(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.changeRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const tabs = [
    { id: 'users' as Tab,   label: 'Users',            icon: Users },
    { id: 'stats' as Tab,   label: 'Platform Stats',   icon: BarChart3 },
    { id: 'imports' as Tab, label: 'CSV Import Logs',  icon: FileText },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users, monitor platform, and view import history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="card-base overflow-hidden">
          {usersLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading users…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Name', 'Email', 'Currency', 'Role', 'Verified', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.currency}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={e => changeRole.mutate({ id: u.id, role: e.target.value })}
                          className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {u.emailVerified
                          ? <CheckCircle size={16} className="text-emerald-500" />
                          : <XCircle size={16} className="text-gray-400" />}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.enabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                        }`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEnabled.mutate({ id: u.id, enabled: !u.enabled })}
                            title={u.enabled ? 'Disable user' : 'Enable user'}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            {u.enabled ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete ${u.email}?`)) deleteUser.mutate(u.id) }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No users found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div>
          {statsLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading stats…</div>
          ) : stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',        value: stats.totalUsers,        color: 'from-teal-500 to-emerald-500' },
                { label: 'Total Transactions', value: stats.totalTransactions, color: 'from-purple-500 to-indigo-500' },
                { label: 'Total Categories',   value: stats.totalCategories,   color: 'from-blue-500 to-cyan-500' },
                { label: 'Total Imports',      value: stats.totalImports,      color: 'from-orange-500 to-amber-500' },
              ].map(({ label, value, color }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
                  <p className="text-sm font-medium opacity-80">{label}</p>
                  <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">No stats available</div>
          )}
        </div>
      )}

      {/* Import Logs Tab */}
      {tab === 'imports' && (
        <div className="card-base overflow-hidden">
          {logsLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading import logs…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['User', 'File', 'Status', 'Imported', 'Skipped', 'Date', 'Error'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{log.userEmail}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[140px] truncate">{log.fileName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                        }`}>
                          {log.status === 'COMPLETED'
                            ? <CheckCircle size={11} />
                            : <AlertCircle size={11} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">{log.imported}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{log.skipped}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(log.importedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-red-500 text-xs max-w-[180px] truncate" title={log.errorMessage || ''}>
                        {log.errorMessage || '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No import history yet</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
