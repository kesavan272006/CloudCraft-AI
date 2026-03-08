import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCampaignStore } from '@/stores/campaign-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import {
  Search,
  Zap,
  Terminal,
  Eye,
  Headphones,
  BrainCircuit,
  Target,
  AlertTriangle,
  Globe,
  Cpu,
  Loader2,
  ShieldAlert,
  Network,
  Fingerprint,
  Rocket,
  ChevronRight,
  ShieldCheck,
  History,
  Lock,
  Activity,
  Crosshair,
} from "lucide-react"

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'Competitor Pulse', href: '/competitor-pulse', isActive: true, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const navigate = useNavigate()
  const { injectIntelligence } = useCampaignStore()

  const bootSequence = [
    { label: "Intercept Link",  icon: <Cpu className="h-3 w-3" />,       color: 'text-violet-400' },
    { label: "Market Audit",    icon: <Search className="h-3 w-3" />,     color: 'text-indigo-400' },
    { label: "Visual DNA",      icon: <Eye className="h-3 w-3" />,        color: 'text-sky-400'    },
    { label: "Sentiment Scan",  icon: <BrainCircuit className="h-3 w-3" />, color: 'text-pink-400' },
    { label: "Strike Vectors",  icon: <ShieldAlert className="h-3 w-3" />, color: 'text-amber-400' },
    { label: "Threat Mesh",     icon: <Network className="h-3 w-3" />,    color: 'text-emerald-400' },
  ]

  useEffect(() => {
    if (loading) {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < bootSequence.length ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [loading])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('http://localhost:8000/api/v1/competitor/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) throw new Error("Intercept link severed")
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
  }

  const handleDeploy = () => {
    setDeploying(true)
    injectIntelligence(result)
    toast.success("Intelligence Link Established", {
      description: "Directives transferred to Architect core.",
      icon: <Rocket className="h-4 w-4" />,
    })
    setTimeout(() => navigate({ to: '/campaign-architect' }), 1200)
  }

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4">
          <TopNav links={topNav} />
        </div>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="relative w-full min-h-screen bg-background overflow-x-hidden">

        {/* ── Premium dot-matrix background grid ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        {/* ── Gradient mesh overlay ── */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 12% 18%, rgba(99,102,241,0.09) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(168,85,247,0.09) 0%, transparent 50%), radial-gradient(circle at 55% 42%, rgba(236,72,153,0.06) 0%, transparent 50%)' }}
        />

        {/* ── Floating ambient orbs ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[620px] h-[620px] rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"
            animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '-10%', left: '-6%' }}
          />
          <motion.div
            className="absolute w-[480px] h-[480px] rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, 55, 0], scale: [1, 1.18, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{ bottom: '5%', right: '-2%' }}
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-10 space-y-10">

          {/* ── PAGE HEADER ── */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-3">
              {/* Live status pill */}
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
                Panopticon Engine · Armed
              </motion.div>

              <motion.h1
                className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                  Competitor
                </span>
                <span className="italic bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Pulse
                </span>
                <Crosshair className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              </motion.h1>

              <motion.p
                className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Analyze market signals and synthesize counter-strike directives.
              </motion.p>
            </div>

            {/* ── Search Bar ── */}
            <motion.div
              className="shrink-0 lg:w-[520px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl p-1.5 shadow-xl shadow-black/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 pointer-events-none rounded-2xl" />
                <div className="flex items-center gap-2 relative z-10">
                  <div className="relative flex-1">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={loading}
                      placeholder="Intercept @Handle or URL..."
                      className="pl-11 h-11 bg-transparent border-none text-sm font-medium focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="h-9 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20 gap-2"
                  >
                    {loading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Zap className="h-3 w-3" />
                    }
                    Pulse
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── CONTENT AREA ── */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">

              {/* ── LOADING STATE ── */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center pt-16"
                >
                  <div className="w-full max-w-md rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between pb-5 border-b border-border/40 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                          <Terminal className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-widest uppercase text-foreground">Intercept Stream</p>
                          <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">agent.panopticon.sys</p>
                        </div>
                      </div>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    </div>

                    <div className="space-y-2">
                      {bootSequence.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: i <= terminalIndex ? 1 : 0.15, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.3 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
                            i < terminalIndex
                              ? "bg-emerald-500/8 border border-emerald-500/15"
                              : i === terminalIndex
                                ? "bg-primary/8 border border-primary/20"
                                : "border border-transparent"
                          )}
                        >
                          <div className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 border",
                            i < terminalIndex
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : i === terminalIndex
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-muted/30 border-border/30 text-muted-foreground/30"
                          )}>
                            {i < terminalIndex
                              ? <ShieldCheck className="h-3.5 w-3.5" />
                              : step.icon
                            }
                          </div>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            i < terminalIndex ? "text-emerald-400"
                              : i === terminalIndex ? "text-primary"
                              : "text-muted-foreground/25"
                          )}>
                            {step.label}
                          </p>
                          {i === terminalIndex && (
                            <motion.span
                              className="ml-auto text-[9px] font-mono text-primary/50"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              compiling…
                            </motion.span>
                          )}
                          {i < terminalIndex && (
                            <span className="ml-auto text-[9px] font-mono text-emerald-500/60">done</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── ERROR STATE ── */}
              {error && !loading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-md mx-auto rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/8 to-destructive/3 backdrop-blur-xl p-12 text-center shadow-xl shadow-destructive/5 mt-16 space-y-6"
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="h-16 w-16 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-center justify-center text-destructive mx-auto shadow-inner">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold italic uppercase tracking-tight text-destructive">Signal Lost</h3>
                    <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-relaxed">{error}</p>
                  </div>
                  <Button
                    onClick={() => setError(null)}
                    size="sm"
                    variant="destructive"
                    className="rounded-xl px-8 uppercase font-bold text-[10px] tracking-widest hover:scale-105 transition-all"
                  >
                    Retry Link
                  </Button>
                </motion.div>
              )}

              {/* ── RESULTS ── */}
              {result && !loading && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8 pb-20"
                >
                  {/* ── Hero Panel ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Target Identity Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="lg:col-span-3 rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl p-10 min-h-[280px] relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-primary/5"
                    >
                      <Fingerprint className="absolute -right-12 -top-12 h-80 w-80 text-primary opacity-[0.025] pointer-events-none" />
                      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                      <div
                        className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
                      />

                      <div className="space-y-6 relative z-10 w-full">
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/30 text-[10px] font-mono tracking-widest uppercase shadow-lg shadow-primary/10 backdrop-blur-xl">
                            <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                            Target Identity
                          </Badge>
                          <div className="flex items-center gap-2">
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                              animate={{ opacity: [1, 0.4, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Panopticon Sync: 99.8%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <motion.h2
                            className="text-4xl sm:text-6xl font-bold tracking-tighter bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent leading-[1.0] break-all uppercase"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            {result.competitor_handle}
                          </motion.h2>
                          <p className="text-muted-foreground text-base italic max-w-xl leading-relaxed">
                            "Market audit complete. Extraction of high-fidelity sensory and strategic vectors is finalized."
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Hazard Coefficient */}
                    <motion.div
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl p-8 flex flex-col items-center justify-center gap-6 shadow-xl shadow-black/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] z-10">Hazard Coefficient</p>
                      <div className="relative h-40 w-40 flex items-center justify-center z-10">
                        <svg className="absolute w-full h-full -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-border/30" />
                          <motion.circle
                            cx="80" cy="80" r="70"
                            stroke="url(#threatGrad)" strokeWidth="8" fill="transparent"
                            strokeDasharray="440"
                            initial={{ strokeDashoffset: 440 }}
                            animate={{ strokeDashoffset: 440 - (440 * result.threat_level) / 100 }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="threatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="rgb(168,85,247)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <motion.span
                          className="text-5xl font-black text-foreground tracking-tighter"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                        >
                          {result.threat_level}
                        </motion.span>
                      </div>
                      <Badge className="text-[9px] bg-primary/15 text-primary border border-primary/25 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] z-10">
                        Priority: High
                      </Badge>
                    </motion.div>
                  </div>

                  {/* ── Intelligence Grid ── */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                  >
                    {/* Visual DNA */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.5 }}
                      className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-card/90 to-indigo-500/5 backdrop-blur-xl p-8 flex flex-col shadow-xl shadow-indigo-500/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/8 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-8 z-10">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                          <Eye className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[9px] border-indigo-500/25 text-indigo-400 px-3 py-1 font-bold uppercase tracking-widest rounded-full bg-indigo-500/5">
                          Visual DNA
                        </Badge>
                      </div>
                      <div className="space-y-6 flex-1 relative z-10">
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Core Aesthetic</p>
                          <p className="text-xl font-bold text-foreground leading-none uppercase tracking-tight italic">{result.sensory_layer.rekognition.color_palette}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.sensory_layer.rekognition.visual_themes.map((t: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + i * 0.06 }}
                              className="px-3 py-1.5 bg-indigo-500/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/15"
                            >
                              {t}
                            </motion.div>
                          ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t border-border/40">
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Psychological Delta</p>
                          <p className="text-sm text-muted-foreground leading-relaxed italic">"{result.sensory_layer.rekognition.target_demographic_visuals}"</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sonic Core */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.5 }}
                      className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-card/90 to-sky-500/5 backdrop-blur-xl p-8 flex flex-col shadow-xl shadow-sky-500/5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/8 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-8 z-10">
                        <div className="h-10 w-10 bg-sky-500/10 rounded-xl border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
                          <Headphones className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[9px] border-sky-500/25 text-sky-400 px-3 py-1 font-bold uppercase tracking-widest rounded-full bg-sky-500/5">
                          Sonic Core
                        </Badge>
                      </div>
                      <div className="space-y-4 flex-1 relative z-10">
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Auditory Conversion Loops</p>
                        <div className="space-y-3">
                          {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + i * 0.08 }}
                              className="bg-sky-500/5 p-4 rounded-xl border border-sky-500/15 text-sm italic font-light leading-relaxed relative overflow-hidden group/hook"
                            >
                              <div className="absolute top-0 left-0 w-[2px] h-full bg-sky-500/40 group-hover/hook:bg-sky-500/70 transition-colors rounded-l-xl" />
                              <span className="pl-2">"{hook}"</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Red Team Strike */}
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.5 }}
                      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl shadow-primary/5 relative overflow-hidden"
                    >
                      <Rocket className="absolute -right-6 -bottom-6 h-40 w-40 text-primary opacity-[0.04] rotate-12 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-28 h-28 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-6 relative z-10">
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/25 text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full w-fit">
                          Strike Objective
                        </Badge>
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">System Vulnerability</p>
                          <h3 className="text-xl font-bold text-foreground leading-tight italic">{result.agent_swarm.red_team.pricing_vulnerability}</h3>
                        </div>
                      </div>
                      <motion.div
                        className="bg-gradient-to-br from-primary to-violet-600 p-6 rounded-xl text-primary-foreground shadow-2xl shadow-primary/25 relative overflow-hidden group/strike mt-6 z-10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/strike:opacity-100 transition-opacity" />
                        <div className="space-y-3 relative z-10">
                          <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">Execution Directive</p>
                          <p className="text-base font-bold italic leading-snug">{result.agent_swarm.red_team.undercut_strategy}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* ── Neptune Threat Topology ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-10 relative overflow-hidden shadow-xl shadow-black/5"
                  >
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                      style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center gap-3 mb-10 relative z-10">
                      <Globe className="h-4 w-4 text-primary/60" />
                      <h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em]">Neptune Threat Topology</h4>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-16 items-center px-4 relative z-10">
                      {result.threat_graph.nodes.slice(0, 3).map((node: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }}
                          className="relative text-center w-full lg:w-56 group/node"
                        >
                          <div className={cn(
                            "h-24 w-full rounded-2xl border flex flex-col items-center justify-center backdrop-blur-sm shadow-lg transition-all duration-500 bg-card/60",
                            i === 0
                              ? "border-primary/40 shadow-primary/10 hover:border-primary/60 hover:shadow-primary/20"
                              : "border-border/50 hover:border-border"
                          )}>
                            {i === 0 && (
                              <div className="absolute -top-3 px-3 py-1 bg-gradient-to-r from-primary to-violet-500 text-primary-foreground text-[8px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-primary/30">
                                Primary
                              </div>
                            )}
                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase mb-1.5 tracking-widest">{node.type}</span>
                            <h5 className="text-sm font-bold text-foreground px-4 leading-tight italic uppercase">{node.label}</h5>
                          </div>
                          {i < 2 && (
                            <div className="hidden lg:flex absolute top-1/2 -right-12 items-center gap-1 -translate-y-1/2">
                              <div className="w-4 h-[1px] bg-border/30" />
                              <Activity className="h-3 w-3 text-border/30" />
                              <div className="w-4 h-[1px] bg-border/30" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Action Center ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="pt-8 relative"
                  >
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                      <div className="space-y-3">
                        <motion.h2
                          className="text-4xl md:text-6xl font-bold text-foreground italic uppercase tracking-tight leading-none select-none"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.65, type: 'spring', stiffness: 150 }}
                        >
                          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Weaponize</span>{' '}
                          <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent not-italic">Directives</span>
                        </motion.h2>
                        <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-2xl mx-auto">
                          Transfer these tactical interceptions to the{' '}
                          <span className="text-foreground font-bold">Campaign Architect</span>{' '}
                          to operationalize the counter-strike.
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-5">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full max-w-md">
                          <Button
                            onClick={handleDeploy}
                            disabled={deploying}
                            className="h-16 w-full rounded-2xl text-lg font-bold italic uppercase tracking-wide shadow-2xl shadow-primary/25 gap-4 transition-all group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center justify-center gap-4">
                              {deploying ? (
                                <>
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                  <span>Injecting Directives…</span>
                                </>
                              ) : (
                                <>
                                  <Rocket className="h-5 w-5 group-hover:rotate-12 transition-transform duration-500" />
                                  <span>Deploy Counter-Strike</span>
                                  <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                              )}
                            </span>
                          </Button>
                        </motion.div>

                        <div className="flex items-center gap-3 px-6 py-3 bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl shadow-inner">
                          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                            Architect Pipeline: Secured
                            <Lock className="h-3 w-3 inline ml-1.5 opacity-30" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── IDLE STATE ── */}
              {!result && !loading && !error && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 mb-16 relative"
                >
                  <div className="h-[540px] flex flex-col items-center justify-center relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card/50 to-card/20 backdrop-blur-md shadow-inner group">
                    {/* Inner ambience */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 blur-[120px] rounded-full"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div
                        className="absolute inset-0 opacity-[0.025]"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }}
                      />
                    </div>

                    <div className="text-center space-y-8 relative z-10 px-8 max-w-4xl">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="h-24 w-24 bg-card/80 border border-border/40 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:border-primary/30 transition-all duration-700">
                          <History className="h-10 w-10 text-primary/25 group-hover:text-primary/60 transition-colors duration-700" />
                        </div>
                      </motion.div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                          Intercept Active
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                        </div>
                        <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground/80 leading-[1.0] italic select-none uppercase">
                          Pulse{' '}
                          <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent not-italic">Sequence</span>
                          <br />
                          Required
                        </h3>
                        <p className="text-base font-medium text-muted-foreground/50 max-w-md mx-auto leading-relaxed">
                          Identify a target market identity to authorize a real-time intelligence sweep.
                        </p>
                      </div>

                      <motion.div
                        className="flex flex-wrap items-center justify-center gap-3 pt-2"
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                      >
                        {['@Nike', '@TheRundownAI', '@Anthropic'].map((handle) => (
                          <motion.button
                            key={handle}
                            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setQuery(handle)}
                            className="px-6 py-3 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-all text-[10px] tracking-[0.35em] font-bold uppercase italic shadow-sm"
                          >
                            {handle}
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})
