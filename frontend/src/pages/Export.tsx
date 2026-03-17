import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { csvApi } from '@/lib/api'

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
      a.download = 'transactions.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download your transactions as CSV</p>
      </div>

      <div className="card-base p-10 flex flex-col items-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
          <FileText size={28} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Export Transactions</h3>
          <p className="text-sm text-gray-400">All your transactions will be exported as a CSV file.</p>
        </div>

        <motion.button
          onClick={handleExport}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Exporting...</>
          ) : done ? (
            <><CheckCircle size={16} /> Downloaded!</>
          ) : (
            <><Download size={16} /> Download CSV</>
          )}
        </motion.button>
      </div>
    </div>
  )
}
