

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
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
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



