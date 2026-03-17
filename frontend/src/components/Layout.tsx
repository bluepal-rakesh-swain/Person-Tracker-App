// // import { useState } from 'react'
// // import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import {
// //   LayoutDashboard, ArrowLeftRight, Tag, Target,
// //   LogOut, Menu,
// //   TrendingUp, ChevronRight, ChevronLeft, Users, BarChart3,
// //   Settings, Info,
// // } from 'lucide-react'
// // import { useAuth } from '@/contexts/AuthContext'
// // import ThemeToggle from './ThemeToggle'
// // import { cn } from '@/lib/utils'

// // const baseNavItems = [
// //   { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
// //   { to: '/categories',   icon: Tag,             label: 'Categories' },
// //   { to: '/budgets',      icon: Target,          label: 'Budgets' },
// //   { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
// // ]

// // export default function Layout() {
// //   const { user, logout } = useAuth()
// //   const navigate = useNavigate()
// //   const [mobileOpen, setMobileOpen] = useState(false)
// //   const [collapsed, setCollapsed] = useState(false)
// //   const [avatarOpen, setAvatarOpen] = useState(false)
// //   const isAdmin = user?.role === 'ADMIN'
// //   const navItems = isAdmin ? [] : baseNavItems

// //   const handleLogout = () => { logout(); navigate('/login') }

// //   const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
// //     const isCollapsed = !isMobile && collapsed
// //     const location = useLocation()
// //     const [searchParams] = useSearchParams()
// //     const currentTab = searchParams.get('tab')
// //     return (
// //       <div className="flex flex-col h-full overflow-hidden">

// //         {/* Logo row — click logo icon to expand when collapsed */}
// //         <div className={cn(
// //           'flex items-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0',
// //           isCollapsed ? 'justify-center py-5 px-2' : 'gap-3 px-4 py-5 justify-between'
// //         )}>
// //           <button
// //             onClick={() => { if (isCollapsed) setCollapsed(false) }}
// //             className={cn('flex items-center gap-3', isCollapsed ? 'cursor-pointer' : 'cursor-default')}
// //             tabIndex={isCollapsed ? 0 : -1}
// //             aria-label="Expand sidebar"
// //           >
// //             <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
// //               <TrendingUp size={18} className="text-white" />
// //             </div>
// //             {!isCollapsed && (
// //               <div>
// //                 <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Finance</p>
// //                 <p className="text-xs text-gray-500 dark:text-gray-400">Tracker</p>
// //               </div>
// //             )}
// //           </button>

// //           {/* Close (collapse) button — only when expanded on desktop */}
// //           {!isCollapsed && !isMobile && (
// //             <button
// //               onClick={() => setCollapsed(true)}
// //               className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
// //               aria-label="Collapse sidebar"
// //             >
// //               <ChevronLeft size={16} />
// //             </button>
// //           )}
// //         </div>

// //         {/* Nav */}
// //         <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
// //           {navItems.map(({ to, icon: Icon, label }) => (
// //             <NavLink
// //               key={to}
// //               to={to}
// //               onClick={() => setMobileOpen(false)}
// //               title={isCollapsed ? label : undefined}
// //               className={({ isActive }) => cn(
// //                 'flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
// //                 isCollapsed ? 'justify-center px-2' : 'px-3',
// //                 isActive
// //                   ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
// //                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
// //               )}
// //             >
// //               {({ isActive }) => (
// //                 <>
// //                   <Icon size={18} className={isActive ? 'text-emerald-500' : ''} />
// //                   {!isCollapsed && <span className="flex-1">{label}</span>}
// //                   {!isCollapsed && isActive && <ChevronRight size={14} className="text-emerald-400" />}
// //                 </>
// //               )}
// //             </NavLink>
// //           ))}

