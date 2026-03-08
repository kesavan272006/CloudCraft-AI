import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
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
  Briefcase, RefreshCcw, AlertCircle, Shield,
  Search, Radio, Plus, History,
  PlayCircle, PauseCircle, Activity, Hammer, Eye
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

// Animation variants
const EASE_CURVE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_CURVE } }
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

const cardReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_CURVE } }
}

function PageBackground() {
  return (
    <>
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-25"
        style={{
          background: 'radial-gradient(circle at 15% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(99,102,241,0.10) 0%, transparent 50%), radial-gradient(circle at 55% 50%, rgba(168,85,247,0.07) 0%, transparent 50%)'
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[560px] h-[560px] rounded-full bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 blur-3xl"
          animate={{ x: [0, 70, 0], y: [0, -50, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '2%', left: '-5%' }}
        />
        <motion.div
          className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-r from-violet-500/10 via-primary/10 to-cyan-500/10 blur-3xl"
          animate={{ x: [0, -45, 0], y: [0, 60, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{ bottom: '8%', right: '0%' }}
        />
      </div>
    </>
  )
}

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
  const [_loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [pushedTasks, setPushedTasks] = useState<Record<string, boolean>>({})

  // Deploy Terminal Index
  const [terminalIndex, setTerminalIndex] = useState(0)

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

  // ─── DASHBOARD – Mission Control ───
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

        <Main className="px-6 py-12 md:px-10 max-w-[1600px] mx-auto space-y-10 relative w-full pb-32">
          <PageBackground />

          {/* Page Header */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 w-full mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
                Sovereign Intelligence · Online
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                  Chronos
                </span>
                <span className="italic bg-gradient-to-r from-primary via-primary/90 to-indigo-400 bg-clip-text text-transparent">
                  Command
                </span>
                <Timer className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
              </motion.h1>

              <motion.p
                className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Orchestrate sovereign growth missions with multi-agent intelligence — plan, deploy, and track campaigns across every phase.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="shrink-0"
            >
              <Button
                onClick={() => setActiveState('briefing')}
                size="lg"
                className="rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all gap-2"
              >
                <Plus className="h-4 w-4" /> New Mission
              </Button>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="relative z-10 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }}
          >
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-white/[0.04] border border-white/10 rounded-2xl p-1 h-14 w-full max-w-sm mb-10 backdrop-blur-xl">
                <TabsTrigger
                  value="active"
                  className="rounded-xl font-black uppercase tracking-widest text-xs h-full flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-indigo-500/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all"
                >
                  Active Operations
                </TabsTrigger>
                <TabsTrigger
                  value="paused"
                  className="rounded-xl font-black uppercase tracking-widest text-xs h-full flex-1 data-[state=active]:bg-white/10 data-[state=active]:text-foreground transition-all"
                >
                  Archived / Paused
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-8 mt-0 focus-visible:ring-0">
                {loadingMissions ? (
                  <motion.div
                    className="h-72 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] shadow-inner gap-4"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">Scanning Uplinks...</span>
                  </motion.div>
                ) : activeMissions.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-72 border border-white/5 border-dashed bg-white/[0.01] rounded-[3rem] space-y-4"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <Target className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/40">No active missions deployed.</p>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveState('briefing')}
                      className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                    >
                      Initialize First Mission <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {activeMissions.map((m, i) => (
                      <motion.div key={i} variants={cardReveal}>
                        <Card className="relative bg-card/20 backdrop-blur-xl border border-white/[0.06] p-8 rounded-[2.5rem] shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-500 group flex flex-col justify-between min-h-[320px] overflow-hidden">
                          <div className="absolute inset-0 z-0 rounded-[2.5rem] bg-gradient-to-br from-primary/0 via-indigo-500/0 to-primary/0 group-hover:from-primary/[0.04] group-hover:via-indigo-500/[0.03] group-hover:to-primary/[0.04] transition-all duration-700 pointer-events-none" />
                          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="space-y-6 flex-1 relative z-10">
                            <div className="flex justify-between items-start">
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] uppercase tracking-widest px-3 py-1 flex items-center gap-2 shadow-inner shadow-emerald-500/5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                Active
                              </Badge>
                              <span className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">Day {m.current_day}/{m.duration_days}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-snug line-clamp-3 text-foreground/90">{m.goal}</h3>
                            <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                              "{m.executive_summary}"
                            </p>
                          </div>
                          <div className="mt-8 pt-6 border-t border-white/5 flex gap-3 relative z-10">
                            <Button
                              onClick={() => loadMission(m.mission_id)}
                              className="flex-1 bg-white/[0.04] text-foreground hover:bg-gradient-to-r hover:from-primary hover:to-indigo-500 hover:text-primary-foreground border border-white/5 hover:border-transparent rounded-xl h-12 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-none group/btn"
                            >
                              Command Center <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="paused" className="space-y-8 mt-0 focus-visible:ring-0">
                {pausedMissions.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-72 border border-white/5 border-dashed bg-white/[0.01] rounded-[3rem] space-y-4"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <History className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/40">No archived records found.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {pausedMissions.map((m, i) => (
                      <motion.div key={i} variants={cardReveal}>
                        <Card className="bg-card/10 border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[320px] opacity-50 hover:opacity-90 transition-all duration-300 group">
                          <div className="space-y-6 flex-1">
                            <div className="flex justify-between items-start">
                              <Badge className="bg-white/5 text-muted-foreground border border-white/10 font-black text-[9px] uppercase tracking-widest px-3 py-1 flex items-center gap-2">
                                <PauseCircle className="h-3 w-3" /> Paused
                              </Badge>
                              <span className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">Ended: Day {m.current_day}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-snug line-clamp-3 line-through decoration-white/20">{m.goal}</h3>
                          </div>
                          <div className="mt-8 pt-6 border-t border-white/5">
                            <Button variant="outline" className="w-full rounded-xl h-12 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-primary/30 hover:text-primary transition-all">
                              Resume Mission <PlayCircle className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </Main>
      </div>
    )
  }

  // ─── BRIEFING ROOM – Create ───
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

        <Main className="px-6 py-12 md:px-10 max-w-[1240px] mx-auto relative w-full overflow-hidden">
          <PageBackground />

          <motion.div
            className="max-w-4xl mx-auto space-y-14 text-center relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <motion.div
              className="space-y-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setActiveState('dashboard')}
                  className="inline-flex items-center px-5 py-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.35em] gap-2 hover:bg-primary/15 hover:border-primary/50 transition-all shadow-lg shadow-primary/10 backdrop-blur-xl"
                >
                  ← Return to Command
                </button>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] select-none">
                <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">Mission</span>{' '}
                <span className="bg-gradient-to-r from-primary via-primary/90 to-indigo-400 bg-clip-text text-transparent not-italic">Brief</span>
              </h1>
              <p className="text-lg md:text-xl font-light text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed italic">
                Specify objectives. Architect phases. Link internal engines.
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="relative bg-card/20 backdrop-blur-3xl border border-white/[0.06] rounded-[3.5rem] p-12 shadow-2xl overflow-hidden text-left">
                <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

                <div className="space-y-12 relative z-10">
                  {/* 1. Mission Objective */}
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-3">
                      <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-[9px] font-black">1</span>
                      Mission Objective & Scope
                    </p>
                    <Textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="What must we achieve? e.g., Capture 20% of the local AI tool market..."
                      className="min-h-[120px] text-xl bg-white/[0.02] border border-white/[0.06] rounded-3xl focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 resize-none font-medium p-8 leading-relaxed italic placeholder:opacity-20 transition-all font-serif"
                    />
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* 2. Strategic Runway */}
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.42 }}
                    >
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-3">
                          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-[9px] font-black">2</span>
                          Strategic Runway
                        </p>
                        <span className="text-xl font-black italic bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">{duration[0]} Days</span>
                      </div>
                      <Slider value={duration} onValueChange={setDuration} max={120} min={30} step={30} className="py-2" />
                      <div className="flex justify-between text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                        <span>Blitz (30D)</span>
                        <span>Standard (60D)</span>
                        <span>Campaign (90D+)</span>
                      </div>
                    </motion.div>

                    {/* 3. Resource Allocation */}
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.48 }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-3">
                        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-[9px] font-black">3</span>
                        Resource Allocation
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {(['bootstrap', 'growth', 'scale'] as const).map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setBudgetTier(tier)}
                            className={cn(
                              "h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                              budgetTier === tier
                                ? "bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary border-primary/40 shadow-inner shadow-primary/10"
                                : "bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:bg-white/[0.06] hover:border-white/10"
                            )}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <Separator className="bg-white/[0.05]" />

                  {/* 4. Engine Connectivity */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-3">
                        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-[9px] font-black">4</span>
                        Engine Connectivity & Execution Mode
                      </p>
                      <Badge className="text-[8px] bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest shadow-inner">Integrates with Forge & Vision Lab</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        onClick={() => setAutomationLevel('suggest')}
                        className={cn(
                          "p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 space-y-3 relative overflow-hidden",
                          automationLevel === 'suggest'
                            ? "bg-gradient-to-br from-primary/10 to-indigo-500/10 border-primary/40 shadow-xl shadow-primary/5"
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        {automationLevel === 'suggest' && (
                          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
                        )}
                        <div className="flex items-center gap-3">
                          <Radio className={cn("h-5 w-5 transition-colors", automationLevel === 'suggest' ? "text-primary" : "text-muted-foreground/50")} />
                          <h4 className="text-sm font-black uppercase tracking-widest">Advisor Mode</h4>
                        </div>
                        <p className="text-xs text-muted-foreground/70 leading-relaxed italic">Chronos formulates the strategy and recommends daily actions. Human explicitly approves and executes via connected tools.</p>
                      </div>

                      <div
                        onClick={() => setAutomationLevel('automate')}
                        className={cn(
                          "p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 space-y-3 relative overflow-hidden",
                          automationLevel === 'automate'
                            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/40 shadow-xl shadow-emerald-500/5"
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04]"
                        )}
                      >
                        {automationLevel === 'automate' && (
                          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-full" />
                        )}
                        <div className="flex items-center gap-3">
                          <Activity className={cn("h-5 w-5 transition-colors", automationLevel === 'automate' ? "text-emerald-400" : "text-muted-foreground/50")} />
                          <h4 className="text-sm font-black uppercase tracking-widest">Sovereign Automate</h4>
                        </div>
                        <p className="text-xs text-muted-foreground/70 leading-relaxed italic">End-to-End operations. Chronos automatically commands Campaign Architect and Vision Lab to execute and publish tasks daily.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <Button
                      onClick={handleAuthorize}
                      className="w-full h-20 rounded-[2.5rem] bg-gradient-to-r from-foreground via-foreground to-foreground/90 text-background text-xl font-black italic uppercase tracking-[0.2em] shadow-2xl hover:from-primary hover:via-primary hover:to-indigo-500 hover:text-primary-foreground hover:translate-y-[-4px] hover:shadow-primary/30 transition-all duration-300 group border-0"
                    >
                      Authorize Mission Initialization
                      <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </Main>
      </div>
    )
  }

  // ─── DEPLOYMENT SEQUENCE ───
  if (activeState === 'deploying') {
    return (
      <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
        <PageBackground />

        {/* Extra deep orb for deploying atmosphere */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            className="w-[700px] h-[700px] rounded-full bg-gradient-to-br from-primary/8 via-indigo-500/5 to-purple-500/5 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <Main className="flex flex-col items-center justify-center p-10 relative z-10 h-screen">
          <motion.div
            className="w-full max-w-2xl space-y-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero icon */}
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/25 blur-[80px] rounded-full" />
                {/* Orbiting ring */}
                <motion.div
                  className="absolute inset-[-12px] rounded-full border border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.9)]" />
                </motion.div>
                <motion.div
                  className="absolute inset-[-28px] rounded-full border border-indigo-500/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute bottom-[4px] right-[8px] h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                </motion.div>
                <div className="h-40 w-40 border border-primary/15 rounded-full flex items-center justify-center bg-gradient-to-br from-card via-background to-primary/5 relative z-10 shadow-2xl backdrop-blur-sm">
                  <Terminal className="h-16 w-16 text-primary" />
                </div>
              </div>
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                  <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Deploying</span>{' '}
                  <span className="bg-gradient-to-r from-primary via-primary/90 to-indigo-400 bg-clip-text text-transparent not-italic">Sovereign</span>{' '}
                  <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Swarm</span>
                </h2>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.5em] opacity-40">Orchestrating Strategic Intelligence</p>
              </motion.div>
            </div>

            {/* Steps */}
            <motion.div
              className="grid grid-cols-1 gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {deploySteps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={cn(
                    "flex items-center gap-8 p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden",
                    i < terminalIndex
                      ? "bg-emerald-500/[0.04] border-emerald-500/15"
                      : i === terminalIndex
                      ? "bg-primary/5 border-primary/25 scale-[1.02] shadow-2xl shadow-primary/5"
                      : "opacity-10 border-transparent"
                  )}
                >
                  {i === terminalIndex && (
                    <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full" />
                  )}
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 border",
                    i < terminalIndex
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : i === terminalIndex
                      ? "text-primary bg-gradient-to-br from-primary/15 to-indigo-500/15 border-primary/30 shadow-inner"
                      : "text-muted-foreground/30 bg-white/[0.02] border-white/[0.04]"
                  )}>
                    {i < terminalIndex ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-foreground/80 flex-1">{step.label}</span>
                  {i === terminalIndex && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  {i < terminalIndex && (
                    <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest border border-emerald-500/20 px-2 py-1 rounded-full">Authorized</span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Main>
      </div>
    )
  }

  if (activeState === 'active' && !mission) {
    return (
      <div className="flex items-center justify-center h-screen bg-background relative overflow-hidden">
        <PageBackground />
        <motion.div
          className="flex flex-col items-center gap-6 relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full" />
            <motion.div
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center relative z-10"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Terminal className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] italic">Establishing Mission Uplink...</p>
        </motion.div>
      </div>
    )
  }

  // ─── ACTIVE MISSION HQ ───
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

      <Main className="px-6 py-8 md:px-10 max-w-[1600px] mx-auto space-y-12 relative w-full pb-32 overflow-hidden">
        <PageBackground />

        <motion.div
          className="mb-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => setActiveState('dashboard')}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="opacity-50 group-hover:opacity-100 transition-opacity">←</span> Back to Command Center
          </button>
        </motion.div>

        {/* ─── Strategic Top Bar ─── */}
        <motion.div
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10 w-full mb-12 border-b border-white/[0.05] pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Mission: Active</span>
              </div>
              <div className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                isAutomated ? "border-primary/30 text-primary bg-primary/10" : "border-white/10 text-muted-foreground bg-white/[0.02]"
              )}>
                {isAutomated ? "Engine: Sovereign Auto" : "Engine: Advisor Mode"}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.8]">
              <span className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                {mission.goal}
              </span>
            </h1>
          </div>

          {/* Stat cards */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {[
              { label: 'Runtime', val: `Day ${mission.current_day}/${mission.duration_days}`, icon: <Timer className="h-4 w-4" /> },
              { label: 'Budget', val: mission.budget_tier.toUpperCase(), icon: <Briefcase className="h-4 w-4" /> },
              { label: 'Pivots', val: mission.rewrite_count || 0, icon: <Zap className="h-4 w-4" /> },
              { label: 'Integrity', val: '98%', icon: <Globe className="h-4 w-4" /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={cardReveal}
                className="relative flex flex-col items-center justify-center bg-card/20 backdrop-blur-xl border border-white/[0.06] px-6 h-24 rounded-[2rem] shadow-xl overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-indigo-500/5 transition-all duration-500" />
                <div className="absolute top-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <span className="text-primary opacity-40">{stat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                </div>
                <span className="text-xl font-black italic text-foreground leading-none relative z-10">{stat.val}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">

          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="bg-gradient-to-br from-primary/[0.06] via-card/20 to-indigo-500/[0.04] backdrop-blur-xl border border-primary/[0.12] rounded-[4rem] p-14 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-16 right-16 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
                <Shield className="absolute -right-16 -top-16 h-72 w-72 text-primary opacity-[0.03] rotate-12 pointer-events-none" />
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Strategic Consensus Summary</h4>
                  </div>
                  <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-foreground/90 font-serif">
                    "{mission.executive_summary}"
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Connected Engines */}
            <motion.div
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
            >
              {[
                { icon: <Hammer className="h-5 w-5" />, name: 'Forge', desc: 'Generating creative assets and ad-copy for each phase.' },
                { icon: <Eye className="h-5 w-5" />, name: 'Vision Lab', desc: 'Synthesizing visual content and brand imagery autonomously.' }
              ].map((engine, i) => (
                <Card key={i} className="p-8 rounded-[2.5rem] bg-card/20 backdrop-blur-xl border border-white/[0.06] space-y-4 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="h-9 w-9 bg-gradient-to-br from-primary/15 to-indigo-500/15 rounded-xl flex items-center justify-center border border-primary/20">
                        {engine.icon}
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] italic">{engine.name}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Linked
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase tracking-wider relative z-10">{engine.desc}</p>
                </Card>
              ))}
            </motion.div>

            {/* Tactical Timeline */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary/15 to-indigo-500/15 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase">
                      Tactical <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent not-italic">Timeline</span>
                    </h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Living Blueprint Architecture</p>
                  </div>
                </div>
                <Button variant="ghost" className="rounded-full gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">
                  <RefreshCcw className="h-3 w-3" /> Manual Override
                </Button>
              </div>

              <div className="space-y-16">
                {(mission.phases || []).map((phase: any, pIdx: number) => (
                  <div key={pIdx} className="space-y-8 relative">
                    {pIdx < mission.phases.length - 1 && <div className="absolute left-[30px] top-20 bottom-0 w-px bg-gradient-to-b from-primary/20 via-white/5 to-transparent -z-10" />}
                    <div className="flex items-center gap-8">
                      <div className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 flex flex-col items-center justify-center shadow-lg shadow-primary/5">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/40 leading-none mb-1">Phase</span>
                        <span className="text-xl font-black italic bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent leading-none">0{pIdx + 1}</span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-3xl font-black uppercase tracking-tighter italic">{phase.name}</h5>
                        <p className="text-xs text-muted-foreground/60 font-medium">Days {phase.start_day} — {phase.end_day} | Objective: <span className="text-foreground/80 italic">{phase.objective}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-8 mt-16">
                      {/* Timeline Navigator */}
                      <div className="w-[140px] md:w-[180px] shrink-0 border-r border-white/[0.05] pr-4 md:pr-6 space-y-3 relative pb-10">
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
                                isSelected
                                  ? 'bg-gradient-to-br from-primary/10 to-indigo-500/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                                  : 'border-transparent text-muted-foreground hover:bg-white/[0.04]'
                              )}
                            >
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Day {dayNum}</div>
                              {isCurrent && <div className="text-[9px] font-bold text-amber-500 mb-1 leading-none uppercase">Today</div>}
                              <div className={cn("text-xs font-bold leading-tight line-clamp-2", isSelected ? 'text-primary' : 'text-foreground/80')}>{dayData.theme}</div>
                              <div className={cn(
                                "absolute -right-[23px] md:-right-[31px] top-[14px] w-3 h-3 rounded-full border-2 bg-background z-10 transition-colors",
                                isSelected ? "border-primary shadow-[0_0_12px_rgba(var(--primary),0.9)]" :
                                  isPast ? "border-emerald-500 bg-emerald-500" :
                                    isCurrent ? "border-amber-500 bg-amber-500 animate-pulse" : "border-white/20"
                              )} />
                            </button>
                          )
                        })}
                      </div>

                      {/* Selected Day Tasks */}
                      <div className="flex-1 space-y-6">
                        <AnimatePresence mode="wait">
                          {(phase.days || phase.weeks || []).filter((d: any) => (d.day || d.week) === selectedDay).map((dayData: any, dIdx: number) => {
                            const dayNum = dayData.day || dayData.week;
                            const loc = getTaskLocation(dayData.theme, dayData.tasks || []);
                            return (
                              <motion.div
                                key={dayNum}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex items-stretch gap-8 group/day"
                              >
                                <Card className="flex-1 bg-card/20 backdrop-blur-xl border border-white/[0.06] p-7 rounded-[2rem] shadow-xl hover:border-primary/15 transition-all relative overflow-hidden group">
                                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                  <div className="space-y-6 relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Day {dayNum} Overview</div>
                                        <p className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest italic">{dayData.theme}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                      {(dayData.tasks || []).map((task: any, tIdx: number) => (
                                        <div key={tIdx} className="flex gap-4 items-start border-l-2 border-primary/20 pl-5 hover:border-primary/50 transition-all py-2 bg-white/[0.01] rounded-r-lg pr-4">
                                          <div className="space-y-3 w-full">
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 border-white/10 text-muted-foreground bg-white/[0.04] rounded-md">{task.platform}</Badge>
                                                <span className="text-xs font-black uppercase tracking-widest text-foreground/90">{task.content_type}</span>
                                              </div>
                                              {task.expected_reach && task.expected_reach !== "N/A" && (
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 border border-white/[0.06] px-2 py-0.5 rounded bg-black/20">
                                                  EST. REACH: {task.expected_reach}
                                                </div>
                                              )}
                                            </div>
                                            <p className="text-sm text-muted-foreground/80 leading-relaxed font-bold">"{task.description}"</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="pt-4 border-t border-white/[0.05] flex justify-end">
                                      {isAutomated ? (
                                        <Button disabled className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-none opacity-80">
                                          <Activity className="h-3 w-3 mr-2 animate-pulse" /> Natively Queued
                                        </Button>
                                      ) : pushedTasks[`${pIdx}-${dIdx}`] ? (
                                        <Button disabled className="h-10 px-6 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-none gap-2">
                                          <CheckCircle2 className="h-3 w-3" /> Queued in {loc.label.replace('Push to ', '')}
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => handlePushTask(dayData.theme, `${pIdx}-${dIdx}`, dayData.tasks || [])}
                                          className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 text-primary-foreground text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:translate-y-[-2px] group/btn"
                                        >
                                          {loc.label} {loc.icon}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="lg:col-span-4 space-y-10">

            {/* Agentic Feed */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <Card className="bg-card/20 backdrop-blur-3xl border border-white/[0.06] rounded-[3rem] p-10 space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full" />
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h4 className="text-base font-black italic tracking-tighter uppercase">
                      Living <span className="text-emerald-400 not-italic">Agentic</span> Feed
                    </h4>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Synced
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="bg-black/30 border border-white/[0.04] rounded-[1.5rem] p-6 space-y-4 overflow-hidden relative">
                    <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent rounded-full" />
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                      <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> Market Signal Intercept</span>
                      <span>JUST NOW</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={liveSignalIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                        className="text-xs text-foreground/80 leading-relaxed italic border-l-[3px] border-emerald-500/40 pl-4 uppercase tracking-tight font-bold"
                      >
                        {LOCAL_MARKET_SIGNALS[liveSignalIndex]}
                      </motion.p>
                    </AnimatePresence>

                    {isPivoting ? (
                      <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
                        <Activity className="h-3 w-3 animate-pulse" /> Autonomous Pivot Executing
                      </div>
                    ) : isAutomated ? (
                      <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
                        <Activity className="h-3 w-3 animate-pulse" /> Auto-Monitoring Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[9px] font-black text-amber-500/70 uppercase">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                        </span>
                        Alert: Manual Pivot Recommended
                      </div>
                    )}
                  </div>

                  {(!isAutomated && !isPivoting) && (
                    <Button
                      onClick={handleGlobalPivot}
                      className="w-full h-14 rounded-2xl border border-white/[0.07] bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.35em] hover:bg-primary/5 hover:text-primary hover:border-primary/25 transition-all shadow-none">
                      Authorize Global Pivot <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  {isPivoting && (
                    <Button disabled className="w-full h-14 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400 shadow-none gap-2">
                      <Activity className="h-4 w-4 animate-spin" /> Recalibrating Architecture...
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Persona Uplink */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <Card className="bg-card/20 backdrop-blur-xl border border-white/[0.06] rounded-[3rem] p-10 space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
                <Users className="absolute -right-6 -top-6 h-48 w-48 text-primary opacity-[0.03] rotate-[-20deg] pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black italic tracking-tighter uppercase">
                      Persona <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent not-italic">Uplink</span>
                    </h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Audience Genome DNA</p>
                  </div>
                </div>
                <div className="space-y-6 relative z-10">
                  {(mission.personas || []).map((p: any, i: number) => (
                    <div key={i} className="space-y-3 group/p">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{p.archetype}</span>
                        <span className="text-xl font-black italic bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">{p.resonance_score}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04] shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${p.resonance_score}%` }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] group-hover/p:border-primary/20 transition-all">
                        <p className="text-[9px] text-muted-foreground/60 italic font-medium leading-relaxed">
                          "{p.psychological_trigger}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Risk Entropy */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <Card className="bg-card/20 backdrop-blur-xl border border-amber-500/[0.12] rounded-[3rem] p-10 space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-full" />
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-black italic tracking-tighter uppercase">
                    Risk <span className="text-amber-400 not-italic">Entropy</span>
                  </h4>
                </div>
                <div className="space-y-6 relative z-10">
                  {(mission.risks || []).map((risk: any, i: number) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-amber-500/70 font-black">PROBABILITY: {risk.probability_pct}%</span>
                        <span className="text-muted-foreground/40 italic">ETA: Day {risk.predicted_day}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground italic leading-tight uppercase tracking-tight">{risk.title}</p>
                      <div className="p-4 bg-amber-500/[0.04] border border-amber-500/[0.12] rounded-xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-400/60 mb-2">Contingency Sequence</p>
                        <p className="text-[10px] text-muted-foreground/70 italic leading-relaxed">"{risk.contingency}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Main>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/chronos-brief/')({
  component: ChronosBriefPageContent,
})
