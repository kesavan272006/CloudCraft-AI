import { useState, useEffect, type ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Rocket,
  Trash2,
  Clock,
  TrendingUp,
  Users,
  Loader2,
  Send,
  Activity,
  Zap,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isThisMonth,
} from 'date-fns'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ScheduledPost } from '@/types/calendar'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: CampaignCalendarPage,
})

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false },
  { title: 'Campaign Architect', href: '/campaign-architect', isActive: false },
  { title: 'Campaign Calendar', href: '/calendar', isActive: true },
  { title: 'Competitor Pulse', href: '/competitor-pulse', isActive: false },
]

function cx(...cs: (string | undefined | false | null)[]) {
  return cs.filter(Boolean).join(' ')
}

const PLATFORM_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  LinkedIn:  { border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   glow: 'shadow-blue-500/20'   },
  Twitter:   { border: 'border-sky-500/40',    bg: 'bg-sky-500/10',    text: 'text-sky-400',    glow: 'shadow-sky-500/20'    },
  Instagram: { border: 'border-pink-500/40',   bg: 'bg-pink-500/10',   text: 'text-pink-400',   glow: 'shadow-pink-500/20'   },
  Facebook:  { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
}

function getPlatformStyle(platform: string) {
  const key = Object.keys(PLATFORM_COLORS).find(k => platform.startsWith(k))
  return key ? PLATFORM_COLORS[key] : { border: 'border-primary/30', bg: 'bg-primary/10', text: 'text-primary', glow: 'shadow-primary/20' }
}

function CampaignCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  // Quick Schedule State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostPlatform, setNewPostPlatform] = useState('LinkedIn')
  const [isScheduling, setIsScheduling] = useState(false)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/calendar/')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('Failed to load your content calendar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleQuickSchedule = async () => {
    if (!newPostContent.trim() || !selectedDate) {
      toast.error('Please enter content and ensure a date is selected')
      return
    }

    setIsScheduling(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          platform: newPostPlatform,
          scheduled_time: selectedDate.toISOString(),
          performance_score: 75,
        })
      })

      if (response.ok) {
        toast.success('Post scheduled successfully!')
        setIsDialogOpen(false)
        setNewPostContent('')
        fetchPosts()
      } else {
        throw new Error('Failed to schedule')
      }
    } catch {
      toast.error('Failed to schedule post')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post from the calendar?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/v1/calendar/${postId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
        toast.success('Post removed from calendar')
      }
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const avgPerformance = posts.length > 0
    ? Math.round(posts.reduce((acc, p) => acc + (p.performance_score || 0), 0) / posts.length)
    : 0

  const thisMonthPosts = posts.filter(p => isThisMonth(parseISO(p.scheduled_time))).length
  const platforms = [...new Set(posts.map(p => p.platform.split(' ')[0]))].length
  const upcomingPosts = posts.filter(p => parseISO(p.scheduled_time) > new Date())

  // ── Calendar Render ──────────────────────────────────────────────────────

  const monthStart  = startOfMonth(currentMonth)
  const monthEnd    = endOfMonth(monthStart)
  const startDate   = startOfWeek(monthStart)
  const endDate     = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const stats = [
    { label: 'Scheduled', value: posts.length, icon: CalendarDays, color: 'text-primary',   bg: 'bg-primary/10',    border: 'border-primary/20'   },
    { label: 'This Month', value: thisMonthPosts,   icon: Activity,     color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Avg Score',  value: `${avgPerformance}%`, icon: BarChart3,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Platforms',  value: platforms,        icon: Zap,          color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20'   },
  ]

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14">
        <div className="flex items-center gap-4">
          <TopNav links={topNav} />
        </div>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <div className="flex-1 min-w-0 relative overflow-hidden">
      {/* Premium dot-matrix background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 15% 15%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 78%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(14,165,233,0.05) 0%, transparent 55%)' }}
      />
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-140 h-140 rounded-full bg-linear-to-r from-indigo-500/6 via-violet-500/6 to-blue-500/6 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '-14%', left: '-6%' }}
        />
        <motion.div
          className="absolute w-100 h-100 rounded-full bg-linear-to-r from-violet-500/6 via-purple-500/6 to-pink-500/6 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 55, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{ bottom: '2%', right: '-4%' }}
        />
      </div>

      <div className="relative z-10 space-y-6 p-4 md:p-8">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div className="space-y-2">
            {/* Live status pill */}
            <motion.div
              className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-linear-to-r from-primary/15 via-primary/10 to-primary/15 text-primary text-xs font-bold shadow-lg shadow-primary/15 uppercase tracking-widest gap-2 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-lg shadow-primary/50" />
              </span>
              Content Pipeline · Synced
            </motion.div>

            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tight flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
                Campaign
              </span>
              <span className="italic bg-linear-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Calendar
              </span>
              <CalendarDays className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
            </motion.h1>

            <motion.p
              className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-optimized content pipeline with autonomous scheduling intelligence.
            </motion.p>
          </div>

          {/* Month Navigator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-1.5 shadow-xl shadow-black/5"
          >
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted/60 transition-all hover:scale-105"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <AnimatePresence mode="wait">
              <motion.span
                key={format(currentMonth, 'MMMM yyyy')}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-bold min-w-35 text-center px-2"
              >
                {format(currentMonth, 'MMMM yyyy')}
              </motion.span>
            </AnimatePresence>
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-muted/60 transition-all hover:scale-105"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={cx(
                "rounded-2xl border backdrop-blur-xl p-4 shadow-lg relative overflow-hidden",
                stat.border, "bg-linear-to-br from-card/80 to-card/40"
              )}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-50"
                style={{ background: `var(--tw-gradient-stops)` }}
              />
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <div className={cx("p-1.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cx("h-3.5 w-3.5", stat.color)} />
                </div>
              </div>
              <p className={cx("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-100 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-10 h-10 text-primary/40" />
            </motion.div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/40">
              Syncing content pipeline...
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-4 gap-6"
          >
            {/* ── Calendar Grid ── */}
            <div className="xl:col-span-3 space-y-3">
              {/* Day-of-week header */}
              <div className="grid grid-cols-7 px-0.5">
                {DAYS_OF_WEEK.map((day, i) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="text-center py-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{day}</span>
                  </motion.div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="rounded-2xl border border-border/40 bg-linear-to-br from-card/60 to-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
                {(() => {
                  const rows: ReactElement[] = []
                  let week: ReactElement[] = []

                  calendarDays.forEach((day, idx) => {
                    const dayPosts = posts.filter(post => isSameDay(parseISO(post.scheduled_time), day))
                    const isToday    = isSameDay(day, new Date())
                    const inMonth    = isSameMonth(day, monthStart)

                    week.push(
                      <motion.div
                        key={day.toString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.008, duration: 0.3 }}
                        className={cx(
                          "min-h-32 border-r border-b border-border/25 p-2 transition-colors duration-200 group relative",
                          !inMonth && "opacity-30 bg-muted/5",
                          inMonth && !isToday && "hover:bg-muted/6",
                          isToday && "bg-primary/4 shadow-inner",
                        )}
                      >
                        {/* Today glow ring */}
                        {isToday && (
                          <motion.div
                            className="absolute inset-0 ring-1 ring-primary/30 rounded-none pointer-events-none"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                          />
                        )}

                        <div className="flex justify-between items-center mb-1.5">
                          <span className={cx(
                            "text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full transition-colors",
                            isToday
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : inMonth
                              ? "text-muted-foreground/70 group-hover:text-foreground/80"
                              : "text-muted-foreground/30"
                          )}>
                            {format(day, 'd')}
                          </span>

                          {inMonth && (
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
                              onClick={() => { setSelectedDate(day); setIsDialogOpen(true) }}
                            >
                              <Plus className="w-2.5 h-2.5 text-primary" />
                            </motion.button>
                          )}
                        </div>

                        <div className="space-y-1 overflow-y-auto max-h-22" style={{ scrollbarWidth: 'none' }}>
                          {dayPosts.map((post, pi) => {
                            const ps = getPlatformStyle(post.platform)
                            return (
                              <TooltipProvider key={post.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.85 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: pi * 0.06 }}
                                      className={cx(
                                        "group/post relative p-1.5 rounded-lg border transition-all cursor-default",
                                        ps.border, ps.bg,
                                        "hover:shadow-md", ps.glow
                                      )}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className={cx("text-[8px] font-black uppercase tracking-widest", ps.text)}>
                                          {post.platform.split(' ')[0]}
                                        </span>
                                        {post.performance_score != null && (
                                          <span className="flex items-center text-[8px] text-emerald-500 font-bold ml-auto">
                                            <TrendingUp className="w-2 h-2 mr-0.5" />
                                            {post.performance_score}%
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[9px] line-clamp-2 text-foreground/70 leading-tight">
                                        {post.content}
                                      </p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }}
                                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover/post:opacity-100 transition-opacity flex items-center justify-center"
                                      >
                                        <Trash2 className="w-2 h-2" />
                                      </button>
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-55 p-0 overflow-hidden rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl"
                                  >
                                    <div className={cx("px-3 py-2 border-b border-border/40", ps.bg)}>
                                      <div className="flex items-center justify-between">
                                        <span className={cx("text-[10px] font-black uppercase tracking-widest", ps.text)}>{post.platform}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{format(parseISO(post.scheduled_time), 'h:mm a')}</span>
                                      </div>
                                    </div>
                                    <div className="px-3 py-2.5 space-y-2">
                                      <p className="text-[11px] text-foreground/85 leading-relaxed">{post.content}</p>
                                      {post.persona_name && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                          <Users className="w-2.5 h-2.5" />
                                          {post.persona_name}
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )
                          })}
                        </div>
                      </motion.div>
                    )

                    if (week.length === 7) {
                      rows.push(
                        <div key={`row-${idx}`} className="grid grid-cols-7">
                          {week}
                        </div>
                      )
                      week = []
                    }
                  })

                  return rows
                })()}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">

              {/* Plan Insight */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 to-primary/2 backdrop-blur-xl p-5 shadow-xl shadow-primary/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                    <Rocket className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Plan Insight</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
                  Content optimized for the{' '}
                  <span className="text-primary font-bold">Bharat High-Engagement Cycle</span>.
                  Peak windows:{' '}
                  <span className="text-foreground font-medium">9–11 AM</span> &amp;{' '}
                  <span className="text-foreground font-medium">7–9 PM IST</span>.
                </p>
                <div className="mt-4 pt-4 border-t border-primary/10 relative z-10 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total Scheduled</span>
                    <span className="font-bold text-foreground">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Avg. Performance</span>
                    <span className="font-bold text-emerald-500">{avgPerformance}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Active Platforms</span>
                    <span className="font-bold text-foreground">{platforms}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Schedule CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button
                  onClick={() => { setSelectedDate(new Date()); setIsDialogOpen(true) }}
                  className="w-full h-11 gap-2 rounded-xl shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all"
                >
                  <Plus className="h-4 w-4" /> Schedule Post
                </Button>
              </motion.div>

              {/* Upcoming Posts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="rounded-2xl border border-border/50 bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 shadow-xl shadow-black/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <div className="p-1.5 rounded-lg bg-muted/50 border border-border/40">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upcoming</p>
                  {upcomingPosts.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-[9px] font-mono px-1.5">{upcomingPosts.length}</Badge>
                  )}
                </div>

                <div className="space-y-2 relative z-10">
                  {upcomingPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                      <Sparkles className="h-6 w-6 text-muted-foreground/20" />
                      <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">No upcoming posts</p>
                    </div>
                  ) : (
                    upcomingPosts.slice(0, 4).map((post, i) => {
                      const ps = getPlatformStyle(post.platform)
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.06 }}
                          className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-default border border-transparent hover:border-border/30 group/up"
                        >
                          <div className={cx(
                            "w-9 h-9 flex flex-col items-center justify-center rounded-xl border text-[9px] font-bold shrink-0",
                            ps.bg, ps.border
                          )}>
                            <span className="text-muted-foreground/60">{format(parseISO(post.scheduled_time), 'MMM')}</span>
                            <span className={ps.text}>{format(parseISO(post.scheduled_time), 'd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate text-foreground/80 group-hover/up:text-foreground transition-colors">{post.content}</p>
                            <p className="text-[9px] text-muted-foreground/50 mt-0.5 font-mono">{post.platform.split(' ')[0]} · {format(parseISO(post.scheduled_time), 'h:mm a')}</p>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Schedule Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-115 p-0 overflow-hidden rounded-2xl border border-border/60 bg-card/95 backdrop-blur-2xl shadow-2xl">
          <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-linear-to-r from-primary/5 to-transparent">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                Quick Schedule
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {selectedDate ? (
                  <span>Scheduling post for <span className="text-foreground font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span></span>
                ) : 'Select content and platform'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</Label>
              <Select value={newPostPlatform} onValueChange={setNewPostPlatform}>
                <SelectTrigger className="bg-muted/40 border-border/50 backdrop-blur-sm focus:border-primary/50 transition-colors h-10 rounded-xl">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  {['LinkedIn', 'Twitter', 'Instagram', 'Facebook'].map(p => (
                    <SelectItem key={p} value={p} className="rounded-lg">{p === 'Twitter' ? 'Twitter (X)' : p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content</Label>
              <Textarea
                placeholder="What would you like to post?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-30 bg-muted/40 border-border/50 backdrop-blur-sm resize-none focus:border-primary/50 transition-colors rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/10 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="hover:bg-muted/50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleQuickSchedule}
              disabled={isScheduling}
              className="px-6 rounded-xl shadow-lg shadow-primary/15 hover:scale-105 transition-all gap-2"
            >
              {isScheduling
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling…</>
                : <><Send className="h-4 w-4" /> Schedule to Pipeline</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