// //           {user?.role === 'ADMIN' && (
// //             <>
// //               {[
// //                 { tab: 'users',    label: 'Users',          icon: Users    },
// //                 { tab: 'stats',    label: 'Platform Stats', icon: BarChart3 },
// //                 { tab: 'settings', label: 'Settings',       icon: Settings },
// //                 { tab: 'about',    label: 'About',          icon: Info     },
// //               ].map(({ tab, label, icon: Icon }) => {
// //                 const isActive = location.pathname === '/admin' && currentTab === tab
// //                 return (
// //                   <button
// //                     key={tab}
// //                     onClick={() => { navigate(`/admin?tab=${tab}`); setMobileOpen(false) }}
// //                     title={isCollapsed ? label : undefined}
// //                     className={cn(
// //                       'w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
// //                       isCollapsed ? 'justify-center px-2' : 'px-3',
// //                       isActive
// //                         ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
// //                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
// //                     )}
// //                   >
// //                     <Icon size={18} className={isActive ? 'text-purple-500' : ''} />
// //                     {!isCollapsed && <span className="flex-1">{label}</span>}
// //                     {!isCollapsed && isActive && <ChevronRight size={14} className="text-purple-400" />}
// //                   </button>
// //                 )
// //               })}
// //             </>
// //           )}
// //         </nav>

// //         {/* User */}
// //         <div className="px-2 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1 flex-shrink-0">
// //           {!isCollapsed && (
// //             <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
// //               <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
// //                 {user?.fullName?.charAt(0).toUpperCase()}
// //               </div>
// //               <div className="flex-1 min-w-0">
// //                 <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName}</p>
// //                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.currency}</p>
// //               </div>
// //             </div>
// //           )}
// //           <button
// //             onClick={handleLogout}
// //             title={isCollapsed ? 'Sign out' : undefined}
// //             className={cn(
// //               'w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors',
// //               isCollapsed ? 'justify-center px-2' : 'px-3'
// //             )}
// //           >
// //             <LogOut size={18} />
// //             {!isCollapsed && 'Sign out'}
// //           </button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="flex h-screen bg-gray-50 dark:bg-[#0a0f1e] overflow-hidden">

// //       {/* Desktop Sidebar */}
// //       <aside className={cn(
// //         'hidden lg:flex flex-col bg-white dark:bg-[#0d1424] border-r border-gray-100 dark:border-gray-800 flex-shrink-0 transition-all duration-300',
// //         collapsed ? 'w-16' : 'w-60'
// //       )}>
// //         <SidebarContent />
// //       </aside>

// //       {/* Mobile Sidebar Overlay */}
// //       <AnimatePresence>
// //         {mobileOpen && (
// //           <>
// //             <motion.div
// //               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
// //               className="fixed inset-0 bg-black/50 z-40 lg:hidden"
// //               onClick={() => setMobileOpen(false)}
// //             />
// //             <motion.aside
// //               initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
// //               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
// //               className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0d1424] z-50 lg:hidden border-r border-gray-100 dark:border-gray-800"
// //             >
// //               <SidebarContent isMobile />
// //             </motion.aside>
// //           </>
// //         )}
// //       </AnimatePresence>

// //       {/* Main */}
// //       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
// //         {/* Top bar */}
// //         <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-[#0d1424] border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
// //           {/* Mobile hamburger */}
// //           <button
// //             className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
// //             onClick={() => setMobileOpen(true)}
// //             aria-label="Open menu"
// //           >
// //             <Menu size={20} />
// //           </button>
// //           <div className="flex-1" />
// //           <div className="flex items-center gap-3">
// //             <div className="relative">
// //               <button
// //                 onClick={() => setAvatarOpen(v => !v)}
// //                 className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold focus:outline-none"
// //               >
// //                 {user?.fullName?.charAt(0).toUpperCase()}
// //               </button>
// //               <AnimatePresence>
// //                 {avatarOpen && (
// //                   <>
// //                     <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
// //                     <motion.div
// //                       initial={{ opacity: 0, scale: 0.95, y: -4 }}
// //                       animate={{ opacity: 1, scale: 1, y: 0 }}
// //                       exit={{ opacity: 0, scale: 0.95, y: -4 }}
// //                       transition={{ duration: 0.12 }}
// //                       className="absolute right-0 top-10 z-50 w-52 bg-white dark:bg-[#0d1424] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden"
// //                     >
// //                       <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
// //                         <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
// //                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
// //                       </div>
// //                       <button
// //                         onClick={() => { setAvatarOpen(false); handleLogout() }}
// //                         className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
// //                       >
// //                         <LogOut size={14} />
// //                         Sign out
// //                       </button>
// //                     </motion.div>
// //                   </>
// //                 )}
// //               </AnimatePresence>
// //             </div>
// //           </div>
// //         </header>

