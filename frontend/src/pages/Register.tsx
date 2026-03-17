// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import {
//   TrendingUp, Loader2, Mail, Lock, User, Coins, Eye, EyeOff,
//   BarChart2, ShieldCheck, Zap, Twitter, Github, Linkedin,
// } from 'lucide-react'
// import { authApi } from '@/lib/api'

// const schema = z.object({
//   fullName: z.string().min(2, 'Name required'),
//   email: z.string().email('Invalid email'),
//   password: z.string().min(6, 'Min 6 characters'),
//   currency: z.string().min(1, 'Select currency'),
// })
// type FormData = z.infer<typeof schema>

// const features = [
//   { icon: BarChart2,   title: 'Visual Analytics', desc: 'Beautiful charts for income & expenses', glow: '0 0 16px rgba(16,185,129,0.7)'  },
//   { icon: ShieldCheck, title: 'Secure & Private',  desc: 'Bank-grade encryption for your data',   glow: '0 0 16px rgba(99,102,241,0.7)'  },
//   { icon: Zap,         title: 'Smart Budgets',     desc: 'Set limits and get real-time alerts',   glow: '0 0 16px rgba(245,158,11,0.7)'  },
// ]

// export default function Register() {
//   const navigate = useNavigate()
//   const [error, setError] = useState('')
//   const [showPw, setShowPw] = useState(false)

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { currency: 'INR' },
//   })

//   const onSubmit = async (data: FormData) => {
//     setError('')
//     try {
//       await authApi.register(data)
//       navigate('/verify-email', { state: { email: data.email } })
//     } catch (e: any) {
//       setError(e.response?.data?.message || 'Registration failed')
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-[#f8fafc]">

//       {/* ── Sticky Header ── */}
//       <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           {/* Logo */}
//           <Link to="/login" className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//               <TrendingUp size={15} className="text-white" />
//             </div>
//             <span className="font-bold text-gray-900 text-[15px] tracking-tight">Finance Tracker</span>
//           </Link>

//           {/* Nav */}
//           <nav className="hidden md:flex items-center gap-7">
//             <a href="#about" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">About</a>
//             <a href="#contact" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
//             <a href="#features" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
//           </nav>

//           {/* Right */}
//           <div className="flex items-center gap-3">
//             <Link to="/login" className="text-[13px] font-semibold text-gray-600 hover:text-emerald-600 transition-colors px-3 py-1.5">
//               Login
//             </Link>
//             <Link to="/register"
//               className="text-[13px] font-semibold text-white px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 10px rgba(16,185,129,0.35)' }}>
//               Get Started
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* ── Main content ── */}
//       <main className="flex-1 flex">

//         {/* Left panel */}
//         <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
//           style={{
//             backgroundImage: `url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fit=crop')`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//           }}>
//           {/* Dark overlay with green tint */}
//           <div className="absolute inset-0"
//             style={{ background: 'linear-gradient(145deg, rgba(4,47,46,0.88) 0%, rgba(5,101,79,0.82) 40%, rgba(16,185,129,0.72) 100%)' }} />
//           {/* Dot grid overlay */}
//           <div className="absolute inset-0 pointer-events-none"
//             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

//           <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
//             <div className="auth-logo-icon w-9 h-9 rounded-xl flex items-center justify-center">
//               <TrendingUp size={17} className="text-white drop-shadow-sm" />
//             </div>
//             <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">Finance Tracker</span>
//           </div>

//           <div className="relative w-full max-w-[290px] space-y-5 z-10">
//             <div>
//               <h2 className="text-2xl font-bold text-white leading-tight mb-2">
//                 Take control of<br />your finances
//               </h2>
//               <p className="text-sm text-white/65 leading-relaxed">
//                 Join thousands of users managing their money smarter every day.
//               </p>
//             </div>

//             <div className="space-y-3">
//               {features.map(({ icon: Icon, title, desc, glow }) => (
//                 <div key={title} className="auth-feature-card rounded-2xl p-4 flex items-center gap-3.5">
//                   <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
//                     style={{ background: 'rgba(255,255,255,0.22)', boxShadow: glow }}>
//                     <Icon size={17} className="text-white" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-white">{title}</p>
//                     <p className="text-xs text-white/55 mt-0.5">{desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <p className="absolute bottom-8 text-sm font-semibold text-white/55 tracking-wide z-10">
//             Free forever. No credit card required.
//           </p>
//         </div>

//         {/* Right panel */}
//         <div className="flex-1 flex items-center justify-center auth-right-panel p-6 overflow-y-auto">
//           <div className="w-full max-w-md py-8 animate-slide-in bg-white rounded-3xl shadow-xl shadow-emerald-100/60 px-10">

//             {/* Mobile logo */}
//             <div className="flex lg:hidden items-center gap-2 mb-8">
//               <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//                 <TrendingUp size={15} className="text-white" />
//               </div>
//               <span className="font-bold text-gray-800 text-sm">Finance Tracker</span>
//             </div>

//             <div className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h1>
//               <p className="text-sm text-gray-400 mt-1.5">Start your financial journey today</p>
//             </div>

