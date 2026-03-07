import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import {
  Radar,
  Search,
  Zap,
  Activity,
  Terminal,
  Eye,
  Headphones,
  BrainCircuit,
  Crosshair,
  Server,
  Network,
  Rocket,
  ShieldAlert,
  Fingerprint,
  ChevronRight,
  Target,
  AlertTriangle,
  Flame,
  Globe,
  Cpu,
  Lock
} from "lucide-react"

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const bootSequence = [
    { label: "INITIATING AWS STEP FUNCTIONS", icon: <Cpu className="h-3 w-3" />, color: "text-blue-400" },
    { label: "SPINNING UP REKOGNITION AGENTS", icon: <Eye className="h-3 w-3" />, color: "text-indigo-400" },
    { label: "MINING BRAND DNA VIA COMPREHEND", icon: <BrainCircuit className="h-3 w-3" />, color: "text-orange-400" },
    { label: "ORCHESTRATING RED TEAM BEDROCK SWARM", icon: <ShieldAlert className="h-3 w-3" />, color: "text-red-400" },
    { label: "MAPPING THREAT GRAPH IN NEPTUNE", icon: <Network className="h-3 w-3" />, color: "text-emerald-400" },
    { label: "LOCKING ON TARGET PARAMETERS", icon: <Target className="h-3 w-3" />, color: "text-zinc-400" }
  ]

  useEffect(() => {
    if (loading) {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < bootSequence.length ? prev + 1 : prev))
      }, 800)
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
      if (!response.ok) throw new Error("Intelligence link severed by remote host")
      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTimeout(() => setLoading(false), 800)
    }
  }

  const handleDeploy = () => {
    setDeploying(true)
    toast.success("WAR ROOM DEPLOYMENT INITIATED", {
      description: "Asymmetric directives transferred to Architect core.",
      icon: <Rocket className="h-4 w-4" />,
      className: "bg-red-600 border-red-500 text-white font-bold"
    })
    setTimeout(() => setDeploying(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 font-sans selection:bg-red-500/30">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 opacity-30" />
        <div className="absolute inset-0 panopticon-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050507]/80 to-[#050507]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* Elite Header */}
        <header className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-600/20 rounded-xl rotate-12 animate-pulse" />
                <div className="absolute inset-0 border border-red-500/30 rounded-xl -rotate-6" />
                <Radar className="h-8 w-8 text-red-500 relative z-10 animate-panopticon-pulse" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tightest uppercase text-white lg:text-6xl">
                  Panopticon<span className="text-red-600">.</span>
                </h1>
                <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-1">
                  <span className="w-8 h-px bg-red-600/50" />
                  Predictive Strategic Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 px-6">
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">System Status</div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">AWS Backend</div>
              <div className="text-zinc-300 font-black text-xs uppercase tracking-widest">Nova-Lite-v1</div>
            </div>
          </div>
        </header>

        {/* Tactical Search Interface */}
        <section className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition duration-1000" />
          <div className="relative bg-[#09090b] border border-white/10 rounded-2xl p-2 flex flex-col md:flex-row shadow-2xl">
            <div className="flex-1 flex items-center px-6 gap-4">
              <Search className="h-5 w-5 text-red-500/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                placeholder="Target Handle (e.g. @therundownai) or Competitive Niche..."
                className="h-14 bg-transparent border-none text-xl font-bold placeholder:text-zinc-700 text-white focus-visible:ring-0 shadow-none px-0"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-14 px-10 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            >
              <Zap className="h-5 w-5 mr-3 fill-current" />
              Initiate Pulse
            </Button>
          </div>
        </section>

        {/* Terminal / Results */}
        <main>
          {loading && (
            <div className="max-w-3xl mx-auto space-y-6 pt-10">
              <div className="panopticon-glass rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">AWS Step Orchestrator</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                    <div className="h-2 w-2 rounded-full bg-zinc-800" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="p-8 font-mono text-xs md:text-sm space-y-4 min-h-[300px]">
                  {bootSequence.slice(0, terminalIndex).map((step, i) => (
                    <div key={i} className="flex items-center gap-4 animate-panopticon-reveal">
                      <span className="text-zinc-600 font-bold">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                      <span className={step.color + " font-black uppercase flex items-center gap-2"}>
                        {step.icon} {step.label}
                      </span>
                      <span className="ml-auto text-emerald-500 font-black">ACTIVE</span>
                    </div>
                  ))}
                  {terminalIndex < bootSequence.length && (
                    <div className="flex items-center gap-4 animate-pulse">
                      <span className="text-zinc-600 font-bold">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                      <div className="h-4 w-2 bg-zinc-700" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto bg-red-950/20 border-2 border-red-600/50 rounded-2xl p-8 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black uppercase text-red-100">Intelligence Link severed</h3>
              <p className="text-red-400/80 font-mono text-sm">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">

              {/* Strategic Overview Meta */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Fingerprint className="h-64 w-64 text-red-600" />
                  </div>
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-500 text-white font-black rounded text-[10px]">THREAT LEVEL: CRITICAL</Badge>
                      <span className="h-px w-20 bg-white/10" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Protocol Panopticon Active</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tightest uppercase leading-none text-white break-words">
                      {result.competitor_handle}
                    </h2>
                  </div>
                </div>

                <Card className="bg-[#0c0c0e] border border-red-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_-15px_rgba(220,38,38,0.2)]">
                  <div className="absolute inset-0 bg-red-500/5 pulse-bg rounded-3xl pointer-events-none" />
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 mb-6">Aggregate Danger</h4>
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-900" />
                      <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray="465"
                        strokeDashoffset={465 - (465 * result.threat_level) / 100}
                        className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-panopticon-revea"
                        strokeLinecap="round" />
                    </svg>
                    <div className="text-center">
                      <div className="text-6xl font-black text-white">{result.threat_level}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Impact Score</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Data Grid Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

                {/* COLUMN 1: SENSORY DATA */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-[.25em] text-zinc-400">Sensory Intercepts</h3>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono text-[9px]">RAW AWS DATA</Badge>
                  </div>

                  <div className="space-y-4">
                    {/* Rekognition */}
                    <Card className="bg-white/5 border-l-4 border-l-indigo-500 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest">Rekognition Vision</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase font-mono text-zinc-500">Aesthetic Palette</div>
                            <div className="text-sm font-bold text-white">{result.sensory_layer.rekognition.color_palette}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase font-mono text-zinc-500">Demographic Hook</div>
                            <div className="text-sm font-bold text-white">{result.sensory_layer.rekognition.target_demographic_visuals}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 content-start">
                          {result.sensory_layer.rekognition.visual_themes.map((theme: string, i: number) => (
                            <Badge key={i} className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[9px] uppercase font-black">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Transcribe */}
                    <Card className="bg-white/5 border-l-4 border-l-cyan-500 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center gap-2 mb-6">
                        <Headphones className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest">Transcribe Sonic</span>
                      </div>
                      <div className="grid gap-3">
                        {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                          <div key={i} className="bg-zinc-950/50 p-3 px-4 rounded-lg border border-white/5 font-mono italic text-sm text-cyan-50/70 border-l-2 border-l-cyan-500/50">
                            "{hook}"
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Comprehend */}
                    <Card className="bg-white/5 border-l-4 border-l-orange-500 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-mono font-black text-orange-400 uppercase tracking-widest">Comprehend NLP</span>
                        </div>
                        <div className="text-[10px] font-mono text-orange-500/80 font-black flex items-center gap-2">
                          SENTIMENT LOSS: {result.sensory_layer.comprehend.negative_sentiment_score}%
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                          <p className="text-lg font-black text-white italic leading-tight uppercase">"{result.sensory_layer.comprehend.critical_vulnerability}"</p>
                        </div>
                        <div className="space-y-2">
                          {result.sensory_layer.comprehend.user_complaints.map((c: string, i: number) => (
                            <div key={i} className="flex gap-3 text-xs text-zinc-400 items-start">
                              <span className="text-orange-500 font-bold">»</span> <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* COLUMN 2: STRATEGIC SWARM */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Crosshair className="h-5 w-5 text-red-500" />
                      <h3 className="text-sm font-black uppercase tracking-[.25em] text-zinc-400">Agent Swarm Directives</h3>
                    </div>
                    <Badge variant="outline" className="border-red-500/30 text-red-400 font-mono text-[9px] animate-pulse">BEDROCK ACTIVE</Badge>
                  </div>

                  <div className="grid gap-6">
                    {/* Red Team Strategy */}
                    <Card className="bg-gradient-to-br from-[#1c0a0a] to-[#050507] border border-red-500/30 rounded-2xl p-8 relative overflow-hidden group">
                      <Flame className="absolute -right-6 -bottom-6 w-32 h-32 text-red-500 opacity-5 group-hover:opacity-10 transition-opacity" />
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_12px_rgba(220,38,38,1)]" />
                        <span className="text-xs font-mono font-black text-red-500 uppercase tracking-widest">Asymmetric Offensive</span>
                      </div>
                      <div className="space-y-8 relative z-10">
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono font-black text-red-400/50 uppercase">Weakness Identification</div>
                          <p className="text-base font-bold text-zinc-100">{result.agent_swarm.red_team.pricing_vulnerability}</p>
                        </div>
                        <div className="bg-red-600 border border-red-500 rounded-xl p-6 shadow-[0_10px_30px_-5px_rgba(220,38,38,0.4)] transition-transform hover:-translate-y-1">
                          <div className="flex items-center gap-2 mb-2 text-white/70 font-mono font-black text-[9px] uppercase">Primary Directive</div>
                          <p className="text-xl font-black text-white uppercase leading-tight">{result.agent_swarm.red_team.undercut_strategy}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Poacher Section */}
                    <Card className="bg-[#09090b] border border-emerald-500/20 rounded-2xl p-8 relative group">
                      <div className="absolute top-0 right-0 p-4">
                        <Rocket className="h-5 w-5 text-emerald-500/20" />
                      </div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-3 w-3 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_12px_rgba(16,185,129,1)]" />
                        <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-widest">Market Poacher</span>
                      </div>
                      <div className="space-y-4">
                        <div className="text-[10px] font-mono font-black text-emerald-500/50 uppercase">The Zero-Day Ad Hook</div>
                        <div className="bg-zinc-950/80 border-2 border-dashed border-emerald-500/20 p-8 rounded-2xl text-center">
                          <p className="text-2xl font-black italic text-emerald-400 leading-snug">"{result.agent_swarm.customer_poacher.zero_day_ad_copy}"</p>
                        </div>
                      </div>
                    </Card>

                    {/* Neptune Threat Graph Overlay */}
                    <Card className="bg-[#060608] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-[#060608] panopticon-grid pointer-events-none opacity-20" />
                      <div className="flex items-center justify-between mb-8 relative z-10">
                        <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" /> Neptune Infrastructure Map
                        </span>
                        <Lock className="h-3 w-3 text-zinc-700" />
                      </div>
                      <div className="relative h-48 flex items-center justify-center p-4">
                        {/* Stylized Visual Graph Component */}
                        <div className="w-full flex justify-around items-center relative gap-4">
                          <div className="absolute inset-0 flex items-center justify-center -z-0">
                            <svg className="w-full h-full stroke-zinc-800" fill="none">
                              <path d="M 20 80 Q 50 20 80 80" className="animate-panopticon-dash" strokeDasharray="5,5" />
                              <path d="M 20 80 Q 50 140 80 80" className="animate-panopticon-dash" strokeDasharray="5,5" />
                            </svg>
                          </div>
                          {result.threat_graph.nodes.slice(0, 3).map((node: any, i: number) => (
                            <div key={i} className="bg-zinc-900 border border-white/10 p-3 px-5 rounded-lg text-center relative z-10 hover:border-red-500/50 transition-colors cursor-crosshair">
                              <div className="text-[9px] font-mono text-zinc-600 uppercase mb-1">{node.type}</div>
                              <div className="text-[11px] font-black text-zinc-200 uppercase">{node.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* MASSIVE FINAL CTA */}
              <div className="pt-20 pb-32 flex flex-col items-center">
                <div className="relative group perspective-1000 w-full max-w-2xl px-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-[30px] blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse" />

                  <Button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className="w-full h-auto py-8 rounded-[24px] bg-[#0c0c0e] border-2 border-red-600/50 hover:border-red-500 relative overflow-hidden group transition-all duration-500 flex flex-col sm:flex-row items-center justify-center gap-8 px-12"
                  >
                    {/* Dynamic Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1200 ease-out" />

                    <div className="relative bg-red-600 p-4 rounded-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                      <Rocket className="w-8 h-8 text-white fill-current" />
                    </div>

                    <div className="flex flex-col items-start text-center sm:text-left relative z-10">
                      <span className="text-3xl font-black uppercase tracking-tighter text-white leading-none">Deploy Counter-Strike</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Execute Directive #42</span>
                        <ChevronRight className="h-3 w-3 text-red-600" />
                      </div>
                    </div>

                    {deploying && (
                      <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center animate-in slide-in-from-bottom fill-current">
                        <Activity className="h-10 w-10 text-white animate-pulse mb-2" />
                        <span className="font-black text-xl text-white uppercase tracking-widest">Transmitting Intel...</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* Empty State Overlay */}
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-32 opacity-80">
              <div className="relative h-40 w-40 mb-10">
                <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-4 border border-zinc-900 border-t-red-500/20 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crosshair className="h-14 w-14 text-white/5" />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase text-zinc-600 tracking-[0.4em]">Target Acquisition Offline</h3>
              <p className="text-zinc-500 font-mono mt-4 max-w-xs text-center text-xs tracking-tight">
                Authorize the system via the command bar above to initiate a deep-strike intelligence pulse.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})