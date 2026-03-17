// import { Link } from 'react-router-dom'
// import {
//   TrendingUp, BarChart2, ShieldCheck, Upload,
//   Tag, PieChart, ArrowRight, CheckCircle2,
//   Twitter, Github, Linkedin, Mail, Phone,
//   ArrowUpRight, DollarSign, Target, FileText, Zap,
// } from 'lucide-react'

// const features = [
//   { icon: BarChart2, color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)', title: 'Expense Tracking',    desc: 'Log every income and expense with categories, dates, and notes in seconds.' },
//   { icon: Target,    color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)', title: 'Budget Management',   desc: 'Set monthly budgets per category and get alerts when you hit 80% usage.' },
//   { icon: Upload,    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)', title: 'CSV Import',           desc: 'Bulk import transactions from any bank CSV export with smart column mapping.' },
//   { icon: PieChart,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',  title: 'Analytics Dashboard', desc: 'Visualize spending with bar charts, pie charts, and monthly summaries.' },
//   { icon: Tag,       color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)', title: 'Category Management', desc: 'Create custom income and expense categories with colors and icons.' },
//   { icon: FileText,  color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)',  title: 'Export Reports',      desc: 'Download your transaction history as CSV for tax filing or analysis.' },
// ]

// const steps = [
//   { num: '01', title: 'Create Your Account',  desc: 'Sign up free in under 60 seconds. No credit card required.',          color: '#10b981' },
//   { num: '02', title: 'Add Transactions',      desc: 'Log income and expenses manually or import via CSV bulk upload.',      color: '#6366f1' },
//   { num: '03', title: 'Set Monthly Budgets',   desc: 'Define spending limits per category and track progress in real time.', color: '#f59e0b' },
//   { num: '04', title: 'Analyze & Grow',        desc: 'Use charts and reports to understand habits and improve finances.',    color: '#ef4444' },
// ]

// const stats = [
//   { value: '10,000+', label: 'Active Users',         icon: ArrowUpRight, color: '#10b981' },
//   { value: '₹2.5Cr+', label: 'Transactions Tracked', icon: DollarSign,   color: '#6366f1' },
//   { value: '48,000+', label: 'Budgets Created',       icon: Target,       color: '#f59e0b' },
//   { value: '99.9%',   label: 'Uptime Reliability',    icon: ShieldCheck,  color: '#ef4444' },
// ]

// const security = [
//   { title: 'JWT Authentication', desc: 'Stateless, secure token-based auth with refresh token rotation.',  color: '#10b981' },
//   { title: 'Encrypted Storage',  desc: 'All sensitive data encrypted at rest and in transit via HTTPS.',   color: '#6366f1' },
//   { title: 'Role-Based Access',  desc: 'Admin and user roles with strict API-level permission guards.',     color: '#f59e0b' },
//   { title: 'Email Verification', desc: 'OTP-based email verification before account activation.',           color: '#ef4444' },
// ]

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen flex flex-col font-sans" style={{ background: '#f0f4ff' }}>

//       {/* ── Sticky Navbar ── */}
//       <header className="sticky top-0 z-50 backdrop-blur-md border-b"
//         style={{ background: 'linear-gradient(90deg, rgba(30,27,75,0.97) 0%, rgba(17,55,80,0.97) 50%, rgba(5,101,79,0.97) 100%)', borderColor: 'rgba(255,255,255,0.1)' }}>
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//               <TrendingUp size={15} className="text-white" />
//             </div>
//             <span className="font-bold text-white text-[15px] tracking-tight">Finance Tracker</span>
//           </Link>


//           <div className="flex items-center gap-3">
//             <Link to="/login"
//               className="text-[13px] font-semibold px-3 py-1.5 transition-colors"
//               style={{ color: 'rgba(255,255,255,0.65)' }}>
//               Login
//             </Link>
//             <Link to="/register"
//               className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 12px rgba(16,185,129,0.4)' }}>
//               Get Started Free
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* ── Hero Section ── */}
//       <section className="relative min-h-[90vh] flex items-center overflow-hidden"
//         style={{
//           background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 35%, #1e3a5f 65%, #0f2d40 100%)',
//         }}>

//         {/* Animated mesh blobs */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           {/* Top-right emerald glow */}
//           <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
//             style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }} />
//           {/* Bottom-left indigo glow */}
//           <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full"
//             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', filter: 'blur(50px)' }} />
//           {/* Center blue glow */}
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
//             style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
//           {/* Dot grid */}
//           <div className="absolute inset-0"
//             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
//           {/* Diagonal lines accent */}
//           <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
//             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
//         </div>

