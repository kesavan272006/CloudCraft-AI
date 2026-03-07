import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from 'sonner'
import {
  Search,
  Zap,
  Activity,
  Terminal,
  Eye,
  Headphones,
  BrainCircuit,
  Target,
  AlertTriangle,
  Globe,
  Cpu,
  Layers,
  Loader2,
  Lock,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Network,
  Fingerprint,
  Rocket,
  ChevronRight,
  X,
  Search as SearchIcon
} from "lucide-react"

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

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
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()

  const bootSequence = [
    { label: "Initializing Intercept Pipeline", icon: <Cpu className="h-4 w-4" /> },
    { label: "Scanning Surface Market Signals", icon: <Search className="h-4 w-4" /> },
    { label: "Extracting Visual Brand DNA", icon: <Eye className="h-4 w-4" /> },
    { label: "Analyzing Sentiment Clustering", icon: <BrainCircuit className="h-4 w-4" /> },
    { label: "Synthesizing Counter-Strike Directives", icon: <ShieldAlert className="h-4 w-4" /> },
    { label: "Finalizing Neptune Threat Topology", icon: <Network className="h-4 w-4" /> }
  ]

  useEffect(() => {
    if (loading) {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < bootSequence.length ? prev + 1 : prev))
      }, 700)
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
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleDeploy = () => {
    setDeploying(true)
    toast.success("Intelligence Link Established", {
      description: "Asymmetric directives transferred to Architect core.",
      icon: <Rocket className="h-4 w-4" />,
    })

    setTimeout(() => {
      navigate({ to: '/campaign-architect' })
    }, 1500)
  }

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <TopNav links={topNav} />
        </div>
        <div className='ms-auto flex items-center space-x-2 sm:space-x-4'>
          <div className="relative hidden md:flex items-center">
            <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchQuery && <X className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setSearchQuery('')} />}
          </div>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 py-8 md:px-8 max-w-[1400px] mx-auto space-y-10 relative w-full">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Page Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Panopticon Core Online
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Competitor Pulse</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Deep-strike market intelligence via Multi-modal Agent Swarms.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 backdrop-blur-sm border rounded-2xl p-4 px-6 border-border/60">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">AWS Engine</p>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Link Clear
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Synthesizer</p>
              <p className="text-xs font-black uppercase tracking-widest text-foreground">Nova-Lite-v1</p>
            </div>
          </div>
        </div>

        {/* Tactical Search Interface */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                placeholder="Target Handle (@Nike) or Niche Sector..."
                className="pl-12 h-14 bg-card border-border/80 text-lg font-medium rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.01]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Zap className="h-5 w-5 mr-3 fill-current" />}
              Initiate Pulse
            </Button>
          </div>
        </div>

        {/* Intelligence Context */}
        <div className="relative z-10 min-h-[400px]">
          {loading && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center pt-20">
              <Card className="w-full max-w-lg shadow-2xl border-primary/20 overflow-hidden">
                <div className="bg-muted/50 border-b p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Intercept Sequence</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 animate-pulse" />
                  </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    {bootSequence.slice(0, terminalIndex).map((step, i) => (
                      <div key={i} className="flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
                        <span className="text-muted-foreground text-[10px] font-mono opacity-50">[{i + 1}]</span>
                        <div className="text-primary">{step.icon}</div>
                        <span className="text-sm font-semibold text-foreground/80">{step.label}</span>
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-emerald-500 text-[10px] font-black tracking-widest uppercase">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                  {terminalIndex < bootSequence.length && (
                    <div className="flex justify-center pt-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="p-16 text-center bg-destructive/[0.03] border border-destructive/20 rounded-[2rem] space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold uppercase tracking-tight text-foreground">Intercept Severed</h3>
                <p className="text-muted-foreground text-sm font-mono">{error}</p>
              </div>
              <Button variant="outline" onClick={() => setError(null)} className="rounded-full px-8">Refresh Link</Button>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

              {/* Identity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 border-border/80 bg-card rounded-[2rem] p-10 flex flex-col justify-end min-h-[250px] relative overflow-hidden group shadow-sm transition-shadow hover:shadow-md">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000">
                    <Fingerprint className="h-48 w-48 text-primary" />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 text-[10px] tracking-widest rounded-full uppercase">Target: Identified</Badge>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Protocol Panopticon Active</span>
                    </div>
                    <h2 className="text-7xl font-[1000] tracking-tighter uppercase leading-[0.85] text-foreground break-all">
                      {result.competitor_handle}
                    </h2>
                  </div>
                </Card>

                <Card className="border-primary/20 bg-card rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/[0.01] transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-10">Aggregate Threat</div>
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-muted/20" />
                      <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray="515"
                        strokeDashoffset={515 - (515 * result.threat_level) / 100}
                        className="text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-in-out"
                        strokeLinecap="round" />
                    </svg>
                    <div className="text-center">
                      <div className="text-6xl font-[1000] text-foreground leading-none">{result.threat_level}</div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest mt-1">Global Danger</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Multi-modal Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Rekognition Intelligence */}
                <Card className="rounded-[2rem] border-border/80 bg-card p-10 space-y-10 hover:shadow-lg transition-all border-l-4 border-l-indigo-500/40">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                      <Eye className="h-5 w-5 text-indigo-500" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase border-indigo-500/20 text-indigo-500">Visual DNA</Badge>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Brand Aesthetic</p>
                      <p className="text-lg font-extrabold leading-tight text-foreground">{result.sensory_layer.rekognition.color_palette}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.sensory_layer.rekognition.visual_themes.map((t: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 font-bold px-3">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Psychological Visual Target</p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{result.sensory_layer.rekognition.target_demographic_visuals}</p>
                  </div>
                </Card>

                {/* Transcribe Intercepts */}
                <Card className="rounded-[2rem] border-border/80 bg-card p-10 space-y-10 hover:shadow-lg transition-all border-l-4 border-l-sky-500/40">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-sky-500/10 rounded-2xl">
                      <Headphones className="h-5 w-5 text-sky-500" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase border-sky-500/20 text-sky-500">Sonic Core</Badge>
                  </div>
                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">High-CTR Conversion Loops</p>
                    <div className="space-y-3">
                      {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                        <div key={i} className="bg-muted/30 p-5 rounded-2xl border italic text-sm text-foreground/80 leading-relaxed group">
                          <span className="text-sky-500 mr-2 font-bold select-none">"</span>
                          {hook}
                          <span className="text-sky-500 ml-1 font-bold select-none">"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Offensive Strategy Strike */}
                <Card className="rounded-[2.5rem] border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent p-10 flex flex-col justify-between group shadow-xl transition-all hover:scale-[1.01] lg:row-span-2">
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="h-3.5 w-3.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-black uppercase tracking-widest text-primary">Red Team Offensive</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Market Vulnerability</p>
                      <p className="text-2xl font-[1000] leading-none text-foreground uppercase tracking-tight">{result.agent_swarm.red_team.pricing_vulnerability}</p>
                    </div>
                    <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground shadow-2xl relative overflow-hidden">
                      <Rocket className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Primary Strike Directive</p>
                      <p className="text-3xl font-[1000] uppercase leading-tight tracking-tighter">{result.agent_swarm.red_team.undercut_strategy}</p>
                    </div>
                  </div>
                  <div className="pt-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-primary" />
                      <span className="text-[11px] font-bold uppercase text-primary">Asymmetric Delta Detected</span>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary animate-in fade-in slide-in-from-left-4 repeat-infinite duration-1000" />
                  </div>
                </Card>

                {/* Comprehend Sentiment Analysis */}
                <Card className="rounded-[2rem] border-border/80 bg-card p-10 space-y-10 border-l-4 border-l-orange-500/40">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-orange-500/10 rounded-2xl">
                      <BrainCircuit className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-[11px] font-black text-orange-600 flex items-center gap-2 uppercase tracking-tighter">
                      <ShieldAlert className="h-3.5 w-3.5" /> {result.sensory_layer.comprehend.negative_sentiment_score}% Market Erosion
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10">
                      <p className="text-xl font-black text-foreground uppercase tracking-tight leading-none">"{result.sensory_layer.comprehend.critical_vulnerability}"</p>
                    </div>
                    <div className="space-y-3">
                      {result.sensory_layer.comprehend.user_complaints.map((c: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm text-muted-foreground items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Market Poacher Segment */}
                <Card className="rounded-[2rem] border-emerald-500/20 bg-emerald-500/[0.02] p-10 space-y-10 border-l-4 border-l-emerald-500/40 group hover:bg-emerald-500/[0.04] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Target className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Market Poacher v2</span>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Exploitative Zero-Day Hook</p>
                    <div className="bg-card border-2 border-dashed border-emerald-500/20 p-8 rounded-2xl shadow-inner">
                      <p className="text-2xl font-[1000] italic text-emerald-600 dark:text-emerald-400 leading-snug tracking-tighter font-serif uppercase">"{result.agent_swarm.customer_poacher.zero_day_ad_copy}"</p>
                    </div>
                  </div>
                </Card>

                {/* Infrastructure Topology */}
                <Card className="lg:col-span-2 rounded-[2.5rem] bg-muted/20 border-border/60 p-10 relative overflow-hidden">
                  <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                  <div className="flex items-center justify-between relative z-10 mb-10">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                      <Globe className="h-4 w-4" /> Neptune Threat Topology
                    </span>
                    <Lock className="h-4 w-4 text-muted-foreground opacity-30" />
                  </div>
                  <div className="relative z-10 py-4 flex flex-wrap justify-center gap-12 sm:gap-24 items-center">
                    {result.threat_graph.nodes.slice(0, 3).map((node: any, i: number) => (
                      <div key={i} className="text-center space-y-4 group/node">
                        <div className={`relative h-24 w-40 rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center p-6 bg-card group-hover/node:shadow-xl group-hover/node:-translate-y-2 cursor-pointer ${i === 0 ? 'border-primary border-2 shadow-lg scale-110' : 'border-border/60'}`}>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 mb-1">{node.type}</p>
                          <p className="text-xs font-black uppercase text-foreground text-center tracking-tighter line-clamp-2 leading-none">{node.label}</p>
                          {i === 0 && <div className="absolute -top-2 px-3 py-0.5 bg-primary text-primary-foreground text-[8px] font-black rounded-full uppercase">Primary</div>}
                        </div>
                      </div>
                    ))}
                    {/* Static connecting line representation */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 -z-1" />
                  </div>
                </Card>
              </div>

              {/* Deploy Directive Section */}
              <div className="pt-24 pb-48 flex flex-col items-center text-center space-y-12 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-5xl font-[1000] tracking-tighter uppercase leading-none text-foreground">Launch Market Strike</h3>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                    Convert this intelligence pulse into an operational directive.
                    Redirect to the <strong>Campaign Architect</strong> to weaponize these insights.
                  </p>
                </div>

                <div className="relative group w-full max-w-3xl">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-30 transition duration-1000" />
                  <Button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="h-28 w-full rounded-[3rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_30px_70px_-15px_rgba(var(--primary),0.4)] flex items-center justify-between px-16 group transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] border-none"
                  >
                    <div className="flex items-center gap-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
                          <Rocket className="h-8 w-8 fill-current" />
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-4xl font-[1000] uppercase tracking-[-0.03em] leading-none block">Deploy Counter-Strike</span>
                        <span className="text-[11px] font-bold tracking-[0.4em] opacity-60 uppercase mt-2 block">Direct-to-Architect Override</span>
                      </div>
                    </div>
                    <ChevronRight className="h-10 w-10 opacity-30 group-hover:opacity-80 transition-all group-hover:translate-x-3" />

                    {deploying && (
                      <div className="absolute inset-0 bg-primary flex flex-col items-center justify-center rounded-[3rem] animate-in slide-in-from-bottom-full duration-500">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <span className="text-2xl font-black uppercase tracking-widest">Piping Intelligence...</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
              <div className="relative h-64 w-64 mb-16 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full animate-[spin_50s_linear_infinite]" />
                <div className="absolute inset-10 border border-primary/5 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-[2rem] bg-card border shadow-xl flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-[1000] uppercase tracking-[0.5em] text-muted-foreground/30 leading-none px-4">Intercept Link Inactive</h2>
                <p className="text-muted-foreground text-sm font-mono tracking-widest uppercase max-w-sm mx-auto leading-relaxed">
                  Input target identity and authenticate via the command bar above to authorize the multi-modal pulse sequence.
                </p>
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