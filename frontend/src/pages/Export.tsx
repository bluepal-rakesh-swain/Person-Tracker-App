// import { useState } from 'react'
// import { motion } from 'framer-motion'
// import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react'
// import { csvApi } from '@/lib/api'

// export default function Export() {
//   const [loading, setLoading] = useState(false)
//   const [done, setDone] = useState(false)

//   const handleExport = async () => {
//     setLoading(true)
//     setDone(false)
//     try {
//       const res = await csvApi.export()
//       const url = window.URL.createObjectURL(new Blob([res.data]))
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'transactions.csv'
//       a.click()
//       window.URL.revokeObjectURL(url)
//       setDone(true)
//       setTimeout(() => setDone(false), 3000)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export</h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download your transactions as CSV</p>
//       </div>

//       <div className="card-base p-10 flex flex-col items-center text-center space-y-5">
//         <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
//           <FileText size={28} className="text-emerald-500" />
//         </div>
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Export Transactions</h3>
//           <p className="text-sm text-gray-400">All your transactions will be exported as a CSV file.</p>
//         </div>

//         <motion.button
//           onClick={handleExport}
//           disabled={loading}
//           whileTap={{ scale: 0.97 }}
//           className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60"
//         >
//           {loading ? (
//             <><Loader2 size={16} className="animate-spin" /> Exporting...</>
//           ) : done ? (
//             <><CheckCircle size={16} /> Downloaded!</>
//           ) : (
//             <><Download size={16} /> Download CSV</>
//           )}
//         </motion.button>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, CheckCircle, Loader2, Database, ShieldCheck } from 'lucide-react'
import { csvApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function Export() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    setDone(false)
    try {
      const res = await csvApi.export()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `SYSTEM_EXTRACT_${new Date().getTime()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    } catch (error) {
      console.error("Extraction failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-10 selection:bg-orange-500 selection:text-white">
      {/* --- HEADER --- */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
          <Database size={12} className="text-orange-500" />
          <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em]">Data Management Layer</span>
        </div>
        <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
          Data <span className="text-orange-500">Extraction</span>
        </h1>
        <p className="text-slate-400 mt-4 text-[10px] font-black uppercase tracking-widest">
          Secure Export of Ledger Transactions
        </p>
      </div>

      {/* --- EXTRACTION CARD --- */}
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.04)] relative overflow-hidden group">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
          <FileText size={180} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <FileText size={32} className="text-orange-500" />
          </div>

          <div className="space-y-2 mb-10">
            <h3 className="text-xl font-[1000] text-black uppercase tracking-tighter">CSV Protocol Generate</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              Initiate full sequence export of cluster transactions into a standardized comma-separated values format.
            </p>
          </div>

          <motion.button
            onClick={handleExport}
            disabled={loading}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "relative flex items-center gap-4 px-10 py-5 rounded-2xl font-[1000] text-[11px] uppercase tracking-[0.2em] transition-all duration-300 shadow-xl active:shadow-none",
              done 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-black text-white hover:bg-orange-500 shadow-black/10 hover:shadow-orange-500/20"
            )}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-orange-500" />
                <span>Decrypting & Packaging...</span>
              </>
            ) : done ? (
              <>
                <CheckCircle size={18} className="text-white" />
                <span>Extraction Complete</span>
              </>
            ) : (
              <>
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Initialize Download</span>
              </>
            )}
          </motion.button>

          <div className="mt-10 flex items-center gap-2 opacity-30">
            <ShieldCheck size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted Extract</span>
          </div>
        </div>
      </div>

      {/* --- FOOTER INFO --- */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Format</p>
          <p className="text-xs font-bold text-black uppercase">CSV / UTF-8</p>
        </div>
        <div className="p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30 text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs font-bold text-orange-500 uppercase">Operational</p>
        </div>
      </div>
    </div>
  )
}