// //         {/* Page content */}
// //         <main className="flex-1 overflow-y-auto p-4 lg:p-6">
// //           <motion.div
// //             key={location.pathname}
// //             initial={{ opacity: 0, y: 8 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ duration: 0.2 }}
// //           >
// //             <Outlet />
// //           </motion.div>
// //         </main>
// //       </div>
// //     </div>
// //   )
// // }


// import { useState } from 'react'
// import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard, ArrowLeftRight, Tag, Target,
//   LogOut, Menu, TrendingUp, ChevronRight, ChevronLeft, 
//   Users, BarChart3, Settings, Bell, Search
// } from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'
// import { cn } from '@/lib/utils'

// const baseNavItems = [
//   { to: '/dashboard',    icon: LayoutDashboard, label: 'Control Room' },
//   { to: '/transactions', icon: ArrowLeftRight,  label: 'Ledger' },
//   { to: '/categories',   icon: Tag,             label: 'Clusters' },
//   { to: '/budgets',      icon: Target,          label: 'Targets' },
// ]

// export default function Layout() {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const [collapsed, setCollapsed] = useState(false)
//   const [avatarOpen, setAvatarOpen] = useState(false)
//   const isAdmin = user?.role === 'ADMIN'
//   const navItems = isAdmin ? [] : baseNavItems

//   const handleLogout = () => { logout(); navigate('/login') }

//   const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
//     const isCollapsed = !isMobile && collapsed
//     const location = useLocation()
//     const [searchParams] = useSearchParams()
//     const currentTab = searchParams.get('tab')

//     return (
//       <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a] border-r border-white/5">
        
//         {/* Cinematic Logo Area - Match Admin Header */}
//         <div className={cn(
//           'flex items-center flex-shrink-0 transition-all duration-500',
//           isCollapsed ? 'justify-center py-8' : 'gap-4 px-6 py-8 justify-start'
//         )}>
//           <motion.div 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]"
//           >
//             <TrendingUp size={20} className="text-black" strokeWidth={3} />
//           </motion.div>
//           {!isCollapsed && (
//             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
//               <p className="font-[1000] text-xl tracking-tighter text-white uppercase leading-none">
//                 SYS<span className="text-orange-500">TEM</span>
//               </p>
//               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Command Center</p>
//             </motion.div>
//           )}
//         </div>

//         {/* Cinematic Nav - High Contrast Orange/Black */}
//         <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
//           {navItems.map(({ to, icon: Icon, label }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={() => setMobileOpen(false)}
//               className={({ isActive }) => cn(
//                 'group relative flex items-center gap-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300',
//                 isCollapsed ? 'justify-center' : 'px-4',
//                 isActive 
//                   ? 'bg-orange-500 text-black shadow-[0_10px_25px_rgba(249,115,22,0.2)]' 
//                   : 'text-slate-500 hover:bg-white/5 hover:text-white'
//               )}
//             >
//               {({ isActive }) => (
//                 <>
//                   <Icon size={18} strokeWidth={isActive ? 3 : 2} />
//                   {!isCollapsed && <span>{label}</span>}
//                 </>
//               )}
//             </NavLink>
//           ))}

