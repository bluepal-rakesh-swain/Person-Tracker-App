// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import {
//   Eye, EyeOff, TrendingUp, Loader2, Mail, Lock,
//   PieChart, ArrowUpRight, ArrowDownRight, Plus,
// } from 'lucide-react'
// import { authApi } from '@/lib/api'
// import { useAuth } from '@/contexts/AuthContext'

// const schema = z.object({
//   email: z.string().email('Invalid email'),
//   password: z.string().min(1, 'Password required'),
// })
// type FormData = z.infer<typeof schema>

// export default function Login() {
//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const [showPw, setShowPw] = useState(false)
//   const [error, setError] = useState('')

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//   })

//   const onSubmit = async (data: FormData) => {
//     setError('')
//     try {
//       const res = await authApi.login(data)
//       const { accessToken, refreshToken, user } = res.data.data
//       login(accessToken, refreshToken, user)
//       navigate('/dashboard')
//     } catch (e: any) {
//       setError(e.response?.data?.message || e.response?.data?.error || 'Login failed. Please try again.')
//     }
//   }

//   return (
//     <div className="min-h-screen flex animate-fade-in">

//       {/* ── Left panel ── */}
//       <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
//         style={{
//           backgroundImage: `url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fit=crop')`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}>
//         <div className="absolute inset-0"
//           style={{ background: 'linear-gradient(145deg, rgba(4,47,46,0.90) 0%, rgba(5,101,79,0.84) 40%, rgba(16,185,129,0.70) 100%)' }} />
//         <div className="absolute inset-0 pointer-events-none"
//           style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

//         {/* Logo */}
//         <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
//           <Link to="/" className="flex items-center gap-2.5">
//             <div className="auth-logo-icon w-9 h-9 rounded-xl flex items-center justify-center">
//               <TrendingUp size={17} className="text-white drop-shadow-sm" />
//             </div>
//             <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">Finance Tracker</span>
//           </Link>
//         </div>

//         {/* Floating cards */}
//         <div className="relative w-full max-w-[280px] space-y-4 z-10 animate-slide-up">
//           <div className="auth-card">
//             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
//             <p className="text-3xl font-bold text-gray-900 font-mono">₹24,359</p>
//             <div className="flex items-center gap-1 mt-2">
//               <ArrowUpRight size={13} className="text-emerald-500" />
//               <span className="text-xs text-emerald-500 font-semibold">+12.4% this month</span>
//             </div>
//           </div>

//           <div className="auth-card flex items-center gap-4">
//             <div className="relative w-14 h-14 flex-shrink-0">
//               <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
//                 <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="4" />
//                 <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="34 66" strokeLinecap="round" />
//                 <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="22 78" strokeDashoffset="-34" strokeLinecap="round" />
//                 <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-56" strokeLinecap="round" />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <PieChart size={13} className="text-gray-400" />
//               </div>
//             </div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-medium mb-1">Top category</p>
//               <p className="text-sm font-bold text-gray-900">Food — 34%</p>
//               <div className="flex gap-1.5 mt-2">
//                 {['#10b981','#6366f1','#f59e0b'].map(c => (
//                   <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="auth-card flex items-center gap-3 !p-4">
//             <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.6)' }}>
//               <Plus size={18} className="text-white" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-gray-900">New transaction</p>
//               <p className="text-xs text-gray-400">or upload .csv file</p>
//             </div>
//             <ArrowDownRight size={15} className="text-red-400 ml-auto" />
//           </div>
//         </div>

//         <p className="absolute bottom-8 text-sm font-semibold text-white/60 tracking-wide z-10">Welcome back!</p>
//       </div>

//       {/* ── Right panel ── */}
//       <div className="flex-1 flex items-center justify-center auth-right-panel p-6">
//         <div className="w-full max-w-md animate-slide-in bg-white rounded-3xl shadow-xl shadow-emerald-100/60 px-10 py-10">

//           {/* Mobile logo */}
//           <div className="flex lg:hidden items-center gap-2 mb-8">
//             <Link to="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
//                 <TrendingUp size={15} className="text-white" />
//               </div>
//               <span className="font-bold text-gray-800 text-sm">Finance Tracker</span>
//             </Link>
//           </div>

//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back!</h1>
//             <p className="text-sm text-gray-400 mt-1.5">Start managing your finance faster and better</p>
//           </div>

