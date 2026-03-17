// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { motion } from 'framer-motion'
// import { TrendingUp, Loader2, CheckCircle } from 'lucide-react'
// import { authApi } from '@/lib/api'

// const schema = z.object({ email: z.string().email('Invalid email') })
// type FormData = z.infer<typeof schema>

// export default function ForgotPassword() {
//   const [sent, setSent] = useState(false)
//   const [error, setError] = useState('')
//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//   })

//   const onSubmit = async (data: FormData) => {
//     setError('')
//     try {
//       await authApi.forgotPassword(data.email)
//       setSent(true)
//     } catch (e: any) {
//       setError(e.response?.data?.message || 'Something went wrong')
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 dark:from-[#0a0f1e] dark:via-[#0d1424] dark:to-[#0a0f1e] p-4">
//       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand shadow-xl shadow-emerald-500/30 mb-4">
//             <TrendingUp size={26} className="text-white" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">We'll send a reset link to your email</p>
//         </div>
//         <div className="card-base p-8">
//           {sent ? (
//             <div className="text-center py-4">
//               <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
//               <p className="font-semibold text-gray-900 dark:text-white mb-2">Check your inbox</p>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Password reset email sent. Enter the 6-digit OTP from your email within 15 minutes.</p>
//               <Link to="/reset-password" className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
//                 Enter OTP →
//               </Link>
//             </div>
//           ) : (
//             <>
//               {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
//                   <input {...register('email')} type="email" placeholder="jane@example.com"
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm" />
//                   {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
//                 </div>
//                 <button type="submit" disabled={isSubmitting}
//                   className="w-full py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
//                   {isSubmitting && <Loader2 size={16} className="animate-spin" />}
//                   Send Reset Email
//                 </button>
//               </form>
//             </>
//           )}
//           <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
//             <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">← Back to login</Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   )
// }



import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Loader2, CheckCircle, ShieldAlert, ArrowLeft, Mail } from 'lucide-react'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const schema = z.object({ email: z.string().email('Valid operational email required') })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Protocol Failure: Request Denied')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      {/* Background Grid Protocol */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6">
            <TrendingUp size={28} className="text-white" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none">
            Recovery <span className="text-orange-500">Node</span>
          </h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.3em]">
            Requesting Access Authorization
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail size={40} className="text-orange-500" />
                </div>
                <p className="font-black text-white uppercase tracking-widest text-sm">Transmission Sent</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-3 tracking-wider leading-relaxed">
                  Verification OTP dispatched to your inbox. <br/>Valid for 15:00 minutes.
                </p>
                <div className="mt-8">
                  <Link 
                    to="/reset-password" 
                    className="w-full py-4 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-[1000] text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                  >
                    Enter Authorization Code →
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase"
                  >
                    <ShieldAlert size={14} />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Operational Email
                  </label>
                  <div className="relative">
                    <input 
                      {...register('email')} 
                      type="email" 
                      placeholder="operator@system.io"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl bg-white/5 border text-sm font-bold text-white transition-all focus:outline-none focus:bg-white/10 placeholder:text-slate-800",
                        errors.email ? "border-red-500/50" : "border-white/5 focus:border-orange-500/50"
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-[1000] text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Request Reset Link'}
                </button>
              </form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={12} /> Return to Authentication
            </Link>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center gap-6 opacity-20">
            <div className="h-px w-12 bg-white/50 self-center" />
            <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">System Protected</span>
            <div className="h-px w-12 bg-white/50 self-center" />
        </div>
      </motion.div>
    </div>
  )
}
