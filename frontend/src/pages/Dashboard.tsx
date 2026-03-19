import { useState } from 'react'
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

function StatCard({ label, value, sub, bg, currency, icon }: {
  label: string; value: number | string; sub?: string; bg: string; currency?: string; icon?: string
}) {
  const display = typeof value === 'number' && currency
    ? formatMoney(value, currency)
    : String(value)
  return (
    <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${bg} shadow-lg`}>
      <p className="text-[11px] font-bold uppercase tracking-widest opacity-75 mb-2">{label}</p>
      <p className="text-[26px] font-bold font-mono tabular-nums leading-tight">{display}</p>
      {sub && (
        <p className="text-[12px] mt-2 opacity-70 flex items-center gap-1.5">
          <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-b-[6px] border-l-transparent border-r-transparent border-b-white/70" />
          {sub}
        </p>
      )}
      {icon && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[42px] opacity-15 select-none">{icon}</div>
      )}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -right-1 -bottom-8 w-12 h-12 rounded-full bg-white/5" />
    </div>
  )
}

const DonutTooltip = ({ active, payload, currency }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-semibold mb-1" style={{ color: d.payload.color }}>{d.name}</p>
      <p className="font-mono text-gray-700 dark:text-gray-300">{formatMoney(d.value, currency)}</p>
      <p className="text-gray-400 mt-0.5">{d.payload.percent?.toFixed(1)}%</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const currency = user?.currency || 'INR'
  const [selectedYear, setSelectedYear] = useState<number>(currentYear())
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYear())

  const YEAR_OPTIONS = (() => {
    const years: number[] = []
    for (let y = 2001; y <= 2030; y++) years.push(y)
    return years
  })()
  const MONTH_OPTIONS = (() => {
    const opts: { label: string; value: string }[] = []
    const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    for (let y = 2030; y >= 2001; y--) {
      for (let m = 11; m >= 0; m--) {
        const val = `${y}-${String(m + 1).padStart(2, '0')}`
        opts.push({ label: `${mNames[m]} ${y}`, value: val })
      }
    }
    return opts
  })()

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 0,
    refetchOnMount: true,
  })
  const { data: monthlyRes } = useQuery({
    queryKey: ['dashboard-monthly', selectedYear],
    queryFn: () => dashboardApi.getMonthlyChart(selectedYear),
    staleTime: 0,
  })
  const { data: categoryRes } = useQuery({
    queryKey: ['dashboard-categories', selectedMonth],
    queryFn: () => dashboardApi.getCategoryChart(selectedMonth),
    staleTime: 0,
  })
  const { data: txRes } = useQuery({
    queryKey: ['transactions-recent'],
    queryFn: () => transactionApi.getAll(),
    staleTime: 0,
    refetchOnMount: true,
  })

  const summary: DashboardSummary | undefined = summaryRes?.data?.data
  const monthlyData: MonthlyChartData[] = monthlyRes?.data?.data || []
  const categoryData: CategoryChartData[] = categoryRes?.data?.data || []
  const allTx: Transaction[] = txRes?.data?.data || []
  const recentTx = allTx.slice(0, 5)

  // Yearly totals derived from monthly chart data (already fetched for selectedYear)
  const yearlyIncome = monthlyData.reduce((s, d) => s + (d.income ?? 0), 0)
  const yearlyExpense = monthlyData.reduce((s, d) => s + (d.expense ?? 0), 0)
  const yearlyNet = yearlyIncome - yearlyExpense
  const yearlySavingsRate = yearlyIncome > 0 ? Math.round((yearlyNet / yearlyIncome) * 100) : 0

  const totalForPie = categoryData.reduce((s, d) => s + d.total, 0)
  const pieData = categoryData.map((d, i) => ({
    name: d.categoryName,
    value: d.total,
    color: d.color || PIE_COLORS[i % PIE_COLORS.length],
    percent: totalForPie > 0 ? (d.total / totalForPie) * 100 : 0,
  }))

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyMap = Object.fromEntries(monthlyData.map(d => [d.month.slice(5), d.expense]))
  const barData = MONTH_NAMES.map((name, i) => {
    const key = String(i + 1).padStart(2, '0')
    return { month: name, Expense: monthlyMap[key] ?? 0 }
  })

  const topCategories = [...categoryData].sort((a, b) => b.total - a.total).slice(0, 5)

  const savingsRate = yearlySavingsRate

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Stat Cards ── */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Income"   value={yearlyIncome}   currency={currency} sub={`Year ${selectedYear}`}       bg="bg-gradient-to-br from-emerald-500 to-teal-600"   icon="💰" />
          <StatCard label="Total Expenses" value={yearlyExpense}  currency={currency} sub={`Year ${selectedYear}`}       bg="bg-gradient-to-br from-violet-500 to-indigo-600"  icon="🛒" />
          <StatCard label="Net Balance"    value={yearlyNet}      currency={currency} sub="Income − Expenses"            bg="bg-gradient-to-br from-blue-500 to-cyan-600"      icon="📊" />
          <StatCard label="Savings Rate"   value={`${savingsRate}%`}                  sub="Of income saved"              bg="bg-gradient-to-br from-orange-500 to-rose-500"    icon="🎯" />
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Monthly Bar Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Monthly Spending</h2>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Expenses across {selectedYear}</p>
            </div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="min-w-[110px] text-[13px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
            >
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {barData.every(d => d.Expense === 0) ? (
            <div className="h-56 flex flex-col items-center justify-center gap-3 text-gray-400">
              <p className="text-sm">No transactions this year yet</p>
              <button onClick={() => navigate('/transactions')}
                className="text-xs px-4 py-2 rounded-xl gradient-brand text-white hover:opacity-90 transition-opacity font-medium">
                + Add Transaction
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatMoney(v, currency)} width={72} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [formatMoney(value, currency), 'Expense']}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="Expense" fill="#7c6fcd" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Spending by Category</h2>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="min-w-[130px] text-[12px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer shadow-sm hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
              >
                {MONTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{formatMonthYear(selectedMonth)}</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-8">
              <p className="text-sm">No expenses this month</p>
              <button onClick={() => navigate('/transactions')}
                className="text-xs px-3 py-2 rounded-xl bg-violet-500 text-white hover:opacity-90 transition-opacity font-medium">
                + Add Expense
              </button>
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
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                {pieData.slice(0, 4).map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-[11.5px] text-gray-500 dark:text-gray-400">
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
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Your latest transactions</p>
            </div>
          </div>
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
              <p className="text-sm">No transactions yet</p>
              <button onClick={() => navigate('/transactions')}
                className="text-xs px-4 py-2 rounded-xl gradient-brand text-white hover:opacity-90 transition-opacity font-medium">
                + Add your first transaction
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentTx.map(tx => (
                <li key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-sm ${tx.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {tx.type === 'INCOME' ? '↑' : '↓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {tx.description || tx.categoryName}
                    </p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">{tx.categoryName} · {formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-[13.5px] font-bold font-mono flex-shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="mb-5">
            <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Top Categories</h2>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Highest spending this month</p>
          </div>
          {topCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
              <p className="text-sm">No data this month</p>
              <button onClick={() => navigate('/categories')}
                className="text-xs px-4 py-2 rounded-xl bg-rose-500 text-white hover:opacity-90 transition-opacity font-medium">
                + Set up categories
              </button>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Category','Amount','Share','Type'].map(h => (
                    <th key={h} className={`pb-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${h === 'Category' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {topCategories.map((c, i) => {
                  const color = c.color || PIE_COLORS[i % PIE_COLORS.length]
                  const share = totalForPie > 0 ? ((c.total / totalForPie) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3">
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>
                            {c.categoryName.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[110px]">{c.categoryName}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-gray-800 dark:text-gray-200">{formatMoney(c.total, currency)}</td>
                      <td className="py-3 text-right text-gray-400 dark:text-gray-500">{share}%</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'}`}>
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



// import { useQuery } from '@tanstack/react-query'
// import { dashboardApi, transactionApi } from '@/lib/api'
// import { useAuth } from '@/contexts/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { formatMoney, currentMonthYear, currentYear, formatMonthYear, formatDate } from '@/lib/utils'
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts'
// import type { DashboardSummary, MonthlyChartData, CategoryChartData, Transaction } from '@/types'
// import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Target } from 'lucide-react'

// const PIE_COLORS = ['#f97316', '#000000', '#475569', '#94a3b8', '#fb923c', '#0f172a']

// function StatCard({ label, value, sub, bg, currency, icon: Icon }: {
//   label: string; value: number | string; sub?: string; bg: string; currency?: string; icon?: any
// }) {
//   const display = typeof value === 'number' && currency
//     ? formatMoney(value, currency)
//     : String(value)
//   return (
//     <motion.div 
//       whileHover={{ y: -5 }}
//       className={`rounded-[2rem] p-8 text-white relative overflow-hidden ${bg} shadow-2xl border border-white/10`}
//     >
//       <div className="relative z-10">
//         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-3">{label}</p>
//         <p className="text-3xl font-[1000] tracking-tighter leading-none mb-4">{display}</p>
//         {sub && (
//           <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-black/20 w-fit border border-white/5">
//             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
//             <p className="text-[10px] font-bold uppercase tracking-widest text-white/90">{sub}</p>
//           </div>
//         )}
//       </div>
//       {Icon && (
//         <div className="absolute right-6 top-8 text-white/10 group-hover:text-white/20 transition-colors">
//           <Icon size={64} strokeWidth={3} />
//         </div>
//       )}
//       {/* Cinematic Glass Effect */}
//       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
//     </motion.div>
//   )
// }

// const CustomTooltip = ({ active, payload, currency }: any) => {
//   if (!active || !payload?.length) return null
//   return (
//     <div className="bg-black border border-white/10 rounded-2xl p-4 shadow-2xl">
//       <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
//         {payload[0].payload.month || payload[0].name}
//       </p>
//       <p className="text-lg font-black text-white">{formatMoney(payload[0].value, currency)}</p>
//     </div>
//   )
// }

// export default function Dashboard() {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const currency = user?.currency || 'INR'
//   const monthYear = currentMonthYear()
//   const year = currentYear()

//   const { data: summaryRes, isLoading: loadingSummary } = useQuery({
//     queryKey: ['dashboard-summary'],
//     queryFn: () => dashboardApi.getSummary(),
//   })
  
//   const { data: monthlyRes } = useQuery({
//     queryKey: ['dashboard-monthly', year],
//     queryFn: () => dashboardApi.getMonthlyChart(year),
//   })

//   const { data: categoryRes } = useQuery({
//     queryKey: ['dashboard-categories', monthYear],
//     queryFn: () => dashboardApi.getCategoryChart(monthYear),
//   })

//   const { data: txRes } = useQuery({
//     queryKey: ['transactions-recent'],
//     queryFn: () => transactionApi.getAll(),
//   })

//   const summary: DashboardSummary | undefined = summaryRes?.data?.data
//   const monthlyData: MonthlyChartData[] = monthlyRes?.data?.data || []
//   const categoryData: CategoryChartData[] = categoryRes?.data?.data || []
//   const allTx: Transaction[] = txRes?.data?.data || []
//   const recentTx = allTx.slice(0, 5)

//   const totalForPie = categoryData.reduce((s, d) => s + d.total, 0)
//   const pieData = categoryData.map((d, i) => ({
//     name: d.categoryName,
//     value: d.total,
//     color: d.color || PIE_COLORS[i % PIE_COLORS.length],
//   }))

//   const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
//   const monthlyMap = Object.fromEntries(monthlyData.map(d => [d.month.slice(5), d.expense]))
//   const barData = MONTH_NAMES.map((name, i) => {
//     const key = String(i + 1).padStart(2, '0')
//     return { month: name, Expense: monthlyMap[key] ?? 0 }
//   })

//   const savingsRate = summary && summary.totalIncome > 0
//     ? Math.round((summary.netBalance / summary.totalIncome) * 100)
//     : 0

//   return (
//     <div className="space-y-8 max-w-[1600px] mx-auto">
      
//       {/* ── HEADER ── */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
//             Control <span className="text-orange-500">Room</span>
//           </h1>
//           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Operational Analytics • {year}</p>
//         </div>
//         <button 
//           onClick={() => navigate('/transactions')}
//           className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95"
//         >
//           + Initialize Transaction
//         </button>
//       </div>

//       {/* ── STATS ── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//         {loadingSummary ? (
//           [1,2,3,4].map(i => <div key={i} className="h-40 rounded-[2rem] animate-pulse bg-gray-100" />)
//         ) : (
//           <>
//             <StatCard label="Inflow" value={summary?.totalIncome ?? 0} currency={currency} sub="Revenue" bg="bg-black" icon={ArrowUpRight} />
//             <StatCard label="Outflow" value={summary?.totalExpenses ?? 0} currency={currency} sub="Expenditure" bg="bg-orange-500" icon={ArrowDownRight} />
//             <StatCard label="Net Asset" value={summary?.netBalance ?? 0} currency={currency} sub="Liquidity" bg="bg-slate-900" icon={Activity} />
//             <StatCard label="Efficiency" value={`${savingsRate}%`} sub="Savings Rate" bg="bg-orange-600" icon={Target} />
//           </>
//         )}
//       </div>

//       {/* ── CHARTS ── */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//         {/* Main Spending Bar Chart */}
//         <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-[12px] font-black text-black uppercase tracking-[0.3em]">Capital Distribution</h2>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-orange-500" />
//               <span className="text-[10px] font-black uppercase text-slate-400">Monthly Expense</span>
//             </div>
//           </div>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
//               <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
//               <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
//               <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip currency={currency} />} />
//               <Bar dataKey="Expense" fill="#000000" radius={[12, 12, 4, 4]} barSize={32} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Category Donut */}
//         <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
//           <h2 className="text-[12px] font-black text-white/50 uppercase tracking-[0.3em] mb-8">Cluster Analysis</h2>
//           <div className="relative h-[250px]">
//              <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" strokeWidth={0}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                   <Tooltip content={<CustomTooltip currency={currency} />} />
//                 </PieChart>
//              </ResponsiveContainer>
//              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Total</p>
//                 <p className="text-xl font-black text-white">{formatMoney(totalForPie, currency)}</p>
//              </div>
//           </div>
//           <div className="mt-6 space-y-3">
//              {pieData.slice(0, 3).map((d) => (
//                 <div key={d.name} className="flex items-center justify-between">
//                    <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
//                       <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">{d.name}</span>
//                    </div>
//                    <span className="text-[10px] font-mono font-bold text-white">{formatMoney(d.value, currency)}</span>
//                 </div>
//              ))}
//           </div>
//         </div>
//       </div>

//       {/* ── RECENT ACTIVITY TABLE ── */}
//       <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-[12px] font-black text-black uppercase tracking-[0.3em]">Latest Protocols</h2>
//           <button onClick={() => navigate('/transactions')} className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">View Ledger</button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-50">
//                 <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
//                 <th className="pb-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cluster</th>
//                 <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
//                 <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {recentTx.map(tx => (
//                 <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
//                   <td className="py-5">
//                     <div className="flex items-center gap-4">
//                       <div className={cn(
//                         "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
//                         tx.type === 'INCOME' ? "bg-orange-500/10 text-orange-500" : "bg-black text-white"
//                       )}>
//                         {tx.type === 'INCOME' ? 'IN' : 'OUT'}
//                       </div>
//                       <span className="text-[13px] font-black text-black uppercase tracking-tight">{tx.description || tx.categoryName}</span>
//                     </div>
//                   </td>
//                   <td className="py-5 text-[11px] font-bold text-slate-500 uppercase">{tx.categoryName}</td>
//                   <td className="py-5 text-right text-[11px] font-bold text-slate-400 uppercase">{formatDate(tx.date)}</td>
//                   <td className={cn(
//                     "py-5 text-right font-mono font-black text-sm",
//                     tx.type === 'INCOME' ? "text-orange-500" : "text-black"
//                   )}>
//                     {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, currency)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }



// import { useQuery } from '@tanstack/react-query'
// import { dashboardApi, transactionApi } from '@/lib/api'
// import { useAuth } from '@/contexts/AuthContext'
// import { useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { formatMoney, currentMonthYear, currentYear, formatMonthYear, formatDate } from '@/lib/utils'
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts'
// import type { DashboardSummary, MonthlyChartData, CategoryChartData, Transaction } from '@/types'
// import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Target } from 'lucide-react'
// import { clsx, type ClassValue } from 'clsx'
// import { twMerge } from 'tailwind-merge'

// /** * Utility to merge tailwind classes (Fixes "Cannot find name 'cn'")
//  * Note: Requires 'npm install clsx tailwind-merge'
//  */
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// const PIE_COLORS = ['#f97316', '#000000', '#475569', '#94a3b8', '#fb923c', '#0f172a']

// function StatCard({ label, value, sub, bg, currency, icon: Icon }: {
//   label: string; value: number | string; sub?: string; bg: string; currency?: string; icon?: any
// }) {
//   const display = typeof value === 'number' && currency
//     ? formatMoney(value, currency)
//     : String(value)
//   return (
//     <motion.div 
//       whileHover={{ y: -5 }}
//       className={cn(
//         "rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/10 group",
//         bg
//       )}
//     >
//       <div className="relative z-10">
//         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-3">{label}</p>
//         <p className="text-3xl font-[1000] tracking-tighter leading-none mb-4">{display}</p>
//         {sub && (
//           <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-black/20 w-fit border border-white/5">
//             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
//             <p className="text-[10px] font-bold uppercase tracking-widest text-white/90">{sub}</p>
//           </div>
//         )}
//       </div>
//       {Icon && (
//         <div className="absolute right-6 top-8 text-white/10 group-hover:text-white/20 transition-colors duration-500">
//           <Icon size={64} strokeWidth={3} />
//         </div>
//       )}
//       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
//     </motion.div>
//   )
// }

// const CustomTooltip = ({ active, payload, currency }: any) => {
//   if (!active || !payload?.length) return null
//   return (
//     <div className="bg-black border border-white/10 rounded-2xl p-4 shadow-2xl">
//       <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">
//         {payload[0].payload.month || payload[0].name}
//       </p>
//       <p className="text-lg font-black text-white">{formatMoney(payload[0].value, currency)}</p>
//     </div>
//   )
// }

// export default function Dashboard() {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const currency = user?.currency || 'INR'
//   const monthYear = currentMonthYear()
//   const year = currentYear()

//   const { data: summaryRes, isLoading: loadingSummary } = useQuery({
//     queryKey: ['dashboard-summary'],
//     queryFn: () => dashboardApi.getSummary(),
//   })
  
//   const { data: monthlyRes } = useQuery({
//     queryKey: ['dashboard-monthly', year],
//     queryFn: () => dashboardApi.getMonthlyChart(year),
//   })

//   const { data: categoryRes } = useQuery({
//     queryKey: ['dashboard-categories', monthYear],
//     queryFn: () => dashboardApi.getCategoryChart(monthYear),
//   })

//   const { data: txRes } = useQuery({
//     queryKey: ['transactions-recent'],
//     queryFn: () => transactionApi.getAll(),
//   })

//   const summary: DashboardSummary | undefined = summaryRes?.data?.data
//   const monthlyData: MonthlyChartData[] = monthlyRes?.data?.data || []
//   const categoryData: CategoryChartData[] = categoryRes?.data?.data || []
//   const allTx: Transaction[] = txRes?.data?.data || []
//   const recentTx = allTx.slice(0, 5)

//   const totalForPie = categoryData.reduce((s, d) => s + d.total, 0)
//   const pieData = categoryData.map((d, i) => ({
//     name: d.categoryName,
//     value: d.total,
//     color: d.color || PIE_COLORS[i % PIE_COLORS.length],
//   }))

//   const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
//   const monthlyMap = Object.fromEntries(monthlyData.map(d => [d.month.slice(5), d.expense]))
//   const barData = MONTH_NAMES.map((name, i) => {
//     const key = String(i + 1).padStart(2, '0')
//     return { month: name, Expense: monthlyMap[key] ?? 0 }
//   })

//   const savingsRate = summary && summary.totalIncome > 0
//     ? Math.round((summary.netBalance / summary.totalIncome) * 100)
//     : 0

//   return (
//     <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
//       {/* ── HEADER ── */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
//             Control <span className="text-orange-500">Room</span>
//           </h1>
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Active Operational Hub • {year}</p>
//         </div>
//         <button 
//           onClick={() => navigate('/transactions')}
//           className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] active:scale-95"
//         >
//           + Initialize Entry
//         </button>
//       </div>

//       {/* ── STATS ── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//         {loadingSummary ? (
//           [1,2,3,4].map(i => <div key={i} className="h-40 rounded-[2rem] animate-pulse bg-gray-100" />)
//         ) : (
//           <>
//             <StatCard label="Inflow" value={summary?.totalIncome ?? 0} currency={currency} sub="Income" bg="bg-black" icon={ArrowUpRight} />
//             <StatCard label="Outflow" value={summary?.totalExpenses ?? 0} currency={currency} sub="Spending" bg="bg-orange-500" icon={ArrowDownRight} />
//             <StatCard label="Net Asset" value={summary?.netBalance ?? 0} currency={currency} sub="Liquidity" bg="bg-slate-900" icon={Activity} />
//             <StatCard label="Efficiency" value={`${savingsRate}%`} sub="Savings Rate" bg="bg-orange-600" icon={Target} />
//           </>
//         )}
//       </div>

//       {/* ── CHARTS ── */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//         <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Capital Flow Index</h2>
//             <div className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-orange-500" />
//               <span className="text-[9px] font-black uppercase text-slate-400">Monthly Expenses</span>
//             </div>
//           </div>
//           <ResponsiveContainer width="100%" height={320}>
//             <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
//               <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} />
//               <YAxis tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
//               <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip currency={currency} />} />
//               <Bar dataKey="Expense" fill="#000000" radius={[10, 10, 2, 2]} barSize={35} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-black rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
//           <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Sector Distribution</h2>
//           <div className="relative h-[250px] my-4">
//              <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={8} dataKey="value" strokeWidth={0}>
//                     {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                   </Pie>
//                   <Tooltip content={<CustomTooltip currency={currency} />} />
//                 </PieChart>
//              </ResponsiveContainer>
//              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Aggregate</p>
//                 <p className="text-xl font-black text-white tracking-tighter">
//                   {formatMoney(totalForPie, currency).split('.')[0]}
//                 </p>
//              </div>
//           </div>
//           <div className="space-y-3">
//              {pieData.slice(0, 3).map((d) => (
//                 <div key={d.name} className="flex items-center justify-between group cursor-default">
//                    <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: d.color }} />
//                       <span className="text-[10px] font-black text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">{d.name}</span>
//                    </div>
//                    <span className="text-[10px] font-mono font-bold text-white/90">{formatMoney(d.value, currency)}</span>
//                 </div>
//              ))}
//           </div>
//         </div>
//       </div>

//       {/* ── RECENT ACTIVITY ── */}
//       <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100">
//         <div className="flex items-center justify-between mb-8">
//           <h2 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Latest Transactions</h2>
//           <button 
//             onClick={() => navigate('/transactions')} 
//             className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 transition-colors"
//           >
//             Access Full Ledger
//           </button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-100">
//                 <th className="pb-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
//                 <th className="pb-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cluster</th>
//                 <th className="pb-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
//                 <th className="pb-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {recentTx.map(tx => (
//                 <tr key={tx.id} className="group hover:bg-gray-50 transition-all duration-300">
//                   <td className="py-6">
//                     <div className="flex items-center gap-4">
//                       <div className={cn(
//                         "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[10px] transition-transform group-hover:rotate-6",
//                         tx.type === 'INCOME' ? "bg-orange-500/10 text-orange-500" : "bg-black text-white"
//                       )}>
//                         {tx.type === 'INCOME' ? 'INC' : 'EXP'}
//                       </div>
//                       <span className="text-[13px] font-black text-black uppercase tracking-tight">{tx.description || tx.categoryName}</span>
//                     </div>
//                   </td>
//                   <td className="py-6">
//                     <span className="text-[10px] font-black text-slate-400 uppercase border border-slate-100 px-3 py-1 rounded-full bg-slate-50">
//                       {tx.categoryName}
//                     </span>
//                   </td>
//                   <td className="py-6 text-right text-[10px] font-bold text-slate-400 uppercase">{formatDate(tx.date)}</td>
//                   <td className={cn(
//                     "py-6 text-right font-mono font-black text-[15px]",
//                     tx.type === 'INCOME' ? "text-orange-500" : "text-black"
//                   )}>
//                     {tx.type === 'INCOME' ? '+' : '-'}{formatMoney(tx.amount, currency)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }
