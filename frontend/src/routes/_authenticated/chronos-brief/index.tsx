import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "../../../components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Loader2, Zap, Target, Globe, Cpu, Layers,
  ChevronRight, CalendarDays, ShieldCheck,
  Timer, Users, ArrowRight, CheckCircle2, Terminal,
  Briefcase, RefreshCcw, Share2, AlertCircle, Shield,
  TrendingUp, Search, Info, Radio, Plus, Lock, History,
  PlayCircle, PauseCircle, Activity, Settings2, Hammer, Eye
} from "lucide-react"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false },
  { title: 'Chronos Brief', href: '/chronos-brief', isActive: true },
  { title: 'Campaign Architect', href: '/campaign-architect', isActive: false },
  { title: 'Competitor Pulse', href: '/competitor-pulse', isActive: false },
]

type MissionState = 'dashboard' | 'briefing' | 'deploying' | 'active'
type AutomationLevel = 'automate' | 'suggest'

const LOCAL_MARKET_SIGNALS = [
  "COMPETITOR 'VIVA' LAUNCHED NEW AD CAMPAIGN. SENTIMENT DROPPING.",
  "UNEXPECTED SURGE IN TIKTOK ENGAGEMENT FOR 'SUSTAINABILITY' HASHTAG.",
  "GLOBAL SUPPLY CHAIN DISRUPTION DETECTED. ADJUSTING INVENTORY MESSAGING.",
  "INFLUENCER TREND SHIFTING TOWARDS MICRO-COMMUNITIES IN TARGET REGION.",
  "BUSINESSES MUST PREPARE FOR 2026 BY ADOPTING ADVANCED TESTING STRATEGIES.",
  "ALGORITHMIC UPDATE ON LINKEDIN PRIORITIZING LONG-FORM THOUGHT LEADERSHIP."
]

