import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Satellite, MapPin, Compass, Loader2, Terminal,
  Search, Cpu, Layers, Database, Bell, CheckCircle2,
  Circle, Clock, TrendingUp, TrendingDown, Minus,
  Tag, Target, Zap, Building2, CalendarDays, User,
  Activity, Hash, Plus,
  RefreshCw, Globe, Shield
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────
interface ViralHook { title: string; description: string; confidence?: number }
interface Entity { text: string; type: string; score: number }
interface ScoutInsights {
  local_vibe: string
  viral_hooks: ViralHook[]
  strategic_recommendation: string
  sentiment_score: number
  trending_hashtags: string[]
  comprehend_summary?: string
}
interface ComprehendData {
  sentiment: string
  compliance_score: number
  key_phrases: string[]
  entities: Entity[]
}
interface TrendDelta {
  is_first_run: boolean
  new_hooks: string[]
  recurring_hooks: string[]
  new_hashtags: string[]
  score_trend: string
  avg_past_score?: number
  past_runs_count: number
}
interface LogLine {
  id: number; step: string; message: string; type: string; ts: string
}
interface StepState {
  status: 'pending' | 'running' | 'done' | 'error'
  startedAt?: number
  elapsed?: number
  meta?: string
}

type Step = 'RECON' | 'COMPREHEND' | 'SYNTHESIS' | 'MEMORY' | 'ALERT'
const STEPS: Step[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY', 'ALERT']

const STEP_META: Record<Step, { label: string; Icon: any; logColor: string }> = {
  RECON: { label: 'Recon Agent', Icon: Search, logColor: '#60a5fa' },
  COMPREHEND: { label: 'AWS Comprehend', Icon: Cpu, logColor: '#f59e0b' },
  SYNTHESIS: { label: 'Nova Synthesis', Icon: Layers, logColor: '#a78bfa' },
  MEMORY: { label: 'DynamoDB Memory', Icon: Database, logColor: '#34d399' },
  ALERT: { label: 'SNS Alert Agent', Icon: Bell, logColor: '#f87171' },
}

const ENTITY_ICON: Record<string, any> = {
  EVENT: CalendarDays, LOCATION: MapPin, PERSON: User,
  ORGANIZATION: Building2, DATE: Clock,
}

// ── ArcGauge ─────────────────────────────────────────────────────────
function ArcGauge({ score, animated }: { score: number; animated: boolean }) {
  const [val, setVal] = useState(0)
  const R = 44
  const circ = 2 * Math.PI * R
  const arc = (270 / 360) * circ

  useEffect(() => {
    if (!animated || score === 0) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score, animated])

  const offset = arc - (val / 100) * arc
  const color = val >= 80 ? '#ef4444' : val >= 60 ? '#f59e0b' : '#22c55e'

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 100 80" width="130" height="104">
          <circle cx="50" cy="58" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circ - arc}`}
            transform="rotate(-135 50 58)" />
          <circle cx="50" cy="58" r={R} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={offset}
            transform="rotate(-135 50 58)"
            style={{ transition: 'stroke 0.4s ease', filter: `drop-shadow(0 0 8px ${color}99)` }} />
          <text x="50" y="54" textAnchor="middle" fontSize="22" fontWeight="800"
            fill={color} fontFamily="inherit">{val}</text>
          <text x="50" y="66" textAnchor="middle" fontSize="6.5"
            fill="hsl(var(--muted-foreground))" fontFamily="inherit" letterSpacing="1">VIRAL SCORE</text>
        </svg>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ filter: 'blur(14px)', background: `radial-gradient(circle at 50% 70%, ${color}22, transparent 65%)` }}
        />
      </div>
    </div>
  )
}

// ── ConfidenceBadge ───────────────────────────────────────────────────
function ConfidenceBadge({ value }: { value: number }) {
  const R = 10
  const circ = 2 * Math.PI * R
  const offset = circ - (value / 100) * circ
  const color = value >= 90 ? '#22c55e' : value >= 75 ? '#f59e0b' : '#94a3b8'
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
        <circle cx="12" cy="12" r={R} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 12 12)"
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
      </svg>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{value}%</span>
    </div>
  )
}

// ── ExecutionTrace ────────────────────────────────────────────────────
function ExecutionTrace({
  steps, activeStep: _activeStep, runElapsed, runId
}: {
  steps: Record<Step, StepState>
  activeStep: Step | null
  runElapsed: number
  runId: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {runId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-3 py-2.5 rounded-xl bg-linear-to-br from-muted/60 to-muted/20 border border-border/60 backdrop-blur-xl space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Run ID</span>
            <span className="text-[11px] font-mono text-foreground/70">{runId.slice(0, 8)}…</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Elapsed</span>
            <span className="text-[11px] font-mono text-emerald-400">{runElapsed}s</span>
          </div>
        </motion.div>
      )}

      {STEPS.map((step, i) => {
        const { label, Icon } = STEP_META[step]
        const s = steps[step]
        const isDone = s.status === 'done'
        const isRunning = s.status === 'running'
        const isPending = s.status === 'pending'

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center" style={{ width: 22 }}>
              <div className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full shrink-0 z-10 transition-all duration-500',
                isDone
                  ? 'bg-emerald-500/15 border border-emerald-500/60 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                  : isRunning
                    ? 'bg-primary/15 border border-primary/60 shadow-[0_0_8px_rgba(99,102,241,0.25)]'
                    : 'bg-muted/40 border border-border/50'
              )}>
                {isDone
                  ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  : isRunning
                    ? <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    : <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />
                }
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-px flex-1 min-h-8 mt-0.5 transition-all duration-700"
                  style={{
                    background: isDone
                      ? 'linear-gradient(to bottom, rgba(34,197,94,0.5), rgba(34,197,94,0.05))'
                      : 'hsl(var(--border))'
                  }}
                />
              )}
            </div>

            <div className={cn(
              'pb-5 flex-1 min-w-0 transition-all duration-500',
              isPending ? 'opacity-30' : 'opacity-100'
            )}>
              <div className={cn(
                'flex items-center gap-1.5 mb-0.5 px-2 py-1 rounded-lg transition-all duration-300',
                isRunning ? 'bg-primary/5 border border-primary/20' : 'bg-transparent'
              )}>
                <Icon className={cn(
                  'h-3 w-3 shrink-0 transition-colors',
                  isDone ? 'text-emerald-400' : isRunning ? 'text-primary' : 'text-muted-foreground/40'
                )} />
                <span className={cn(
                  'text-xs font-semibold',
                  isDone ? 'text-foreground' : isRunning ? 'text-primary' : 'text-muted-foreground/50'
                )}>
                  {label}
                </span>
              </div>
              {s.meta && (
                <p className="text-[10px] text-muted-foreground/60 leading-tight truncate pl-0.5 mt-0.5">
                  {s.meta}
                </p>
              )}
              {s.elapsed !== undefined && (
                <p className="text-[10px] text-muted-foreground/35 pl-0.5 font-mono mt-0.5">
                  {s.elapsed}s
                </p>
              )}
              {isRunning && (
                <p className="text-[10px] text-primary/70 pl-0.5 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary animate-ping inline-block" />
                  <span className="animate-pulse">Running…</span>
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── AgentTerminal ─────────────────────────────────────────────────────
function AgentTerminal({ lines, loading }: { lines: LogLine[]; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [lines])

  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden shadow-xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-zinc-900/90 to-zinc-950/90 border-b border-white/4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <Terminal className="h-3.5 w-3.5 text-zinc-500 ml-1" />
        <span className="text-xs font-medium text-zinc-500 font-mono">
          agent.live — scout@cloudcraft
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-zinc-600">{lines.length} events</span>
          <AnimatePresence>
            {loading && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                LIVE
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div
        ref={ref}
        className="h-52 overflow-y-auto bg-[#07080a] px-4 py-3 font-mono text-[11px] space-y-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
      >
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3 opacity-[0.15]">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Satellite className="h-8 w-8 mx-auto text-zinc-500" />
              </motion.div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Awaiting deployment…</p>
            </div>
          </div>
        ) : (
          lines.map(line => {
            const col = STEP_META[line.step as Step]?.logColor ?? '#71717a'
            return (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-start gap-2 leading-relaxed"
              >
                <span className="text-zinc-700 shrink-0 tabular-nums select-none">{line.ts}</span>
                <span
                  className="font-bold shrink-0 uppercase text-[9px] tracking-wider"
                  style={{ color: col }}
                >
                  {line.step}
                </span>
                <span className={cn(
                  'break-all',
                  line.type === 'success' ? 'text-emerald-400' :
                    line.type === 'warning' ? 'text-amber-400' :
                      line.type === 'fire' ? 'text-red-400' :
                        line.type === 'aws' ? 'text-blue-300' :
                          'text-zinc-500'
                )}>
                  {line.message}
                </span>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ────────────────────────────────────────────────
export default function LocalScoutPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [city, setCity] = useState('Locating…')
  const [insights, setInsights] = useState<ScoutInsights | null>(null)
  const [comprehendData, setComprehendData] = useState<ComprehendData | null>(null)
  const [trendDelta, setTrendDelta] = useState<TrendDelta | null>(null)
  const [alertFired, setAlertFired] = useState(false)
  const [alertScore, setAlertScore] = useState(0)
  const [runId, setRunId] = useState('')
  const [loading, setLoading] = useState(false)
  const [gaugeAnimated, setGaugeAnimated] = useState(false)
  const [logLines, setLogLines] = useState<LogLine[]>([])
  const [runElapsed, setRunElapsed] = useState(0)
  const runStartRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logIdRef = useRef(0)

  const [stepStates, setStepStates] = useState<Record<Step, StepState>>(() =>
    Object.fromEntries(STEPS.map(s => [s, { status: 'pending' } as StepState])) as Record<Step, StepState>
  )
  const [activeStep, setActiveStep] = useState<Step | null>(null)

  const addLog = useCallback((step: string, message: string, type = 'info') => {
    setLogLines(prev => [...prev.slice(-100), {
      id: ++logIdRef.current, step, message, type,
      ts: new Date().toLocaleTimeString('en-IN', { hour12: false })
    }])
  }, [])

  const markStepRunning = useCallback((step: Step) => {
    setActiveStep(step)
    setStepStates(prev => ({
      ...prev,
      [step]: { ...prev[step], status: 'running', startedAt: Date.now() }
    }))
  }, [])

  const markStepDone = useCallback((step: Step, meta?: string) => {
    setActiveStep(null)
    setStepStates(prev => {
      const elapsed = prev[step].startedAt
        ? parseFloat(((Date.now() - prev[step].startedAt!) / 1000).toFixed(1))
        : undefined
      return { ...prev, [step]: { status: 'done', elapsed, meta } }
    })
  }, [])

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setCity('GPS Unavailable'); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          )
          const d = await r.json()
          setCity(d.address?.city || d.address?.town || d.address?.village || 'Local Region')
        } catch { setCity('Unknown Area') }
      },
      () => setCity('GPS Denied')
    )
  }, [])

  const runScout = useCallback(async () => {
    if (!location) return
    setLoading(true)
    setInsights(null); setComprehendData(null); setTrendDelta(null)
    setAlertFired(false); setLogLines([]); setRunId('')
    setRunElapsed(0); setGaugeAnimated(false)
    setStepStates(Object.fromEntries(STEPS.map(s => [s, { status: 'pending' } as StepState])) as Record<Step, StepState>)
    setActiveStep(null)

    runStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setRunElapsed(Math.floor((Date.now() - runStartRef.current) / 1000))
    }, 1000)

    const url = `http://localhost:8000/api/v1/scout/stream?city=${encodeURIComponent(city)}&lat=${location.lat}&lng=${location.lng}`
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data)

        if (event === 'pipeline_start') {
          addLog('SYSTEM', `Deploying Scout Agent → ${data.city} (${data.lat?.toFixed(3)}, ${data.lng?.toFixed(3)})`)
        }
        else if (event === 'step_start') {
          markStepRunning(data.step as Step)
          addLog(data.step, `Starting ${data.step} phase`)
        }
        else if (event === 'step_complete') {
          const metaMap: Record<string, string | undefined> = {}
          markStepDone(data.step as Step, metaMap[data.step])
          addLog(data.step, data.message, 'success')
        }
        else if (event === 'recon_query') {
          addLog('RECON', data.message)
        }
        else if (event === 'recon_hit') {
          const meta = `${data.hits} result${data.hits !== 1 ? 's' : ''} from query ${data.query_num}`
          addLog('RECON', data.message, data.hits > 0 ? 'success' : 'info')
          setStepStates(prev => ({
            ...prev,
            RECON: { ...prev.RECON, meta }
          }))
        }
        else if (event === 'aws_call') {
          addLog(data.service?.toUpperCase() || 'AWS', data.message, 'aws')
        }
        else if (event === 'comprehend_result') {
          setComprehendData({
            sentiment: data.sentiment,
            compliance_score: data.compliance_score,
            key_phrases: data.key_phrases || [],
            entities: data.entities || []
          })
          markStepDone('COMPREHEND', `${data.sentiment} · ${data.entities?.length ?? 0} entities · ${data.key_phrases?.length ?? 0} phrases`)
          addLog('COMPREHEND', data.message, 'success')
        }
        else if (event === 'synthesis_result' || event === 'synthesis_fallback') {
          setInsights(data.insights)
          setGaugeAnimated(true)
          markStepDone('SYNTHESIS', `${data.insights?.viral_hooks?.length ?? 0} hooks · score ${data.insights?.sentiment_score ?? '?'}`)
          addLog('SYNTHESIS', data.message, event === 'synthesis_result' ? 'success' : 'warning')
        }
        else if (event === 'memory_update') {
          setTrendDelta(data.trend_delta)
          setRunId(data.run_id || '')
          const d = data.trend_delta
          markStepDone('MEMORY', d?.is_first_run
            ? 'Baseline established'
            : `${d?.score_trend} · ${d?.new_hooks?.length ?? 0} new signals`)
          addLog('MEMORY', data.message, 'success')
        }
        else if (event === 'alert_sent') {
          if (data.fired) { setAlertFired(true); setAlertScore(data.viral_score || 0) }
          markStepDone('ALERT', data.fired ? `SNS fired — score ${data.viral_score}` : 'Below threshold')
          addLog('ALERT', data.message || '', data.fired ? 'fire' : 'info')
        }
        else if (event === 'alert_skipped') {
          markStepDone('ALERT', `Score ${data.viral_score} below threshold ${data.threshold}`)
          addLog('ALERT', data.message, 'info')
        }
        else if (event === 'scout_complete') {
          if (data.insights && !insights) { setInsights(data.insights); setGaugeAnimated(true) }
          if (data.comprehend_data && !comprehendData) setComprehendData(data.comprehend_data)
          if (data.trend_delta && !trendDelta) setTrendDelta(data.trend_delta)
          if (data.alert_fired) setAlertFired(true)
          if (data.run_id) setRunId(data.run_id)
          addLog('SYSTEM', 'Pipeline complete. All 5 steps executed successfully.', 'success')
          es.close(); setLoading(false)
          if (timerRef.current) clearInterval(timerRef.current)
        }
      } catch { /* ignore */ }
    }

    es.onerror = () => {
      addLog('SYSTEM', 'Stream connection error', 'warning')
      es.close(); setLoading(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [location, city, addLog, markStepRunning, markStepDone])

  const allDone = STEPS.every(s => stepStates[s].status === 'done')
  const trendIcon = trendDelta?.score_trend === 'RISING'
    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
    : trendDelta?.score_trend === 'FALLING'
      ? <TrendingDown className="h-3.5 w-3.5 text-red-400" />
      : <Minus className="h-3.5 w-3.5 text-muted-foreground" />

  return (
    <div className="flex-1 min-h-screen relative overflow-hidden">

      {/* ── Background: dot-matrix grid ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* ── Background: gradient mesh ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-35"
        style={{
          background: [
            'radial-gradient(circle at 15% 20%, rgba(16,185,129,0.10) 0%, transparent 45%)',
            'radial-gradient(circle at 85% 15%, rgba(6,182,212,0.10) 0%, transparent 45%)',
            'radial-gradient(circle at 55% 80%, rgba(20,184,166,0.07) 0%, transparent 50%)',
          ].join(', ')
        }}
      />

      {/* ── Background: floating orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-150 h-150 rounded-full bg-linear-to-r from-emerald-500/10 via-cyan-500/10 to-teal-500/10 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '-8%', left: '-8%' }}
        />
        <motion.div
          className="absolute w-125 h-125 rounded-full bg-linear-to-r from-teal-500/10 via-emerald-500/8 to-cyan-500/10 blur-3xl"
          animate={{ x: [0, -45, 0], y: [0, 55, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          style={{ bottom: '-5%', right: '-5%' }}
        />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 space-y-6 p-4 md:p-8 max-w-350">

        {/* ── Top bar ── */}
        <motion.div
          className="flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            {/* Satellite icon widget */}
            <motion.div
              className={cn(
                'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500',
                location
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.15)]'
                  : 'bg-muted/40 border-border'
              )}
              animate={loading
                ? { boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 28px rgba(16,185,129,0.35)', '0 0 0px rgba(16,185,129,0)'] }
                : {}
              }
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <Satellite className={cn(
                'h-5 w-5 transition-colors',
                location ? 'text-emerald-400' : 'text-muted-foreground',
                loading ? 'animate-pulse' : ''
              )} />
              {location && !loading && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}
              {loading && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-ping" />
              )}
            </motion.div>

            <div className="space-y-1">
              {/* Live status pill */}
              <motion.div
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest gap-1.5 backdrop-blur-xl',
                  loading
                    ? 'border-emerald-500/40 bg-linear-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : allDone && runId
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                      : 'border-border/60 bg-muted/30 text-muted-foreground'
                )}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {loading && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={cn(
                    'relative inline-flex rounded-full h-1.5 w-1.5',
                    loading ? 'bg-emerald-400' : allDone && runId ? 'bg-cyan-400' : 'bg-muted-foreground/50'
                  )} />
                </span>
                {loading
                  ? 'AWS Agentic Pipeline · Running'
                  : allDone && runId
                    ? `Complete · ${runElapsed}s`
                    : 'AWS Agentic Pipeline · Ready'
                }
              </motion.div>

              {/* Page title */}
              <motion.h1
                className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Local Agent
                </span>{' '}
                <span className="bg-linear-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent italic">
                  Scout
                </span>
                <Satellite className="h-6 w-6 text-emerald-400 animate-pulse ml-1" />
              </motion.h1>

              <motion.p
                className="text-sm text-muted-foreground flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="font-medium">{city}</span>
                {runId && (
                  <span className="font-mono text-muted-foreground/40 text-[10px]">
                    · run/{runId.slice(0, 8)}
                  </span>
                )}
              </motion.p>
            </div>
          </div>

          {/* Deploy button */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={runScout}
              disabled={loading || !location}
              className={cn(
                'h-11 px-6 rounded-xl font-black uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-lg group relative overflow-hidden',
                location && !loading
                  ? 'bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/25'
                  : ''
              )}
            >
              {location && !loading && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              )}
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Scanning…</>
                : <><Compass className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" /> Deploy Agent</>
              }
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Alert banner ── */}
        <AnimatePresence>
          {alertFired && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex items-center gap-4 rounded-2xl border border-red-500/30 bg-linear-to-r from-red-500/10 via-red-500/5 to-transparent backdrop-blur-xl px-5 py-4 shadow-xl shadow-red-500/10 overflow-hidden"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-red-500/10 to-transparent opacity-50 blur-xl rounded-2xl pointer-events-none" />
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                <Zap className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0 relative">
                <p className="text-sm font-bold text-red-400">
                  Hot Signal Dispatched — SNS Alert Fired Autonomously
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Viral score {alertScore}/100 exceeded threshold. Email alert sent via AWS SNS to subscribed marketers. No human triggered this.
                </p>
              </div>
              <span
                className="text-3xl font-black tabular-nums text-red-400 shrink-0 relative"
                style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}
              >
                {alertScore}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main grid ── */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '240px 1fr' }}>

          {/* LEFT: Execution trace */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Execution Trace
              </span>
            </div>

            <ExecutionTrace
              steps={stepStates}
              activeStep={activeStep}
              runElapsed={runElapsed}
              runId={runId}
            />

            {/* Viral score gauge */}
            <AnimatePresence>
              {insights && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                  className="rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/10 backdrop-blur-xl p-4 space-y-3 shadow-xl shadow-black/5"
                >
                  <ArcGauge score={insights.sentiment_score} animated={gaugeAnimated} />
                  {trendDelta && !trendDelta.is_first_run && (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                      {trendIcon}
                      <span className={
                        trendDelta.score_trend === 'RISING' ? 'text-emerald-400' :
                          trendDelta.score_trend === 'FALLING' ? 'text-red-400' : 'text-muted-foreground'
                      }>
                        {trendDelta.score_trend}
                      </span>
                      {trendDelta.avg_past_score != null && (
                        <span className="text-muted-foreground/60">(avg {trendDelta.avg_past_score})</span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* DynamoDB memory */}
            <AnimatePresence>
              {trendDelta && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl p-4 space-y-3 shadow-lg shadow-emerald-500/5 overflow-hidden"
                >
                  <div className="absolute -inset-1 bg-linear-to-br from-emerald-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 relative">
                    <Database className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Memory</span>
                    <Badge variant="outline" className="ml-auto text-[10px] font-mono border-emerald-500/30 text-emerald-400">
                      {trendDelta.past_runs_count} runs
                    </Badge>
                  </div>
                  {trendDelta.is_first_run ? (
                    <p className="text-xs text-muted-foreground relative">Baseline established for {city}</p>
                  ) : (
                    <div className="space-y-1.5 relative">
                      {trendDelta.new_hooks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Plus className="h-3 w-3 shrink-0" />
                          <span>{trendDelta.new_hooks.length} new signals this scan</span>
                        </div>
                      )}
                      {trendDelta.recurring_hooks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <RefreshCw className="h-3 w-3 shrink-0" />
                          <span>{trendDelta.recurring_hooks.length} recurring trends</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trending hashtags */}
            <AnimatePresence>
              {insights?.trending_hashtags && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/10 backdrop-blur-xl p-4 space-y-3 shadow-lg shadow-black/5"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insights.trending_hashtags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] font-mono bg-linear-to-r from-muted/80 to-muted/50 hover:from-emerald-500/10 hover:to-cyan-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-200 cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: Content area */}
          <motion.div
            className="space-y-5 min-w-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            {/* Agent terminal */}
            <AgentTerminal lines={logLines} loading={loading} />

            {/* AWS Comprehend */}
            <AnimatePresence>
              {comprehendData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-xl p-5 space-y-4 shadow-xl shadow-amber-500/5 overflow-hidden"
                >
                  <div className="absolute -inset-1 bg-linear-to-br from-amber-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />

                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-bold">AWS Comprehend</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono gap-1.5 border-amber-500/30 text-amber-400 bg-amber-500/5">
                      <Globe className="h-3 w-3" /> Real NLP
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3 relative">
                    {[
                      { label: 'Sentiment', value: comprehendData.sentiment },
                      { label: 'Confidence', value: `${comprehendData.compliance_score}%` },
                      { label: 'Key Phrases', value: String(comprehendData.key_phrases.length) },
                      { label: 'Entities', value: String(comprehendData.entities.length) },
                    ].map(({ label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-xl bg-linear-to-br from-muted/60 to-muted/30 border border-border/60 px-3 py-2.5"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
                        <p className="text-sm font-bold text-foreground">{value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Entities */}
                  {comprehendData.entities.length > 0 && (
                    <div className="space-y-2 relative">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Detected Entities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {comprehendData.entities.map((ent, i) => {
                          const Icon = ENTITY_ICON[ent.type] ?? Tag
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.88 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 hover:border-amber-500/40 transition-colors"
                            >
                              <Icon className="h-3 w-3 text-amber-400/70 shrink-0" />
                              <span className="text-[11px] font-semibold text-foreground">{ent.text}</span>
                              <span className="text-[9px] text-muted-foreground/50 font-mono uppercase">{ent.type}</span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Key phrases */}
                  {comprehendData.key_phrases.length > 0 && (
                    <div className="space-y-2 relative">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Key Phrases</p>
                      <div className="flex flex-wrap gap-1.5">
                        {comprehendData.key_phrases.slice(0, 12).map((phrase, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:border-border transition-colors"
                          >
                            <Tag className="h-2.5 w-2.5 shrink-0" />
                            {phrase}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Intel brief */}
            <AnimatePresence>
              {insights && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Local vibe card */}
                  <div className="relative rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/10 backdrop-blur-xl p-5 space-y-3 shadow-xl shadow-black/5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-linear-to-br from-emerald-500/6 to-transparent blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2.5 relative">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-bold">Local Intelligence</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 italic pl-3 border-l-2 border-emerald-500/30 relative">
                      "{insights.local_vibe}"
                    </p>
                    {insights.comprehend_summary && (
                      <div className="flex items-start gap-2 pt-2.5 border-t border-border/60 relative">
                        <Cpu className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                          {insights.comprehend_summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Viral hook cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {insights.viral_hooks.map((hook, idx) => {
                      const conf = hook.confidence != null ? Math.round(hook.confidence * 100) : 80
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                          className={cn(
                            'relative rounded-2xl border bg-linear-to-br from-card via-card to-muted/10 backdrop-blur-xl p-4 space-y-2.5 group hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden',
                            idx === 0 ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'border-border/50'
                          )}
                        >
                          {idx === 0 && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
                          )}
                          <div className="flex items-center justify-between relative">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                              Hook #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <ConfidenceBadge value={conf} />
                          </div>
                          <h4 className="text-sm font-bold leading-snug text-foreground relative">{hook.title}</h4>
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed relative">{hook.description}</p>
                          {idx === 0 && (
                            <div className="flex items-center gap-1.5 pt-1 relative">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400">Top Signal</span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Mission strategy */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/10 backdrop-blur-xl p-5 space-y-3 shadow-xl shadow-black/5 overflow-hidden"
                  >
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-cyan-500/5 to-transparent rounded-tr-[3rem] blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2.5 relative">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Target className="h-4 w-4 text-cyan-400" />
                      </div>
                      <h3 className="text-sm font-bold">Mission Strategy</h3>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] gap-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                          <Database className="h-3 w-3" /> Saved
                        </Badge>
                        {alertFired && (
                          <Badge variant="outline" className="text-[10px] gap-1.5 border-red-500/40 text-red-400 bg-red-500/5">
                            <Bell className="h-3 w-3" /> SNS Sent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground/85 leading-relaxed pl-3 border-l-2 border-cyan-500/30 relative">
                      {insights.strategic_recommendation}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            <AnimatePresence>
              {!insights && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-border/40 bg-linear-to-br from-muted/20 to-transparent backdrop-blur-xl overflow-hidden"
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.35]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)',
                      backgroundSize: '22px 22px'
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative mb-4"
                  >
                    <Shield className="h-12 w-12 text-muted-foreground/15" />
                  </motion.div>
                  <p className="text-sm font-semibold text-muted-foreground/40 relative">
                    Deploy the Scout Agent to begin intelligence pipeline
                  </p>
                  <p className="text-xs text-muted-foreground/25 mt-1.5 relative">
                    5 steps · AWS Comprehend · DynamoDB · SNS
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/local-scout/')({
  component: LocalScoutPage,
})