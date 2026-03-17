import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TrendingUp, Loader2, Mail, KeyRound, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})
type FormData = z.infer<typeof schema>

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string })?.email || ''

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail, otp: '' },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.verifyEmail({ email: data.email, otp: data.otp })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Verification failed. Check your OTP and try again.')
    }
  }

  return (
    <div className="min-h-screen flex animate-fade-in">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 auth-left-panel flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="auth-orb-1 absolute -top-16 -left-16 w-80 h-80 rounded-full" />
        <div className="auth-orb-2 absolute -bottom-12 -right-12 w-72 h-72 rounded-full" />
        <div className="auth-orb-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" />

        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <div className="auth-logo-icon w-9 h-9 rounded-xl flex items-center justify-center">
            <TrendingUp size={17} className="text-white drop-shadow-sm" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">Finance Tracker</span>
        </div>

        <div className="relative z-10 text-center space-y-4 animate-slide-up">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
            <Mail size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
          <p className="text-sm text-white/65 max-w-[240px] leading-relaxed">
            We sent a 6-digit OTP to your email. Enter it to activate your account.
          </p>
          <p className="text-xs text-white/40">OTP is valid for 10 minutes.</p>
        </div>

        <p className="absolute bottom-8 text-sm font-semibold text-white/55 tracking-wide z-10">
          Almost there!
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

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <CheckCircle2 size={52} className="text-emerald-500" />
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-sm text-gray-400">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verify your email</h1>
                <p className="text-sm text-gray-400 mt-1.5">Enter the 6-digit OTP sent to your email</p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input {...register('email')} type="email" placeholder="you@example.com"
                      className="auth-input pl-10 pr-4" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OTP Code</label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input {...register('otp')} type="text" inputMode="numeric" maxLength={6}
                      placeholder="6-digit code" className="auth-input pl-10 pr-4 tracking-widest text-center text-lg font-mono" />
                  </div>
                  {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                  {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : 'Verify Email →'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">Wrong account?</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <Link to="/register"
                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
                  hover:border-emerald-400 hover:text-emerald-600
                  active:scale-[0.98] transition-all flex items-center justify-center">
                Back to Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