//           {isAdmin && (
//             <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
//               {!isCollapsed && (
//                 <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
//                   Administration
//                 </p>
//               )}
//               {[
//                 { tab: 'users', label: 'Nodes', icon: Users },
//                 { tab: 'stats', label: 'Analytics', icon: BarChart3 },
//                 { tab: 'settings', label: 'Config', icon: Settings },
//               ].map(({ tab: itemTab, label, icon: Icon }) => {
//                 const isActive = location.pathname === '/admin' && currentTab === itemTab
//                 return (
//                   <button
//                     key={itemTab}
//                     onClick={() => { navigate(`/admin?tab=${itemTab}`); setMobileOpen(false) }}
//                     className={cn(
//                       'w-full group flex items-center gap-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300',
//                       isCollapsed ? 'justify-center px-2' : 'px-4',
//                       isActive 
//                         ? 'bg-orange-500 text-black shadow-[0_10px_25px_rgba(249,115,22,0.2)]' 
//                         : 'text-slate-500 hover:bg-white/5 hover:text-white'
//                     )}
//                   >
//                     <Icon size={18} strokeWidth={isActive ? 3 : 2} />
//                     {!isCollapsed && <span>{label}</span>}
//                   </button>
//                 )
//               })}
//             </div>
//           )}
//         </nav>

//         {/* User Profile Summary (Sidebar Bottom) */}
//         {!isCollapsed && (
//           <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/5">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-black">
//                 {user?.fullName?.charAt(0)}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-[11px] font-black text-white truncate uppercase">{user?.fullName?.split(' ')[0]}</p>
//                 <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter italic">Online</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Collapse Toggle */}
//         <div className="p-4 border-t border-white/5">
//           <button 
//             onClick={() => setCollapsed(!collapsed)}
//             className="hidden lg:flex w-full items-center justify-center py-2 rounded-xl hover:bg-white/5 text-slate-600 hover:text-orange-500 transition-colors"
//           >
//             {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-screen bg-black text-slate-400 overflow-hidden font-sans">
      
//       {/* Desktop Sidebar */}
//       <aside className={cn(
//         'hidden lg:flex flex-col flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
//         collapsed ? 'w-24' : 'w-72'
//       )}>
//         <SidebarContent />
//       </aside>

//       <div className="flex-1 flex flex-col min-w-0 relative">
//         {/* Cinematic Header - Matches Admin spacing */}
//         <header className="flex items-center justify-between px-8 py-6 bg-black border-b border-white/5 z-10">
//           <div className="flex items-center gap-4">
//              <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileOpen(true)}><Menu /></button>
//              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 focus-within:border-orange-500/50 transition-all">
//                 <Search size={16} className="text-slate-600" />
//                 <input type="text" placeholder="QUERY DATABASE..." className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-48 text-white uppercase placeholder:text-slate-700" />
//              </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
//               <Bell size={20} />
//               <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
//             </button>
            
//             {/* User Dropdown Trigger */}
//             <button 
//               onClick={() => setAvatarOpen(!avatarOpen)}
//               className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all"
//             >
//               <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-[1000] text-xs">
//                 {user?.fullName?.charAt(0).toUpperCase()}
//               </div>
//               <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:block">
//                 Menu
//               </span>
//             </button>
//           </div>
//         </header>

//         {/* Main Content Area */}
//         <main className="flex-1 overflow-y-auto relative bg-[#050505]">
//            {/* Background Glows (Subtle Orange) */}
//            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />

//            <div className="max-w-7xl mx-auto p-8">
//               <motion.div
//                 key={location.pathname}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <Outlet />
//               </motion.div>
//            </div>
//         </main>

//         {/* User Dropdown Menu */}
//         <AnimatePresence>
//           {avatarOpen && (
//             <>
//               <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
//               <motion.div
//                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                 className="absolute right-8 top-20 z-50 w-64 bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6"
//               >
//                 <div className="flex flex-col items-center text-center mb-6">
//                    <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-black text-2xl font-black mb-3 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
//                       {user?.fullName?.charAt(0).toUpperCase()}
//                    </div>
//                    <p className="font-black text-sm text-white uppercase tracking-tight">{user?.fullName}</p>
//                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">{user?.role}</p>
//                 </div>
                
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
//                 >
//                   <LogOut size={14} />
//                   Terminate Session
//                 </button>
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Mobile Sidebar */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
//               onClick={() => setMobileOpen(false)}
//             />
//             <motion.aside
//               initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
//               className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] z-50 lg:hidden border-r border-white/5 shadow-2xl"
//             >
//               <SidebarContent isMobile />
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }




