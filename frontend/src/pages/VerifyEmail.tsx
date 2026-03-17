// import { useState } from 'react'
// import { useNavigate, useLocation, Link } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { TrendingUp, Loader2, Mail, KeyRound, CheckCircle2 } from 'lucide-react'
// import { authApi } from '@/lib/api'

// const schema = z.object({
//   email: z.string().email('Invalid email'),
//   otp: z.string().length(6, 'OTP must be 6 digits'),
// })
// type FormData = z.infer<typeof schema>

// export default function VerifyEmail() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const prefillEmail = (location.state as { email?: string })?.email || ''

//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState(false)

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//     defaultValues: { email: prefillEmail, otp: '' },
//   })

//   const onSubmit = async (data: FormData) => {
//     setError('')
//     try {
//       await authApi.verifyEmail({ email: data.email, otp: data.otp })
//       setSuccess(true)
//       setTimeout(() => navigate('/login'), 2000)
//     } catch (e: any) {
//       setError(e.response?.data?.message || 'Verification failed. Check your OTP and try again.')
//     }
//   }

//   return (
//     <div className="min-h-screen flex animate-fade-in">

//       {/* ── Left panel ── */}
//       <div className="hidden lg:flex lg:w-1/2 auth-left-panel flex-col items-center justify-center p-12 relative overflow-hidden">
//         <div className="auth-orb-1 absolute -top-16 -left-16 w-80 h-80 rounded-full" />
//         <div className="auth-orb-2 absolute -bottom-12 -right-12 w-72 h-72 rounded-full" />
//         <div className="auth-orb-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" />

//         <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
//           <div className="auth-logo-icon w-9 h-9 rounded-xl flex items-center justify-center">
//             <TrendingUp size={17} className="text-white drop-shadow-sm" />
//           </div>
//           <span className="font-bold text-white text-sm tracking-wide drop-shadow-sm">Finance Tracker</span>
//         </div>

//         <div className="relative z-10 text-center space-y-4 animate-slide-up">
//           <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
//             <Mail size={36} className="text-white" />
//           </div>
//           <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
//           <p className="text-sm text-white/65 max-w-[240px] leading-relaxed">
//             We sent a 6-digit OTP to your email. Enter it to activate your account.
//           </p>
//           <p className="text-xs text-white/40">OTP is valid for 10 minutes.</p>
//         </div>

//         <p className="absolute bottom-8 text-sm font-semibold text-white/55 tracking-wide z-10">
//           Almost there!
//         </p>
//       </div>

//       {/* ── Right panel ── */}
//       <div className="flex-1 flex items-center justify-center auth-right-panel p-6">
//         <div className="w-full max-w-md animate-slide-in bg-white rounded-3xl shadow-xl shadow-emerald-100/60 px-10 py-10">

//           {/* Mobile logo */}
//           <div className="flex lg:hidden items-center gap-2 mb-8">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
//               <TrendingUp size={15} className="text-white" />
//             </div>
//             <span className="font-bold text-gray-800 text-sm">Finance Tracker</span>
//           </div>

//           {success ? (
//             <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
//               <CheckCircle2 size={52} className="text-emerald-500" />
//               <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
//               <p className="text-sm text-gray-400">Redirecting you to login...</p>
//             </div>
//           ) : (
//             <>
//               <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verify your email</h1>
//                 <p className="text-sm text-gray-400 mt-1.5">Enter the 6-digit OTP sent to your email</p>
//               </div>

//               {error && (
//                 <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
//                   <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-[10px] flex-shrink-0">!</span>
//                   {error}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email address</label>
//                   <div className="relative">
//                     <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                     <input {...register('email')} type="email" placeholder="you@example.com"
//                       className="auth-input pl-10 pr-4" />
//                   </div>
//                   {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OTP Code</label>
//                   <div className="relative">
//                     <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                     <input {...register('otp')} type="text" inputMode="numeric" maxLength={6}
//                       placeholder="6-digit code" className="auth-input pl-10 pr-4 tracking-widest text-center text-lg font-mono" />
//                   </div>
//                   {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}
//                 </div>

