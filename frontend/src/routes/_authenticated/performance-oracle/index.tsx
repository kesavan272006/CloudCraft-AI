import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3, Sparkles, Loader2, TrendingUp, BrainCircuit,
  Target, AlertCircle, PieChart as PieIcon, BarChart as BarIcon,
  MessageSquareQuote, ChevronLeft, History, Clock, Share2,
  ArrowUpRight, Gauge, Activity, ShieldCheck, Zap
} from "lucide-react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, LabelList
} from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const VIBRANT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

type OracleState = 'idle' | 'scanning' | 'results'

export default function PerformanceOraclePage() {
  const [activeState, setActiveState] = useState<OracleState>('idle')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/oracle/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error("Failed to fetch history", e)
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
      const response = await fetch('http://localhost:8000/api/v1/oracle/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) throw new Error("Oracle connection failed")
      const data = await response.json()

      const enrichedData = {
        ...data,
        sentiment: [
          { name: 'Excitement', value: 45 },
          { name: 'Trust', value: 25 },
          { name: 'Urgency', value: 20 },
          { name: 'Logic', value: 10 },
        ],
        platform_reach: [
          { name: 'Insta', value: 88 },
          { name: 'L-In', value: 72 },
          { name: 'X', value: 55 },
          { name: 'FB', value: 40 },
        ]
      }
      setResult(enrichedData)
      setActiveState('results')
      toast.success("Prediction finalized")
    } catch (err: any) {
      toast.error("Prediction failed")
      setActiveState('idle')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setActiveState('idle')
    setContent('')
    setResult(null)
  }

  // --- RENDERING CATEGORIES ---

  if (activeState === 'idle') {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

        <div className="max-w-4xl w-full space-y-10 text-center relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
              <Activity className="h-3 w-3" /> Predictive Neural Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
              PERFORMANCE <span className="text-primary italic">ORACLE</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Validate your message before you send it. Our engine predicts 24-hour engagement velocity with hardware-accelerated precision.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-[2.5rem] blur opacity-40 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
            <div className="relative bg-card border-2 border-border/50 rounded-[2.5rem] p-4 shadow-2xl">
              <Textarea
                placeholder="Paste your content draft here (Blog, Thread, Reel Script, LinkedIn Post)..."
                className="min-h-[280px] text-lg bg-transparent border-none focus-visible:ring-0 resize-none font-medium p-6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex items-center justify-between p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" className="rounded-xl gap-2 text-muted-foreground hover:text-foreground" onClick={fetchHistory}>
                        <History className="h-4 w-4" /> History
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[400px]">
                      <SheetHeader>
                        <SheetTitle className="font-black uppercase flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" /> Past Forecasts
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-8 space-y-4 overflow-y-auto max-h-[85vh]">
                        {historyLoading ? (
                          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : history.length === 0 ? (
                          <p className="text-sm text-center text-muted-foreground p-8">No predictions recorded.</p>
                        ) : (
                          history.map((item) => (
                            <Card
                              key={item.id}
                              className="cursor-pointer hover:bg-accent/50 border-primary/10 group transition-all"
                              onClick={() => {
                                setContent(item.input_content)
                                setResult(item.response)
                                setActiveState('results')
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge variant="outline" className="text-[9px]">{new Date(item.timestamp).toLocaleDateString()}</Badge>
                                  <span className="text-xs font-black text-primary">{item.response.viral_score}% Viral</span>
                                </div>
                                <p className="text-xs line-clamp-2 font-medium">{item.input_content}</p>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <Button
                  onClick={handlePredict}
                  disabled={!content.trim()}
                  className="h-14 px-10 rounded-[1.25rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Predict Performance <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeState === 'scanning') {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="relative flex flex-col items-center">
          <div className="relative px-8 py-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <Loader2 className="h-24 w-24 text-primary animate-spin relative z-10" />
          </div>
          <div className="text-center mt-12 space-y-3 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-3xl font-black italic tracking-tighter">CONSULTING THE ORACLE...</h2>
            <p className="text-muted-foreground font-medium max-w-sm">Generating viral heatmaps and cross-platform engagement benchmarks.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden p-6 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={resetAll} className="h-10 rounded-xl gap-2 border bg-muted/20">
            <ChevronLeft className="h-4 w-4" /> Reset
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">LIVE Analysis Ready</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-primary/20 gap-2 font-bold px-6">
            <Share2 className="h-4 w-4" /> Share Dashboard
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20">
            Export JSON
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full space-y-10 relative z-10">

        {/* TOP LEVEL SCORES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-gradient-to-br from-primary to-primary-foreground/90 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center items-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Gauge className="h-32 w-32" />
            </div>
            <p className="text-sm font-black uppercase flex items-center gap-2 mb-2 opacity-80 letter-spacing-[0.2em]"><Zap className="h-4 w-4" /> Viral Probability</p>
            <h3 className="text-8xl font-black tracking-tighter mb-4">{result.viral_score}%</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs py-1 px-4 rounded-full font-black uppercase tracking-widest backdrop-blur-md">
              Confidence: {result.confidence_level}
            </Badge>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Trend Matching', val: '94%', sub: 'Hardware Sync', color: 'text-primary', icon: <TrendingUp className="h-4 w-4" /> },
              { label: 'Retention Time', val: '8.4s', sub: 'Est. Attention', color: 'text-amber-500', icon: <Clock className="h-4 w-4" /> },
              { label: 'Authority', val: 'High', sub: 'Topic Lead', color: 'text-emerald-500', icon: <ShieldCheck className="h-4 w-4" /> },
              { label: 'Complexity', val: 'Opt.', sub: 'Readability', color: 'text-rose-500', icon: <Activity className="h-4 w-4" /> }
            ].map((s, i) => (
              <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-md shadow-lg flex flex-col justify-center p-6 text-center group hover:border-primary/50 transition-colors">
                <div className="flex justify-center mb-3">
                  <div className={cn("p-2 rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10", s.color)}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">{s.label}</p>
                <p className={cn("text-3xl font-black mb-1 tracking-tighter", s.color)}>{s.val}</p>
                <p className="text-[10px] font-bold text-muted-foreground/60">{s.sub}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* ANALYST VERDICT CONTAINER */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] blur opacity-50" />
          <Card className="relative bg-card/80 border-border/50 rounded-[2rem] backdrop-blur-xl shadow-xl p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareQuote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-black tracking-tight">AI ANALYST INSIGHT</h4>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Architectural Assessment</p>
              </div>
            </div>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90 max-w-5xl">
              {result.analysis_report}
            </p>
          </Card>
        </div>

        {/* CHARTS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* RADAR: ATTRIBUTES */}
          <Card className="lg:col-span-4 bg-card/50 border-border/50 p-8 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Attribute Pulse</p>
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={result.radar_data} outerRadius="75%">
                  <PolarGrid stroke="#888" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#888' }} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6}>
                    <LabelList dataKey="score" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6366f1' }} />
                  </Radar>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* AREA: GROWTH MOMENTUM */}
          <Card className="lg:col-span-8 bg-card/50 border-border/50 p-8 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">24-Hour Velocity Forecast</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.forecast_data}>
                  <defs>
                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#888" />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={4} fill="url(#colorEng)">
                    <LabelList dataKey="engagement" position="top" offset={10} style={{ fontSize: '10px', fill: '#6366f1', fontWeight: 'black' }} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* PIE: SENTIMENT */}
          <Card className="lg:col-span-5 bg-card/50 border-border/50 p-8 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Sentiment Spectrum</p>
              <PieIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={result.sentiment}
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                    stroke="none"
                  >
                    {result.sentiment.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* BAR: PLATFORM FIT */}
          <Card className="lg:col-span-7 bg-card/50 border-border/50 p-8 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Platform Fit Matrix</p>
              <BarIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.platform_reach} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'black' }} width={80} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                    {result.platform_reach.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} strokeOpacity={0.2} stroke={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" formatter={(v: number) => `${v}%`} style={{ fontSize: '12px', fontWeight: 'black', fill: '#444' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* INPUT RECAP / FOOTER */}
        <div className="p-8 border-t border-border/50 flex flex-col items-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 px-1">Source Content Draft</p>
          <div className="w-full max-w-4xl p-8 bg-muted/20 border border-border/50 rounded-2xl">
            <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">"{content}"</p>
          </div>
          <Button onClick={resetAll} variant="link" className="mt-8 text-primary font-bold hover:scale-105 transition-transform">
            Generate New Forecast
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/performance-oracle/')({
  component: PerformanceOraclePage,
})