import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Loader2, Mail, Lock, User, Coins, Eye, EyeOff, BarChart2, ShieldCheck, Zap } from 'lucide-react'
import { authApi } from '@/lib/api'

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  currency: z.string().min(1, 'Select currency'),
})
type FormData = z.infer<typeof schema>

const features = [
  { icon: BarChart2,   title: 'Visual Analytics', desc: 'Beautiful charts for income & expenses', glow: '0 0 16px rgba(16,185,129,0.7)'  },
  { icon: ShieldCheck, title: 'Secure & Private',  desc: 'Bank-grade encryption for your data',   glow: '0 0 16px rgba(99,102,241,0.7)'  },
  { icon: Zap,         title: 'Smart Budgets',     desc: 'Set limits and get real-time alerts',   glow: '0 0 16px rgba(245,158,11,0.7)'  },
]

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.register(data)
      navigate('/verify-email', { state: { email: data.email } })
    } catch (e: any) {
      setError(e.response?.data?.message || 'Registration failed')
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

        {/* Content */}
        <div className="relative w-full max-w-[290px] space-y-5 z-10 animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
              Take control of<br />your finances
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Join thousands of users managing their money smarter every day.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, title, desc, glow }) => (
              <div key={title} className="auth-feature-card rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.22)', boxShadow: glow }}>
                  <Icon size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/55 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 text-sm font-semibold text-white/55 tracking-wide z-10">
          Free forever. No credit card required.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center auth-right-panel p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-slide-in bg-white rounded-3xl shadow-xl shadow-emerald-100/60 px-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm">Finance Tracker</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h1>
            <p className="text-sm text-gray-400 mt-1.5">Start your financial journey today</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('fullName')} type="text" placeholder="Jane Doe" className="auth-input pl-10 pr-4" />
              </div>
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('email')} type="email" placeholder="you@example.com" className="auth-input pl-10 pr-4" />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters" className="auth-input pl-10 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Currency</label>
              <div className="relative">
                <Coins size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select {...register('currency')} className="auth-input pl-10 pr-4 appearance-none">
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Creating...</> : 'Create Account →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Have an account?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link to="/login"
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
              hover:border-emerald-400 hover:text-emerald-600
              active:scale-[0.98] transition-all flex items-center justify-center">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}
