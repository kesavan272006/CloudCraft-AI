import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Rocket,
  Activity,
  TrendingUp,
  Send,
  Loader2,
  Search as SearchIcon,
  X,
  ChevronRight,
  Sparkles,
  Blocks,
  Network,
  Zap
} from 'lucide-react'
import { ActivityFeed } from './components/activity-feed'
import { CoverageChart } from './components/coverage-chart'
import { AnalyticsTab } from './components/analytics-tab'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import './dashboard-animations.css'
import { API_BASE_URL } from '@/lib/api-config'

// Animated Number Counter Component
function AnimatedNumber({ value, suffix = '' }: { value: number | string, suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: 2000, bounce: 0 })
  const displayValue = useTransform(springValue, (latest) => Math.round(latest))

  useEffect(() => {
    if (isInView) {
      const numericValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) || 0 : value
      motionValue.set(numericValue)
    }
  }, [isInView, value, motionValue])

  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const unsubscribe = displayValue.on('change', (latest) => {
      setAnimatedValue(latest)
    })
    return unsubscribe
  }, [displayValue])

  return <div ref={ref}>{animatedValue}{suffix}</div>
}

// Floating Orbs Background Component
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{ top: '60%', right: '5%' }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-r from-fuchsia-500/20 via-pink-500/20 to-rose-500/20 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        style={{ bottom: '20%', left: '50%' }}
      />
    </div>
  )
}

