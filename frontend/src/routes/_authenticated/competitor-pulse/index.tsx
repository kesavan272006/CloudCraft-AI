import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  Fingerprint
} from "lucide-react"

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)

  // Terminal animation state
  const [logs, setLogs] = useState<string[]>([])
  const bootSequence = [
    "INITIATING AWS STEP FUNCTIONS ORCHESTRATOR...",
    "SPINNING UP AMAZON REKOGNITION VISION AGENTS...",
    "EXTRACTING COMPETITOR COMPLAINTS VIA AWS COMPREHEND...",
    "DEPLOYING RED TEAM BEDROCK SWARM...",
    "MAPPING THREAT GRAPH IN AMAZON NEPTUNE...",
    "SYNTHESIZING ZERO-DAY EXPLOIT PLAN..."
  ]

  useEffect(() => {
    if (loading) {
      let currentLogIndex = 0;
      setLogs([]);
      const interval = setInterval(() => {
        if (currentLogIndex < bootSequence.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${bootSequence[currentLogIndex]}`]);
          currentLogIndex++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

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

      if (!response.ok) throw new Error("Failed to fetch competitor pulse")

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Engine error during web search")
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleDeploy = () => {
    setDeploying(true)
    toast.success("COUNTER-STRIKE INITIATED", {
      description: "Intelligence successfully transferred. Bedrock agents are drafting your retaliation campaign...",
      icon: <Rocket className="h-5 w-5 text-white" />,
      style: { backgroundColor: '#dc2626', color: 'white', border: '1px solid #f87171' }
    });
    setTimeout(() => {
      setDeploying(false)
    }, 3000)
  }

  return (
    <div className="flex-1 p-4 md:p-10 text-foreground overflow-x-hidden min-h-screen relative font-sans">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-zinc-950">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-30 animate-pulse" />
                <div className="relative bg-zinc-950 border border-red-500/50 p-2 rounded-full">
                  <Radar className="h-6 w-6 text-red-500 animate-[spin_3s_linear_infinite]" />
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Project Panopticon</h1>
            </div>
            <p className="text-zinc-400 text-sm font-mono tracking-widest uppercase flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500/80" />
              AWS Native Threat Engine
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative group rounded-2xl p-1 bg-gradient-to-r from-red-500/20 via-zinc-800 to-indigo-500/20 hover:from-red-500/40 hover:to-indigo-500/40 transition-all duration-500">
          <div className="absolute inset-0 bg-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col sm:flex-row gap-2 bg-zinc-950 p-2 rounded-xl border border-white/10">
            <div className="relative flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Enter Target Handle or URI..."
                className="flex-1 h-12 bg-transparent border-none text-lg font-mono placeholder:text-zinc-600 focus-visible:ring-0 shadow-none text-zinc-100"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={loading}
              className="h-12 px-10 text-base font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02]"
            >
              <Zap className="mr-2 h-5 w-5" />
              Initiate Pulse
            </Button>
          </div>
        </div>

        {/* Terminal Loading */}
        {loading && (
          <div className="mx-auto max-w-3xl pt-10">
            <div className="bg-[#0D1117] border border-green-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.1)] relative">
              <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">AWS Step Functions.exe</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
              <div className="p-6 font-mono text-sm space-y-3 min-h-[250px] relative">
                {logs.map((log, i) => (
                  <div key={i} className="text-green-400 opacity-90 animate-in slide-in-from-bottom-2 fade-in flex items-start gap-3">
                    <span className="text-zinc-500 select-none">❯</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="text-green-500/50 animate-pulse mt-4 flex items-center gap-3">
                  <span className="text-zinc-500 select-none">❯</span>
                  <span className="w-2 h-4 bg-green-500/80 inline-block" />
                </div>
                {/* Visual scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-20 w-full animate-[scan_3s_ease-in-out_infinite] opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-950/30 p-6 flex flex-col items-center justify-center text-center">
            <Activity className="h-8 w-8 text-red-500 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-red-400 uppercase">System Malfunction</h3>
            <p className="text-red-300/80 font-mono mt-2">{error}</p>
          </div>
        )}

        {/* Panopticon Results Dashboard */}
        {result && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Top Identity Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md group">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                  <Fingerprint className="h-64 w-64 text-red-500" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">VULNERABILITY DETECTED</Badge>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Intelligence Target</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">{result.competitor_handle}</h2>
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(220,38,38,0.15)]">
                <div className="absolute inset-0 bg-red-500/5 pulse-bg rounded-2xl pointer-events-none" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-3">Threat Level</span>
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray="377"
                      strokeDashoffset={377 - (377 * result.threat_level) / 100}
                      className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      strokeLinecap="round" />
                  </svg>
                  <span className="text-4xl font-black text-white">{result.threat_level}<span className="text-lg text-zinc-500">%</span></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* SENSORY INTERCEPTS COLUMN */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">Sensory Intercepts</h3>
                </div>

                <div className="grid gap-4">
                  {/* Rekognition */}
                  <div className="bg-white/5 border border-indigo-500/30 rounded-xl p-5 hover:bg-white/10 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Amazon Rekognition</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Visual Palette</p>
                        <p className="text-sm text-zinc-200 font-medium">{result.sensory_layer.rekognition.color_palette}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Target Demographic</p>
                        <p className="text-sm text-zinc-200 font-medium">{result.sensory_layer.rekognition.target_demographic_visuals}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {result.sensory_layer.rekognition.visual_themes.map((theme: string, i: number) => (
                          <span key={i} className="px-2 py-1 text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">{theme}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transcribe */}
                  <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-5 hover:bg-white/10 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    <div className="flex items-center gap-2 mb-4">
                      <Headphones className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Amazon Transcribe</span>
                    </div>
                    <div className="space-y-3 bg-zinc-950/50 p-4 rounded-lg border border-white/5">
                      <p className="text-[10px] text-zinc-500 uppercase font-mono mb-2">Sonic Hooks Extracted</p>
                      {result.sensory_layer.transcribe.sonic_hooks.map((hook: string, i: number) => (
                        <p key={i} className="text-sm text-cyan-50/90 font-mono italic">"{hook}"</p>
                      ))}
                    </div>
                  </div>

                  {/* Comprehend */}
                  <div className="bg-white/5 border border-orange-500/30 rounded-xl p-5 hover:bg-white/10 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-orange-400" />
                        <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">Amazon Comprehend</span>
                      </div>
                      <Badge className="bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded uppercase text-[9px] font-black">
                        Sentiment: NEGATIVE
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-zinc-100 mb-4">{result.sensory_layer.comprehend.critical_vulnerability}</p>
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-mono">User Complaints Filtered</p>
                      {result.sensory_layer.comprehend.user_complaints.map((complaint: string, i: number) => (
                        <div key={i} className="flex gap-2 text-sm text-zinc-400 items-start">
                          <span className="text-orange-500 mt-1">⊛</span> <span>{complaint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AGENT SWARM & THREAT GRAPH COLUMN */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <Crosshair className="h-5 w-5 text-rose-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">Agent Swarm Directives</h3>
                </div>

                {/* Red Team Strategy */}
                <div className="bg-gradient-to-br from-rose-950/40 to-black border border-rose-500/30 rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert className="w-32 h-32 text-rose-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,1)]" />
                    <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">Red Team Offensive</span>
                  </div>
                  <div className="space-y-5 relative z-10">
                    <div>
                      <span className="text-[10px] text-rose-400/70 uppercase tracking-widest block mb-1 font-mono">Pricing Vulnerability</span>
                      <p className="text-sm font-semibold text-zinc-200">{result.agent_swarm.red_team.pricing_vulnerability}</p>
                    </div>
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <span className="text-[10px] text-rose-400 uppercase tracking-widest block mb-1 font-mono">Undercut Execution</span>
                      <p className="text-base font-bold text-white">{result.agent_swarm.red_team.undercut_strategy}</p>
                    </div>
                  </div>
                </div>

                {/* Poacher Segment */}
                <div className="bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/30 rounded-xl p-6 relative">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Customer Poacher</span>
                  </div>
                  <div className="bg-black/50 border border-emerald-500/20 p-5 rounded-lg">
                    <span className="text-[9px] text-emerald-500/70 uppercase tracking-widest block mb-2 font-mono">Zero-Day Ad Copy Draft Generated</span>
                    <p className="text-lg font-black italic text-emerald-400 leading-snug">"{result.agent_swarm.customer_poacher.zero_day_ad_copy}"</p>
                  </div>
                </div>

                {/* Neptune Threat Graph Visualization */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                  <div className="p-4 border-b border-zinc-800 bg-black/50 relative z-10">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Network className="h-3 w-3" /> Amazon Neptune Threat Graph
                    </span>
                  </div>
                  <div className="p-8 relative z-10 min-h-[220px] flex items-center justify-center">
                    {/* Simulated Graph UI */}
                    <div className="relative w-full max-w-sm aspect-video">
                      {/* Center Node */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-950 border border-red-500 p-2 rounded z-20 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        <span className="text-[10px] font-mono font-bold text-white uppercase">{result.threat_graph.nodes[0]?.label.slice(0, 15)}</span>
                      </div>

                      {/* Left Node */}
                      <div className="absolute top-1/4 left-0 bg-zinc-900 border border-zinc-700 p-2 rounded z-20">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase">{result.threat_graph.nodes[1]?.label.slice(0, 12)}</span>
                      </div>

                      {/* Right Node */}
                      <div className="absolute bottom-1/4 right-0 bg-zinc-900 border border-zinc-700 p-2 rounded z-20">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase">{result.threat_graph.nodes[2]?.label.slice(0, 12)}</span>
                      </div>

                      {/* SVG Lines */}
                      <svg className="absolute inset-0 w-full h-full z-10 overflow-visible" aria-hidden="true">
                        <path d="M 0 25 L 50 50" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" fill="none" vectorEffect="non-scaling-stroke" preserveAspectRatio="none" transform="scale(3.8, 1) translate(0, 15)" />
                        <path d="M 50 50 L 100 75" stroke="rgba(239,68,68,0.3)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite_reverse]" fill="none" vectorEffect="non-scaling-stroke" preserveAspectRatio="none" transform="scale(3.8, 1) translate(0, 15)" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* MASSIVE DEPLOY BUTTON */}
            <div className="pt-10 pb-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 delay-500">
              <div className="relative group perspective-1000">
                {/* Glowing backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 group-active:opacity-75 transition-all duration-500 animate-pulse" />

                <Button
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="relative flex items-center gap-4 bg-zinc-950 border-2 border-red-500/50 hover:border-red-400 hover:bg-zinc-900 h-auto py-6 px-12 rounded-xl transition-all duration-300 transform group-hover:scale-[1.03] group-active:scale-[0.98] overflow-hidden"
                >
                  {/* Shimmer sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                  {deploying ? (
                    <>
                      <Activity className="w-8 h-8 text-red-500 animate-pulse" />
                      <div className="flex flex-col items-start text-left">
                        <span className="text-2xl font-black uppercase text-white tracking-widest leading-none">Executing...</span>
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest mt-1">Transferring to Architect</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-8 h-8 text-red-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                      <div className="flex flex-col items-start text-left">
                        <span className="text-2xl font-black uppercase text-white tracking-widest leading-none">Deploy Counter-Strike</span>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">Convert Intel into Live Campaign Draft</span>
                      </div>
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500 blur-3xl opacity-10 rounded-full" />
              <Crosshair className="h-20 w-20 text-red-500/20 relative" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest text-zinc-100">Engine Standby</h3>
            <p className="text-zinc-500 font-mono mt-3 max-w-md text-sm">
              Input target parameters above to authorize AWS Step Functions to orchestrate a multi-modal Panopticon intelligence sweep.
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})