import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  TrendingUp,
  Target,
  History,
  Activity,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Rocket,
  Cpu,
  Globe,
  Layers,
  CheckCircle2,
  Terminal,
  BrainCircuit,
  RotateCcw,
  Share2,
  ScanFace,
  Eye,
  ChevronRight,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { API_BASE_URL } from '@/lib/api-config'

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  {
    title: 'Brand Brain',
    href: '/brand_brain',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Performance Oracle',
    href: '/performance-oracle',
    isActive: true,
    disabled: false,
  },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

type OracleState = 'idle' | 'scanning' | 'results'

export default function PerformanceOraclePage() {
  const [activeState, setActiveState] = useState<OracleState>('idle')
  const [content, setContent] = useState('')
  const [visualUrl, setVisualUrl] = useState('')
  const [_loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [terminalIndex, setTerminalIndex] = useState(0)

  const scanSteps = [
    { label: 'Uplink Established', icon: <Globe className='h-3 w-3' /> },
    { label: 'Sentiment Ingest', icon: <Layers className='h-3 w-3' /> },
    { label: 'Visual DNA Audit', icon: <ImageIcon className='h-3 w-3' /> },
    { label: 'Viral Trigger Synthesis', icon: <Zap className='h-3 w-3' /> },
    { label: 'Strategy Formulation', icon: <Cpu className='h-3 w-3' /> },
  ]

  useEffect(() => {
    if (activeState === 'scanning') {
      setTerminalIndex(0)
      const interval = setInterval(() => {
        setTerminalIndex((prev) => (prev < scanSteps.length ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [activeState])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/oracle/history`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error('Failed to fetch history', e)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!content.trim()) return
    setActiveState('scanning')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/oracle/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          visual_url: visualUrl || null
        }),
      })
      if (!response.ok) throw new Error("Oracle connection failed")
      const data = await response.json()

      const enrichedData = {
        ...data,
        sentiment: data.sentiment || [
          { name: 'Excitement', value: 45 },
          { name: 'Trust', value: 25 },
        ],
      }

      setTimeout(() => {
        setResult(enrichedData)
        setActiveState('results')
        toast.success('Neural alignment complete')
      }, 600)
    } catch (err: any) {
      toast.error('Scan failed')
      setActiveState('idle')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setActiveState('idle')
    setContent('')
    setVisualUrl('')
    setResult(null)
  }

  return (
    <>
      <Header className='sticky top-0 z-50 h-14 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md sm:px-6'>
        <div className='flex items-center gap-4'>
          <TopNav links={topNav} />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='relative mx-auto min-h-screen w-full max-w-[1600px] overflow-hidden bg-background px-4 py-10 md:px-12'>
        {/* Futuristic Grid Background */}
        <div
          className='pointer-events-none absolute inset-0 z-0 opacity-[0.05]'
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <AnimatePresence mode='wait'>
          {/* ── IDLE STATE ── */}
          {activeState === 'idle' && (
            <motion.div
              key='idle'
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className='relative z-10 flex min-h-[75vh] flex-col items-center justify-center space-y-16 py-12'
            >
              {/* Header Section */}
              <div className='max-w-3xl space-y-6 text-center'>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[11px] font-bold tracking-[0.25em] text-primary uppercase shadow-lg shadow-primary/20 backdrop-blur-sm'
                >
                  <span className='relative flex h-2 w-2'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
                    <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
                  </span>
                  System Ready
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='text-6xl leading-[1.1] font-black tracking-tighter md:text-7xl lg:text-8xl'
                >
                  <span className='bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent'>
                    Performance
                  </span>
                  <br />
                  <span className='bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent'>
                    Oracle
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='mx-auto max-w-xl text-base font-medium leading-relaxed text-muted-foreground'
                >
                  Predict engagement metrics with AI-powered analysis. Enter your content and get instant performance insights.
                </motion.p>
              </div>

              {/* Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className='w-full max-w-4xl space-y-6'
              >
                {/* Main Content Input */}
                <div className='group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10'>
                  <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                  <div className='relative p-6'>
                    <div className='mb-3 flex items-center justify-between'>
                      <label className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                        <Terminal className='h-4 w-4 text-primary' />
                        Content Input
                      </label>
                      <span className='text-xs font-medium text-muted-foreground'>
                        {content.length} / 5000 characters
                      </span>
                    </div>

                    <Textarea
                      placeholder='Enter your marketing content, social media post, or campaign copy here for AI-powered performance analysis...'
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={5000}
                      className='min-h-[200px] w-full resize-none border-none bg-transparent px-4 py-3 text-base leading-relaxed placeholder:text-muted-foreground/40 focus-visible:ring-0'
                    />
                  </div>
                </div>

                {/* Visual URL Input */}
                <div className='relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300 hover:border-primary/20'>
                  <div className='p-5'>
                    <label className='mb-3 flex items-center gap-2 text-sm font-semibold text-foreground'>
                      <ImageIcon className='h-4 w-4 text-violet-500' />
                      Visual Asset URL
                      <span className='ml-auto text-xs font-normal text-muted-foreground'>Optional</span>
                    </label>

                    <div className='flex items-center gap-3'>
                      <Input
                        placeholder='https://example.com/image.jpg'
                        value={visualUrl}
                        onChange={(e) => setVisualUrl(e.target.value)}
                        className='h-11 flex-1 border-border/50 bg-background/50 text-sm placeholder:text-muted-foreground/40'
                      />
                      {visualUrl && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setVisualUrl('')}
                          className='h-11 px-3'
                        >
                          <RotateCcw className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex items-center justify-center gap-4 pt-4'>
                  <Button
                    onClick={handlePredict}
                    disabled={!content.trim()}
                    size='lg'
                    className='group relative h-14 overflow-hidden rounded-full bg-gradient-to-r from-primary to-violet-600 px-10 text-base font-bold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:hover:scale-100'
                  >
                    <span className='relative z-10 flex items-center gap-2'>
                      <Sparkles className='h-5 w-5' />
                      Analyze Performance
                      <ChevronRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                    </span>
                    <div className='absolute inset-0 bg-gradient-to-r from-violet-600 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                  </Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant='outline'
                        size='lg'
                        onClick={fetchHistory}
                        className='h-14 rounded-full border-border/50 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-primary/5'
                      >
                        <History className='mr-2 h-5 w-5' />
                        History
                      </Button>
                    </SheetTrigger>
                    <SheetContent className='w-full sm:max-w-xl'>
                      <SheetHeader>
                        <SheetTitle className='flex items-center gap-2 text-xl font-bold'>
                          <History className='h-5 w-5 text-primary' />
                          Analysis History
                        </SheetTitle>
                      </SheetHeader>
                      <div className='mt-6 space-y-4'>
                        {historyLoading ? (
                          <div className='flex items-center justify-center py-12'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                          </div>
                        ) : history.length === 0 ? (
                          <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <Activity className='mb-4 h-12 w-12 text-muted-foreground/30' />
                            <p className='text-sm text-muted-foreground'>
                              No analysis history yet
                            </p>
                          </div>
                        ) : (
                          history.map((item, i) => (
                            <div
                              key={i}
                              className='rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/30 hover:bg-card'
                            >
                              <div className='mb-2 flex items-center justify-between'>
                                <span className='text-xs font-medium text-muted-foreground'>
                                  {new Date(item.timestamp).toLocaleString()}
                                </span>
                                <Badge variant='outline' className='text-xs'>
                                  Score: {item.viral_score}
                                </Badge>
                              </div>
                              <p className='line-clamp-2 text-sm'>
                                {item.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </motion.div>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className='flex flex-wrap items-center justify-center gap-3'
              >
                {[
                  { icon: <Target className='h-3.5 w-3.5' />, label: 'Viral Score Prediction' },
                  { icon: <BarChart3 className='h-3.5 w-3.5' />, label: 'Engagement Metrics' },
                  { icon: <Eye className='h-3.5 w-3.5' />, label: 'Visual Analysis' },
                  { icon: <ShieldCheck className='h-3.5 w-3.5' />, label: 'Sentiment Check' },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className='flex items-center gap-2 rounded-full border border-border/30 bg-card/30 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm'
                  >
                    {feature.icon}
                    {feature.label}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── SCANNING STATE ── */}
          {activeState === 'scanning' && (
            <motion.div
              key='scanning'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='relative z-10 flex min-h-[75vh] flex-col items-center justify-center gap-16 py-12'
            >
              {/* Animated Scanner */}
              <div className='relative'>
                {/* Outer rotating rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className='absolute -inset-20 rounded-full border border-primary/10'
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className='absolute -inset-12 rounded-full border border-dashed border-violet-500/10'
                />

                {/* Central pulse */}
                <div className='relative flex h-48 w-48 items-center justify-center'>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className='absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 blur-2xl'
                  />

                  <div className='relative z-10 flex flex-col items-center gap-4'>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <BrainCircuit className='h-16 w-16 text-primary' />
                    </motion.div>
                    <div className='text-center'>
                      <p className='text-sm font-bold text-primary'>Analyzing</p>
                      <p className='text-xs text-muted-foreground'>Please wait...</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className='w-full max-w-lg space-y-3'>
                {scanSteps.map((step, i) => {
                  const isActive = i === terminalIndex
                  const isDone = i < terminalIndex
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: isDone || isActive ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        'flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300',
                        isActive
                          ? 'border-primary/30 bg-primary/10 shadow-lg shadow-primary/10'
                          : isDone
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-border/30 bg-card/30'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl border transition-all',
                          isDone
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                            : isActive
                              ? 'border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/20'
                              : 'border-border/30 bg-muted/20 text-muted-foreground'
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className='h-5 w-5' />
                        ) : (
                          step.icon
                        )}
                      </div>

                      <span className='flex-1 text-sm font-semibold'>
                        {step.label}
                      </span>

                      {isActive && (
                        <Loader2 className='h-4 w-4 animate-spin text-primary' />
                      )}
                      {isDone && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className='text-xs font-medium text-emerald-500'
                        >
                          Complete
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Status Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='text-center'
              >
                <p className='text-sm font-medium text-muted-foreground'>
                  Running AI analysis on your content...
                </p>
                <p className='mt-1 text-xs text-muted-foreground/60'>
                  This usually takes 10-15 seconds
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ── RESULTS STATE: NEURAL COMMAND CENTER ── */}
          {activeState === 'results' && result && (
            <motion.div
              key='results'
              initial='initial'
              animate='animate'
              exit='exit'
              className='relative z-10 w-full'
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
            >
              <div className='space-y-12'>
                {/* Status Header */}
                <div className='flex items-center justify-between border-b border-white/5 pb-8'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-3'>
                      <div className='shadow-glow h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-emerald-500/50' />
                      <h3 className='font-mono text-[10px] font-black tracking-[0.4em] text-primary uppercase'>
                        Neural Alignment Optimized
                      </h3>
                    </div>
                    <p className='font-mono text-[9px] text-muted-foreground/40 uppercase'>
                      Strategic ID: CC-{(Math.random() * 1000).toFixed(0)}
                      -ORACLE
                    </p>
                  </div>
                  <div className='flex items-center gap-8 rounded-3xl border border-white/5 bg-white/5 px-8 py-4 backdrop-blur-2xl'>
                    <div className='border-r border-white/5 pr-8 text-center'>
                      <p className='mb-1 text-[8px] font-black text-muted-foreground/60 uppercase'>
                        Confidence
                      </p>
                      <span className='text-sm font-black text-emerald-400'>
                        {result.confidence_level}
                      </span>
                    </div>
                    <div className='text-center'>
                      <p className='mb-1 text-[8px] font-black text-muted-foreground/60 uppercase'>
                        Sync Rate
                      </p>
                      <span className='text-sm font-black text-white'>
                        99.8%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Hero View */}
                <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-12'>
                  {/* Left Column: Intelligence Stream */}
                  <div className='space-y-6 lg:col-span-3'>
                    <div className='flex items-center gap-3'>
                      <Terminal className='h-4 w-4 text-primary' />
                      <span className='text-[10px] font-black tracking-widest uppercase'>
                        Intelligence Stream
                      </span>
                    </div>
                    <div className='relative h-[500px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-8 backdrop-blur-3xl'>
                      <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-transparent opacity-50' />
                      <div className='scrollbar-hide space-y-6 font-mono text-[11px] leading-relaxed text-muted-foreground/80 select-none'>
                        <p className='text-primary opacity-50'>
                          ❯ INITIALIZING DECRYPTION...
                        </p>
                        <p className='text-sm leading-8 font-light text-white/90 italic'>
                          "{result.analysis_report}"
                        </p>
                        <div className='space-y-3 pt-8 opacity-30'>
                          <p>❯ HASH: 0x8F2A...9C</p>
                          <p>❯ ANALYTICS: VERIFIED</p>
                          <p>❯ THREATS: NONE</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: The Singularity */}
                  <div className='relative flex flex-col items-center justify-center py-12 lg:col-span-6'>
                    {/* Background Visuals */}
                    <div className='absolute inset-0 -z-10 flex items-center justify-center'>
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                        transition={{ duration: 40, repeat: Infinity }}
                        className='absolute h-[600px] w-[600px] rounded-full border border-primary/5 opacity-50'
                      />
                      <div className='absolute h-[400px] w-[400px] animate-pulse rounded-full bg-primary/10 blur-[120px]' />
                    </div>

                    <div className='relative flex h-[350px] w-[350px] items-center justify-center'>
                      <svg
                        className='absolute inset-0 h-full w-full -rotate-90'
                        viewBox='0 0 200 200'
                      >
                        <circle
                          cx='100'
                          cy='100'
                          r='94'
                          stroke='rgba(255,255,255,0.05)'
                          strokeWidth='1'
                          fill='transparent'
                        />
                        <motion.circle
                          cx='100'
                          y='100'
                          r='94'
                          stroke='url(#coreGrad)'
                          strokeWidth='8'
                          fill='transparent'
                          strokeLinecap='round'
                          strokeDasharray={`${2 * Math.PI * 94}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 94 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 94 * (1 - result.viral_score / 100),
                          }}
                          transition={{
                            duration: 2.5,
                            ease: [0.65, 0, 0.35, 1],
                            delay: 0.5,
                          }}
                        />
                        <defs>
                          <linearGradient
                            id='coreGrad'
                            x1='0'
                            y1='0'
                            x2='1'
                            y2='1'
                          >
                            <stop offset='0%' stopColor='#6366f1' />
                            <stop offset='100%' stopColor='#ec4899' />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className='relative z-10 text-center'>
                        <p className='mb-2 text-[10px] font-black tracking-[0.6em] text-primary'>
                          VIRAL VELOCITY
                        </p>
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', damping: 15, delay: 1 }}
                          className='text-9xl font-black tracking-tighter text-white italic drop-shadow-2xl'
                        >
                          {result.viral_score}
                        </motion.div>
                        <Badge className='mt-4 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[10px] font-black tracking-widest text-white/70 uppercase'>
                          Score Index
                        </Badge>
                      </div>
                    </div>

                    <div className='mt-12 max-w-sm space-y-3 text-center'>
                      <h2 className='text-2xl font-black tracking-tight uppercase italic'>
                        Impact Synchronized
                      </h2>
                      <p className='font-mono text-[10px] tracking-widest text-muted-foreground/50'>
                        PREDICTIVE ALGORITHMS CONFIRM OPTIMAL ENGAGEMENT WINDOW
                        OPEN.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Tactical Specs */}
                  <div className='space-y-6 lg:col-span-3'>
                    <div className='flex items-center gap-3'>
                      <Activity className='h-4 w-4 text-primary' />
                      <span className='text-[10px] font-black tracking-widest uppercase'>
                        Tactical Specs
                      </span>
                    </div>
                    <div className='relative flex h-[500px] flex-col justify-center gap-10 rounded-[2.5rem] border border-white/10 bg-black/40 p-10 backdrop-blur-3xl'>
                      {result.radar_data.map((item: any, i: number) => (
                        <div key={i} className='space-y-3'>
                          <div className='flex items-center justify-between px-1'>
                            <span className='text-[10px] font-black tracking-tighter text-muted-foreground/70 uppercase'>
                              {item.subject}
                            </span>
                            <span className='font-mono text-[10px] font-bold'>
                              {item.score}%
                            </span>
                          </div>
                          <div className='h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-white/5'>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score}%` }}
                              transition={{
                                duration: 1.5,
                                delay: 1.2 + i * 0.1,
                              }}
                              className='h-full bg-gradient-to-r from-primary to-violet-500'
                            />
                          </div>
                        </div>
                      ))}
                      <div className='border-t border-white/5 pt-8'>
                        <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4'>
                          <p className='font-mono text-[9px] leading-relaxed text-muted-foreground'>
                            ❯ RECOMMENDATION: LEVERAGE HIGH-VELOCITY HOOK VECTOR
                            TO OPTIMIZE DELTA.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Section: Velocity Arc */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className='relative overflow-hidden rounded-[3rem] border border-white/10 bg-black/30 p-12 backdrop-blur-3xl'
                >
                  <div className='flex flex-col items-center gap-12 md:flex-row'>
                    <div className='space-y-6 md:w-1/3'>
                      <div className='flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'>
                          <TrendingUp className='h-6 w-6' />
                        </div>
                        <div>
                          <h3 className='text-2xl font-black uppercase'>
                            Velocity Arc
                          </h3>
                          <p className='font-mono text-xs text-muted-foreground/40'>
                            Engagement Dynamics Projection
                          </p>
                        </div>
                      </div>
                      <p className='text-sm leading-relaxed font-light text-muted-foreground/80'>
                        Predictive curves indicate a 24-hour peak window.
                        Strategic deployment is advised during the T+14 sector.
                      </p>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='rounded-2xl border border-white/5 bg-white/5 p-4'>
                          <p className='mb-1 text-[8px] font-black text-muted-foreground/60 uppercase'>
                            Saturation
                          </p>
                          <span className='font-black text-white'>
                            Low (4%)
                          </span>
                        </div>
                        <div className='rounded-2xl border border-white/5 bg-white/5 p-4'>
                          <p className='mb-1 text-[8px] font-black text-muted-foreground/60 uppercase'>
                            Peak Power
                          </p>
                          <span className='font-black text-emerald-400'>
                            Critical
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='h-[300px] w-full md:w-2/3'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={result.forecast_data}>
                          <defs>
                            <linearGradient
                              id='velGrad'
                              x1='0'
                              y1='0'
                              x2='0'
                              y2='1'
                            >
                              <stop
                                offset='0%'
                                stopColor='#10b981'
                                stopOpacity={0.4}
                              />
                              <stop
                                offset='100%'
                                stopColor='#10b981'
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray='4 8'
                            vertical={false}
                            stroke='rgba(255,255,255,0.05)'
                          />
                          <XAxis dataKey='time' hide />
                          <YAxis hide />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '20px',
                              background: '#000',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                          <Area
                            type='monotone'
                            dataKey='engagement'
                            stroke='#10b981'
                            strokeWidth={4}
                            fill='url(#velGrad)'
                            strokeLinecap='round'
                            animationDuration={3000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

                {/* Sub-Section: Visual DNA */}
                {result.visual_audit && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className='relative overflow-hidden rounded-[3rem] border border-white/10 bg-black/30 p-12 backdrop-blur-3xl'
                  >
                    <div className='flex flex-col gap-12 md:flex-row'>
                      <div className='space-y-8 md:w-1/2'>
                        <div className='flex items-center gap-4'>
                          <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400'>
                            <ImageIcon className='h-6 w-6' />
                          </div>
                          <div>
                            <h3 className='text-2xl font-black uppercase'>
                              Visual Resonance
                            </h3>
                            <p className='font-mono text-xs text-muted-foreground/40'>
                              Deep Asset DNA Audit
                            </p>
                          </div>
                        </div>
                        <div className='group relative h-[300px] w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40'>
                          {visualUrl ? (
                            <img
                              src={visualUrl}
                              className='h-full w-full object-cover opacity-60 transition-opacity duration-1000 group-hover:opacity-100'
                            />
                          ) : (
                            <div className='flex h-full flex-col items-center justify-center gap-4 opacity-20'>
                              <ScanFace className='h-16 w-16' />
                              <span className='font-mono text-[8px] tracking-[0.5em] uppercase'>
                                No Context
                              </span>
                            </div>
                          )}
                          <div className='pointer-events-none absolute inset-0 border-[20px] border-black/20' />
                        </div>
                      </div>
                      <div className='flex flex-col justify-center space-y-10 md:w-1/2'>
                        <div className='grid grid-cols-2 gap-8'>
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-[9px] font-black text-muted-foreground/60 uppercase'>
                              <span>Optical Quality</span>
                              <span className='text-white'>
                                {result.visual_audit.technical_quality}%
                              </span>
                            </div>
                            <div className='h-1 w-full overflow-hidden rounded-full bg-white/5'>
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{
                                  width: `${result.visual_audit.technical_quality}%`,
                                }}
                                className='h-full bg-primary'
                              />
                            </div>
                          </div>
                          <div className='space-y-2'>
                            <div className='flex items-center justify-between text-[9px] font-black text-muted-foreground/60 uppercase'>
                              <span>Sentiment Pulse</span>
                              <span className='text-emerald-400'>
                                {result.visual_audit.sentiment}
                              </span>
                            </div>
                            <div className='h-1 w-full overflow-hidden rounded-full bg-emerald-500/10'>
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '80%' }}
                                className='h-full bg-emerald-500'
                              />
                            </div>
                          </div>
                        </div>

                        <div className='space-y-4'>
                          <p className='text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase'>
                            Detected Entities
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {result.visual_audit.labels.map(
                              (l: any, i: number) => (
                                <span
                                  key={i}
                                  className='rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-bold text-white/70'
                                >
                                  {l}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className='rounded-[2rem] border border-violet-500/20 bg-violet-600/10 p-8'>
                          <div className='mb-4 flex items-center gap-3'>
                            <RotateCcw className='h-4 w-4 text-violet-400' />
                            <span className='text-[10px] font-black tracking-widest text-violet-400 uppercase'>
                              Visual Directive
                            </span>
                          </div>
                          <p className='text-lg leading-relaxed font-light text-white/90 italic'>
                            "{result.visual_audit.recommendation}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Final Footer Ticker */}
                <div className='space-y-12 pt-20 text-center'>
                  <h2 className='text-7xl font-black tracking-tighter uppercase italic opacity-10 select-none md:text-9xl'>
                    WEAPONIZE
                  </h2>
                  <div className='flex justify-center gap-4'>
                    <Button
                      size='lg'
                      onClick={resetAll}
                      className='shadow-glow-primary h-16 rounded-full border-none bg-primary px-12 text-sm font-black tracking-widest uppercase'
                    >
                      <Rocket className='mr-3 h-5 w-5' /> New Forecast
                    </Button>
                    <Button
                      variant='outline'
                      size='lg'
                      className='h-16 rounded-full border-white/10 bg-white/5 px-12 text-sm font-black tracking-widest uppercase'
                    >
                      <Share2 className='mr-3 h-5 w-5' /> Share Intel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/performance-oracle/')({
  component: PerformanceOraclePage,
})
