
import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, ArrowRight, CheckCircle, X, Loader2, AlertCircle, Cpu, Database, HardDrive } from 'lucide-react'
import { csvApi, categoryApi } from '@/lib/api'
import type { Category, ImportResult } from '@/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** ── Utility for merging tailwind classes ── */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FIELD_OPTIONS = [
  { value: '', label: '— SKIP COLUMN —' },
  { value: 'date', label: 'TRANSACTION DATE' },
  { value: 'desc', label: 'MEMO / DESCRIPTION' },
  { value: 'amount', label: 'NET AMOUNT' },
  { value: 'debit', label: 'DEBIT (-)' },
  { value: 'credit', label: 'CREDIT (+)' },
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

  const STEPS = ['Ingest', 'Map Schema', 'Finalize']
  const stepIdx = step === 'upload' ? 0 : step === 'mapping' ? 1 : 2

  return (
    <div className="space-y-10 animate-fade-in max-w-3xl mx-auto pb-20">
      
      {/* ── HEADER ── */}
      <div className="text-center">
        <h1 className="text-4xl font-[1000] text-black tracking-tighter uppercase leading-none">
          Data <span className="text-orange-500">Ingestion</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">
          Legacy CSV Synchronization Interface
        </p>
      </div>

      {/* ── STEPPER ── */}
      <div className="flex items-center justify-center gap-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border-2",
              i < stepIdx ? "bg-orange-500 border-orange-500 text-white" : 
              i === stepIdx ? "bg-black border-black text-white shadow-xl scale-110" : 
              "bg-white border-slate-100 text-slate-300"
            )}>
              {i < stepIdx ? <CheckCircle size={16} /> : `0${i + 1}`}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest hidden md:block",
              i === stepIdx ? "text-black" : "text-slate-300"
            )}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-[2px] w-8 bg-slate-100 mx-2" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "group bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-4 border-dashed",
                dragOver ? "border-orange-500 bg-orange-50/50" : "border-slate-100 hover:border-black"
              )}
            >
              <div className="w-24 h-24 rounded-[2rem] bg-black flex items-center justify-center mb-8 shadow-2xl group-hover:bg-orange-500 transition-colors">
                <Upload size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-[1000] text-black uppercase tracking-tighter mb-2">Upload Source File</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                Drag and drop CSV or click to scan directory<br/>
                <span className="text-orange-500">Supported encoding: UTF-8</span>
              </p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          </motion.div>
        )}

        {step === 'mapping' && (
          <motion.div key="mapping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 space-y-8">
            
            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem]">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Source</p>
                <p className="text-sm font-[1000] text-black uppercase tracking-tighter truncate">{file?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Count</p>
                <p className="text-sm font-[1000] text-orange-500 font-mono">{headers.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-[1px] flex-1 bg-slate-100" />
                 <p className="text-[10px] font-[1000] text-black uppercase tracking-[0.2em] px-4">Schema Mapping</p>
                 <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {headers.map(h => (
                  <div key={h} className="flex items-center gap-4 group">
                    <div className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 text-[11px] font-bold text-slate-600 font-mono truncate border border-transparent group-hover:border-slate-200 transition-all">
                      {h}
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                    <select 
                      value={mapping[h] || ''} 
                      onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                      className="flex-1 px-5 py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest outline-none hover:bg-orange-500 transition-all cursor-pointer"
                    >
                      {FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block">Date Parsing Rule</label>
                <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 focus:ring-orange-500">
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block">Default Node Allocation</label>
                <select value={defaultCategoryId} onChange={e => setDefaultCategoryId(Number(e.target.value))}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] font-bold outline-none focus:ring-2 focus:ring-orange-500">
                  <option value={0}>UNCATEGORIZED</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {importMutation.isError && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <AlertCircle size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest">Critical: Source parsing failed. Verify schema alignment.</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button onClick={reset}
                className="flex-1 py-5 rounded-2xl border-2 border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-black hover:border-black transition-all">
                Abort
              </button>
              <button onClick={() => importMutation.mutate()} disabled={importMutation.isPending}
                className="flex-1 py-5 rounded-2xl bg-black text-white text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {importMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                Execute Import
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-8">
            
            <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <CheckCircle size={40} className="text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-[1000] text-black uppercase tracking-tighter">Synchronization Complete</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Database state updated successfully</p>
            </div>

            <div className="grid grid-cols-2 gap-12 w-full max-w-sm">
              <div className="text-center">
                <p className="text-5xl font-[1000] text-black tracking-tighter">{result.imported}</p>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mt-2">Rows Committed</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-[1000] text-slate-200 tracking-tighter">{result.skipped}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Rows Ignored</p>
              </div>
            </div>

            <button onClick={reset}
              className="bg-black text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl active:scale-95">
              Sync Another Stream
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