//           {error && (
//             <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
//               <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
//               <div className="relative">
//                 <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                 <input {...register('email')} type="email" placeholder="you@example.com" className="auth-input pl-10 pr-4" />
//               </div>
//               {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
//               <div className="relative">
//                 <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                 <input {...register('password')} type={showPw ? 'text' : 'password'}
//                   placeholder="At least 6 characters" className="auth-input pl-10 pr-11" />
//                 <button type="button" onClick={() => setShowPw(!showPw)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
//                   {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
//                 </button>
//               </div>
//               {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
//             </div>

//             <div className="flex justify-end">
//               <Link to="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors">
//                 Forgot password?
//               </Link>
//             </div>

//             <button type="submit" disabled={isSubmitting}
//               className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
//               {isSubmitting && <Loader2 size={15} className="animate-spin" />}
//               {isSubmitting ? 'Signing in...' : 'Login'}
//             </button>
//           </form>

//           <div className="flex items-center gap-3 my-6">
//             <div className="flex-1 h-px bg-gray-100" />
//             <span className="text-xs text-gray-400 font-medium">New here?</span>
//             <div className="flex-1 h-px bg-gray-100" />
//           </div>

//           <Link to="/register"
//             className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-emerald-400 hover:text-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center">
//             Create an account
//           </Link>

//           <p className="text-center text-[12px] text-gray-400 mt-5">
//             <Link to="/" className="text-emerald-600 hover:underline">← Back to home</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, TrendingUp, Loader2, Lock,
  ArrowRight, ShieldCheck, Sparkles, Globe
} from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.login(data)
      const { accessToken, refreshToken, user } = res.data.data
      login(accessToken, refreshToken, user)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Authentication failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0f1115] font-sans antialiased selection:bg-orange-500/30">
      
      {/* ── Left Visual Panel with Your Custom BG ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative p-16 justify-between overflow-hidden">
        {/* The Background Image */}
        <div 
          className="absolute inset-0 z-0 scale-105 animate-slow-zoom"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1738736637589-5d8007bedbbc?q=80&w=1170&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Professional Overlay for Text Readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

        <div className="relative z-10 flex items-center gap-2">
           <span className="text-white/80 text-xs tracking-[0.2em] font-bold uppercase drop-shadow-md">
             Vault Institutional Access
           </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-2">
            <Sparkles size={12} className="text-orange-400" />
            <span>AI-Driven Wealth Management</span>
          </div>
          <h2 className="text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
            Manage <br /> 
            <span className="text-white/90">your money</span>
          </h2>
          <p className="text-white/70 text-lg max-w-sm leading-relaxed drop-shadow-md">
            Seamlessly track expenses and grow your portfolio with our secure, next-gen finance suite.
          </p>
        </div>

        <div className="relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                <Globe size={20} className="text-white" />
              </div>
              <div className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-bold">
                Global Financial <br /> Infrastructure
              </div>
           </div>
        </div>
      </div>

      {/* ── Right Form Panel (Clean White Card) ── */}
      <div className="flex-1 lg:my-4 lg:mr-4 lg:rounded-[3.5rem] bg-white flex flex-col p-8 md:p-12 shadow-2xl shadow-black/20 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tighter">Personal Finance Tracker</span>
          </Link>
          <Link 
            to="/register" 
            className="text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-full transition-all active:scale-95"
          >
            Create account
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Sign In</h1>
            <p className="text-slate-500 text-lg font-medium">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-shake">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center font-bold text-[10px]">!</div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <div className="relative">
                <input 
                  {...register('email')} 
                  type="email" 
                  placeholder="Email or Username" 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 px-6 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium" 
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-2 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <input 
                  {...register('password')} 
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password" 
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 px-6 pr-14 outline-none focus:bg-white focus:border-orange-500/40 transition-all font-medium" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-2 mt-1">{errors.password.message}</p>}
              
              <div className="flex justify-start mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors ml-1"
                >
                  Forgot password?
                </Link>
              </div>
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
                  <ArrowRight size={20} />
                  <span>Sign In</span>
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
          <div className="flex gap-6">
            {/* <a href="#" className="hover:text-slate-900 transition-colors">Contact</a> */}
            <select className="bg-transparent outline-none cursor-pointer hover:text-slate-900 transition-colors">
               {/* <option>English (US)</option>
               <option>Hindi</option> */}
            </select>
          </div>
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
    </div>
  )
}



