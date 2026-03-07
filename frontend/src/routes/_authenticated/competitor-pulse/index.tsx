import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCampaignStore } from '@/stores/campaign-store'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  TrendingDown,
  ShieldAlert,
  Network,
  Fingerprint,
  Rocket,
  ChevronRight,
  ShieldCheck,
  History,
  X,
  Lock,
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
    { label: "Intercept Link", icon: <Cpu className="h-3 w-3" /> },
    { label: "Market Audit", icon: <Search className="h-3 w-3" /> },
    { label: "Visual DNA", icon: <Eye className="h-3 w-3" /> },
    { label: "Sentiment Scan", icon: <BrainCircuit className="h-3 w-3" /> },
    { label: "Strike Vectors", icon: <ShieldAlert className="h-3 w-3" /> },
    { label: "Threat Mesh", icon: <Network className="h-3 w-3" /> }
  ]

  useEffect(() => {
    if (loading) {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < bootSequence.length ? prev + 1 : prev))
      }, 400)
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
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-6 py-8 md:px-10 max-w-[1400px] mx-auto space-y-12 relative w-full bg-background min-h-screen">
        {/* REFINED BACKGROUND ELEMENTS */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] neural-grid" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 max-w-6xl">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20 bg-primary/5 shadow-inner">Operational Logic</Badge>
              <div className="h-px w-12 bg-primary/20" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.9]">Competitor <span className="text-primary not-italic">Pulse</span></h1>
            <p className="text-muted-foreground text-base md:text-lg font-light max-w-2xl leading-relaxed opacity-70">
              Analyze market signals and synthesize counter-strike directives.
            </p>
          </div>

          <Card className="bg-card/40 backdrop-blur-3xl border border-white/5 p-1.5 rounded-xl shadow-xl overflow-hidden min-h-[56px] lg:w-[480px]">
            <div className="flex items-center">
              <div className="relative flex-1">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                  placeholder="Intercept @Handle or URL..."
                  className="pl-12 h-11 bg-transparent border-none text-sm font-medium focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/30 py-2 sm:py-0"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="h-9 px-6 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}Pulse
              </Button>
            </div>
          </Card>
        </div>

        <div className="relative min-h-[500px]">
          {loading && (
            <div className="flex flex-col items-center justify-center pt-20 animate-in fade-in duration-500">
              <div className="w-full max-w-md space-y-6 glass-dark p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <h4 className="text-xs font-bold tracking-widest uppercase opacity-80">Intercept Stream</h4>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-primary/40" />
                </div>

                <div className="space-y-2">
                  {bootSequence.map((step, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
                        i < terminalIndex
                          ? "bg-emerald-500/[0.03] text-emerald-500/80"
                          : i === terminalIndex ? "bg-primary/5 text-primary" : "opacity-10"
                      )}
                    >
                      <div className="h-7 w-7 rounded-lg bg-current/5 flex items-center justify-center">
                        {i < terminalIndex ? <ShieldCheck className="h-3.5 w-3.5" /> : step.icon}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto p-12 text-center glass-dark rounded-[2rem] space-y-6 animate-in zoom-in-95 mt-20 shadow-2xl">
              <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto shadow-inner">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-destructive">Signal Lost</h3>
                <p className="text-muted-foreground text-xs font-light max-w-xs mx-auto opacity-70">{error}</p>
              </div>
              <Button onClick={() => setError(null)} size="sm" className="rounded-lg px-8 uppercase font-bold text-[10px] tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">Retry Link</Button>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out pb-32">
              {/* COMPACT HERO PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 glass-dark p-10 min-h-[300px] relative overflow-hidden flex flex-col justify-center rounded-[2rem] border-none shadow-xl">
                  <Fingerprint className="absolute -right-8 -top-8 h-80 w-80 text-primary opacity-[0.02] -z-10" />
                  <div className="space-y-8 relative z-10 w-full">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-4 py-1 text-[10px] tracking-widest rounded-full uppercase">Target Identity</Badge>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 italic">Panopticon Sync: 99.8%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-[1.0] break-all uppercase italic">
                        {result.competitor_handle}
                      </h2>
                      <p className="text-muted-foreground text-lg italic max-w-xl opacity-60">
                        "Market audit complete. Extraction of high-fidelity sensory and strategic vectors is finalized."
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="lg:col-span-1 glass-dark p-8 flex flex-col items-center justify-center gap-8 rounded-[2rem] border-none shadow-xl bg-primary/[0.02]">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Hazard Coefficient</p>
                  </div>
                  <div className="relative h-40 w-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent"
                        strokeDasharray="452"
                        strokeDashoffset={452 - (452 * result.threat_level) / 100}
                        className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.5)] transition-all duration-2000 ease-out"
                        strokeLinecap="round" />
                    </svg>
                    <span className="text-6xl font-black text-foreground tracking-tighter italic">{result.threat_level}</span>
                  </div>
                  <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em]">Priority: High</Badge>
                </Card>
              </div>

              {/* REFINED INTELLIGENCE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Visual DNA */}
                <Card className="glass-dark p-8 space-y-10 rounded-[2rem] border-t-2 border-t-indigo-500/20 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-inner">
                      <Eye className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[9px] border-indigo-500/20 text-indigo-400 px-4 py-1 font-bold uppercase tracking-widest rounded-full">Visual DNA</Badge>
                  </div>
                  <div className="space-y-8 flex-1">
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Core Aesthetic</p>
                      <p className="text-xl font-black text-foreground leading-none uppercase tracking-tight italic">{result.sensory_layer.rekognition.color_palette}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.sensory_layer.rekognition.visual_themes.map((t: string, i: number) => (
                        <div key={i} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/80 border border-white/5">{t}</div>
                      ))}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Psychological Delta</p>
                      <p className="text-sm text-muted-foreground leading-relaxed italic font-light opacity-80">"{result.sensory_layer.rekognition.target_demographic_visuals}"</p>
                    </div>
                  </div>
                </Card>

                {/* Sonic Core */}
                <Card className="glass-dark p-8 space-y-10 rounded-[2rem] border-t-2 border-t-sky-500/20 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 border border-sky-500/10 shadow-inner">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[9px] border-sky-500/20 text-sky-400 px-4 py-1 font-bold uppercase tracking-widest rounded-full">Sonic Core</Badge>
                  </div>
                  <div className="space-y-6 flex-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Auditory Conversion Loops</p>
                    <div className="space-y-3">
                      {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                        <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 text-sm italic font-light leading-relaxed relative overflow-hidden group/hook">
                          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500/30 group-hover/hook:bg-sky-500/60 transition-colors" />
                          "{hook}"
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Red Team Offensive */}
                <Card className="p-8 space-y-10 rounded-[2rem] bg-card/60 backdrop-blur-3xl border-l-[3px] border-l-primary relative flex flex-col justify-between shadow-xl overflow-hidden border-y border-r border-white/5">
                  <Rocket className="absolute -right-8 -bottom-8 h-48 w-48 text-primary opacity-[0.03] rotate-12 -z-10" />
                  <div className="space-y-10 relative z-10">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full">Strike Objective</Badge>
                    <div className="space-y-3">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">System Vulnerability</p>
                      <h3 className="text-2xl font-black text-foreground leading-tight italic uppercase tracking-tighter">{result.agent_swarm.red_team.pricing_vulnerability}</h3>
                    </div>
                  </div>

                  <div className="bg-primary p-8 rounded-2xl text-primary-foreground shadow-2xl relative overflow-hidden group/strike transition-transform hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer-subtle" />
                    <div className="space-y-4 relative z-10">
                      <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">Execution Directive</p>
                      <p className="text-xl font-black italic leading-[1.0] uppercase tracking-tighter">{result.agent_swarm.red_team.undercut_strategy}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* TOPOLOGY: Ecosystem mapping */}
              <Card className="glass-dark p-10 rounded-[2.5rem] relative overflow-hidden shadow-sm group border-none bg-card/20 min-h-[300px] flex flex-col justify-center">
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <Globe className="h-5 w-5 text-primary/40" />
                    <h4 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.5em] block leading-none">Neptune Threat Topology</h4>
                  </div>
                </div>

                <div className="relative flex flex-col lg:flex-row justify-center gap-8 lg:gap-16 items-center px-4 relative z-10">
                  {result.threat_graph.nodes.slice(0, 3).map((node: any, i: number) => (
                    <div key={i} className="relative group/node text-center w-full lg:w-56">
                      <div className={cn(
                        "h-24 w-full rounded-2xl border flex flex-col items-center justify-center bg-background/50 shadow-lg transition-all duration-700",
                        i === 0 ? "border-primary/50 shadow-primary/5" : "border-white/5"
                      )}>
                        {i === 0 && (
                          <div className="absolute -top-3 px-4 py-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full uppercase tracking-widest shadow-lg">Primary</div>
                        )}
                        <span className="text-[8px] font-bold text-muted-foreground uppercase mb-1.5 tracking-widest opacity-40">{node.type}</span>
                        <h5 className="text-base font-black text-foreground px-6 leading-tight italic uppercase tracking-tighter">{node.label}</h5>
                      </div>
                      {i < 2 && (
                        <div className="hidden lg:block absolute top-1/2 -right-12 w-8 h-[1px] bg-white/10 -translate-y-1/2" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* ACTION CENTER */}
              <div className="pt-16 relative">
                <div className="max-w-3xl mx-auto text-center space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-none select-none">
                      Weaponize <span className="text-primary not-italic">Directives</span>
                    </h2>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto opacity-70">
                      Transfer these tactical interceptions to the <span className="text-foreground font-black">Campaign Architect</span> to operationalize the counter-strike.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-8 relative">
                    <Button
                      onClick={handleDeploy}
                      disabled={deploying}
                      className="h-16 px-12 rounded-2xl bg-primary text-primary-foreground text-xl font-black italic uppercase tracking-[0.05em] shadow-2xl premium-button-glow hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden w-full max-w-md"
                    >
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer-subtle" />
                      <span className="relative z-10 flex items-center justify-center gap-6">
                        {deploying ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Injecting Directives...</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
                            <span>Deploy Counter-Strike</span>
                            <ChevronRight className="h-6 w-6 opacity-40 group-hover:translate-x-2 transition-transform duration-500" />
                          </>
                        )}
                      </span>
                    </Button>
                    <div className="flex items-center gap-4 px-8 py-3 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-inner">
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] leading-none">Architect Pipeline: Secured <Lock className="h-3 w-3 inline ml-1.5 opacity-30" /></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-[550px] flex flex-col items-center justify-center relative overflow-hidden rounded-[3rem] border border-white/5 bg-card/5 backdrop-blur-md animate-in fade-in duration-2000 mt-4 mb-20 group shadow-inner">
              {/* NEURAL DRIFT BACKGROUND */}
              <div className="absolute inset-0 -z-10 bg-[#020202]/50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full animate-pulse transition-all duration-3000" />
                <div className="absolute inset-0 neural-grid opacity-20" />
              </div>

              <div className="text-center space-y-12 relative z-10 p-16 max-w-4xl px-8">
                <div className="relative inline-block mb-8">
                  <div className="h-24 w-24 bg-background/50 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative group-hover:border-primary/40 transition-all duration-700">
                    <History className="h-10 w-10 text-primary opacity-20 animate-pulse group-hover:opacity-80" />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center justify-center gap-4 text-primary/30 text-[10px] font-bold uppercase tracking-[0.6em] mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    Intercept Active
                  </div>
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground/90 leading-[0.9] italic select-none uppercase">
                    Pulse <span className="text-primary not-italic">Sequence</span> <br /> Required
                  </h3>
                  <p className="text-lg font-light text-muted-foreground/60 max-w-xl mx-auto leading-relaxed px-4">
                    Identify a target market identity to authorize a real-time intelligence sweep.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                  <button onClick={() => setQuery('@Nike')} className="px-8 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-[10px] tracking-[0.4em] font-black uppercase italic">@Nike</button>
                  <button onClick={() => setQuery('@TheRundownAI')} className="px-8 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-[10px] tracking-[0.4em] font-black uppercase italic">@TheRundownAI</button>
                  <button onClick={() => setQuery('@Anthropic')} className="px-8 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] text-muted-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer text-[10px] tracking-[0.4em] font-black uppercase italic">@Anthropic</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})
