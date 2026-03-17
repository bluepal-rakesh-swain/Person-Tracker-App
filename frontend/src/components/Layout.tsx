import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target,
  LogOut, Menu,
  TrendingUp, ChevronRight, ChevronLeft, Users, BarChart3,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'

const baseNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories',   icon: Tag,             label: 'Categories' },
  { to: '/budgets',      icon: Target,          label: 'Budgets' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? [] : baseNavItems

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = !isMobile && collapsed
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const currentTab = searchParams.get('tab')
    return (
      <div className="flex flex-col h-full overflow-hidden">

        {/* Logo row — click logo icon to expand when collapsed */}
        <div className={cn(
          'flex items-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0',
          isCollapsed ? 'justify-center py-5 px-2' : 'gap-3 px-4 py-5 justify-between'
        )}>
          <button
            onClick={() => { if (isCollapsed) setCollapsed(false) }}
            className={cn('flex items-center gap-3', isCollapsed ? 'cursor-pointer' : 'cursor-default')}
            tabIndex={isCollapsed ? 0 : -1}
            aria-label="Expand sidebar"
          >
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
              <TrendingUp size={18} className="text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Finance</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tracker</p>
              </div>
            )}
          </button>

          {/* Close (collapse) button — only when expanded on desktop */}
          {!isCollapsed && !isMobile && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) => cn(
                'flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isCollapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-emerald-500' : ''} />
                  {!isCollapsed && <span className="flex-1">{label}</span>}
                  {!isCollapsed && isActive && <ChevronRight size={14} className="text-emerald-400" />}
                </>
              )}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              {[
                { tab: 'users', label: 'Users', icon: Users },
                { tab: 'stats', label: 'Platform Stats', icon: BarChart3 },
              ].map(({ tab, label, icon: Icon }) => {
                const isActive = location.pathname === '/admin' && currentTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => { navigate(`/admin?tab=${tab}`); setMobileOpen(false) }}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      'w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isCollapsed ? 'justify-center px-2' : 'px-3',
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-purple-500' : ''} />
                    {!isCollapsed && <span className="flex-1">{label}</span>}
                    {!isCollapsed && isActive && <ChevronRight size={14} className="text-purple-400" />}
                  </button>
                )
              })}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.currency}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign out' : undefined}
            className={cn(
              'w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors',
              isCollapsed ? 'justify-center px-2' : 'px-3'
            )}
          >
            <LogOut size={18} />
            {!isCollapsed && 'Sign out'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0f1e] overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white dark:bg-[#0d1424] border-r border-gray-100 dark:border-gray-800 flex-shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0d1424] z-50 lg:hidden border-r border-gray-100 dark:border-gray-800"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-[#0d1424] border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