//             {error && (
//               <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
//                 <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
//                 <div className="relative">
//                   <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                   <input {...register('fullName')} type="text" placeholder="Jane Doe" className="auth-input pl-10 pr-4" />
//                 </div>
//                 {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
//                 <div className="relative">
//                   <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                   <input {...register('email')} type="email" placeholder="you@example.com" className="auth-input pl-10 pr-4" />
//                 </div>
//                 {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
//                 <div className="relative">
//                   <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                   <input {...register('password')} type={showPw ? 'text' : 'password'}
//                     placeholder="Min 6 characters" className="auth-input pl-10 pr-11" />
//                   <button type="button" onClick={() => setShowPw(!showPw)}
//                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
//                     {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
//                   </button>
//                 </div>
//                 {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency</label>
//                 <div className="relative">
//                   <Coins size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                   <select {...register('currency')} className="auth-input pl-10 pr-4 appearance-none">
//                     <option value="INR">INR — Indian Rupee</option>
//                     <option value="USD">USD — US Dollar</option>
//                     <option value="EUR">EUR — Euro</option>
//                     <option value="GBP">GBP — British Pound</option>
//                   </select>
//                 </div>
//               </div>

//               <button type="submit" disabled={isSubmitting}
//                 className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
//                 {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Creating...</> : 'Create Account →'}
//               </button>
//             </form>

//             <div className="flex items-center gap-3 my-6">
//               <div className="flex-1 h-px bg-gray-100" />
//               <span className="text-xs text-gray-400 font-medium">Have an account?</span>
//               <div className="flex-1 h-px bg-gray-100" />
//             </div>

//             <Link to="/login"
//               className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-emerald-400 hover:text-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center">
//               Sign in instead
//             </Link>
//           </div>
//         </div>
//       </main>

//       {/* ── Footer ── */}
//       <footer className="bg-white border-t border-gray-100">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-6 h-6 rounded-lg flex items-center justify-center"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//               <TrendingUp size={11} className="text-white" />
//             </div>
//             <span className="text-[13px] font-semibold text-gray-700">Finance Tracker</span>
//             <span className="text-[12px] text-gray-400 ml-2">© {new Date().getFullYear()} All rights reserved.</span>
//           </div>

//           <div className="flex items-center gap-6">
//             <a href="#about" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">About</a>
//             <a href="#contact" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Contact</a>
//             <a href="#" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Privacy Policy</a>
//           </div>

//           <div className="flex items-center gap-3">
//             <a href="#" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
//               <Twitter size={13} className="text-gray-500" />
//             </a>
//             <a href="#" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
//               <Github size={13} className="text-gray-500" />
//             </a>
//             <a href="#" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
//               <Linkedin size={13} className="text-gray-500" />
//             </a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, TrendingUp, Loader2, Mail, Lock,
  User, ShieldCheck, Sparkles, Coins, ArrowRight
} from 'lucide-react'
import { authApi } from '@/lib/api'

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  currency: z.string().min(1, 'Please select a currency'),
})
type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR' }
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.register(data)
      navigate('/verify-email', { state: { email: data.email } })
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0f1115] font-sans antialiased selection:bg-orange-500/30">
      
      {/* ── Left Visual Panel (Dark Cinematic) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative p-16 justify-between overflow-hidden">
        {/* Your Custom Background Image */}
        <div 
          className="absolute inset-0 z-0 scale-105 animate-slow-zoom"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1738736637589-5d8007bedbbc?q=80&w=1170&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

        <div className="relative z-10 flex items-center gap-2">
           <span className="text-white/80 text-xs tracking-[0.2em] font-bold uppercase">
             Start Your Journey
           </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-2">
            <Sparkles size={12} className="text-orange-400" />
            <span>Join 10,000+ users worldwide</span>
          </div>
          <h2 className="text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
            Secure <br /> 
            <span className="text-white/90">your wealth</span>
          </h2>
          <p className="text-white/70 text-lg max-w-sm leading-relaxed">
            Create an account to start tracking, analyzing, and optimizing your financial life.
          </p>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <div className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-bold">
                AES-256 Bank Level <br /> Encryption
              </div>
           </div>
        </div>
      </div>

      {/* ── Right Form Panel (Clean White Card) ── */}
      <div className="flex-1 lg:my-4 lg:mr-4 lg:rounded-[3.5rem] bg-white flex flex-col p-8 md:p-12 shadow-2xl shadow-black/20 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tighter">Personal Finance Tracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">Already have an account?</span>
            <Link 
              to="/login" 
              className="text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-full transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">Register</h1>
            <p className="text-slate-500 text-lg font-medium">Get started with your free account today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center font-bold text-[10px]">!</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <div className="relative group">
                <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  {...register('fullName')} 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium" 
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 ml-2">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <div className="relative group">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  {...register('email')} 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium" 
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-2">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  {...register('password')} 
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create Password" 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 pl-14 pr-14 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-2">{errors.password.message}</p>}
            </div>

            {/* Currency Select */}
            <div className="space-y-1">
              <div className="relative group">
                <Coins size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <select 
                  {...register('currency')} 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium appearance-none"
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              {errors.currency && <p className="text-xs text-red-500 ml-2">{errors.currency.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-600 to-rose-600 py-4 rounded-full text-white font-bold text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            {/* <p>© 2026 Vault Analytics Inc.</p> */}
          </div>
          {/* <p className="normal-case font-medium">Free forever. No credit card required.</p> */}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}} />
    </div>
  )
}