export function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/stats`)
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error("Dashboard sync failed", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const filteredActivity = useMemo(() => {
    if (!stats?.recent_activity) return []
    return stats.recent_activity.filter((a: any) =>
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.platform.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [stats, searchQuery])

  const handleGenerateReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Compiling ecosystem metrics...',
        success: 'Telemetry report generated.',
        error: 'Failed to generate report',
      }
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        <FloatingOrbs />
        <motion.div 
          className="relative z-10 flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
            <Loader2 className="h-12 w-12 text-primary relative z-10" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 text-center"
          >
            <p className="text-sm font-semibold text-foreground">Initializing Orchestration Center</p>
            <p className="text-xs text-muted-foreground">Loading real-time telemetry...</p>
          </motion.div>
        </motion.div>
      </div>
    )
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
              placeholder="Search autonomous tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-sm shadow-none"
            />
            {searchQuery && (
              <X
                className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 relative overflow-hidden">
        
        {/* ANIMATED FLOATING ORBS BACKGROUND */}
        <FloatingOrbs />

        {/* PREMIUM DOT-MATRIX BACKGROUND GRID */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>

        {/* PREMIUM GRADIENT MESH OVERLAY */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30"
          style={{ 
            background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          }}>
        </div>

        {/* HERO SECTION - SLEEK & MODERN WITH ANIMATION */}
        <motion.div 
          className='flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 text-primary text-xs font-bold mb-2 shadow-lg shadow-primary/20 uppercase tracking-widest gap-2 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-lg shadow-primary/50"></span>
              </span>
              System Online
            </motion.div>
            <motion.h1 
              className='text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center gap-2'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Orchestration Center
              <Zap className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
            </motion.h1>
            <motion.p 
              className="text-muted-foreground text-sm md:text-base font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Manage multi-agent workflows and view real-time cultural telemetry.
            </motion.p>
          </div>

          <motion.div 
            className='flex items-center space-x-3'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl hidden sm:flex"
            >
              View Documentation
            </Button>
            <Button
              className="h-10 px-5 font-bold shadow-xl shadow-primary/25 transition-all bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 flex items-center gap-2 relative overflow-hidden group border border-primary/20"
              onClick={handleGenerateReport}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">Export Global Report</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* QUICK JUMP CARDS (Linear/Stripe Style) WITH STAGGER ANIMATION */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.6
              }
            }
          }}
        >

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring", bounce: 0.3 } }
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/forge" className="block h-full">
              <Card className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-card via-card to-card/90 hover:border-indigo-500/60 transition-all duration-500 cursor-pointer shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/20 h-full rounded-2xl backdrop-blur-2xl before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-indigo-500/20 before:via-purple-500/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100"
                  initial={false}
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {/* Premium glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <CardContent className="p-6 flex items-start gap-4 relative z-10">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <Blocks className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </motion.div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight text-foreground group-hover:text-indigo-500 transition-colors duration-300 flex items-center gap-2">
                      The Forge Engine
                      <span className="inline-block">
                        <Sparkles className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </h3>
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/60 to-secondary/40 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors border border-border/30 group-hover:border-indigo-500/40 shadow-sm"
                      whileHover={{ x: 4, scale: 1.1 }}
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Launch a new parallel-agent pipeline. Formulate campaigns and trigger autonomous generation.
                  </p>
                </div>
              </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: "spring", bounce: 0.3 } }
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/brand_brain" className="block h-full">
              <Card className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-card via-card to-card/90 hover:border-fuchsia-500/60 transition-all duration-500 cursor-pointer shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-fuchsia-500/20 h-full rounded-2xl backdrop-blur-2xl before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-fuchsia-500/20 before:via-pink-500/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100"
                  initial={false}
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {/* Premium glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <CardContent className="p-6 flex items-start gap-4 relative z-10">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-500/10"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <Network className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400" />
                </motion.div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight text-foreground group-hover:text-fuchsia-500 transition-colors duration-300 flex items-center gap-2">
                      Brand Brain
                      <span className="inline-block">
                        <Sparkles className="w-4 h-4 text-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </h3>
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/60 to-secondary/40 flex items-center justify-center group-hover:bg-fuchsia-500/20 transition-colors border border-border/30 group-hover:border-fuchsia-500/40 shadow-sm"
                      whileHover={{ x: 4, scale: 1.1 }}
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-fuchsia-500 transition-colors" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Configure vector-embedded brand guidelines to enforce 100% compliance across all generated outputs.
                  </p>
                </div>
              </CardContent>
              </Card>
            </Link>
          </motion.div>

        </motion.div>

        {/* MAIN HUD TABS */}
        <Tabs defaultValue='overview' className='space-y-8'>
          <TabsList className="bg-secondary/50 border border-border/50 shadow-lg shadow-black/5 backdrop-blur-xl p-1.5">
            <TabsTrigger value='overview' className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 text-sm font-semibold transition-all data-[state=active]:border data-[state=active]:border-border/50">Real-time Telemetry</TabsTrigger>
            <TabsTrigger value='analytics' className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/5 text-sm font-semibold transition-all data-[state=active]:border data-[state=active]:border-border/50">Long-term Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-8'>

            {/* KPI GRID WITH STAGGER ANIMATION */}
            <div>
              <motion.h3 
                className="text-sm font-bold mb-5 text-foreground flex items-center gap-2.5 uppercase tracking-wide"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Activity className="w-4 h-4 text-primary drop-shadow-lg" />
                Network Status
              </motion.h3>
              <motion.div 
                className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.9
                    }
                  }
                }}
              >
                {[
                  { label: 'Active Pipelines', val: stats?.metrics?.active_missions || 0, sub: '+2 generating', icon: <Rocket className="h-4 w-4" />, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                  { label: 'Avg Oracle Score', val: Math.round(stats?.metrics?.avg_oracle_score || 0), suffix: '%', sub: 'Above nominal', icon: <Sparkles className="h-4 w-4" />, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
                  { label: 'Market Dispatches', val: stats?.metrics?.completed_missions || 0, sub: 'Assets pushed', icon: <Send className="h-4 w-4" />, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Network Efficiency', val: stats?.efficiency_gain || '0%', sub: 'Time saved', icon: <TrendingUp className="h-4 w-4" />, color: 'violet', gradient: 'from-violet-500 to-purple-500' }
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.8 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          duration: 0.5, 
                          type: "spring", 
                          bounce: 0.4 
                        } 
                      }
                    }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="group relative border border-border/40 shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 flex flex-col justify-between p-6 bg-gradient-to-br from-card via-card/95 to-card/90 rounded-2xl overflow-hidden hover:border-primary/50 backdrop-blur-2xl h-full before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                      {/* Premium outer glow */}
                      <div className={`absolute -inset-1 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500`} />
                      
                      {/* Animated gradient background */}
                      <motion.div 
                        className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-15 blur-3xl rounded-full`}
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 180, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      <div className='flex flex-row items-center justify-between pb-3 relative z-10'>
                        <p className='text-xs font-bold text-muted-foreground/70 uppercase tracking-widest'>
                          {kpi.label}
                        </p>
                        <motion.div 
                          className={`p-2.5 rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/40 text-secondary-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary transition-all shadow-lg border border-border/30 group-hover:border-primary/30 group-hover:shadow-${kpi.color}-500/20`}
                          whileHover={{ rotate: 360, scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                        >
                          {kpi.icon}
                        </motion.div>
                      </div>
                      <div className="relative z-10 mt-1 space-y-2">
                        <div className={`text-4xl font-bold tracking-tight bg-gradient-to-br ${kpi.gradient} bg-clip-text text-transparent`}>
                          {kpi.suffix ? (
                            <AnimatedNumber value={kpi.val} suffix={kpi.suffix} />
                          ) : (
                            kpi.val
                          )}
                        </div>
                        <p className='text-[10px] font-semibold text-muted-foreground/70 flex items-center gap-1.5 uppercase tracking-widest'>
                          {i === 1 || i === 3 ? (
                            <motion.div
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            </motion.div>
                          ) : null}
                          {kpi.sub} over 24h
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div 
              className='grid grid-cols-1 gap-6 lg:grid-cols-7'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              {/* CULTURAL COVERAGE CHART */}
              <motion.div
                className='col-span-1 lg:col-span-4'
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <Card className='relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10'>
                  {/* Premium glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-purple-500/10 to-transparent opacity-0 hover:opacity-100 blur-xl rounded-2xl transition-opacity duration-500 pointer-events-none" />
                  
                  <CardHeader className="border-b border-border/30 pb-4 px-6 pt-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                          Cultural Dialect Coverage
                          <Sparkles className="w-4 h-4 text-primary drop-shadow-lg" />
                        </CardTitle>
                        <CardDescription className="text-xs mt-1.5 font-semibold text-muted-foreground">Real-time breakdown of linguistic asset adaptation.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-6 relative z-10'>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <CoverageChart data={stats?.cultural_coverage} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* RECENT ACTIVITY FEED */}
              <motion.div
                className='col-span-1 lg:col-span-3'
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <Card className='relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10'>
                  {/* Premium glow */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent opacity-0 hover:opacity-100 blur-xl rounded-2xl transition-opacity duration-500 pointer-events-none" />
                  
                  <CardHeader className="border-b border-border/30 pb-4 px-6 pt-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                          Global Activity Log
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Activity className="w-4 h-4 text-primary drop-shadow-lg" />
                          </motion.div>
                        </CardTitle>
                        <CardDescription className="text-xs mt-1.5 font-semibold text-muted-foreground">
                          {searchQuery ? 'Searching logs...' : 'Latest actions by the autonomous suite.'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px] relative z-10">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6, duration: 0.5 }}
                    >
                      <ActivityFeed activities={filteredActivity} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value='analytics'>
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Brand Brain',
    href: '/brand_brain',
    isActive: false,
    disabled: false,
  },
  {
    title: 'The Forge',
    href: '/forge',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Missions',
    href: '/tasks',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  }
]