function ChronosBriefPageContent() {
  const [activeState, setActiveState] = useState<MissionState>('dashboard')
  const [missionsList, setMissionsList] = useState<any[]>([])
  const [loadingMissions, setLoadingMissions] = useState(true)

  // Creation State
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState([90])
  const [budgetTier, setBudgetTier] = useState<'bootstrap' | 'growth' | 'scale'>('growth')
  const [automationLevel, setAutomationLevel] = useState<AutomationLevel>('suggest')

  // Active Mission State
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [pushedTasks, setPushedTasks] = useState<Record<string, boolean>>({})

  // Live Feed & Pivot State
  const [liveSignalIndex, setLiveSignalIndex] = useState(0)
  const [isPivoting, setIsPivoting] = useState(false)

  // Live Feed Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSignalIndex(prev => (prev + 1) % LOCAL_MARKET_SIGNALS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleGlobalPivot = () => {
    setIsPivoting(true);
    const toastId = toast.loading("Authorizing Global Pivot...", { description: "Re-calibrating mission parameters & engine directives." });
    setTimeout(() => {
      toast.success("Global Pivot Authorized.", { id: toastId, description: "Mission architecture successfully updated." });
      setIsPivoting(false);
    }, 2500);
  }

  // Update selected day when mission loads
  useEffect(() => {
    if (mission?.current_day) {
      setSelectedDay(mission.current_day)
    }
  }, [mission])

  const getTaskLocation = (theme: string, tasks: any[]) => {
    const combinedDesc = tasks.map(t => `${t.content_type} ${t.description}`).join(' ').toLowerCase();

    if (combinedDesc.includes('image') || combinedDesc.includes('photo') || combinedDesc.includes('graphic') || combinedDesc.includes('video') || combinedDesc.includes('reel') || combinedDesc.includes('banner')) {
      return {
        id: 'vision',
        label: 'Push to Vision Lab',
        route: `/vision-lab?autofill=true&prompt=${encodeURIComponent(theme)}`,
        icon: <Eye className="h-3 w-3 ml-2" />
      }
    } else if (combinedDesc.includes('post') || combinedDesc.includes('blog') || combinedDesc.includes('article') || combinedDesc.includes('copy') || combinedDesc.includes('email') || combinedDesc.includes('newsletter')) {
      return {
        id: 'forge',
        label: 'Push to Forge',
        route: `/forge?autofill=true&prompt=${encodeURIComponent(`Write a ${theme} for my campaign.`)}`,
        icon: <Hammer className="h-3 w-3 ml-2" />
      }
    } else {
      const desc = tasks.map((t: any) => `${t.content_type} on ${t.platform}: ${t.description}`).join(' | ')
      return {
        id: 'architect',
        label: 'Push to Campaign Architect',
        route: `/campaign-architect?autofill=true&task=${encodeURIComponent(theme)}&desc=${encodeURIComponent(desc)}`,
        icon: <Layers className="h-3 w-3 ml-2" />
      }
    }
  }

  const handlePushTask = (theme: string, uniqueId: string, tasks: any[]) => {
    const loc = getTaskLocation(theme, tasks);
    const toastId = toast.loading(`Uplinking Task to ${loc.label.replace('Push to ', '')}...`)

    setTimeout(() => {
      toast.success(`Task successfully queued! Redirecting...`, { id: toastId })
      setPushedTasks(prev => ({ ...prev, [uniqueId]: true }))
      setTimeout(() => {
        window.location.href = loc.route
      }, 1000)
    }, 1500)
  }


  const deploySteps = [
    { label: "Intercepting Market Signals", icon: <Search className="h-4 w-4" /> },
    { label: "Profiling Audience Genome", icon: <Users className="h-4 w-4" /> },
    { label: "Mapping Competitive Moats", icon: <Target className="h-4 w-4" /> },
    { label: "Architecturing Strategic Phases", icon: <Layers className="h-4 w-4" /> },
    { label: "Evaluating Risk Probabilities", icon: <ShieldCheck className="h-4 w-4" /> },
    { label: "Connecting Internal Tools (Forge/Vision Lab)", icon: <Hammer className="h-4 w-4" /> },
    { label: "Synthesizing Cross-Agent Consensus", icon: <Cpu className="h-4 w-4" /> }
  ]

  useEffect(() => {
    if (activeState === 'dashboard') {
      fetchMissions()
    }
  }, [activeState])

  useEffect(() => {
    if (activeState === 'deploying') {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex(prev => (prev < deploySteps.length ? prev + 1 : prev))
      }, 700)
      return () => clearInterval(interval)
    }
  }, [activeState])

  const fetchMissions = async () => {
    setLoadingMissions(true)
    try {
      const resp = await fetch('http://localhost:8000/api/v1/chronos/missions')
      if (resp.ok) {
        const data = await resp.json()
        setMissionsList(data || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingMissions(false)
  }

  const loadMission = async (mId: string) => {
    try {
      const resp = await fetch(`http://localhost:8000/api/v1/chronos/mission/${mId}`)
      if (!resp.ok) throw new Error("Failed to fetch mission details")
      const data = await resp.json()
      setMission(data)
      setActiveState('active')
    } catch (err: any) {
      toast.error("Uplink Failed", { description: err.message })
    }
  }

  const handleAuthorize = async () => {
    if (!goal.trim()) {
      toast.error("Mission Authorization Denied", { description: "Please specify a clear growth goal." })
      return
    }
    setActiveState('deploying')
    setLoading(true)

    try {
      const resp = await fetch('http://localhost:8000/api/v1/chronos/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          duration_days: duration[0],
          budget_tier: budgetTier,
          automation_level: automationLevel
        })
      })
      if (!resp.ok) throw new Error("Mission uplink severed")
      const data = await resp.json()

      setTimeout(() => {
        setMission(data)
        setActiveState('active')
        toast.success("Mission Sovereign Active", { description: "Playbook generated and linked to workspace." })
      }, 1500)

    } catch (err: any) {
      toast.error("Deployment Failed", { description: err.message })
      setActiveState('briefing')
    } finally {
      setLoading(false)
    }
  }

  // --- DASHBOARD (Mission Control) ---
  if (activeState === 'dashboard') {
    const activeMissions = missionsList.filter(m => m.status === 'active')
    const pausedMissions = missionsList.filter(m => m.status === 'paused' || m.status === 'completed')

    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14">
          <TopNav links={topNav} />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>

        <Main className="px-6 py-12 md:px-10 max-w-[1600px] mx-auto space-y-12 relative w-full pb-32">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] neural-grid" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 w-full mb-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8] select-none">
                Chronos <span className="text-primary not-italic">Command</span>
              </h1>
              <p className="text-sm text-muted-foreground/60 font-bold uppercase tracking-[0.2em]">Sovereign Growth Mission Tracker</p>
            </div>
            <Button
              onClick={() => setActiveState('briefing')}
              className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase italic tracking-[0.2em] shadow-lg hover:translate-y-[-2px] transition-all"
            >
              <Plus className="mr-2 h-5 w-5" /> Initialize New Mission
            </Button>
          </div>

          <Tabs defaultValue="active" className="relative z-10 w-full">
            <TabsList className="bg-white/5 border border-white/10 rounded-2xl p-1 h-14 w-full max-w-sm mb-8">
              <TabsTrigger value="active" className="rounded-xl font-black uppercase tracking-widest text-xs h-full flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none">Active Operations</TabsTrigger>
              <TabsTrigger value="paused" className="rounded-xl font-black uppercase tracking-widest text-xs h-full flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-none">Archived / Paused</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-8 mt-0 focus-visible:ring-0">
              {loadingMissions ? (
                <div className="h-64 flex items-center justify-center border border-white/5 bg-card/20 rounded-[3rem] shadow-inner animate-pulse">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Scanning Uplinks...</span>
                </div>
              ) : activeMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-white/5 border-dashed bg-card/10 rounded-[3rem] space-y-4">
                  <Target className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">No active missions deployed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeMissions.map((m, i) => (
                    <Card key={i} className="bg-card/30 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-xl hover:bg-white/[0.03] transition-all group flex flex-col justify-between min-h-[300px]">
                      <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                          </Badge>
                          <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">Day {m.current_day}/{m.duration_days}</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-snug line-clamp-3">{m.goal}</h3>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                          "{m.executive_summary}"
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                        <Button
                          onClick={() => loadMission(m.mission_id)}
                          className="flex-1 bg-white/5 text-foreground hover:bg-primary hover:text-primary-foreground border-none rounded-xl h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-none"
                        >
                          Command Center <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paused" className="space-y-8 mt-0 focus-visible:ring-0">
              {pausedMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-white/5 border-dashed bg-card/10 rounded-[3rem] space-y-4">
                  <History className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">No archived records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pausedMissions.map((m, i) => (
                    <Card key={i} className="bg-card/10 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[300px] opacity-60 hover:opacity-100 transition-opacity">
                      <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="bg-white/5 text-muted-foreground border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 flex items-center gap-2">
                            <PauseCircle className="h-3 w-3" /> Paused
                          </Badge>
                          <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">Ended: Day {m.current_day}</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-snug line-clamp-3 line-through decoration-white/20">{m.goal}</h3>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <Button variant="outline" className="w-full rounded-xl h-12 text-[10px] font-black uppercase tracking-widest border-white/10">
                          Resume Mission <PlayCircle className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Main>
      </div>
    )
  }

  // --- BRIEFING ROOM (CREATE) ---
  if (activeState === 'briefing') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14">
          <TopNav links={topNav} />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>

        <Main className="px-6 py-12 md:px-10 max-w-[1240px] mx-auto space-y-16 relative w-content-center">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] neural-grid" />

          <div className="max-w-4xl mx-auto space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="rounded-full px-5 py-1 text-[11px] font-black uppercase tracking-[0.4em] text-primary border-primary/30 bg-primary/10 shadow-lg cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setActiveState('dashboard')}>
                  ← Return to Command
                </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85] select-none">
                Mission <span className="text-primary not-italic">Brief</span>
              </h1>
              <p className="text-xl md:text-2xl font-light text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed italic">
                Specify objectives. Architect phases. Link internal engines.
              </p>
            </div>

            <Card className="bg-card/30 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 shadow-3xl overflow-hidden group/input relative text-left">
              <div className="space-y-12 relative z-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">1. Mission Objective & Scope</p>
                  <Textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What must we achieve? e.g., Capture 20% of the local AI tool market..."
                    className="min-h-[120px] text-2xl bg-white/[0.02] border border-white/5 rounded-3xl focus-visible:ring-primary/20 resize-none font-medium p-8 leading-relaxed italic placeholder:opacity-20 transition-all font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">2. Strategic Runway</p>
                      <span className="text-xl font-black italic">{duration[0]} Days</span>
                    </div>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={120}
                      min={30}
                      step={30}
                      className="py-2"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                      <span>Blitz (30D)</span>
                      <span>Standard (60D)</span>
                      <span>Campaign (90D+)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">3. Resource Allocation</p>
                    <div className="grid grid-cols-3 gap-3">
                      {(['bootstrap', 'growth', 'scale'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setBudgetTier(tier)}
                          className={cn(
                            "h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            budgetTier === tier ? "bg-primary/20 text-primary border-primary/50 shadow-inner" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">4. Engine Connectivity & Execution Mode</p>
                    <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-none uppercase tracking-widest">Integrates with Forge & Vision Lab</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setAutomationLevel('suggest')}
                      className={cn(
                        "p-6 rounded-[2rem] border cursor-pointer transition-all space-y-3",
                        automationLevel === 'suggest' ? "bg-primary/10 border-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Radio className={cn("h-5 w-5", automationLevel === 'suggest' ? "text-primary" : "text-muted-foreground")} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Advisor Mode</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">Chronos formulates the strategy and recommends daily actions. Human explicitly approves and executes via connected tools.</p>
                    </div>

                    <div
                      onClick={() => setAutomationLevel('automate')}
                      className={cn(
                        "p-6 rounded-[2rem] border cursor-pointer transition-all space-y-3",
                        automationLevel === 'automate' ? "bg-emerald-500/10 border-emerald-500" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Activity className={cn("h-5 w-5", automationLevel === 'automate' ? "text-emerald-500" : "text-muted-foreground")} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Sovereign Automate</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">End-to-End operations. Chronos automatically commands Campaign Architect and Vision Lab to execute and publish tasks daily.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAuthorize}
                  className="w-full h-20 rounded-[2.5rem] bg-foreground text-background text-xl font-black italic uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-primary-foreground hover:translate-y-[-4px] transition-all group mt-8"
                >
                  Authorize Mission Initialization <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </Card>
          </div>
        </Main>
      </div>
    )
  }

  // --- DEPLOYMENT SEQUENCE ---
  if (activeState === 'deploying') {
    return (
      <div className="flex flex-col min-h-screen bg-[#020202]">
        <div className="absolute inset-0 neural-grid opacity-20 pointer-events-none" />
        <Main className="flex flex-col items-center justify-center p-10 relative z-10 h-screen">
          <div className="w-full max-w-2xl space-y-16">
            <div className="flex flex-col items-center text-center space-y-8 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
                <div className="h-40 w-40 border-2 border-primary/20 rounded-full flex items-center justify-center bg-background relative z-10 shadow-2xl">
                  <Terminal className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Deploying <span className="text-primary not-italic">Sovereign</span> Swarm</h2>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.5em] opacity-40">Orchestrating Strategic Intelligence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {deploySteps.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-8 p-6 rounded-[2rem] border transition-all duration-700",
                    i < terminalIndex
                      ? "bg-emerald-500/[0.03] border-emerald-500/10 opacity-100"
                      : i === terminalIndex ? "bg-primary/5 border-primary/20 scale-[1.02] shadow-2xl" : "opacity-5 border-transparent"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700",
                    i < terminalIndex ? "text-emerald-500 bg-emerald-500/10" : i === terminalIndex ? "text-primary bg-primary/10 shadow-inner" : "text-muted-foreground"
                  )}>
                    {i < terminalIndex ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80">{step.label}</span>
                  {i === terminalIndex && <Loader2 className="ml-auto h-5 w-5 animate-spin text-primary" />}
                  {i < terminalIndex && <div className="ml-auto text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">Authorized</div>}
                </div>
              ))}
            </div>
          </div>
        </Main>
      </div>
    )
  }

  if (activeState === 'active' && !mission) {
    return <div className="flex items-center justify-center h-screen bg-background text-muted-foreground font-black uppercase tracking-widest italic animate-pulse shadow-inner">Establishing Mission Uplink...</div>
  }

  // --- MISSION HQ (ACTIVE STATE) ---
  const isAutomated = mission?.automation_level === 'automate'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14">
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-6 py-8 md:px-10 max-w-[1600px] mx-auto space-y-12 relative w-full pb-32">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] neural-grid" />

        <div className="mb-4">
          <Button variant="link" onClick={() => setActiveState('dashboard')} className="text-muted-foreground hover:text-foreground uppercase tracking-widest text-[10px] font-black p-0">
            ← Back to Command Center
          </Button>
        </div>

        {/* --- STRATEGIC TOP BAR --- */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10 w-full mb-12 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-inner">Mission: Active</Badge>
              <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", isAutomated ? "border-primary/50 text-primary bg-primary/5" : "border-white/10 text-muted-foreground")}>
                {isAutomated ? "Engine: Sovereign Auto" : "Engine: Advisor Mode"}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">Sync Cycle: Complete</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.8]">{mission.goal}</h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
            {[
              { label: 'Runtime', val: `Day ${mission.current_day}/${mission.duration_days}`, sub: 'Standard Cycle', icon: <Timer className="h-4 w-4" /> },
              { label: 'Budget', val: mission.budget_tier.toUpperCase(), sub: 'Allocated', icon: <Briefcase className="h-4 w-4" /> },
              { label: 'Rewrites', val: mission.rewrite_count || 0, sub: 'Auto-Pivots', icon: <Zap className="h-4 w-4" /> },
              { label: 'Intelligence', val: '98%', sub: 'Node Integrity', icon: <Globe className="h-4 w-4" /> }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center bg-card/40 border border-white/5 px-8 h-24 rounded-[2rem] shadow-xl backdrop-blur-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary opacity-30">{stat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{stat.label}</span>
                </div>
                <span className="text-xl font-black italic text-foreground leading-none">{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

          {/* --- LEFT COLUMN: CORE INTELLIGENCE & TIMELINE --- */}
          <div className="lg:col-span-8 space-y-10">

            {/* EXECUTIVE SUMMARY */}
            <Card className="bg-primary/[0.03] border border-primary/10 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer-subtle" />
              <Shield className="absolute -right-20 -top-20 h-80 w-80 text-primary opacity-[0.03] rotate-12 pointer-events-none" />
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner border border-primary/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Strategic Consensus Summary</h4>
                </div>
                <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-foreground/90 font-serif leading-snug">
                  "{mission.executive_summary}"
                </p>
              </div>
            </Card>

            {/* CONNECTED ENGINES STATUS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-primary">
                    <Hammer className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] italic">Forge</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase tracking-widest">Linked</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">Generating creative assets and ad-copy required for phases.</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-primary">
                    <Eye className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] italic">Vision Lab</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase tracking-widest">Linked</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">Synthesizing visual content and brand imagery autonomously.</p>
              </div>
            </div>

            {/* 90-DAY TACTICAL ARCHITECTURE */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-card/50 border border-white/5 rounded-xl flex items-center justify-center text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">Tactical <span className="text-primary not-italic">Timeline</span></h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-30">Living Blueprint Architecture</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                  <RefreshCcw className="h-3 w-3" /> Manual Override
                </Button>
              </div>

              <div className="space-y-16">
                {(mission.phases || []).map((phase: any, pIdx: number) => (
                  <div key={pIdx} className="space-y-8 relative">
                    {pIdx < mission.phases.length - 1 && <div className="absolute left-[30px] top-20 bottom-0 w-px bg-white/5 -z-10" />}
                    <div className="flex items-center gap-8">
                      <div className="h-[60px] w-[60px] rounded-2xl bg-background border border-primary/20 flex flex-col items-center justify-center shadow-lg shadow-primary/5">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/40 leading-none mb-1">Phase</span>
                        <span className="text-xl font-black italic text-primary leading-none">0{pIdx + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-3xl font-black uppercase tracking-tighter italic">{phase.name}</h5>
                        <p className="text-xs text-muted-foreground/60 font-medium">Days {phase.start_day} — {phase.end_day} | Objective: <span className="text-foreground/80 italic">{phase.objective}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-8 relative mt-16">
                      {/* Timeline Navigator (Left) */}
                      <div className="w-[140px] md:w-[180px] shrink-0 border-r border-white/5 pr-4 md:pr-6 space-y-3 relative pb-10">
                        <div className="absolute top-0 bottom-0 right-[-1px] w-px bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />

                        {(phase.days || phase.weeks || []).map((dayData: any, dIdx: number) => {
                          const dayNum = dayData.day || dayData.week;
                          const isSelected = selectedDay === dayNum;
                          const isPast = dayNum < (mission.current_day || 1);
                          const isCurrent = dayNum === (mission.current_day || 1);

                          return (
                            <button
                              key={dIdx}
                              onClick={() => setSelectedDay(dayNum)}
                              className={cn(
                                "w-full text-left relative px-3 py-3 md:px-4 md:py-4 rounded-xl border transition-all overflow-visible block",
                                isSelected ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,183,255,0.15)]' : 'border-transparent text-muted-foreground hover:bg-white/5'
                              )}
                            >
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Day {dayNum}</div>
                              {isCurrent && <div className="text-[9px] font-bold text-amber-500 mb-1 leading-none uppercase">Today's Mission</div>}
                              <div className={cn("text-xs font-bold leading-tight line-clamp-2", isSelected ? 'text-primary' : 'text-foreground/80')}>{dayData.theme}</div>

                              {/* Glowing Status Dot on the Line */}
                              <div className={cn(
                                "absolute -right-[23px] md:-right-[31px] top-[14px] w-3 h-3 rounded-full border-2 bg-background z-10 transition-colors",
                                isSelected ? "border-primary shadow-[0_0_10px_rgba(0,183,255,0.8)]" :
                                  isPast ? "border-emerald-500 bg-emerald-500" :
                                    isCurrent ? "border-amber-500 bg-amber-500 animate-pulse" : "border-white/20"
                              )} />

                            </button>
                          )
                        })}
                      </div>

                      {/* Selected Day Tasks (Right) */}
                      <div className="flex-1 space-y-6">
                        {(phase.days || phase.weeks || []).filter((d: any) => (d.day || d.week) === selectedDay).map((dayData: any, dIdx: number) => {
                          const dayNum = dayData.day || dayData.week;
                          const loc = getTaskLocation(dayData.theme, dayData.tasks || []);
                          return (
                            <div key={dIdx} className="relative flex items-stretch gap-8 group/day animate-in fade-in slide-in-from-right-4 duration-500">
                              <Card className="flex-1 bg-card/20 backdrop-blur-md border border-white/5 p-7 rounded-[2rem] shadow-xl hover:bg-white/[0.04] transition-all relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/0 group-hover/day:bg-primary/50 transition-colors" />
                                <div className="space-y-6 relative z-10 flex flex-col h-full">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Day {dayNum} Overview</div>
                                      <p className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest italic">{dayData.theme}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-4 flex-1">
                                    {(dayData.tasks || []).map((task: any, tIdx: number) => (
                                      <div key={tIdx} className="flex gap-4 items-start border-l-2 border-primary/20 pl-5 hover:border-primary transition-all py-2 bg-white/[0.01] rounded-r-lg pr-4">
                                        <div className="space-y-3 w-full">
                                          <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border-white/10 text-muted-foreground bg-white/5 rounded-md">{task.platform}</Badge>
                                              <span className="text-xs font-black uppercase tracking-widest text-foreground/90">{task.content_type}</span>
                                            </div>
                                            {task.expected_reach && task.expected_reach !== "N/A" && (
                                              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 border border-white/5 px-2 py-0.5 rounded bg-black/20">
                                                EST. REACH: {task.expected_reach}
                                              </div>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground/80 leading-relaxed font-bold">"{task.description}"</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-4 border-t border-white/5 flex justify-end">
                                    {isAutomated ? (
                                      <Button disabled className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase tracking-widest shadow-none opacity-80">
                                        <Activity className="h-3 w-3 mr-2 animate-pulse" /> Natively Queued in Engines
                                      </Button>
                                    ) : pushedTasks[`${pIdx}-${dIdx}`] ? (
                                      <Button disabled className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-none gap-2">
                                        <CheckCircle2 className="h-3 w-3" /> Queued in {loc.label.replace('Push to ', '')}
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => handlePushTask(dayData.theme, `${pIdx}-${dIdx}`, dayData.tasks || [])}
                                        className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/80 border border-transparent text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 group/btn"
                                      >
                                        {loc.label} {loc.icon}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: STRATEGIC CONTROLS --- */}
          <div className="lg:col-span-4 space-y-10">

            {/* AGENTIC FEED / MARKET SIGNALS */}
            <Card className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-black italic tracking-tighter uppercase">Living <span className="text-emerald-500 not-italic">Agentic</span> Feed</h4>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Synced</Badge>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 border border-white/5 rounded-[1.5rem] p-6 space-y-4 overflow-hidden relative">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> Market Signal Intercept</span>
                    <span>JUST NOW</span>
                  </div>
                  <p key={liveSignalIndex} className="text-xs text-foreground/80 leading-relaxed italic border-l-[3px] border-emerald-500/40 pl-4 uppercase tracking-tight font-bold animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {LOCAL_MARKET_SIGNALS[liveSignalIndex]}
                  </p>

                  {isPivoting ? (
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase p-2 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300">
                      <Activity className="h-3 w-3 animate-pulse" /> Autonomous Pivot Executing
                    </div>
                  ) : isAutomated ? (
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase p-2 bg-emerald-500/10 rounded-lg">
                      <Activity className="h-3 w-3 animate-pulse" /> Autonomous Pivot Executing
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-500/60 uppercase animate-in fade-in duration-300">
                      <div className="h-1 w-1 rounded-full bg-amber-500 animate-ping" /> Alert: Manual Pivot Recommended
                    </div>
                  )}
                </div>

                {(!isAutomated && !isPivoting) && (
                  <Button
                    onClick={handleGlobalPivot}
                    className="w-full h-14 rounded-2xl border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-none">
                    Authorize Global Pivot <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {isPivoting && (
                  <Button disabled className="w-full h-14 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 transition-all shadow-none gap-2">
                    <Activity className="h-4 w-4 animate-spin" /> Recalibrating Architecture...
                  </Button>
                )}
              </div>
            </Card>

            {/* AUDIENCE GENOME (PERSONAS) */}
            <Card className="bg-card/20 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-xl relative overflow-hidden">
              <Users className="absolute -right-6 -top-6 h-48 w-48 text-primary opacity-[0.03] rotate-[-20deg] pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h4 className="text-xl font-black italic tracking-tighter uppercase">Persona <span className="text-primary not-italic">Uplink</span></h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">Audience Genome DNA</p>
                </div>
              </div>
              <div className="space-y-6 relative z-10">
                {(mission.personas || []).map((p: any, i: number) => (
                  <div key={i} className="space-y-3 group/p">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{p.archetype}</span>
                      <span className="text-xl font-black italic text-primary">{p.resonance_score}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-primary transition-all duration-[2000ms] shadow-[0_0_10px_rgba(var(--primary),0.6)]" style={{ width: `${p.resonance_score}%` }} />
                    </div>
                    <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 group-hover/p:border-primary/20 transition-all">
                      <p className="text-[9px] text-muted-foreground/60 italic font-medium leading-relaxed">
                        "{p.psychological_trigger}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* RISK MITIGATION */}
            <Card className="bg-card/20 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-xl border-l-4 border-l-amber-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h4 className="text-base font-black italic tracking-tighter uppercase">Risk <span className="text-amber-500 not-italic">Entropy</span></h4>
              </div>
              <div className="space-y-6">
                {(mission.risks || []).map((risk: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-amber-500/60 font-black">PROBABILITY: {risk.probability_pct}%</span>
                      <span className="text-muted-foreground/40 italic">ETA: Day {risk.predicted_day}</span>
                    </div>
                    <p className="text-xs font-bold text-foreground italic leading-tight uppercase tracking-tight">{risk.title}</p>
                    <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 opacity-60 mb-2">Contingency Sequence</p>
                      <p className="text-[10px] text-muted-foreground italic leading-relaxed">"{risk.contingency}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div >
      </Main >
    </div >
  )
}

export const Route = createFileRoute('/_authenticated/chronos-brief/')({
  component: ChronosBriefPageContent,
})
