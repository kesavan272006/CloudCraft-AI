import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import {
  Loader2, TrendingUp, Target,
  History,
  Activity, ShieldCheck, Zap,
  Image as ImageIcon, Rocket,
  Fingerprint, Cpu, Globe, Layers, CheckCircle2, Terminal,
  ChevronRight, BrainCircuit
} from "lucide-react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, Tooltip as RechartsTooltip, CartesianGrid,
} from 'recharts'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from "@/lib/utils"

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'Performance Oracle', href: '/performance-oracle', isActive: true, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

type OracleState = 'idle' | 'scanning' | 'results'

export default function PerformanceOraclePage() {
  const [activeState, setActiveState] = useState<OracleState>('idle')
  const [content, setContent] = useState('')
  const [visualUrl, setVisualUrl] = useState('')
  const [_loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const scanSteps = [
    { label: "Uplink Established", icon: <Globe className="h-3 w-3" /> },
    { label: "Sentiment Ingest", icon: <Layers className="h-3 w-3" /> },
    { label: "Visual DNA Audit", icon: <ImageIcon className="h-3 w-3" /> },
    { label: "Viral Trigger Synthesis", icon: <Zap className="h-3 w-3" /> },
    { label: "Strategy Formulation", icon: <Cpu className="h-3 w-3" /> }
  ]

  useEffect(() => {
    if (activeState === 'scanning') {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < scanSteps.length ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [activeState])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/oracle/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error("Failed to fetch history", e)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!content.trim()) return
    setActiveState('scanning')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/oracle/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          visual_url: visualUrl || null
        }),
      })
      if (!response.ok) throw new Error("Oracle connection failed")
      const data = await response.json()

      const enrichedData = {
        ...data,
        sentiment: data.sentiment || [
          { name: 'Excitement', value: 45 },
          { name: 'Trust', value: 25 },
          { name: 'Urgency', value: 20 },
          { name: 'Logic', value: 10 },
        ],
        platform_reach: data.platform_reach || [
          { name: 'Linked-In', value: 92 },
          { name: 'Insta', value: 75 },
          { name: 'X', value: 68 },
          { name: 'Web', value: 45 },
        ]
      }

      setTimeout(() => {
        setResult(enrichedData)
        setActiveState('results')
        toast.success("Prediction finalized")
      }, 400)

    } catch (err: any) {
      toast.error("Prediction failed")
      setActiveState('idle')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setActiveState('idle')
    setContent('')
    setVisualUrl('')
    setResult(null)
  }

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4">
          <TopNav links={topNav} />
        </div>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 md:px-8 py-10 max-w-7xl mx-auto space-y-10 relative w-full bg-background min-h-screen overflow-hidden">

        {/* ── Premium dot-matrix background ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* ── Gradient mesh overlay ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 18% 18%, rgba(99,102,241,0.09) 0%, transparent 50%), radial-gradient(circle at 82% 72%, rgba(168,85,247,0.09) 0%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(236,72,153,0.06) 0%, transparent 50%)' }}
        />

        {/* ── Floating orbs ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-500/8 via-purple-500/8 to-pink-500/8 blur-3xl"
            animate={{ x: [0, 70, 0], y: [0, -45, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '-10%', left: '-5%' }}
          />
          <motion.div
            className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-r from-violet-500/8 via-indigo-500/8 to-cyan-500/8 blur-3xl"
            animate={{ x: [0, -45, 0], y: [0, 65, 0], scale: [1, 1.18, 1] }}
            transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{ bottom: '3%', right: '-3%' }}
          />
        </div>

        {/* ── PAGE HEADER ── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <motion.div
              className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 text-primary text-xs font-bold shadow-lg shadow-primary/15 uppercase tracking-widest gap-2 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-lg shadow-primary/50" />
              </span>
              Predictive Intelligence · Armed
            </motion.div>
            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                Performance
              </span>
              <span className="italic bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Oracle
              </span>
              <BrainCircuit className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
            </motion.h1>
            <motion.p
              className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Synchronize your content with real-time market sentiment and engagement velocity.
            </motion.p>
          </div>

          <motion.div
            className="flex items-center gap-3 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {activeState === 'results' && (
              <Button
                variant="outline"
                onClick={resetAll}
                className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl"
              >
                <Rocket className="w-4 h-4 mr-2" /> New Forecast
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  onClick={fetchHistory}
                  className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl"
                  disabled={historyLoading}
                >
                  {historyLoading
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <History className="w-4 h-4 mr-2" />
                  }
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[420px] border-l border-border/40 bg-background/95 backdrop-blur-2xl">
                <SheetHeader className="pb-6 border-b border-border/20">
                  <SheetTitle className="font-bold text-xl flex items-center gap-3">
                    <History className="h-5 w-5 text-primary" />
                    Signal{' '}
                    <span className="italic bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                      Archives
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3 overflow-y-auto max-h-[80vh] pr-2" style={{ scrollbarWidth: 'none' }}>
                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground/40">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Accessing Logs…</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground/30">
                      <Activity className="h-10 w-10 opacity-20" />
                      <p className="text-xs uppercase tracking-widest font-semibold">No records found</p>
                    </div>
                  ) : history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group rounded-2xl border border-border/40 bg-card/30 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => {
                        setContent(item.input_content)
                        setResult(item.response)
                        setActiveState('results')
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-[9px] border-border/30 uppercase tracking-widest">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Badge>
                        <span className="text-xs font-black text-primary italic">{item.response.viral_score}% VIRAL</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2 italic leading-relaxed">
                        "{item.input_content}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        </motion.div>

        {/* ── MAIN CONTENT (AnimatePresence for state transitions) ── */}
        <AnimatePresence mode="wait">

          {/* ── IDLE STATE ── */}
          {activeState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10"
            >
              {/* Textarea card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="lg:col-span-8"
              >
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group relative">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-violet-500/60 to-transparent rounded-t-2xl" />
                  <div className="px-6 pt-6 pb-2 border-b border-border/30 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Draft</p>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Paste your draft — LinkedIn post, Twitter thread, ad copy, or campaign script…"
                    className="min-h-[280px] text-base bg-transparent border-none focus-visible:ring-0 resize-none font-medium p-6 placeholder:text-muted-foreground/30 text-foreground/90"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="px-6 py-4 bg-muted/20 border-t border-border/20 flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ImageIcon className="h-4 w-4 text-primary/40 shrink-0" />
                      <Input
                        placeholder="Visual asset URL (Rekognition audit)…"
                        className="bg-transparent border-none focus-visible:ring-0 shadow-none text-xs h-8 text-muted-foreground placeholder:text-muted-foreground/30"
                        value={visualUrl}
                        onChange={(e) => setVisualUrl(e.target.value)}
                      />
                    </div>
                    {content.trim() && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] font-mono text-muted-foreground/50"
                      >
                        {content.length} chars
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* CTA sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="lg:col-span-4 flex flex-col gap-5"
              >
                {/* Oracle CTA card */}
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl p-8 flex flex-col items-center justify-between gap-8 shadow-xl shadow-primary/5 relative overflow-hidden group flex-1">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                  <div className="space-y-4 text-center relative z-10 w-full">
                    <motion.div
                      className="h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-xl shadow-primary/10"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Zap className="h-8 w-8" />
                    </motion.div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">Oracle Ready</p>
                      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                        AI-powered sentiment, viral scoring &amp; engagement forecast
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-3 relative z-10">
                    <Button
                      onClick={handlePredict}
                      disabled={!content.trim()}
                      size="lg"
                      className="w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all gap-2 disabled:opacity-40"
                    >
                      Authorize Prediction
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground/40 leading-relaxed">
                      Powered by AWS Comprehend · Bedrock · Rekognition
                    </p>
                  </div>
                </div>

                {/* Stats pills */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Avg. Accuracy', value: '94%', color: 'emerald' },
                    { label: 'Models Active', value: '5', color: 'violet' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className={cn(
                        "rounded-xl border p-4 backdrop-blur-xl text-center shadow-lg",
                        stat.color === 'emerald'
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-violet-500/20 bg-violet-500/5'
                      )}
                    >
                      <p className={cn("text-xl font-black tracking-tight",
                        stat.color === 'emerald' ? 'text-emerald-500' : 'text-violet-500'
                      )}>{stat.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── SCANNING STATE ── */}
          {activeState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 relative z-10"
            >
              <div className="w-full max-w-lg">
                <motion.div
                  className="rounded-2xl border border-border/50 bg-[#09090b] shadow-2xl shadow-black/30 overflow-hidden"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  {/* Terminal header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30 bg-white/[0.02]">
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-xs font-mono font-semibold tracking-widest text-primary uppercase">
                        Oracle Handshake
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/50" />
                      <span className="text-[10px] text-muted-foreground font-mono bg-black/60 px-2 py-0.5 rounded border border-border/40">
                        oracle.predict.sys
                      </span>
                    </div>
                  </div>

                  {/* Scan steps */}
                  <div className="p-5 space-y-2.5 font-mono text-[11px]">
                    {scanSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: i <= terminalIndex ? 1 : 0.15,
                          x: 0,
                        }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                          i < terminalIndex
                            ? "bg-emerald-500/[0.06] text-emerald-400"
                            : i === terminalIndex
                            ? "bg-primary/10 text-primary"
                            : "text-zinc-600"
                        )}
                      >
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-current/10">
                          {i < terminalIndex
                            ? <CheckCircle2 className="h-3.5 w-3.5" />
                            : step.icon
                          }
                        </div>
                        <span className="font-bold uppercase tracking-widest flex-1">{step.label}</span>
                        {i === terminalIndex && (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-[10px] text-primary/60"
                          >
                            processing…
                          </motion.span>
                        )}
                        {i < terminalIndex && (
                          <span className="text-[10px] text-emerald-500/60 font-bold">DONE</span>
                        )}
                      </motion.div>
                    ))}

                    {/* Blinking cursor line */}
                    <motion.div
                      className="flex gap-3 text-primary/30 mt-3 px-3"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-primary/20">❯</span>
                      <span>Synthesizing intelligence vectors…</span>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6 flex items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    Secure AWS uplink established
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS STATE ── */}
          {activeState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 pb-24 relative z-10"
            >

              {/* ── Hero Score Section ── */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Hero banner */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="lg:col-span-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl p-10 min-h-[260px] relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-primary/5"
                >
                  <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                  <Fingerprint className="absolute -right-10 -top-10 h-72 w-72 text-primary opacity-[0.025] pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/30 text-[10px] font-mono tracking-widest uppercase shadow-lg shadow-primary/10">
                        <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        Tactical Forecast
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest font-mono">
                          Confidence: {result.confidence_level}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-none">
                        <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                          Performance
                        </span>{' '}
                        <span className="italic bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                          Synchronized
                        </span>
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed max-w-2xl font-light">
                        Strategic predictive analysis complete. Viral engagement probability is locked with hardware-accelerated precision.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Viral score ring */}
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-8 flex flex-col items-center justify-center gap-6 shadow-xl shadow-black/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">
                    Viral Velocity
                  </p>
                  <div className="relative h-40 w-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 176 176">
                      <circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border/30" />
                      <motion.circle
                        cx="88" cy="88" r="76"
                        stroke="url(#viralGrad)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 76}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - result.viral_score / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                      />
                      <defs>
                        <linearGradient id="viralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <motion.span
                      className="text-6xl font-black text-foreground tracking-tighter relative z-10"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      {result.viral_score}
                    </motion.span>
                  </div>
                  <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest relative z-10">
                    Score Index
                  </Badge>
                </motion.div>
              </div>

              {/* ── Core Insights Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Radar: Attribute Pulse */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                  className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                      <Target className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[9px] border-indigo-500/20 text-indigo-400 px-3 py-0.5 font-bold uppercase tracking-widest rounded-full">
                      Attribute Pulse
                    </Badge>
                  </div>
                  <div className="h-[220px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={result.radar_data} outerRadius="78%">
                        <PolarGrid stroke="currentColor" opacity={0.06} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: '700', fill: '#888', letterSpacing: '0.08em' }} />
                        <Radar dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="#6366f1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Area: 24H Velocity */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                  className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 px-3 py-0.5 font-bold uppercase tracking-widest rounded-full">
                      24H Velocity Proj.
                    </Badge>
                  </div>
                  <div className="h-[220px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.forecast_data}>
                        <defs>
                          <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.04} />
                        <XAxis dataKey="time" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#666" axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.85)', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2.5} fill="url(#velocityGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Analysis report card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.45 }}
                  className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-[3px] bottom-0 w-[3px] bg-gradient-to-b from-primary via-violet-500 to-transparent rounded-full" />
                  <Rocket className="absolute -right-6 -bottom-6 h-40 w-40 text-primary opacity-[0.04] rotate-12 pointer-events-none" />
                  <div className="space-y-5 relative z-10">
                    <Badge className="bg-primary/15 text-primary border-primary/25 text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">
                      Directive Extract
                    </Badge>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">System Assessment</p>
                      <h3 className="text-lg font-bold text-foreground leading-snug">Strategic Impact High</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic border-t border-border/30 pt-4">
                      "{result.analysis_report}"
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* ── Visual DNA Audit (Rekognition) ── */}
              {result.visual_audit && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border/30 pb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">Visual DNA Audit</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">AWS Rekognition</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Sentiment</p>
                        <span className="text-sm font-black uppercase text-emerald-500">
                          {result.visual_audit.sentiment}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-border/30" />
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Tech Quality</p>
                        <span className="text-2xl font-black tracking-tighter">
                          {result.visual_audit.technical_quality}
                          <span className="text-[11px] text-muted-foreground/40 ml-0.5">/100</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        Rekognition Intercepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.visual_audit.labels.map((label: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="px-3 py-1.5 bg-muted/40 rounded-xl border border-border/40 text-[10px] font-bold uppercase tracking-widest hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default"
                          >
                            {label}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-6 space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                        Optimization Directive
                      </p>
                      <p className="text-sm font-medium italic leading-relaxed text-foreground/80 border-l-2 border-primary/30 pl-4">
                        "{result.visual_audit.recommendation}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Action Terminal ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="pt-8"
              >
                <div className="max-w-3xl mx-auto text-center space-y-8">
                  <div className="space-y-3">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Weaponize
                      </span>{' '}
                      <span className="italic bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                        Intelligence
                      </span>
                    </h2>
                    <p className="text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
                      Transfer predictive vectors to the Forge and Architect nodes for immediate deployment.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      onClick={resetAll}
                      size="lg"
                      className="h-13 px-10 rounded-xl font-bold text-sm shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all gap-2"
                    >
                      <Rocket className="h-5 w-5" />
                      Execute New Forecast
                    </Button>
                    <div className="flex items-center gap-2 px-5 py-3 bg-card/40 backdrop-blur-xl border border-border/40 rounded-xl shadow-inner">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Uplink: Secure
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 to-transparent rounded-l-2xl" />
                    <History className="h-5 w-5 text-muted-foreground/20 absolute right-6 top-5" />
                    <p className="text-base font-light italic leading-relaxed text-muted-foreground/50 select-none line-clamp-3">
                      "{content}"
                    </p>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/performance-oracle/')({
  component: PerformanceOraclePage,
})