// import { useState } from 'react'
// import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard, ArrowLeftRight, Tag, Target,
//   LogOut, Menu, TrendingUp, ChevronRight, ChevronLeft, 
//   Users, BarChart3, Settings, Bell, Search
// } from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'
// import { cn } from '@/lib/utils'

// const baseNavItems = [
//   { to: '/dashboard',    icon: LayoutDashboard, label: 'Control Room' },
//   { to: '/transactions', icon: ArrowLeftRight,  label: 'Ledger' },
//   { to: '/categories',   icon: Tag,             label: 'Clusters' },
//   { to: '/budgets',      icon: Target,          label: 'Targets' },
// ]

// export default function Layout() {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const [collapsed, setCollapsed] = useState(false)
//   const [avatarOpen, setAvatarOpen] = useState(false)
//   const isAdmin = user?.role === 'ADMIN'
//   const navItems = isAdmin ? [] : baseNavItems

//   const handleLogout = () => { logout(); navigate('/login') }

//   const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
//     const isCollapsed = !isMobile && collapsed
//     const location = useLocation()
//     const [searchParams] = useSearchParams()
//     const currentTab = searchParams.get('tab')

//     return (
//       <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10">
        
//         {/* Cinematic Logo - Orange & White */}
//         <div className={cn(
//           'flex items-center flex-shrink-0 transition-all duration-500',
//           isCollapsed ? 'justify-center py-8' : 'gap-4 px-6 py-8 justify-start'
//         )}>
//           <motion.div 
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]"
//           >
//             <TrendingUp size={20} className="text-white" strokeWidth={3} />
//           </motion.div>
//           {!isCollapsed && (
//             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
//               <p className="font-[1000] text-xl tracking-tighter text-white uppercase leading-none">
//                 SYS<span className="text-orange-500">TEM</span>
//               </p>
//               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Global Terminal</p>
//             </motion.div>
//           )}
//         </div>

//         {/* Sidebar Nav */}
//         <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
//           {navItems.map(({ to, icon: Icon, label }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={() => setMobileOpen(false)}
//               className={({ isActive }) => cn(
//                 'group relative flex items-center gap-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300',
//                 isCollapsed ? 'justify-center' : 'px-4',
//                 isActive 
//                   ? 'bg-orange-500 text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)]' 
//                   : 'text-slate-500 hover:bg-white/10 hover:text-white'
//               )}
//             >
//               <Icon size={18} strokeWidth={3} />
//               {!isCollapsed && <span>{label}</span>}
//             </NavLink>
//           ))}

//           {isAdmin && (
//             <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
//               {!isCollapsed && <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Admin Hub</p>}
//               {[
//                 { tab: 'users', label: 'Nodes', icon: Users },
//                 { tab: 'stats', label: 'Analytics', icon: BarChart3 },
//                 { tab: 'settings', label: 'Config', icon: Settings },
//               ].map(({ tab: itemTab, label, icon: Icon }) => {
//                 const isActive = location.pathname === '/admin' && currentTab === itemTab
//                 return (
//                   <button
//                     key={itemTab}
//                     onClick={() => { navigate(`/admin?tab=${itemTab}`); setMobileOpen(false) }}
//                     className={cn(
//                       'w-full group flex items-center gap-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300',
//                       isCollapsed ? 'justify-center px-2' : 'px-4',
//                       isActive 
//                         ? 'bg-orange-500 text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)]' 
//                         : 'text-slate-500 hover:bg-white/10 hover:text-white'
//                     )}
//                   >
//                     <Icon size={18} strokeWidth={3} />
//                     {!isCollapsed && <span>{label}</span>}
//                   </button>
//                 )
//               })}
//             </div>
//           )}
//         </nav>