//         {/* Floating decorative chart bars (right side) */}
//         <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden xl:flex items-end gap-3 opacity-20">
//           {[120, 80, 160, 100, 140, 60, 180, 90, 130, 70].map((h, i) => (
//             <div key={i} className="w-6 rounded-t-md"
//               style={{
//                 height: `${h}px`,
//                 background: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#6366f1' : '#f59e0b',
//                 opacity: 0.7 + (i % 3) * 0.1,
//               }} />
//           ))}
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full">
//           <div className="max-w-[620px]">
//             {/* Badge */}
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7"
//               style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #10b981' }} />
//               <span className="text-[11px] font-bold text-emerald-300 tracking-widest uppercase">Personal Finance Tracker</span>
//             </div>

//             <h1 className="text-[54px] font-bold text-white leading-[1.08] tracking-tight mb-6">
//               Take Control of<br />
//               <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
//                 Your Finances
//               </span><br />
//               with Confidence
//             </h1>

//             <p className="text-[16px] leading-relaxed mb-10 max-w-[500px]"
//               style={{ color: 'rgba(255,255,255,0.55)' }}>
//               Track income and expenses, set smart budgets, visualize spending with powerful charts, and import transactions via CSV — all in one place.
//             </p>

//             <div className="flex flex-wrap gap-4 mb-12">
//               <Link to="/register"
//                 className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-[14px] transition-all hover:-translate-y-0.5 active:translate-y-0"
//                 style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 24px rgba(16,185,129,0.45)' }}>
//                 Get Started Free <ArrowRight size={15} />
//               </Link>
//               <Link to="/login"
//                 className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all hover:-translate-y-0.5"
//                 style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
//                 Login to Dashboard
//               </Link>
//             </div>

//             {/* Trust row */}
//             <div className="flex flex-wrap items-center gap-6 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
//               {['No credit card required', 'Free forever plan', 'Secure & encrypted'].map(t => (
//                 <div key={t} className="flex items-center gap-2">
//                   <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
//                   <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{t}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Bottom wave divider */}
//         <div className="absolute bottom-0 left-0 right-0">
//           <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
//             <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#f0f4ff" />
//           </svg>
//         </div>
//       </section>

