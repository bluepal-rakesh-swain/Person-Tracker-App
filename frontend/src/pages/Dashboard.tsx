import { useQuery } from '@tanstack/react-query'
import { dashboardApi, transactionApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatMoney, currentMonthYear, currentYear, formatMonthYear, formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import type { DashboardSummary, MonthlyChartData, CategoryChartData, Transaction } from '@/types'

const PIE_COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6']

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, bg, currency, icon }: {
  label: string; value: number | string; sub?: string; bg: string; currency?: string; icon?: string
}) {
  const display = typeof value === 'number' && currency
    ? formatMoney(value, currency)
    : String(value)
  return (
    <div className={`rounded-xl p-5 text-white relative overflow-hidden ${bg} shadow-md`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono tabular-nums leading-tight">{display}</p>
      {sub && (
        <p className="text-xs mt-1.5 opacity-75 flex items-center gap-1">
          <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-b-[6px] border-l-transparent border-r-transparent border-b-white/70" />
          {sub}
        </p>
      )}
      {icon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-20 select-none">{icon}</div>
      )}
      <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />
    </div>
  )
}

// ── Area Tooltip ──────────────────────────────────────────────────────────────
// ── Donut Tooltip ─────────────────────────────────────────────────────────────
const DonutTooltip = ({ active, payload, currency }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold mb-0.5" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="font-mono text-gray-700 dark:text-gray-300">{formatMoney(d.value, currency)}</p>
      <p className="text-gray-400">{d.payload.percent?.toFixed(1)}%</p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const currency = user?.currency || 'INR'
  const monthYear = currentMonthYear()
  const year = currentYear()

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
  })
  const { data: monthlyRes } = useQuery({
    queryKey: ['dashboard-monthly', year],
    queryFn: () => dashboardApi.getMonthlyChart(year),
    staleTime: 0,
  })
  const { data: categoryRes } = useQuery({
    queryKey: ['dashboard-categories', monthYear],
    queryFn: () => dashboardApi.getCategoryChart(monthYear),
  })
  const { data: txRes } = useQuery({
    queryKey: ['transactions-recent'],
    queryFn: () => transactionApi.getAll(),
    staleTime: 0,
  })

  const summary: DashboardSummary | undefined = summaryRes?.data?.data
  const monthlyData: MonthlyChartData[] = monthlyRes?.data?.data || []
  const categoryData: CategoryChartData[] = categoryRes?.data?.data || []
  const allTx: Transaction[] = txRes?.data?.data || []
  const recentTx = allTx.slice(0, 5)

  const totalForPie = categoryData.reduce((s, d) => s + d.total, 0)
  const pieData = categoryData.map((d, i) => ({
    name: d.categoryName,
    value: d.total,
    color: d.color || PIE_COLORS[i % PIE_COLORS.length],
    percent: totalForPie > 0 ? (d.total / totalForPie) * 100 : 0,
  }))

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Build full 12-month expense data — months with no data default to 0
  const monthlyMap = Object.fromEntries(monthlyData.map(d => [d.month.slice(5), d.expense]))
  const barData = MONTH_NAMES.map((name, i) => {
    const key = String(i + 1).padStart(2, '0')
    return { month: name, Expense: monthlyMap[key] ?? 0 }
  })

  const topCategories = [...categoryData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const savingsRate = summary && summary.totalIncome > 0
    ? Math.round((summary.netBalance / summary.totalIncome) * 100)
    : 0

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Stat Cards ── */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl animate-pulse bg-gray-200 dark:bg-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Income"
            value={summary?.totalIncome ?? 0}
            currency={currency}
            sub="This month"
            bg="bg-[#26c6a2]"
            icon="💰"
          />
          <StatCard
            label="Total Expenses"
            value={summary?.totalExpenses ?? 0}
            currency={currency}
            sub="This month"
            bg="bg-[#7c6fcd]"
            icon="🛒"
          />
          <StatCard
            label="Net Balance"
            value={summary?.netBalance ?? 0}
            currency={currency}
            sub="Income − Expenses"
            bg="bg-[#2196f3]"
            icon="📊"
          />
          <StatCard
            label="Savings Rate"
            value={`${savingsRate}%`}
            sub="Of income saved"
            bg="bg-[#f4845f]"
            icon="🎯"
          />
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Monthly Spending Bar Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Monthly Spending — {year}</h2>
          </div>
          {barData.every(d => d.Expense === 0) ? (
            <div className="h-56 flex flex-col items-center justify-center gap-3 text-gray-400">
              <p className="text-sm">No transactions this year yet</p>
              <button onClick={() => navigate('/transactions')} className="text-xs px-4 py-1.5 rounded-lg bg-[#26c6a2] text-white hover:opacity-90 transition-opacity">+ Add Transaction</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatMoney(v, currency)} width={72} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [formatMoney(value, currency), 'Expense']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="Expense" fill="#7c6fcd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic / Category Donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Spending by Category</h2>
          <p className="text-xs text-gray-400 mb-3">{formatMonthYear(monthYear)}</p>
          {pieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400 py-8">
              <p className="text-sm">No expenses this month</p>
              <button onClick={() => navigate('/transactions')} className="text-xs px-3 py-1 rounded-lg bg-[#7c6fcd] text-white hover:opacity-90 transition-opacity">+ Add Expense</button>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {pieData.slice(0, 4).map((d) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Activity</h2>
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
              <p className="text-sm">No transactions yet</p>
              <button onClick={() => navigate('/transactions')} className="text-xs px-4 py-1.5 rounded-lg bg-[#26c6a2] text-white hover:opacity-90 transition-opacity">+ Add your first transaction</button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentTx.map(tx => (
                <li key={tx.id} className="flex items-start gap-3">
                  <span className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${tx.type === 'INCOME' ? 'bg-[#26c6a2]' : 'bg-[#f4845f]'}`}>
                    {tx.type === 'INCOME' ? '↑' : '↓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {tx.description || tx.categoryName}
                    </p>
                    <p className="text-xs text-gray-400">{tx.categoryName} · {formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold font-mono flex-shrink-0 ${tx.type === 'INCOME' ? 'text-[#26c6a2]' : 'text-[#f4845f]'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Categories</h2>
          {topCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-400">
              <p className="text-sm">No data this month</p>
              <button onClick={() => navigate('/categories')} className="text-xs px-4 py-1.5 rounded-lg bg-[#f4845f] text-white hover:opacity-90 transition-opacity">+ Set up categories</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left pb-2 font-medium">Category</th>
                  <th className="text-right pb-2 font-medium">Amount</th>
                  <th className="text-right pb-2 font-medium">Share</th>
                  <th className="text-right pb-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {topCategories.map((c, i) => {
                  const color = c.color || PIE_COLORS[i % PIE_COLORS.length]
                  const share = totalForPie > 0 ? ((c.total / totalForPie) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>
                            {c.categoryName.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[120px]">{c.categoryName}</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-700 dark:text-gray-200">{formatMoney(c.total, currency)}</td>
                      <td className="py-2.5 text-right text-gray-500 dark:text-gray-400">{share}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${c.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'}`}>
                          {c.type === 'INCOME' ? 'In' : 'Out'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
