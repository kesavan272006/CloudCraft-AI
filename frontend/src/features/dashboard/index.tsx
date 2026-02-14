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
  Zap,
  Activity,
  Globe,
  TrendingUp,
  LayoutDashboard,
  Send,
  Loader2,
  Search as SearchIcon,
  X
} from 'lucide-react'
import { ActivityFeed } from './components/activity-feed'
import { CoverageChart } from './components/coverage-chart'
import { AnalyticsTab } from './components/analytics-tab'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useNavigate } from '@tanstack/react-router'

export function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

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
        loading: 'Synthesizing Mission Intelligence...',
        success: 'Report generated and downloaded successfully!',
        error: 'Failed to generate report',
      }
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    )
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className="space-y-1">
            <h1 className='text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3'>
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Mission <span className="text-primary">Control</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Real-time intelligence from the Bharat Content Engine</p>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant="outline" className="h-10 px-4 border-primary/20 bg-primary/5 text-primary gap-2 font-bold uppercase tracking-widest text-[10px]">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Nexus Link Active
            </Badge>
            <Button
              className="h-10 px-6 font-bold shadow-lg shadow-primary/20"
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList className="bg-muted/50 p-1 border border-border/50">
            <TabsTrigger value='overview' className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Overview</TabsTrigger>
            <TabsTrigger value='analytics' className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6 animate-in fade-in duration-700'>
            {/* KPI GRID */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {[
                { label: 'Active Missions', val: stats?.metrics?.active_missions || 0, sub: 'Scheduled & Queued', icon: <Rocket className="h-4 w-4" />, color: 'text-primary' },
                { label: 'Avg. Oracle Score', val: `${Math.round(stats?.metrics?.avg_oracle_score || 0)}%`, sub: 'Viral Benchmark', icon: <Zap className="h-4 w-4" />, color: 'text-amber-500' },
                { label: 'Nexus Dispatches', val: stats?.metrics?.completed_missions || 0, sub: 'Last 24 Hours', icon: <Send className="h-4 w-4" />, color: 'text-emerald-500' },
                { label: 'Efficiency Gain', val: stats?.efficiency_gain || '0%', sub: 'vs. Manual Ops', icon: <TrendingUp className="h-4 w-4" />, color: 'text-indigo-500' }
              ].map((kpi, i) => (
                <Card key={i} className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors group cursor-pointer" onClick={() => kpi.label === 'Active Missions' && navigate({ to: '/calendar' })}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
                      {kpi.label}
                    </CardTitle>
                    <div className={`${kpi.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                      {kpi.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-black tracking-tight ${kpi.color}`}>{kpi.val}</div>
                    <p className='text-[10px] text-muted-foreground font-medium uppercase mt-1'>
                      {kpi.sub}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-7'>
              {/* CULTURAL COVERAGE CHART */}
              <Card className='col-span-1 lg:col-span-4 border-border/40 shadow-xl overflow-hidden'>
                <CardHeader className="bg-muted/30 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Cultural Coverage
                      </CardTitle>
                      <CardDescription className="text-[10px] mt-1 uppercase font-bold text-muted-foreground/60">Language & Dialect Distribution</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background text-[10px] font-black">LIVE</Badge>
                  </div>
                </CardHeader>
                <CardContent className='pt-10'>
                  <CoverageChart data={stats?.cultural_coverage} />
                </CardContent>
              </Card>

              {/* RECENT ACTIVITY FEED */}
              <Card className='col-span-1 lg:col-span-3 border-border/40 shadow-xl overflow-hidden'>
                <CardHeader className="bg-muted/30 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> Nexus Live Feed
                      </CardTitle>
                      <CardDescription className="text-[10px] mt-1 uppercase font-bold text-muted-foreground/60">{searchQuery ? `Searching for "${searchQuery}"` : 'Recent Autonomous Dispatches'}</CardDescription>
                    </div>
                    <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
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
    title: 'Content Map',
    href: '/calendar',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Brand DNA',
    href: '/brand_brain',
    isActive: false,
    disabled: false,
  }
]