//       {/* ── Stats Bar ── */}
//       <section style={{ background: '#f0f4ff' }}>
//         <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
//           {stats.map(({ value, label, icon: Icon, color }) => (
//             <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100"
//               style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
//               <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
//                 style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
//                 <Icon size={18} style={{ color }} />
//               </div>
//               <div>
//                 <p className="text-[22px] font-bold text-gray-900 leading-tight">{value}</p>
//                 <p className="text-[12px] text-gray-400 mt-0.5">{label}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── About Section ── */}
//       <section id="about" className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest mb-3">About Finance Tracker</p>
//           <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-5">Managing Money, Simplified</h2>
//           <p className="text-[15px] text-gray-500 leading-relaxed max-w-[640px] mx-auto mb-12">
//             Finance Tracker is a full-stack personal finance application built with Spring Boot and React. It helps individuals track every rupee, set realistic budgets, and gain clarity on their spending habits through beautiful visualizations.
//           </p>
//           <div className="flex flex-wrap justify-center gap-3">
//             {['Income & Expense Tracking','Monthly Budget Alerts','CSV Bulk Import','Category Analytics','PDF & CSV Export','Admin Dashboard','Email Notifications','Secure JWT Auth'].map(cap => (
//               <span key={cap} className="px-4 py-2 rounded-full text-[13px] font-medium bg-gray-50 border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-default">
//                 {cap}
//               </span>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Features Section ── */}
//       <section id="features" style={{ background: '#f0f4ff' }} className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-14">
//             <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Features</p>
//             <h2 className="text-[36px] font-bold text-gray-900 tracking-tight">Everything You Need</h2>
//             <p className="text-[15px] text-gray-500 mt-3 max-w-[480px] mx-auto">A complete toolkit for personal finance management, built for real users.</p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
//               <div key={title}
//                 className="bg-white rounded-2xl p-6 border hover:-translate-y-1 transition-all duration-200"
//                 style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
//                 <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
//                   style={{ background: bg, border: `1px solid ${border}` }}>
//                   <Icon size={20} style={{ color }} />
//                 </div>
//                 <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
//                 <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── How It Works ── */}
//       <section id="how-it-works" className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-14">
//             <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest mb-3">How It Works</p>
//             <h2 className="text-[36px] font-bold text-gray-900 tracking-tight">Up and Running in Minutes</h2>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {steps.map(({ num, title, desc, color }, i) => (
//               <div key={num} className="relative rounded-2xl p-6 border border-gray-100 h-full"
//                 style={{ background: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
//                 {i < steps.length - 1 && (
//                   <div className="hidden lg:block absolute top-9 left-[calc(100%-8px)] w-4 h-px z-10"
//                     style={{ background: 'rgba(0,0,0,0.1)' }} />
//                 )}
//                 <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-[15px]"
//                   style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>
//                   {num}
//                 </div>
//                 <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
//                 <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── Security Section ── */}
//       <section id="security" className="py-20"
//         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f2d40 100%)' }}>
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-14">
//             <p className="text-[12px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Security</p>
//             <h2 className="text-[36px] font-bold text-white tracking-tight">Built with Security First</h2>
//             <p className="text-[15px] mt-3 max-w-[480px] mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
//               Your financial data is protected at every layer of the stack.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//             {security.map(({ title, desc, color }) => (
//               <div key={title} className="rounded-2xl p-6"
//                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
//                   style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
//                   <ShieldCheck size={18} style={{ color }} />
//                 </div>
//                 <h3 className="text-[14px] font-bold text-white mb-2">{title}</h3>
//                 <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA Section ── */}
//       <section className="py-20 bg-white">
//         <div className="max-w-3xl mx-auto px-6 text-center">
//           <h2 className="text-[38px] font-bold text-gray-900 tracking-tight mb-4">
//             Start Managing Your Money<br />
//             <span className="text-emerald-500">Smarter Today</span>
//           </h2>
//           <p className="text-[15px] text-gray-500 mb-8">Join thousands of users who have taken control of their finances. Free to start, no credit card needed.</p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link to="/register"
//               className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-[14px] transition-all hover:-translate-y-0.5"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>
//               Get Started Free <ArrowRight size={15} />
//             </Link>
//             <Link to="/login"
//               className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[14px] text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:text-emerald-600 transition-all">
//               Sign In
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* ── Footer ── */}
//       <footer style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
//         <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
//           {/* Brand */}
//           <div>
//             <div className="flex items-center gap-2.5 mb-4">
//               <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//                 <TrendingUp size={15} className="text-white" />
//               </div>
//               <span className="font-bold text-white text-[15px]">Finance Tracker</span>
//             </div>
//             <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.38)' }}>
//               A modern personal finance management platform built with Spring Boot & React.
//             </p>
//             <div className="flex gap-2.5">
//               {[Twitter, Github, Linkedin].map((Icon, i) => (
//                 <a key={i} href="#"
//                   className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:-translate-y-0.5"
//                   style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
//                   <Icon size={13} style={{ color: 'rgba(255,255,255,0.45)' }} />
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Features */}
//           <div>
//             <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 pb-2"
//               style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Features</h4>
//             <ul className="space-y-2.5">
//               {['Expense Tracking','Budget Management','CSV Import','Analytics','Category Management','Export Reports'].map(item => (
//                 <li key={item}>
//                   <a href="#features" className="text-[13px] transition-colors hover:text-emerald-400"
//                     style={{ color: 'rgba(255,255,255,0.38)' }}>{item}</a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* About */}
//           <div>
//             <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 pb-2"
//               style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>About</h4>
//             <ul className="space-y-2.5">
//               {['About Us','How It Works','Security','Privacy Policy','Terms of Use'].map(item => (
//                 <li key={item}>
//                   <a href="#about" className="text-[13px] transition-colors hover:text-emerald-400"
//                     style={{ color: 'rgba(255,255,255,0.38)' }}>{item}</a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact */}
//           <div id="contact">
//             <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4 pb-2"
//               style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Contact</h4>
//             <ul className="space-y-3 mb-6">
//               <li className="flex items-center gap-2.5">
//                 <Mail size={13} className="text-emerald-400 flex-shrink-0" />
//                 <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.38)' }}>support@financetracker.app</span>
//               </li>
//               <li className="flex items-center gap-2.5">
//                 <Phone size={13} className="text-emerald-400 flex-shrink-0" />
//                 <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.38)' }}>+91 98765 43210</span>
//               </li>
//             </ul>
//             <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
//               <p className="text-[12px] text-emerald-400 font-semibold mb-1">Ready to start?</p>
//               <Link to="/register" className="text-[12px] transition-colors hover:text-emerald-400 flex items-center gap-1"
//                 style={{ color: 'rgba(255,255,255,0.5)' }}>
//                 Create free account <ArrowRight size={11} />
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Bottom bar */}
//         <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
//           <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
//             <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
//               © {new Date().getFullYear()} Finance Tracker. All rights reserved.
//             </p>
//             <div className="flex items-center gap-5">
//               {['Privacy Policy','Terms of Use','Cookie Policy'].map(item => (
//                 <a key={item} href="#" className="text-[12px] transition-colors hover:text-white/60"
//                   style={{ color: 'rgba(255,255,255,0.22)' }}>{item}</a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }



