import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCampaignStore } from '@/stores/campaign-store'
import type { PipelineStep, StepState } from '@/stores/campaign-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Loader2, Plus, Sparkles, ArrowLeft,
  Search, Cpu, Layers, Database, CheckCircle2,
  TrendingUp, Target,
  Building2, Users, Clock, Activity, Rocket,
  RefreshCw, Radar, LocateFixed, EyeOff, ScanFace, Shield, Crosshair, Terminal
} from 'lucide-react'
import { GenesisCanvas } from '@/features/genesis/GenesisCanvas'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false },
  { title: 'Chronos Brief', href: '/chronos-brief', isActive: false },
  { title: 'Campaign Architect', href: '/campaign-architect', isActive: true },
  { title: 'Campaign Calendar', href: '/calendar', isActive: false },
  { title: 'Competitor Pulse', href: '/competitor-pulse', isActive: false },
]

const STEPS: PipelineStep[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY']

function cx(...cs: (string | undefined | false | null)[]) {
  return cs.filter(Boolean).join(' ')
}

// ── BlueprintFlow: Premium Animated Pipeline Trace ──────────────────────────
function BlueprintFlow({ steps, pipelineRunning: _pipelineRunning }: { steps: Record<PipelineStep, StepState>, pipelineRunning: boolean }) {
  const stepMeta: Record<PipelineStep, { label: string; icon: React.ElementType; color: 'indigo' | 'violet' | 'purple' | 'pink' }> = {
    RECON:      { label: 'Market Recon',    icon: Search,   color: 'indigo' },
    COMPREHEND: { label: 'NLP Extraction',  icon: Cpu,      color: 'violet' },
    SYNTHESIS:  { label: 'Nova Synthesis',  icon: Layers,   color: 'purple' },
    MEMORY:     { label: 'Campaign Memory', icon: Database, color: 'pink'   },
  }

  const colorMap = {
    indigo: { ring: 'border-indigo-500',  bg: 'bg-indigo-500/10',  glow: '0 0 22px rgba(99,102,241,0.35)',  text: 'text-indigo-400',  icon: 'text-indigo-400' },
    violet: { ring: 'border-violet-500',  bg: 'bg-violet-500/10',  glow: '0 0 22px rgba(139,92,246,0.35)',  text: 'text-violet-400',  icon: 'text-violet-400' },
    purple: { ring: 'border-purple-500',  bg: 'bg-purple-500/10',  glow: '0 0 22px rgba(168,85,247,0.35)', text: 'text-purple-400',  icon: 'text-purple-400' },
    pink:   { ring: 'border-pink-500',    bg: 'bg-pink-500/10',    glow: '0 0 22px rgba(236,72,153,0.35)',  text: 'text-pink-400',    icon: 'text-pink-400'   },
  }

  const doneCount = Object.values(steps).filter(s => s.status === 'done').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-xl shadow-black/5 relative overflow-hidden"
    >
      {/* subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="flex items-center justify-between relative">
        {/* Animated fill bar */}
        <div className="absolute top-[22px] left-[12.5%] right-[12.5%] h-[2px] bg-border/30 z-0 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: doneCount / STEPS.length }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>

        {STEPS.map((step, i) => {
          const s = steps[step]
          const isDone    = s.status === 'done'
          const isRunning = s.status === 'running'
          const M  = stepMeta[step]
          const C  = colorMap[M.color]

          return (
            <motion.div
              key={step}
              className="relative z-10 flex flex-col items-center gap-3 w-1/4"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12, duration: 0.4, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className={cx(
                  "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500",
                  isDone    ? cx(C.bg, C.ring) :
                  isRunning ? "bg-primary/20 border-primary" :
                              "bg-muted/50 border-muted-foreground/20"
                )}
                style={isDone || isRunning ? { boxShadow: isDone ? C.glow : '0 0 22px rgba(99,102,241,0.35)' } : {}}
                animate={isRunning ? { scale: [1, 1.08, 1] } : isDone ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.8, repeat: isRunning ? Infinity : 0, repeatType: 'reverse' }}
              >
                {isRunning ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <M.icon className={cx("h-5 w-5", isDone ? C.icon : "text-muted-foreground/30")} />
                )}
              </motion.div>

              <div className="text-center space-y-1">
                <p className={cx("text-[11px] font-bold uppercase tracking-wider",
                  isDone ? C.text : isRunning ? "text-primary" : "text-muted-foreground/40"
                )}>
                  {M.label}
                </p>
                {(s.elapsed || isRunning) && (
                  <p className="text-[10px] font-mono text-muted-foreground/50">
                    {isRunning ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>compiling…</motion.span> : `${s.elapsed}s`}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── RivalRadarView: Premium Intelligence Watchdog ───────────────────────────
function RivalRadarView({ campaign }: { campaign: any }) {
  const { runRadarScan, radarScanning, radarResult, radarLogs } = useCampaignStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]"
    >
      {/* 1. Control Tower & Visualizer */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-card/80 to-background/50 backdrop-blur-xl flex flex-col p-6 shadow-xl shadow-emerald-500/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 z-10 w-full">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-emerald-500 flex items-center gap-2">
              <Radar className="h-5 w-5" /> Autonomous Watchdog
            </h3>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">AWS EventBridge 6h Schedule</p>
          </div>
          <AnimatePresence>
            {radarScanning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10 text-[10px] font-mono tracking-widest">
                  <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  SCAN ACTIVE
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10 py-4 h-[250px]">
          {radarScanning ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <motion.div className="absolute w-52 h-52 border border-emerald-500/15 rounded-full"
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              <motion.div className="absolute w-36 h-36 border border-emerald-500/30 rounded-full"
                animate={{ scale: [1, 1.09, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }} />
              <div className="absolute w-20 h-20 border border-emerald-500/50 rounded-full" />

              {/* Sweeper */}
              <div className="absolute w-[190px] h-[190px] origin-center animate-spin"
                style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}>
                <div className="w-1/2 h-1/2 border-r-2 border-emerald-500 bg-gradient-to-br from-transparent to-emerald-500/20"
                  style={{ transformOrigin: 'bottom right' }} />
              </div>

              <motion.div className="absolute top-[28%] left-[32%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.6, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <motion.div className="absolute bottom-[30%] right-[26%] w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.6, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />

              <div className="relative z-20 w-16 h-16 bg-card border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.35)]">
                <ScanFace className="h-7 w-7 text-emerald-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              <div className="absolute w-52 h-52 border border-border/20 rounded-full" />
              <div className="absolute w-36 h-36 border border-border/20 rounded-full" />
              <div className="relative z-20 w-16 h-16 bg-muted/40 border border-border/30 rounded-full flex items-center justify-center">
                <EyeOff className="h-6 w-6 text-muted-foreground/30" />
              </div>
            </div>
          )}
        </div>

        <div className="z-10 mt-auto pt-6 border-t border-border/40">
          <Button
            onClick={() => runRadarScan(campaign.id)}
            disabled={radarScanning}
            className={cx("w-full h-12 text-sm font-semibold tracking-wide transition-all duration-300",
              radarScanning
                ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:shadow-[0_0_40px_rgba(16,185,129,0.45)] hover:scale-[1.02]"
            )}
          >
            {radarScanning
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> INTERCEPTING SIGNALS…</>
              : <><LocateFixed className="h-4 w-4 mr-2" /> OVERRIDE SCHEDULE (SCAN NOW)</>
            }
          </Button>
          <p className="text-[10px] text-center text-muted-foreground/50 mt-3 leading-relaxed">
            Simulates the AWS EventBridge Cron override to manually invoke the scanning watchdog pipeline.
          </p>
        </div>
      </motion.div>

      {/* 2. Live Agent Intercept Logs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-border/50 bg-[#09090b] shadow-2xl shadow-black/30 p-1 flex flex-col h-[500px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-white/[0.02] rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono font-semibold tracking-widest text-emerald-500 uppercase">Live Intercept Stream</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono bg-black/60 px-2 py-0.5 rounded border border-border/40">agent.radar.sys</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-[11px] leading-relaxed" style={{ scrollbarWidth: 'none' }}>
          {(!radarLogs || radarLogs.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/20 space-y-3">
              <Database className="h-8 w-8 opacity-20" />
              <p className="tracking-widest uppercase text-[10px]">Awaiting Signal Stream</p>
            </div>
          ) : (
            radarLogs.map((log: any, i: number) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="text-zinc-600 shrink-0 w-8 tabular-nums">{log.ts}</span>
                <span className={cx(
                  "break-words",
                  log.text.includes('complete') || log.text.includes('ready') ? "text-emerald-400 font-bold" :
                  log.text.includes('AWS') || log.text.includes('DynamoDB') || log.text.includes('Tavily') ? "text-cyan-400" :
                  log.text.includes('Intercepting') ? "text-amber-400" :
                  "text-zinc-300"
                )}>
                  <span className="text-zinc-700 mr-2">❯</span>{log.text}
                </span>
              </motion.div>
            ))
          )}
          {radarScanning && (
            <motion.div
              className="flex gap-3 text-emerald-500/50 mt-2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-zinc-700 shrink-0 w-8">···</span>
              <span><span className="text-emerald-500/30 mr-2">❯</span>Processing signal array</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 3. Threat Matrix */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl flex flex-col p-6 h-[500px] overflow-y-auto shadow-xl shadow-black/5 relative"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 border-b border-border/40 pb-3 relative z-10">
          <Layers className="h-4 w-4 text-primary" /> Threat Matrix &amp; Memory Delta
        </h3>

        {!radarResult ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 text-center gap-3">
            <Target className="h-10 w-10 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-semibold">Matrix Offline</p>
            <p className="text-[10px] max-w-[200px] leading-relaxed">Data renders once the watchdog completes a scan pass.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-6 relative z-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/40 shadow-inner">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" /> Market Trend
                </p>
                <span className={cx("text-xl font-black tracking-tight block mt-2",
                  radarResult.delta.market_trend === 'RISING' ? 'text-emerald-500' :
                  radarResult.delta.market_trend === 'FALLING' ? 'text-rose-500' : 'text-foreground'
                )}>
                  {radarResult.delta.market_trend}
                </span>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border/40 shadow-inner">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Activity className="h-3 w-3" /> Sentiment Shift
                </p>
                <p className="text-lg font-bold text-foreground leading-none mt-2">{radarResult.comprehend_data.sentiment}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">Confidence: {radarResult.comprehend_data.market_confidence}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detected Competitors</p>
                <Badge variant="secondary" className="text-[10px] font-mono">{radarResult.comprehend_data.competitor_names.length} Tracked</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {radarResult.comprehend_data.competitor_names.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No competitors detected in this scan.</p>
                ) : (
                  radarResult.comprehend_data.competitor_names.map((name: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/40 border border-border/60 rounded-lg text-xs font-semibold">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/40">
              {radarResult.delta.new_competitors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/8 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-rose-500">New Rivals Detected</p>
                      <p className="text-xs text-rose-400 mt-1 font-medium">{radarResult.delta.new_competitors.join(', ')}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {radarResult.alert_fired && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-amber-500">AWS SNS Alert Fired</p>
                      <p className="text-[10px] text-amber-500/70 mt-1 leading-relaxed">
                        Autonomous event dispatched to campaign stakeholders due to competitor influx or severe sentiment drop.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── ArchitectBoard: Premium Strategy Canvas ─────────────────────────────────
function ArchitectBoard({ strategy }: { strategy: any }) {
  if (!strategy) return null

  const vectors   = strategy.attack_vectors || strategy.usps || []
  const directive = strategy.agentic_directive || strategy.tagline || ''

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      {/* ── Left: 2-col main content ── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Core Thesis Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 backdrop-blur-xl p-8 shadow-2xl shadow-primary/5 relative overflow-hidden"
        >
          {/* Ambience */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/30 text-[10px] font-mono tracking-widest uppercase mb-5 shadow-lg shadow-primary/10 backdrop-blur-xl">
            <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Core Thesis
          </Badge>

          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight leading-snug mb-6 relative z-10">
            "{strategy.core_concept}"
          </h2>

          <div className="bg-background/50 rounded-xl p-5 border border-border/50 shadow-inner backdrop-blur-sm relative z-10">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-3">
              <Terminal className="h-3.5 w-3.5" /> Agentic Directive
            </p>
            <p className="text-lg font-semibold text-foreground/90 pl-5 border-l-2 border-emerald-500/50 leading-relaxed">
              {directive}
            </p>
          </div>
        </motion.div>

        {/* Market Vulnerability + Target Audiences */}
        <div className="grid sm:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Market Vulnerability</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{strategy.market_insight}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Users className="h-3 w-3" /> Target Audiences
            </p>
            <div className="space-y-3">
              {strategy.target_audience?.map((aud: any, i: number) => (
                <div key={i} className="space-y-1 bg-muted/30 p-3 rounded-xl border border-border/30">
                  <p className="text-xs font-bold text-foreground">{aud.segment_name}</p>
                  <p className="text-[10px] text-muted-foreground">{aud.pain_point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Strategic Playbook sidebar ── */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-amber-500/2 backdrop-blur-xl p-6 shadow-xl shadow-amber-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <Crosshair className="h-3.5 w-3.5 text-amber-500" /> Attack Vectors
          </p>
          <ul className="space-y-3 relative z-10">
            {vectors.map((vec: string, i: number) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="text-xs flex items-start gap-3 bg-card/70 p-3 rounded-xl border border-amber-500/15 shadow-sm backdrop-blur-sm"
              >
                <Target className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-snug">{vec}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {strategy.defensive_moats && strategy.defensive_moats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-emerald-500/2 backdrop-blur-xl p-6 shadow-xl shadow-emerald-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <Shield className="h-3.5 w-3.5 text-emerald-500" /> Defensive Moats
            </p>
            <ul className="space-y-3 relative z-10">
              {strategy.defensive_moats.map((moat: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="text-xs flex items-start gap-3 bg-card/70 p-3 rounded-xl border border-emerald-500/15 shadow-sm backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-snug">{moat}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function CampaignArchitectPage() {
  const {
    campaigns, activeCampaign, isSaving,
    fetchCampaigns, createCampaign, setActiveCampaign,
    streamIntelligence, pipelineRunning, pipelineComplete, steps,
    intelligencePayload, injectIntelligence
  } = useCampaignStore()

  const [isCreating, setIsCreating] = useState(false)
  const [showGenesis, setShowGenesis] = useState(false)
  const [activeTab, setActiveTab] = useState<'blueprint' | 'radar'>('blueprint')
  const [formData, setFormData] = useState({ name: '', goal: '', duration: '', budget: '' })

  useEffect(() => { fetchCampaigns() }, [])

  // ── Param Autofill from Chronos ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('autofill') === 'true') {
      const taskTheme = params.get('task') || ''
      const taskDesc = params.get('desc') || ''
      setFormData({
        name: `Mission Task: ${taskTheme}`,
        goal: `Execute Task Objectives:\n${taskDesc.split(' | ').join('\n')}`,
        duration: '1 Week',
        budget: 'Allocated'
      })
      setIsCreating(true)
      // Clear URL to prevent re-triggering
      window.history.replaceState({}, '', '/campaign-architect')
    }
  }, [])

  useEffect(() => {
    if (intelligencePayload) {
      const competitor    = intelligencePayload.competitor_handle || 'Target'
      const vulnerability = intelligencePayload.sensory_layer?.comprehend?.critical_vulnerability || ''
      const strike        = intelligencePayload.agent_swarm?.red_team?.undercut_strategy || ''

      setFormData({
        name: `Counter-Strike: ${competitor}`,
        goal: `Exploit market vulnerability: "${vulnerability}". Executive directive: ${strike}. Synthesize a high-conversion counter-offensive to capture market share.`,
        duration: '4 Weeks',
        budget: ''
      })
      setIsCreating(true)
      injectIntelligence(null)

      toast.info('Intelligence Payload Active', {
        description: `Drafting counter-strike against ${competitor} based on intercepted vulnerabilities.`,
        icon: <Target className="h-4 w-4" />
      })
    }
  }, [intelligencePayload, injectIntelligence])

  const handleCreate = async () => {
    if (!formData.name || !formData.goal) return toast.error('Name and Goal are required')
    await createCampaign(formData)
    setIsCreating(false)
    setFormData({ name: '', goal: '', duration: '', budget: '' })
    toast.success('Campaign blueprint created')
  }

  // ── Genesis View ──────────────────────────────────────────────────────────
  if (activeCampaign && showGenesis) {
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
        <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border">
          <Button variant="secondary" size="sm" onClick={() => setShowGenesis(false)} className="absolute top-4 left-4 z-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Architect
          </Button>
          <GenesisCanvas initialInput={activeCampaign.goal} autoStart={true} />
        </div>
      </>
    )
  }

  // ── Detail View ──────────────────────────────────────────────────────────
  if (activeCampaign) {
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
        <div className="flex-1 min-w-0 relative overflow-hidden">
        {/* Premium background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 10% 15%, rgba(99,102,241,0.07) 0%, transparent 50%), radial-gradient(circle at 88% 80%, rgba(168,85,247,0.07) 0%, transparent 50%)' }} />

        <div className="relative z-10 space-y-6 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex gap-4 min-w-0">
              <Button
                variant="outline" size="icon"
                className="shrink-0 mt-1 rounded-full h-8 w-8 border-border/50 hover:bg-muted/60 backdrop-blur-sm transition-all hover:scale-110"
                onClick={() => setActiveCampaign(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight truncate">{activeCampaign.name}</h1>
                  <Badge
                    variant={activeCampaign.status === 'active' ? 'default' : 'secondary'}
                    className="text-[10px] uppercase shrink-0"
                  >
                    {activeCampaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{activeCampaign.goal}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {activeCampaign.strategy && (
                <Button
                  variant="outline" onClick={() => setShowGenesis(true)}
                  className="gap-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/10 hover:scale-105 transition-all shadow-lg shadow-violet-500/5"
                >
                  <Sparkles className="h-4 w-4" /> View Genesis Graph
                </Button>
              )}
              <Button
                onClick={() => streamIntelligence(activeCampaign.id)}
                disabled={pipelineRunning}
                className="gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/15"
              >
                {pipelineRunning
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Compiling Intel…</>
                  : <><RefreshCw className="h-4 w-4" /> Regenerate Strategy</>
                }
              </Button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 border-b border-border/50"
          >
            <button
              onClick={() => setActiveTab('blueprint')}
              className={cx("pb-3 text-sm font-semibold transition-all relative",
                activeTab === 'blueprint' ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              Strategy Blueprint
              {activeTab === 'blueprint' && (
                <motion.div
                  layoutId="ca-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-primary/30 rounded-t-full"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={cx("pb-3 text-sm font-semibold flex items-center gap-2 transition-all relative",
                activeTab === 'radar' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <Radar className="h-4 w-4" /> Rival Radar Watchdog
              {activeTab === 'radar' && (
                <motion.div
                  layoutId="ca-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500/30 rounded-t-full"
                />
              )}
            </button>
          </motion.div>

          {/* Tab Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {activeTab === 'blueprint' && (
              <motion.div
                key="blueprint"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {(pipelineRunning || pipelineComplete) && (
                  <BlueprintFlow steps={steps} pipelineRunning={pipelineRunning} />
                )}

                {!activeCampaign.strategy && !pipelineRunning ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-72 rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center p-6 bg-muted/5 backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none rounded-2xl" />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Layers className="h-14 w-14 text-muted-foreground/20 mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">Blank Canvas</h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                      Run the Intelligence Pipeline to scan the market, extract NLP insights, and synthesize a differentiated marketing strategy.
                    </p>
                    <Button
                      onClick={() => streamIntelligence(activeCampaign.id)}
                      className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                      size="lg"
                    >
                      <Activity className="h-4 w-4" /> Trigger Intelligence Scan
                    </Button>
                  </motion.div>
                ) : (
                  <ArchitectBoard strategy={activeCampaign.strategy} />
                )}
              </motion.div>
            )}

            {activeTab === 'radar' && (
              <motion.div
                key="radar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <RivalRadarView campaign={activeCampaign} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </>
    )
  }

  // ── List View ─────────────────────────────────────────────────────────────
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
      <div className="flex-1 min-w-0 relative overflow-hidden">
      {/* Premium dot-matrix background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 18% 18%, rgba(99,102,241,0.09) 0%, transparent 50%), radial-gradient(circle at 82% 72%, rgba(168,85,247,0.09) 0%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(236,72,153,0.06) 0%, transparent 50%)' }} />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[620px] h-[620px] rounded-full bg-gradient-to-r from-indigo-500/8 via-purple-500/8 to-pink-500/8 blur-3xl"
          animate={{ x: [0, 70, 0], y: [0, -45, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '-12%', left: '-8%' }}
        />
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-r from-violet-500/8 via-indigo-500/8 to-cyan-500/8 blur-3xl"
          animate={{ x: [0, -45, 0], y: [0, 65, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{ bottom: '3%', right: '-3%' }}
        />
      </div>

      <div className="relative z-10 space-y-8 p-4 md:p-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="space-y-2">
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
              Intelligence Pipeline · Armed
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                Campaign
              </span>
              <span className="italic bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Architect
              </span>
              <Layers className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
            </motion.h1>

            <motion.p
              className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Design data-grounded campaigns and deploy autonomous rival watchdogs.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="shrink-0"
          >
            <Button
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
              size="lg"
              className="rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all gap-2"
            >
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
          </motion.div>
        </motion.div>

        {/* Create Campaign Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl p-6 shadow-2xl shadow-primary/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

              <h3 className="text-lg font-semibold mb-5 relative z-10">Draft New Campaign</h3>

              <div className="grid md:grid-cols-2 gap-5 mb-5 relative z-10">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign Target Name</Label>
                  <Input
                    placeholder="e.g. Summer Launch 2026"
                    className="bg-muted/40 border-border/50 backdrop-blur-sm focus:border-primary/50 transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</Label>
                  <Input
                    placeholder="e.g. 4 Weeks"
                    className="bg-muted/40 border-border/50 backdrop-blur-sm focus:border-primary/50 transition-colors"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6 relative z-10">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategic Goal</Label>
                <Textarea
                  placeholder="What is the objective? (e.g. Penetrate the D2C apparel market in Tamil Nadu)"
                  className="bg-muted/40 border-border/50 backdrop-blur-sm resize-none h-24 focus:border-primary/50 transition-colors"
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 relative z-10">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="hover:bg-muted/50">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSaving} className="px-6 shadow-lg shadow-primary/15 hover:scale-105 transition-all">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Blueprint
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign Grid */}
        {campaigns.length === 0 && !isCreating ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="h-80 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-3xl bg-muted/5 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Rocket className="h-14 w-14 text-muted-foreground/25 mb-4" />
            </motion.div>
            <p className="text-lg font-medium text-muted-foreground">No plans on the board.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Create your first campaign blueprint to get started.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {campaigns.map(campaign => (
              <motion.div
                key={campaign.id}
                variants={{
                  hidden:   { opacity: 0, y: 24, scale: 0.95 },
                  visible:  { opacity: 1, y: 0,  scale: 1     },
                }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 180 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                onClick={() => setActiveCampaign(campaign)}
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-border via-border/40 to-transparent group-hover:from-primary group-hover:via-primary/50 group-hover:to-transparent transition-all duration-500" />

                {/* Hover glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/4 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex justify-between items-start mb-3 pl-4">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {campaign.name}
                  </h3>
                  <Badge
                    variant={campaign.status === 'active' ? 'default' : 'secondary'}
                    className="text-[10px] scale-90 origin-top-right uppercase shrink-0 ml-2"
                  >
                    {campaign.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 pl-4">{campaign.goal}</p>

                <div className="flex items-center gap-4 pt-4 border-t border-border/40 pl-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {campaign.duration || '—'}
                  </div>
                  {campaign.strategy ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-500 ml-auto bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40 ml-auto">Draft</div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
    </>
  )
}
