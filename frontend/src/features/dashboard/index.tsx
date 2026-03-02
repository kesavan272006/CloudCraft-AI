import { useState, useEffect, useMemo } from 'react'
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
  Network
} from 'lucide-react'
import { ActivityFeed } from './components/activity-feed'
import { CoverageChart } from './components/coverage-chart'
import { AnalyticsTab } from './components/analytics-tab'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'

export function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/dashboard/stats')
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
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

      <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 relative">

        {/* PREMIUM DOT-MATRIX BACKGROUND GRID */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none hidden dark:block"></div>

        {/* HERO SECTION - SLEEK & MODERN */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10'>
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-2 shadow-sm uppercase tracking-widest gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              System Online
            </div>
            <h1 className='text-3xl md:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
              Orchestration Center
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Manage multi-agent workflows and view real-time cultural telemetry.</p>
          </div>

          <div className='flex items-center space-x-3'>
            <Button
              variant="outline"
              className="h-9 font-medium shadow-sm transition-all hover:bg-secondary hidden sm:flex"
            >
              View Documentation
            </Button>
            <Button
              className="h-9 px-4 font-semibold shadow-sm transition-all bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2"
              onClick={handleGenerateReport}
            >
              Export Global Report
            </Button>
          </div>
        </div>

        {/* QUICK JUMP CARDS (Linear/Stripe Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">

          <Card className="group relative overflow-hidden border border-border bg-card/80 hover:bg-card hover:border-indigo-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg h-full rounded-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Link to="/forge" className="absolute inset-0 z-10" />
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Blocks className="w-6 h-6 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg tracking-tight text-card-foreground">The Forge Engine</h3>
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Launch a new parallel-agent pipeline. Formulate campaigns and trigger autonomous generation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-border bg-card/80 hover:bg-card hover:border-fuchsia-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg h-full rounded-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Link to="/brand_brain" className="absolute inset-0 z-10" />
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0 group-hover:bg-fuchsia-500/20 transition-all duration-300">
                <Network className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg tracking-tight text-card-foreground">Brand Brain</h3>
                  <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-fuchsia-500/10 transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-fuchsia-500 transition-colors transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure vector-embedded brand guidelines to enforce 100% compliance across all generated outputs.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* MAIN HUD TABS */}
        <Tabs defaultValue='overview' className='space-y-8'>
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value='overview' className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Real-time Telemetry</TabsTrigger>
            <TabsTrigger value='analytics' className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">Long-term Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-8 animate-in fade-in duration-500'>

            {/* KPI GRID */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Network Status
              </h3>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {[
                  { label: 'Active Pipelines', val: stats?.metrics?.active_missions || 0, sub: '+2 generating', icon: <Rocket className="h-4 w-4" /> },
                  { label: 'Avg Oracle Score', val: `${Math.round(stats?.metrics?.avg_oracle_score || 0)}%`, sub: 'Above nominal', icon: <Sparkles className="h-4 w-4" /> },
                  { label: 'Market Dispatches', val: stats?.metrics?.completed_missions || 0, sub: 'Assets pushed', icon: <Send className="h-4 w-4" /> },
                  { label: 'Network Efficiency', val: stats?.efficiency_gain || '0%', sub: 'Time saved', icon: <TrendingUp className="h-4 w-4" /> }
                ].map((kpi, i) => (
                  <Card key={i} className="group relative border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 bg-card/60 rounded-xl overflow-hidden hover:border-primary/40 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className='flex flex-row items-center justify-between pb-2 relative z-10'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        {kpi.label}
                      </p>
                      <div className={`p-2 rounded-lg bg-secondary/80 text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors`}>
                        {kpi.icon}
                      </div>
                    </div>
                    <div className="relative z-10 mt-2">
                      <div className='text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70'>{kpi.val}</div>
                      <p className='text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-wider'>
                        {i === 1 || i === 3 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : null}
                        {kpi.sub} over 24h
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
              {/* CULTURAL COVERAGE CHART */}
              <Card className='col-span-1 lg:col-span-4 border-border shadow-sm'>
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-card-foreground">Cultural Dialect Coverage</CardTitle>
                      <CardDescription className="text-xs mt-1">Real-time breakdown of linguistic asset adaptation.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
                  <CoverageChart data={stats?.cultural_coverage} />
                </CardContent>
              </Card>

              {/* RECENT ACTIVITY FEED */}
              <Card className='col-span-1 lg:col-span-3 border-border shadow-sm flex flex-col'>
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-card-foreground">Global Activity Log</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {searchQuery ? 'Searching logs...' : 'Latest actions by the autonomous suite.'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                  <ActivityFeed activities={filteredActivity} />
                </CardContent>
              </Card>
            </div>
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
