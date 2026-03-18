

import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target,
  LogOut, Menu, TrendingUp,
  Users, BarChart3, Bell, Search, X, AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { useNotifications, type BudgetAlert } from '@/hooks/useNotifications'

const baseNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  
  { to: '/categories',   icon: Tag,             label: 'categories' },
  { to: '/budgets',      icon: Target,          label: 'budgets' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'transactions' },
]

export default function Layout() {
  const { user, logout, accessToken } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [seenCount, setSeenCount] = useState(0)
  const alertsRef = useRef<BudgetAlert[]>([])
  const unreadCount = alerts.length - seenCount
  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? [] : baseNavItems

  const handleAlert = useCallback((alert: BudgetAlert) => {
    setAlerts(prev => {
      const next = [alert, ...prev].slice(0, 20)
      alertsRef.current = next
      return next
    })
  }, [])

  useNotifications(accessToken, handleAlert)

  const handleBellOpen = () => {
    const opening = !bellOpen
    setBellOpen(opening)
    if (opening) setSeenCount(alertsRef.current.length)
    setAvatarOpen(false)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = !isMobile && collapsed
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const currentTab = searchParams.get('tab')

    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a] border-r border-white/5 shadow-2xl">
        
        {/* Cinematic Logo */}
        <div className={cn(
          'flex items-center flex-shrink-0 transition-all duration-500',
          isCollapsed ? 'justify-center py-10' : 'gap-4 px-6 py-10 justify-start'
        )}>
          <div className="relative group cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
            <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:rotate-12 transition-transform duration-300">
              <TrendingUp size={20} className="text-white" strokeWidth={3} />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-[1000] text-xl tracking-tighter text-white uppercase leading-none">
                SYS<span className="text-orange-500">TEM</span>
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation with Hover Tooltips */}
        <nav className="flex-1 px-3 space-y-3 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'group relative flex items-center rounded-2xl transition-all duration-300 h-12',
                isCollapsed ? 'justify-center w-12 mx-auto' : 'px-4 w-full',
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-4 text-[11px] font-black uppercase tracking-widest truncate">
                      {label}
                    </span>
                  )}

                  {/* ── HOVER TOOLTIP (Shows when collapsed) ── */}
                  {isCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-left pointer-events-none z-50">
                      <div className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-orange-400">
                        {label}
                      </div>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Admin Tools */}
          {isAdmin && (
            <div className="pt-8 space-y-3">
              {!isCollapsed && <p className="px-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">Network</p>}
              {[
                { tab: 'users', label: 'Nodes', icon: Users },
                { tab: 'stats', label: 'Data', icon: BarChart3 },
              ].map(({ tab: itemTab, label, icon: Icon }) => {
                const isActive = location.pathname === '/admin' && currentTab === itemTab
                return (
                  <button
                    key={itemTab}
                    onClick={() => { navigate(`/admin?tab=${itemTab}`); setMobileOpen(false) }}
                    className={cn(
                      'group relative flex items-center rounded-2xl transition-all duration-300 h-12',
                      isCollapsed ? 'justify-center w-12 mx-auto' : 'px-4 w-full',
                      isActive ? 'bg-orange-500 text-white shadow-orange-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                    {!isCollapsed && <span className="ml-4 text-[11px] font-black uppercase tracking-widest">{label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-50">
                        <div className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg whitespace-nowrap">
                          {label}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Quick Switcher */}
        <div className="p-4 border-t border-white/5">
           <button 
             onClick={handleLogout}
             className={cn(
               "flex items-center gap-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300 group relative",
               isCollapsed ? 'justify-center w-12 mx-auto' : 'px-4 w-full'
             )}
           >
             <LogOut size={18} />
             {!isCollapsed && <span className="text-[11px] font-black uppercase">Logout System</span>}
             {isCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left">
                  <div className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg whitespace-nowrap">Logout</div>
                </div>
             )}
           </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')`, backgroundSize: 'cover' }}
      />

      <aside className={cn(
        'hidden lg:flex flex-col flex-shrink-0 z-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
        collapsed ? 'w-20' : 'w-72'
      )}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Modern Clean Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileOpen(true)}><Menu /></button>
             <div className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 focus-within:border-orange-500 focus-within:bg-white transition-all duration-300">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="QUERY PROTOCOL..."
                  className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-48 text-black uppercase placeholder:text-slate-300"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) navigate(`/transactions?search=${encodeURIComponent(val)}`)
                    }
                  }}
                />
             </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={handleBellOpen}
                className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 rounded-full border-2 border-white text-white text-[10px] font-black flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-100" />

            <button 
              onClick={() => { setAvatarOpen(!avatarOpen); setBellOpen(false) }}
              className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:border-orange-500/40 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-[1000] text-black uppercase tracking-widest hidden sm:block">
                Operator
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#fafafa]">
           <div className="max-w-7xl mx-auto p-8 lg:p-10">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Outlet />
              </motion.div>
           </div>
        </main>
      </div>

      {/* Bell Notification Dropdown — Portal so it escapes overflow:hidden */}
      {createPortal(
        <AnimatePresence>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setBellOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed right-8 top-[72px] z-[9999] w-80 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-orange-500" />
                    <span className="text-[11px] font-black text-black uppercase tracking-widest">Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {alerts.length > 0 && (
                      <button
                        onClick={() => { setAlerts([]); alertsRef.current = []; setSeenCount(0) }}
                        className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-wider transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button onClick={() => setBellOpen(false)} className="p-1 text-slate-400 hover:text-black transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-b-2xl">
                  {alerts.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-3 text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <Bell size={20} className="text-gray-200" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No alerts yet</p>
                      <p className="text-[10px] text-slate-300 uppercase">Budget alerts will appear here</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div key={alert.id} className="flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-orange-50/40 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle size={14} className="text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-black uppercase tracking-tight">{alert.categoryName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Budget at <span className="text-orange-500 font-black">{alert.usagePercent.toFixed(1)}%</span> — {alert.monthYear}
                          </p>
                          <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-wider">
                            ₹{(alert.spent / 100).toFixed(2)} of ₹{(alert.limit / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