import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, BarChart2, ShieldCheck, Upload,
  Tag, PieChart, ArrowRight, CheckCircle2,
  Twitter, Github, Linkedin, Mail, Phone,
  ArrowUpRight, DollarSign, Target, FileText, Zap, Sparkles, Globe, ChevronRight
} from 'lucide-react'

const features = [
  { icon: BarChart2, color: '#f97316', title: 'Expense Tracking', desc: 'Precision logging for every transaction with neural-link speed.' },
  { icon: Target, color: '#fb923c', title: 'Budget Management', desc: 'Predictive budgeting that alerts you before you overspend.' },
  { icon: Upload, color: '#f97316', title: 'Smart CSV Import', desc: 'Automated bank-to-dashboard mapping with 99% accuracy.' },
  { icon: PieChart, color: '#fb923c', title: 'Neural Analytics', desc: 'Visualize your wealth journey with interactive 4D data models.' },
  { icon: Tag, color: '#f97316', title: 'Custom Taxonomy', desc: 'Organize your finances exactly how your mind works.' },
  { icon: FileText, color: '#fb923c', title: 'Global Reporting', desc: 'One-click tax-ready exports for any jurisdiction.' },
]

const carouselTexts = ["Your Future.", "Your Wealth.", "Your Freedom.", "Your Control."]

export default function LandingPage() {
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % carouselTexts.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-400 font-sans selection:bg-orange-500/30">
      
      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-[100] border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={20} className="text-black" strokeWidth={3} />
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase">Vault<span className="text-orange-500">.</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Security', 'Company'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors tracking-[0.2em] uppercase">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase tracking-widest">Login</Link>
            <Link to="/register" className="bg-orange-500 text-black text-xs font-black px-8 py-3 rounded-full hover:bg-orange-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-widest">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
        {/* Cinematic Grid & Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[140px]" />
          <div className="absolute bottom-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ backgroundImage: `radial-gradient(#f97316 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
              <Sparkles size={14} />
              <span>Institutional Grade Security</span>
            </div>
            
            <h1 className="text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase">
              Master <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                {carouselTexts[textIndex]}
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-md leading-relaxed mb-10 font-medium">
              A hyper-visual command center for your capital. Track, analyze, and scale your net worth with the world's most powerful finance engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/register" className="bg-orange-500 hover:bg-orange-400 px-10 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-orange-500/20">
                  <span className="text-black font-black text-lg uppercase tracking-tighter">Open Free Account</span>
                  <ArrowRight className="text-black group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Cinematic Dashboard Preview */}
          <div className="relative">
             <div className="relative z-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between mb-12">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Portfolio Value</p>
                     <p className="text-5xl font-black text-white tracking-tighter">₹8,42,000<span className="text-orange-500">.</span></p>
                   </div>
                   <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                      <TrendingUp className="text-orange-500" />
                   </div>
                </div>

                <div className="space-y-4">
                   {[70, 45, 90].map((w, i) => (
                     <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center px-6">
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${w}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
             <div className="absolute -bottom-10 -left-10 text-orange-500/10 font-black text-9xl select-none">VAULT</div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Verified Volume', value: '₹25Cr+' },
            { label: 'Active Command Centers', value: '12,000' },
            { label: 'System Latency', value: '<24ms' },
            { label: 'Security Grade', value: 'AES-256' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-white mb-2 tracking-tighter">{s.value}</p>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center lg:text-left">
           <div className="grid lg:grid-cols-3 gap-16 items-start">
              <div className="lg:col-span-1 sticky top-32">
                <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase leading-none">The Core <br/> Engine<span className="text-orange-500">.</span></h2>
                <p className="text-slate-500 font-medium mb-10">Advanced features built for high-performance financial management.</p>
                <Link to="/register" className="inline-flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
                  Explore full stack <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                {features.map((f, i) => (
                  <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-orange-500/30 transition-all group">
                    <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
                      <f.icon size={24} className="text-orange-500 group-hover:text-black" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black pt-32 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} className="text-black" strokeWidth={3} />
              </div>
              <span className="font-black text-white text-3xl tracking-tighter uppercase">Vault<span className="text-orange-500">.</span></span>
            </Link>
            <div className="flex gap-12">
               {['About', 'Privacy', 'Legal', 'Contact'].map(l => (
                 <a key={l} href="#" className="text-xs font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest">{l}</a>
               ))}
            </div>
          </div>
          <div className="text-center md:text-left pt-12 border-t border-white/5">
             <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em]">© 2026 Vault Analytics — All Systems Operational</p>
          </div>
        </div>
      </footer>
    </div>
  )
}