//                 <button type="submit" disabled={isSubmitting}
//                   className="auth-btn w-full py-3 rounded-xl text-white font-semibold text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
//                   {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : 'Verify Email →'}
//                 </button>
//               </form>

//               <div className="flex items-center gap-3 my-6">
//                 <div className="flex-1 h-px bg-gray-100" />
//                 <span className="text-xs text-gray-400 font-medium">Wrong account?</span>
//                 <div className="flex-1 h-px bg-gray-100" />
//               </div>

//               <Link to="/register"
//                 className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm
//                   hover:border-emerald-400 hover:text-emerald-600
//                   active:scale-[0.98] transition-all flex items-center justify-center">
//                 Back to Register
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }



import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Loader2, Mail, KeyRound, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Operational email required'),
  otp: z.string().length(6, 'Authorization code must be 6 digits'),
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
      setTimeout(() => navigate('/login'), 2500)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Verification failed: Invalid Authorization Code.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#050505] selection:bg-orange-500 selection:text-white font-sans overflow-hidden">
      
      {/* ── LEFT PANEL: SYSTEM STATUS ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#080808]">
        {/* Background Grid Protocol */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} 
        />
        
        <div className="absolute top-10 left-10 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <TrendingUp size={20} className="text-white" strokeWidth={3} />
          </div>
          <span className="font-black text-white text-xs uppercase tracking-[0.3em]">System.Node</span>
        </div>

        <div className="relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto"
          >
            <Mail size={42} className="text-orange-500" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none">Check <span className="text-orange-500">Inbox</span></h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
              A 6-digit authorization code has been dispatched to your primary node.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-white/40">Waiting for user input...</span>
          </div>
        </div>

        <p className="absolute bottom-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
          End-to-End Encrypted Verification
        </p>
      </div>

      {/* ── RIGHT PANEL: AUTHENTICATION GATE ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[440px] bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl p-10 md:p-12"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-[1000] text-white uppercase tracking-tighter">Access Granted</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Initializing user environment...</p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
                <div className="mb-10">
                  <h1 className="text-3xl font-[1000] text-white tracking-tighter uppercase leading-none">Verify <span className="text-orange-500">Identity</span></h1>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 leading-relaxed">Enter the authorization code to complete the uplink sequence.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase flex items-center gap-3">
                    <ShieldAlert size={14} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Uplink Node (Email)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input 
                        {...register('email')} 
                        type="email" 
                        placeholder="operator@system.io"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border text-sm font-bold text-white transition-all focus:outline-none focus:bg-white/10 placeholder:text-slate-800",
                          errors.email ? "border-red-500/50" : "border-white/5 focus:border-orange-500/50"
                        )}
                      />
                    </div>
                    {errors.email && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorization Code</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input 
                        {...register('otp')} 
                        type="text" 
                        inputMode="numeric" 
                        maxLength={6}
                        placeholder="000 000"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border text-center text-xl font-black tracking-[0.5em] text-orange-500 transition-all focus:outline-none focus:bg-white/10 placeholder:text-slate-800",
                          errors.otp ? "border-red-500/50" : "border-white/5 focus:border-orange-500/50"
                        )}
                      />
                    </div>
                    {errors.otp && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 ml-1">{errors.otp.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-[1000] text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Authorizing...</> : 'Complete Uplink →'}
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5">
                  <Link to="/register" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors">
                    <ArrowLeft size={12} /> Return to Registration
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}


// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { motion, AnimatePresence } from 'framer-motion'
// import { TrendingUp, Loader2, Mail, ArrowLeft, ShieldQuestion, CheckCircle2 } from 'lucide-react'
// import { authApi } from '@/lib/api'

// const schema = z.object({
//   email: z.string().email('Operational email required for recovery'),
// })
// type FormData = z.infer<typeof schema>

// export default function ForgotPassword() {
//   const [isSent, setIsSent] = useState(false)
//   const [error, setError] = useState('')

//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
//     resolver: zodResolver(schema),
//   })

//   const onSubmit = async (data: FormData) => {
//     setError('')
//     try {
//       await authApi.forgotPassword(data)
//       setIsSent(true)
//     } catch (e: any) {
//       setError(e.response?.data?.message || 'Recovery sequence failed. Node not found.')
//     }
//   }

//   return (
//     <div className="min-h-screen flex bg-[#050505] font-sans selection:bg-orange-500/30 overflow-hidden">
      
//       {/* ── LEFT PANEL: RECOVERY STATUS ── */}
//       <div className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#080808]">
//         <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
//           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
//         />
        
