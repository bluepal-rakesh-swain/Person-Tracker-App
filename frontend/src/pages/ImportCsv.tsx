import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, ArrowRight, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react'
import { csvApi, categoryApi } from '@/lib/api'
import type { Category, ImportResult } from '@/types'

const FIELD_OPTIONS = [
  { value: '', label: '— skip —' },
  { value: 'date', label: 'Date' },
  { value: 'desc', label: 'Description' },
  { value: 'amount', label: 'Amount (combined)' },
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
]

const DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'dd-MM-yyyy', 'MM-dd-yyyy']

type Step = 'upload' | 'mapping' | 'result'

export default function ImportCsv() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [dateFormat, setDateFormat] = useState('yyyy-MM-dd')
  const [defaultCategoryId, setDefaultCategoryId] = useState<number>(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })
  const categories: Category[] = catRes?.data?.data || []

  const importMutation = useMutation({
    mutationFn: () => {
      const mappingObj: Record<string, string | number> = { dateFormat, defaultCategoryId }
      Object.entries(mapping).forEach(([header, field]) => {
        if (field) mappingObj[field] = header
      })
      return csvApi.import(file!, mappingObj)
    },
    onSuccess: (res) => {
      setResult(res.data.data)
      setStep('result')
    },
  })

  const handleFile = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const firstLine = text.split('\n')[0]
      const cols = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      setHeaders(cols)
      const init: Record<string, string> = {}
      cols.forEach(h => { init[h] = '' })
      setMapping(init)
    }
    reader.readAsText(f)
    setStep('mapping')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) handleFile(f)
  }

  const reset = () => {
    setStep('upload'); setFile(null); setHeaders([]); setMapping({})
    setResult(null); setDefaultCategoryId(0)
  }

  const STEPS = ['Upload', 'Map Columns', 'Done']
  const stepIdx = step === 'upload' ? 0 : step === 'mapping' ? 1 : 2

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import CSV</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Import transactions from a CSV file</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < stepIdx ? 'bg-emerald-500 text-white' : i === stepIdx ? 'gradient-brand text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {i < stepIdx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === stepIdx ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <ArrowRight size={14} className="text-gray-300 dark:text-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`card-base p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${
                dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <Upload size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Drop your CSV here</h3>
              <p className="text-sm text-gray-400">or click to browse</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          </motion.div>
        )}

        {step === 'mapping' && (
          <motion.div key="mapping" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="card-base p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <FileText size={18} className="text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{file?.name}</p>
                <p className="text-xs text-gray-400">{headers.length} columns detected</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Map CSV columns to fields</p>
              {headers.map(h => (
                <div key={h} className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                    {h}
                  </div>
                  <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                  <select value={mapping[h] || ''} onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date Format</label>
                <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Category</label>
                <select value={defaultCategoryId} onChange={e => setDefaultCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={0}>None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {importMutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                Import failed. Check your column mapping and try again.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={reset}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Back
              </button>
              <button onClick={() => importMutation.mutate()} disabled={importMutation.isPending}
                className="flex-1 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {importMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Import
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-base p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Complete</h3>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{result.imported}</p>
                <p className="text-sm text-gray-400 mt-1">Imported</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{result.skipped}</p>
                <p className="text-sm text-gray-400 mt-1">Skipped</p>
              </div>
            </div>
            <button onClick={reset}
              className="px-6 py-2.5 rounded-xl gradient-brand text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-90 transition-all">
              Import Another File
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