//         {/* Sidebar User Profile */}
//         {!isCollapsed && (
//           <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/5">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-black">
//                 {user?.fullName?.charAt(0)}
//               </div>
//               <div className="min-w-0">
//                 <p className="text-[10px] font-black text-white uppercase">{user?.fullName?.split(' ')[0]}</p>
//                 <p className="text-[9px] font-bold text-orange-500/60 uppercase">Active Node</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div className="relative flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      
//       {/* ── FINANCE BG IMAGE (Subtle Overlay on White) ── */}
//       <div 
//         className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
//         style={{
//           backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Desktop Sidebar */}
//       <aside className={cn(
//         'hidden lg:flex flex-col flex-shrink-0 z-20 transition-all duration-500',
//         collapsed ? 'w-24' : 'w-72'
//       )}>
//         <SidebarContent />
//       </aside>

//       <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
//         {/* Main Header - White & Clean */}
//         <header className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
//           <div className="flex items-center gap-4">
//              <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileOpen(true)}><Menu /></button>
//              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white transition-all">
//                 <Search size={16} className="text-slate-400" />
//                 <input 
//                   type="text" 
//                   placeholder="SEARCH SYSTEM..." 
//                   className="bg-transparent border-none outline-none text-[10px] font-black tracking-[0.2em] w-48 text-black uppercase placeholder:text-slate-300" 
//                 />
//              </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
//               <Bell size={20} />
//               <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border-2 border-white" />
//             </button>
            
//             <button 
//               onClick={() => setAvatarOpen(!avatarOpen)}
//               className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-gray-50 border border-gray-200 hover:border-orange-500/40 transition-all group"
//             >
//               <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-[1000] text-xs shadow-lg shadow-orange-500/20">
//                 {user?.fullName?.charAt(0).toUpperCase()}
//               </div>
//               <span className="text-[10px] font-black text-black uppercase tracking-widest hidden sm:block">
//                 Account
//               </span>
//             </button>
//           </div>
//         </header>

//         {/* Content Area */}
//         <main className="flex-1 overflow-y-auto relative bg-[#fcfcfc]">
//            <div className="max-w-7xl mx-auto p-8 lg:p-12">
//               <motion.div
//                 key={location.pathname}
//                 initial={{ opacity: 0, y: 15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <Outlet />
//               </motion.div>
//            </div>
//         </main>

//         {/* Floating Profile Dropdown */}
//         <AnimatePresence>
//           {avatarOpen && (
//             <>
//               <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
//               <motion.div
//                 initial={{ opacity: 0, y: 15, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: 15, scale: 0.95 }}
//                 className="absolute right-8 top-20 z-50 w-64 bg-white border border-gray-200 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.1)] p-8"
//               >
//                 <div className="flex flex-col items-center text-center mb-8">
//                    <div className="w-20 h-20 rounded-[2rem] bg-orange-500 flex items-center justify-center text-white text-3xl font-[1000] mb-4 shadow-xl">
//                       {user?.fullName?.charAt(0).toUpperCase()}
//                    </div>
//                    <p className="font-black text-lg text-black uppercase tracking-tighter">{user?.fullName}</p>
//                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">{user?.role} STATUS</p>
//                 </div>
                
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-orange-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
//                 >
//                   <LogOut size={16} />
//                   Sign Out
//                 </button>
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Mobile Sidebar */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
//               onClick={() => setMobileOpen(false)}
//             />
//             <motion.aside
//               initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
//               className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] z-50 lg:hidden"
//             >
//               <SidebarContent isMobile />
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }




import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target,
  LogOut, Menu, TrendingUp, ChevronRight, ChevronLeft, 
  Users, BarChart3, Settings, Bell, Search
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const baseNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'transactions' },
  { to: '/categories',   icon: Tag,             label: 'categories' },
  { to: '/budgets',      icon: Target,          label: 'budgets' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const isAdmin = user?.role === 'ADMIN'
  const navItems = isAdmin ? [] : baseNavItems

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
                <input type="text" placeholder="QUERY PROTOCOL..." className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-48 text-black uppercase placeholder:text-slate-300" />
             </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-[1px] bg-gray-100" />

            <button 
              onClick={() => setAvatarOpen(!avatarOpen)}
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

