import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { TrendingUp, Loader2, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api'

const schema = z.object({
  token: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Min 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.resetPassword(data.token, data.newPassword)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 dark:from-[#0a0f1e] dark:via-[#0d1424] dark:to-[#0a0f1e] p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand shadow-xl shadow-emerald-500/30 mb-4">
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New password</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Enter the 6-digit OTP from your email</p>
        </div>
        <div className="card-base p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <p className="font-semibold text-gray-900 dark:text-white">Password reset!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Redirecting to login…</p>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">OTP Code</label>
                  <input {...register('token')} type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-[0.5em]" />
                  {errors.token && <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                  <input {...register('newPassword')} type="password" placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm" />
                  {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Reset Password
                </button>
              </form>
            </>
          )}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">← Back to login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
