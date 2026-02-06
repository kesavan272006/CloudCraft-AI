import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3, Sparkles, Loader2, TrendingUp, BrainCircuit,
  Target, AlertCircle, PieChart as PieIcon, BarChart as BarIcon,
  MessageSquareQuote
} from "lucide-react"
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, LabelList, Label
} from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Clock, History } from "lucide-react"

export default function PerformanceOraclePage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
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
    setLoading(true)
    setError(null)

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-6 md:p-10 bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 md:p-3">
            <BrainCircuit className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl uppercase italic">Performance Oracle</h1>
            <p className="text-muted-foreground text-[10px] md:text-sm font-medium tracking-widest uppercase">Predictive Viral Intelligence</p>
          </div>
        </div>

        {/* History Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 border-primary/20" onClick={fetchHistory}>
              <History className="h-4 w-4" /> History
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="uppercase font-black flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Prediction History
              </SheetTitle>
              <CardDescription>Revisit past viral forecasts.</CardDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {historyLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground p-4">No history yet.</p>
              ) : (
                history.map((item: any) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors border-primary/10 group"
                    onClick={() => {
                      setContent(item.input_content);
                      setResult(item.response);
                      // Close sheet implicitly by user action or manual control (uncontrolled for now is fine)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </Badge>
                        <p className="text-[10px] font-bold text-emerald-500">{item.response.viral_score}% Viral</p>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.input_content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Side */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-black uppercase">Draft Input</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <Textarea
                placeholder="Paste your script here for the Oracle to scan..."
                className="h-[200px] md:h-[450px] bg-background border-primary/10 text-sm overflow-y-auto resize-none font-medium leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handlePredict} disabled={loading || !content.trim()} className="w-full h-14 font-black text-lg shadow-lg hover:shadow-primary/20 transition-all">
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                SCAN & PREDICT
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Side */}
        <div className="lg:col-span-8 space-y-4">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700">

              {/* AI VERDICT - PROMINENT PLACE */}
              <Card className="border-l-4 border-l-primary bg-primary/5 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4" /> AI Analyst Verdict
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm md:text-base font-semibold leading-relaxed text-foreground">
                    {result.analysis_report}
                  </p>
                </CardContent>
              </Card>

              {/* Main Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Viral Prob.', val: result.viral_score + '%', color: 'text-primary' },
                  { label: 'Reliability', val: result.confidence_level, color: 'text-emerald-500' },
                  { label: 'Trend Match', val: '94%', color: 'text-amber-500' },
                  { label: 'Retention', val: '8.4s', color: 'text-rose-500' }
                ].map((s, i) => (
                  <Card key={i} className="bg-card border-none shadow-sm text-center">
                    <CardContent className="p-4">
                      <p className="text-[9px] uppercase font-black text-muted-foreground">{s.label}</p>
                      <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Grid 1: Radar (Labels On) & Pie (Labels On) */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 shadow-sm border-none">
                  <p className="text-[10px] font-black mb-4 flex items-center gap-2 uppercase text-muted-foreground"><Target className="h-3 w-3 text-primary" /> Attribute Breakdown</p>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={result.radar_data} outerRadius="70%">
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888' }} />
                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6}>
                          <LabelList dataKey="score" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6366f1' }} />
                        </Radar>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 shadow-sm border-none">
                  <p className="text-[10px] font-black mb-4 flex items-center gap-2 uppercase text-muted-foreground"><PieIcon className="h-3 w-3 text-primary" /> Sentiment Mix</p>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={result.sentiment || []} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                          {(result.sentiment || []).map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Charts Grid 2: Growth Area & Platform Bar (Multi-Color) */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 shadow-sm border-none">
                  <p className="text-[10px] font-black mb-4 flex items-center gap-2 uppercase text-muted-foreground"><TrendingUp className="h-3 w-3 text-primary" /> Predicted Momentum</p>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.forecast_data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="engagement" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3}>
                          <LabelList dataKey="engagement" position="top" style={{ fontSize: '9px', fill: '#6366f1', fontWeight: 'bold' }} />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 shadow-sm border-none">
                  <p className="text-[10px] font-black mb-4 flex items-center gap-2 uppercase text-muted-foreground"><BarIcon className="h-3 w-3 text-primary" /> Platform Reach Index</p>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.platform_reach || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                          {(result.platform_reach || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                          ))}
                          <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'black', fill: '#888' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5 p-10 text-center">
              <div className="relative mb-6">
                <BarChart3 className="h-20 w-20 text-primary/20 animate-pulse" />
                <BrainCircuit className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-bounce" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Predictive Engine Idle</h3>
              <p className="text-muted-foreground text-sm mt-3 max-w-sm font-medium">
                The Oracle is ready to process your content. Input your draft on the left to generate 24-hour engagement forecasts and viral heatmaps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/performance-oracle/')({
  component: PerformanceOraclePage,
})