//         <div className="absolute top-10 left-10 flex items-center gap-3 z-10">
//           <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
//             <TrendingUp size={20} className="text-white" strokeWidth={3} />
//           </div>
//           <span className="font-black text-white text-xs uppercase tracking-[0.3em]">System.Recovery</span>
//         </div>

//         <div className="relative z-10 text-center space-y-6">
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }} 
//             animate={{ opacity: 1, y: 0 }}
//             className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto"
//           >
//             <ShieldQuestion size={42} className="text-orange-500" />
//           </motion.div>
//           <div className="space-y-2">
//             <h2 className="text-3xl font-[1000] text-white uppercase tracking-tighter leading-none">Lost <span className="text-orange-500">Access?</span></h2>
//             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed">
//               Initiate a security override to reset your primary authentication key.
//             </p>
//           </div>
//         </div>

//         <p className="absolute bottom-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
//           Identity Validation Required
//         </p>
//       </div>

//       {/* ── RIGHT PANEL: RECOVERY GATE ── */}
//       <div className="flex-1 flex items-center justify-center p-6 relative bg-white">
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.95 }} 
//           animate={{ opacity: 1, scale: 1 }}
//           className="w-full max-w-[440px] p-8"
//         >
//           <AnimatePresence mode="wait">
//             {isSent ? (
//               <motion.div 
//                 key="sent"
//                 initial={{ opacity: 0, x: 20 }} 
//                 animate={{ opacity: 1, x: 0 }}
//                 className="text-center space-y-6"
//               >
//                 <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto">
//                   <CheckCircle2 size={40} className="text-emerald-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-3xl font-[1000] text-black uppercase tracking-tighter">Link Dispatched</h2>
//                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
//                     A recovery bridge has been sent to your email. Check your inbox to reset your key.
//                   </p>
//                 </div>
//                 <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest pt-4 hover:gap-4 transition-all">
//                   <ArrowLeft size={14} /> Return to Login
//                 </Link>
//               </motion.div>
//             ) : (
//               <motion.div key="form">
//                 <div className="mb-10">
//                   <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">Password <span className="text-orange-500">Reset</span></h1>
//                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Provide the registered node email to receive a recovery link.</p>
//                 </div>

//                 {error && (
//                   <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase flex items-center gap-3">
//                     {error}
//                   </div>
//                 )}

//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                   <div className="space-y-2">
//                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
//                     <div className="relative">
//                       <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
//                       <input 
//                         {...register('email')} 
//                         type="email" 
//                         placeholder="OPERATOR@SYSTEM.IO"
//                         className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-50 text-xs font-bold uppercase tracking-widest focus:bg-white focus:border-black/10 transition-all outline-none"
//                       />
//                     </div>
//                     {errors.email && <p className="text-[9px] font-bold text-red-500 uppercase mt-1 ml-1">{errors.email.message}</p>}
//                   </div>

//                   <button 
//                     type="submit" 
//                     disabled={isSubmitting}
//                     className="w-full py-5 rounded-2xl bg-black text-white font-[1000] text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-orange-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
//                   >
//                     {isSubmitting ? <><Loader2 size={16} className="animate-spin text-orange-500" /> Processing...</> : 'Send Recovery Link'}
//                   </button>
//                 </form>

//                 <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
//                   <Link to="/login" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest transition-colors">
//                     <ArrowLeft size={12} /> Back to Sign In
//                   </Link>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>
//       </div>
//     </div>
//   )
// }
