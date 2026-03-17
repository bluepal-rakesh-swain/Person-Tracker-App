import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, TrendingUp, Loader2, Mail, Lock,
  PieChart, ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
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
      setError(e.response?.data?.message || e.response?.data?.error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex animate-fade-in">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 auth-left-panel flex-col items-center justify-center p-12 relative overflow-hidden">

        {/* Glow orbs */}
        <div className="auth-orb-1 absolute -top-16 -left-16 w-80 h-80 rounded-full" />
        <div className="auth-orb-2 absolute -bottom-12 -right-12 w-72 h-72 rounded-full" />
        <div className="auth-orb-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" />

        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="auth-logo-icon w-9 h-9 rounded-xl flex items-center justify-center">
            <TrendingUp size={17} className="text-white drop-shadow-sm" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">Finance Tracker</span>
        </div>

        {/* Floating cards */}
        <div className="relative w-full max-w-[280px] space-y-4 z-10 animate-slide-up">

          {/* Balance card */}
          <div className="auth-card">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">₹24,359</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight size={13} className="text-emerald-500" />
              <span className="text-xs text-emerald-500 font-semibold">+12.4% this month</span>
            </div>
          </div>

          {/* Donut card */}
          <div className="auth-card flex items-center gap-4">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4"
                  strokeDasharray="34 66" strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="4"
                  strokeDasharray="22 78" strokeDashoffset="-34" strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4"
                  strokeDasharray="18 82" strokeDashoffset="-56" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <PieChart size={13} className="text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Top category</p>
              <p className="text-sm font-bold text-gray-900">Food — 34%</p>
              <div className="flex gap-1.5 mt-2">
                {[
                  { color: '#10b981', shadow: '0 0 6px #10b981' },
                  { color: '#6366f1', shadow: '0 0 6px #6366f1' },
                  { color: '#f59e0b', shadow: '0 0 6px #f59e0b' },
                ].map(({ color, shadow }) => (
                  <div key={color} className="w-2.5 h-2.5 rounded-full"
                    style={{ background: color, boxShadow: shadow }} />
                ))}
              </div>
            </div>
          </div>

          {/* New transaction card */}
          <div className="auth-card flex items-center gap-3 !p-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.6)' }}>
              <Plus size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">New transaction</p>
              <p className="text-xs text-gray-400">or upload .csv file</p>
            </div>
            <ArrowDownRight size={15} className="text-red-400 ml-auto" />
          </div>
        </div>

        <p className="absolute bottom-8 text-sm font-semibold text-white/60 tracking-wide z-10">
          Welcome back!
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center auth-right-panel p-6">
        <div className="w-full max-w-md animate-slide-in bg-white rounded-3xl shadow-xl shadow-emerald-100/60 px-10 py-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm">Finance Tracker</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back!</h1>
            <p className="text-sm text-gray-400 mt-1.5">Start managing your finance faster and better</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('email')} type="email" placeholder="you@example.com"
                  className="auth-input pl-10 pr-4" />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className="auth-input pl-10 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <Link to="/forgot-password"
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">New here?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link to="/register"
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
              hover:border-emerald-400 hover:text-emerald-600
              active:scale-[0.98] transition-all flex items-center justify-center">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
