import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  Search, Cpu, Layers, Database, CheckCircle2, Circle,
  TrendingUp, TrendingDown, Minus, Target,
  Building2, Users, Eye, Clock, Activity, Rocket,
  RefreshCw, Radar, LocateFixed, EyeOff, ScanFace, Shield, Crosshair, Terminal
} from 'lucide-react'
import { GenesisCanvas } from '@/features/genesis/GenesisCanvas'

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})

const STEPS: PipelineStep[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY']

function cx(...cs: (string | undefined | false | null)[]) {
  return cs.filter(Boolean).join(' ')
}

// ── New Visuals: Horizontal Flow instead of Vertical Trace ──────────────────
function BlueprintFlow({ steps, pipelineRunning }: { steps: Record<PipelineStep, StepState>, pipelineRunning: boolean }) {
  const stepMeta = {
    RECON: { label: 'Market Recon', icon: Search },
    COMPREHEND: { label: 'NLP Extraction', icon: Cpu },
    SYNTHESIS: { label: 'Nova Synthesis', icon: Layers },
    MEMORY: { label: 'Campaign Memory', icon: Database },
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border/40 -translate-y-1/2 z-0" />

        {STEPS.map((step, i) => {
          const s = steps[step]
          const isDone = s.status === 'done'
          const isRunning = s.status === 'running'
          const M = stepMeta[step]
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className={cx(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                isDone ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                  isRunning ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse" :
                    "bg-muted border-muted-foreground/30"
              )}>
                {isRunning ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <M.icon className={cx("h-4 w-4", isDone ? "text-emerald-500" : "text-muted-foreground/50")} />
                )}
              </div>
              <div className="text-center space-y-1">
                <p className={cx("text-[11px] font-bold uppercase tracking-wider",
                  isDone ? "text-emerald-400" : isRunning ? "text-primary" : "text-muted-foreground/50"
                )}>{M.label}</p>
                {(s.elapsed || isRunning) && (
                  <p className="text-[10px] font-mono text-muted-foreground/60">
                    {isRunning ? "compiling..." : `${s.elapsed}s`}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RivalRadarView({ campaign }: { campaign: any }) {
  const { runRadarScan, radarScanning, radarResult, radarLogs } = useCampaignStore()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] animate-in fade-in duration-700">
      {/* 1. Control Tower & Visualizer */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card/80 to-background flex flex-col p-6 shadow-xl relative overflow-hidden">
        {/* Dynamic sweeping background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="flex items-center justify-between mb-8 z-10 w-full">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-emerald-500 flex items-center gap-2">
              <Radar className="h-5 w-5" /> Autonomous Watchdog
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">AWS EventBridge 6h Schedule</p>
          </div>
          {radarScanning && (
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10 animate-pulse">
              SCAN ACTIVE
            </Badge>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10 py-4 h-[250px]">
          {radarScanning ? (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Radar Rings */}
              <div className="absolute w-44 h-44 border border-emerald-500/20 rounded-full" />
              <div className="absolute w-28 h-28 border border-emerald-500/40 rounded-full" />
              {/* Sweeper Line */}
              <div className="absolute w-full h-full max-w-[180px] max-h-[180px] origin-center animate-spin" style={{ animationDuration: '3s', animationTimingFunction: 'linear' }}>
                <div className="w-1/2 h-1/2 border-r-2 border-emerald-500 bg-gradient-to-br from-transparent to-emerald-500/20" style={{ transformOrigin: 'bottom right' }} />
              </div>
              {/* Targets */}
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '1s' }} />
              <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }} />

              <div className="relative z-20 w-16 h-16 bg-card border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <ScanFace className="h-7 w-7 text-emerald-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              <div className="absolute w-44 h-44 border border-border rounded-full opacity-30" />
              <div className="absolute w-28 h-28 border border-border rounded-full opacity-30" />
              <div className="relative z-20 w-16 h-16 bg-muted border border-border rounded-full flex items-center justify-center">
                <EyeOff className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="z-10 mt-auto pt-6 border-t border-border/50">
          <Button
            onClick={() => runRadarScan(campaign.id)}
            disabled={radarScanning}
            className={cx("w-full h-12 text-sm font-semibold tracking-wide transition-all",
              radarScanning ? "bg-muted text-muted-foreground border border-border"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            )}
          >
            {radarScanning ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> INTERCEPTING SIGNALS...</> : <><LocateFixed className="h-4 w-4 mr-2" /> OVERRIDE SCHEDULE (SCAN NOW)</>}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3 leading-relaxed">
            Pressing this simulates the AWS EventBridge Cron override to manually invoke the scanning watchdog pipeline.
          </p>
        </div>
      </div>

      {/* 2. Live Agent Intercept Logs */}
      <div className="rounded-2xl border border-border/80 bg-[#09090b] shadow-inner p-1 flex flex-col h-[500px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-mono font-semibold tracking-widest text-emerald-500 uppercase">Live Intercept Stream</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono bg-black/50 px-2 py-0.5 rounded border border-border/50">agent.radar.sys</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] leading-relaxed hidden-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {(!radarLogs || radarLogs.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-3">
              <Database className="h-8 w-8 opacity-20" />
              <p className="tracking-widest uppercase text-[10px]">Awaiting Signal Stream</p>
            </div>
          ) : (
            radarLogs.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-zinc-600 shrink-0 w-8 table-cell align-top">{log.ts}</span>
                <span className={cx(
                  "break-words",
                  log.text.includes('complete') || log.text.includes('ready') ? "text-emerald-400 font-bold" :
                    log.text.includes('AWS') || log.text.includes('DynamoDB') || log.text.includes('Tavily') ? "text-cyan-400" :
                      log.text.includes('Intercepting') ? "text-amber-400" :
                        "text-zinc-300"
                )}>
                  <span className="text-zinc-600 mr-2">❯</span>{log.text}
                </span>
              </div>
            ))
          )}
          {radarScanning && (
            <div className="flex gap-3 text-emerald-500/70 animate-pulse mt-4">
              <span className="text-zinc-600 shrink-0 w-8">...</span>
              <span><span className="text-emerald-500/30 mr-2">❯</span>Processing signal array</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Threat Matrix (Results) */}
      <div className="rounded-2xl border border-border/80 bg-card flex flex-col p-6 h-[500px] overflow-y-auto shadow-sm hidden-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 border-b border-border/40 pb-3">
          <Layers className="h-4 w-4 text-primary" /> Threat Matrix & Memory Delta
        </h3>

        {!radarResult ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 text-center">
            <Target className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-semibold">Matrix Offline</p>
            <p className="text-[10px] max-w-[200px] mt-2">Data will render here once the watchdog completes a pass.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Essential Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-xl p-4 border border-border/60 shadow-inner">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Market Trend</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cx("text-xl font-black tracking-tight",
                    radarResult.delta.market_trend === 'RISING' ? 'text-emerald-500' :
                      radarResult.delta.market_trend === 'FALLING' ? 'text-rose-500' : 'text-foreground'
                  )}>{radarResult.delta.market_trend}</span>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-4 border border-border/60 shadow-inner">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Sentiment Shift</p>
                <div className="mt-2">
                  <p className="text-lg font-bold text-foreground leading-none">{radarResult.comprehend_data.sentiment}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">Confidence: {radarResult.comprehend_data.market_confidence}%</p>
                </div>
              </div>
            </div>

            {/* Entity Matrix */}
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
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/40 border border-border/80 rounded-md shadow-sm">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Deltas & Alerts */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              {radarResult.delta.new_competitors.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-sm animate-pulse">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-rose-500">New Rivals Detected</p>
                      <p className="text-xs text-rose-400 mt-1 font-medium">{radarResult.delta.new_competitors.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {radarResult.alert_fired && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-amber-500">AWS SNS Alert Fired</p>
                      <p className="text-[10px] text-amber-500/80 mt-1 leading-relaxed">Autonomous event dispatched to campaign stakeholders due to competitor influx or severe sentiment drop.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ArchitectBoard({ strategy }: { strategy: any }) {
  if (!strategy) return null

  const vectors = strategy.attack_vectors || strategy.usps || []
  const directive = strategy.agentic_directive || strategy.tagline || ''

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="lg:col-span-2 space-y-6">
        {/* Main Directive Card */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Layers className="h-40 w-40" />
          </div>

          <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-primary/30 text-[10px] font-mono tracking-widest uppercase mb-5">
            Core Thesis
          </Badge>

          <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight leading-snug mb-6">
            "{strategy.core_concept}"
          </h2>

          <div className="bg-background/50 rounded-xl p-5 border border-border/80 shadow-inner">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-2">
              <Terminal className="h-4 w-4" /> Agentic Directive
            </p>
            <p className="text-lg font-semibold text-foreground/90 pl-6 border-l-2 border-emerald-500/50">
              {directive}
            </p>
          </div>
        </div>

        {/* Market Vulnerability & Target Segments */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-80">Market Vulnerability</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {strategy.market_insight}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
              <Users className="h-3 w-3" /> Target Audiences
            </p>
            <div className="space-y-4">
              {strategy.target_audience?.map((aud: any, i: number) => (
                <div key={i} className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/40">
                  <p className="text-xs font-bold text-foreground">{aud.segment_name}</p>
                  <p className="text-[10px] text-muted-foreground">{aud.pain_point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Playbook (Sidebar) */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
          <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-amber-500" /> Attack Vectors
          </p>
          <ul className="space-y-3">
            {vectors.map((vec: string, i: number) => (
              <li key={i} className="text-xs flex items-start gap-3 bg-card p-3 rounded-lg border border-amber-500/20 shadow-sm">
                <Target className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-foreground/80 leading-snug">{vec}</span>
              </li>
            ))}
          </ul>
        </div>

        {strategy.defensive_moats && strategy.defensive_moats.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
            <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" /> Defensive Moats
            </p>
            <ul className="space-y-3">
              {strategy.defensive_moats.map((moat: string, i: number) => (
                <li key={i} className="text-xs flex items-start gap-3 bg-card p-3 rounded-lg border border-emerald-500/20 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-snug">{moat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CampaignArchitectPage() {
  const {
    campaigns, activeCampaign, isFetching, isSaving, isGenerating,
    fetchCampaigns, createCampaign, setActiveCampaign,
    streamIntelligence, pipelineRunning, pipelineComplete, steps, runElapsed
  } = useCampaignStore()

  const [isCreating, setIsCreating] = useState(false)
  const [showGenesis, setShowGenesis] = useState(false)
  const [activeTab, setActiveTab] = useState<'blueprint' | 'radar'>('blueprint')
  const [formData, setFormData] = useState({ name: '', goal: '', duration: '', budget: '' })

  useEffect(() => { fetchCampaigns() }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.goal) return toast.error('Name and Goal are required')
    await createCampaign(formData)
    setIsCreating(false)
    setFormData({ name: '', goal: '', duration: '', budget: '' })
    toast.success('Campaign draft created')
  }

  // ── Genesis View ──
  if (activeCampaign && showGenesis) {
    return (
      <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border">
        <Button variant="secondary" size="sm" onClick={() => setShowGenesis(false)} className="absolute top-4 left-4 z-50">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Architect
        </Button>
        <GenesisCanvas initialInput={activeCampaign.goal} autoStart={true} />
      </div>
    )
  }

  // ── Detail View ──
  if (activeCampaign) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 min-w-0">
        {/* Header Block */}
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Button variant="outline" size="icon" className="shrink-0 mt-1 rounded-full h-8 w-8" onClick={() => setActiveCampaign(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{activeCampaign.name}</h1>
                <Badge variant={activeCampaign.status === 'active' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                  {activeCampaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{activeCampaign.goal}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeCampaign.strategy && (
              <Button variant="outline" onClick={() => setShowGenesis(true)} className="gap-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/10">
                <Sparkles className="h-4 w-4" /> View Genesis Graph
              </Button>
            )}
            <Button onClick={() => streamIntelligence(activeCampaign.id)} disabled={pipelineRunning} className="gap-2">
              {pipelineRunning ? <><Loader2 className="h-4 w-4 animate-spin" /> Compiling Intel...</> : <><RefreshCw className="h-4 w-4" /> Regenerate Strategy</>}
            </Button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={cx("pb-3 text-sm font-semibold transition-colors relative", activeTab === 'blueprint' ? "text-foreground" : "text-muted-foreground hover:text-foreground/80")}
          >
            Strategy Blueprint
            {activeTab === 'blueprint' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={cx("pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative", activeTab === 'radar' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground/80")}
          >
            <Radar className="h-4 w-4" /> Rival Radar Watchdog
            {activeTab === 'radar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {(pipelineRunning || pipelineComplete) && (
              <BlueprintFlow steps={steps} pipelineRunning={pipelineRunning} />
            )}

            {!activeCampaign.strategy && !pipelineRunning ? (
              <div className="h-64 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-6 bg-muted/20">
                <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Blank Canvas</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Run the Intelligence Pipeline to scan the market, extract NLP insights, and synthesize a differentiated marketing strategy.
                </p>
                <Button onClick={() => streamIntelligence(activeCampaign.id)} className="gap-2" size="lg">
                  <Activity className="h-4 w-4" /> Trigger Intelligence Scan
                </Button>
              </div>
            ) : (
              <ArchitectBoard strategy={activeCampaign.strategy} />
            )}
          </div>
        )}

        {activeTab === 'radar' && (
          <RivalRadarView campaign={activeCampaign} />
        )}
      </div>
    )
  }

  // ── List View ──
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            Campaign Architect
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Design data-grounded campaigns and deploy autonomous rival watchdogs.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating} size="lg" className="rounded-full shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isCreating && (
        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">Draft New Campaign</h3>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <Label>Campaign Target Name</Label>
              <Input placeholder="e.g. Summer Launch 2026" className="bg-muted/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input placeholder="e.g. 4 Weeks" className="bg-muted/50" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2 mb-5">
            <Label>Strategic Goal</Label>
            <Textarea placeholder="What is the objective? (e.g. Penetrate the D2C apparel market in Tamil Nadu)" className="bg-muted/50 resize-none h-20" value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSaving} className="px-6">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Blueprint
            </Button>
          </div>
        </div>
      )}

      {campaigns.length === 0 && !isCreating ? (
        <div className="h-80 flex flex-col items-center justify-center border border-dashed rounded-3xl opacity-60">
          <Rocket className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium">No plans on the board.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map(campaign => (
            <div
              key={campaign.id}
              className="group relative rounded-2xl border border-border/80 bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              onClick={() => setActiveCampaign(campaign)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-[10px] scale-90 origin-top-right uppercase">{campaign.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{campaign.goal}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {campaign.duration || '—'}
                </div>
                {campaign.strategy ? (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-500 ml-auto bg-emerald-500/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                ) : (
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50 ml-auto">Draft</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
