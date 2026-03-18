

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, BarChart2, ShieldCheck, Upload,
  Tag, PieChart, ArrowRight, CheckCircle2,
  Twitter, Github, Linkedin, Mail, Phone,
  ArrowUpRight, DollarSign, Target, FileText, Zap, Sparkles, Globe, ChevronRight
} from 'lucide-react'

const features = [
  { icon: BarChart2, color: '#f97316', title: 'Expense Tracking', desc: 'Precision logging for every transaction with neural-link speed.' },
  { icon: Target, color: '#fb923c', title: 'Budget Management', desc: 'Predictive budgeting that alerts you before you overspend.' },
  { icon: Upload, color: '#f97316', title: 'Smart CSV Import', desc: 'Automated bank-to-dashboard mapping with 99% accuracy.' },
  { icon: PieChart, color: '#fb923c', title: 'Neural Analytics', desc: 'Visualize your wealth journey with interactive 4D data models.' },
  { icon: Tag, color: '#f97316', title: 'Custom Taxonomy', desc: 'Organize your finances exactly how your mind works.' },
  { icon: FileText, color: '#fb923c', title: 'Global Reporting', desc: 'One-click tax-ready exports for any jurisdiction.' },
]

const carouselTexts = ["Your Future.", "Your Wealth.", "Your Freedom.", "Your Control."]

export default function LandingPage() {
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % carouselTexts.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-slate-400 font-sans selection:bg-orange-500/30">
      
      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-[100] border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={20} className="text-black" strokeWidth={3} />
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase">Personal Finance Tracker<span className="text-orange-500">.</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Security', 'Company'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors tracking-[0.2em] uppercase">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-white hover:text-orange-500 transition-colors uppercase tracking-widest">Login</Link>
            <Link to="/register" className="bg-orange-500 text-black text-xs font-black px-8 py-3 rounded-full hover:bg-orange-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)] uppercase tracking-widest">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center">
        {/* Cinematic Grid & Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[140px]" />
          <div className="absolute bottom-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ backgroundImage: `radial-gradient(#f97316 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-500 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
              <Sparkles size={14} />
              <span>Institutional Grade Security</span>
            </div>
            
            <h1 className="text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase">
              Master <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                {carouselTexts[textIndex]}
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-md leading-relaxed mb-10 font-medium">
              A hyper-visual command center for your capital. Track, analyze, and scale your net worth with the world's most powerful finance engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/register" className="bg-orange-500 hover:bg-orange-400 px-10 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-orange-500/20">
                  <span className="text-black font-black text-lg uppercase tracking-tighter">Open Free Account</span>
                  <ArrowRight className="text-black group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Cinematic Dashboard Preview */}
          <div className="relative">
             <div className="relative z-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between mb-12">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Portfolio Value</p>
                     <p className="text-5xl font-black text-white tracking-tighter">₹8,42,000<span className="text-orange-500">.</span></p>
                   </div>
                   <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                      <TrendingUp className="text-orange-500" />
                   </div>
                </div>

                <div className="space-y-4">
                   {[70, 45, 90].map((w, i) => (
                     <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center px-6">
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                           <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${w}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
             <div className="absolute -bottom-10 -left-10 text-orange-500/10 font-black text-9xl select-none">Personal Finance Tracker</div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Verified Volume', value: '₹25Cr+' },
            { label: 'Active Command Centers', value: '12,000' },
            { label: 'System Latency', value: '<24ms' },
            { label: 'Security Grade', value: 'AES-256' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-white mb-2 tracking-tighter">{s.value}</p>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center lg:text-left">
           <div className="grid lg:grid-cols-3 gap-16 items-start">
              <div className="lg:col-span-1 sticky top-32">
                <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase leading-none">The Core <br/> Engine<span className="text-orange-500">.</span></h2>
                <p className="text-slate-500 font-medium mb-10">Advanced features built for high-performance financial management.</p>
                <Link to="/register" className="inline-flex items-center gap-2 text-orange-500 font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
                  Explore full stack <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
                {features.map((f, i) => (
                  <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[2rem] hover:border-orange-500/30 transition-all group">
                    <div className="w-14 h-14 bg-orange-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-black transition-all">
                      <f.icon size={24} className="text-orange-500 group-hover:text-black" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">{f.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black pt-32 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} className="text-black" strokeWidth={3} />
              </div>
              <span className="font-black text-white text-3xl tracking-tighter uppercase">Personal Finance Tracker<span className="text-orange-500">.</span></span>
            </Link>
            <div className="flex gap-12">
               {['About', 'Privacy', 'Legal', 'Contact'].map(l => (
                 <a key={l} href="#" className="text-xs font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest">{l}</a>
               ))}
            </div>
          </div>
          <div className="text-center md:text-left pt-12 border-t border-white/5">
             <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em]">© 2026 Vault Analytics — All Systems Operational</p>
          </div>
        </div>
      </footer>
    </div>
  )
}