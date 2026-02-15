import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Radar,
  Search,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Zap,
  Copy
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from 'sonner'

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Strategy copied!")
  }

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
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-8 md:p-10 bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 md:p-3">
            <Radar className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">Competitor Pulse</h1>
            <p className="text-muted-foreground text-xs md:text-sm">Spy on trends & viral patterns</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Search Input Section */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter handle (e.g. @keralafoodie) or niche..."
                className="pl-10 h-12 bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
            </div>
            <Button size="lg" onClick={handleSearch} disabled={loading} className="h-12 px-8 font-bold">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Analyze Pulse
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-in fade-in duration-500">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-primary">Scanning Social Ecosystem...</p>
            <p className="text-muted-foreground text-xs">Tavily is retrieving current trends for "{query}"</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertTitle>Pulse Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Top Intelligence Bar */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2 border-primary/40 bg-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-32 w-32" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="animate-pulse bg-red-600">LIVE INTEL</Badge>
                  <CardTitle className="text-xl font-black tracking-tighter uppercase">Intelligence Brief: {result.competitor_handle}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold leading-tight text-foreground/90 italic">
                  "{result.intelligence_brief}"
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card flex flex-col justify-center items-center p-6 text-center">
              <h4 className="text-xs font-black uppercase text-muted-foreground mb-2">Threat Level</h4>
              <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/20"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * result.threat_level) / 100}
                    className={result.threat_level > 70 ? "text-red-500" : "text-yellow-500"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black">{result.threat_level}%</span>
                </div>
              </div>
              <Badge variant="outline" className="mt-4 border-red-500/50 text-red-500 bg-red-500/10">
                {result.competitor_status}
              </Badge>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Battle Map: SWOT Analysis */}
            <Card className="border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="bg-muted/50 border-b py-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Radar className="h-4 w-4 text-primary" /> Tactical SWOT Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-b bg-green-500/5">
                    <h5 className="text-[10px] font-black uppercase text-green-600 mb-2">Strengths</h5>
                    <ul className="space-y-1">
                      {result.swot.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] font-medium flex items-start gap-1">
                          <span className="text-green-500">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border-b bg-red-500/5">
                    <h5 className="text-[10px] font-black uppercase text-red-600 mb-2">Weaknesses</h5>
                    <ul className="space-y-1">
                      {result.swot.weaknesses.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] font-medium flex items-start gap-1">
                          <span className="text-red-500">-</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border-r bg-blue-500/5">
                    <h5 className="text-[10px] font-black uppercase text-blue-600 mb-2">Opportunities</h5>
                    <ul className="space-y-1">
                      {result.swot.opportunities.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] font-medium flex items-start gap-1">
                          <span className="text-blue-500">⚡</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-500/5">
                    <h5 className="text-[10px] font-black uppercase text-orange-600 mb-2">Threats</h5>
                    <ul className="space-y-1">
                      {result.swot.threats.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] font-medium flex items-start gap-1">
                          <span className="text-orange-500">⚠️</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Counter-Play */}
            <Card className="border-primary/40 bg-primary/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary uppercase font-black tracking-tighter">
                  <Zap className="h-5 w-5 fill-primary" /> The Counter-Play Pivot
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">War Room Directives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-primary/70">Master Strategy</h4>
                  <p className="text-xl font-black leading-tight tracking-tight">{result.counter_play.the_pivot}</p>
                </div>
                <div className="p-4 rounded-xl bg-background border-2 border-primary/20 relative">
                  <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-black uppercase">Series Pitch</div>
                  <div className="pt-2 text-sm font-bold">
                    {typeof result.counter_play.content_series_concept === 'string' ? (
                      result.counter_play.content_series_concept
                    ) : (
                      <div className="space-y-1">
                        <span className="text-primary block">{result.counter_play.content_series_concept?.series_name || result.counter_play.content_series_concept?.name || 'Tactical Series'}</span>
                        <span className="text-muted-foreground font-normal block text-xs">{result.counter_play.content_series_concept?.pitch || result.counter_play.content_series_concept?.description || JSON.stringify(result.counter_play.content_series_concept)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-3 rounded-lg bg-muted/50 border flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Difficulty</span>
                    <span className="text-sm font-black text-primary">{result.counter_play.execution_difficulty}</span>
                  </div>
                  <div className="flex-[2] p-3 rounded-lg bg-primary/10 border-2 border-primary/20 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-primary">Status</span>
                    <span className="text-xs font-black animate-pulse">STRATEGY READY</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tactical Files: Asset Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <hr className="flex-1 border-muted-foreground/20" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Tactical Assets</h3>
              <hr className="flex-1 border-muted-foreground/20" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.suggested_assets.map((asset: any, i: number) => (
                <Card key={i} className="border-border hover:border-primary/50 transition-colors bg-card shadow-sm flex flex-col h-full group">
                  <CardHeader className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">{asset.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(asset.headline + "\n\n" + asset.script_outline)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-base font-black leading-tight group-hover:text-primary transition-colors cursor-pointer">{asset.headline}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4 flex-1">
                    <div className="space-y-2">
                      <h5 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Script Outline</h5>
                      <div className="text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
                        {Array.isArray(asset.script_outline) ? (
                          <ul className="list-disc pl-3 space-y-1">
                            {asset.script_outline.map((step: string, j: number) => (
                              <li key={j}>{step}</li>
                            ))}
                          </ul>
                        ) : (
                          asset.script_outline
                        )}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-muted/30 text-[10px] italic border-l-2 border-primary">
                      <span className="font-bold uppercase not-italic">Visual:</span> {asset.visual_vibe}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Alert className="bg-primary/5 border-primary/20 py-2">
                      <AlertTitle className="text-[10px] font-black uppercase flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Projection
                      </AlertTitle>
                      <AlertDescription className="text-[10px] text-primary leading-tight font-medium">
                        {asset.impact_prediction}
                      </AlertDescription>
                    </Alert>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/5 p-12 md:p-24 flex flex-col items-center justify-center text-center">
          <Radar className="h-12 w-12 md:h-16 md:w-16 text-primary/20 mb-4 md:mb-6" />
          <h3 className="text-lg md:text-xl font-bold tracking-tight">Scanner Ready</h3>
          <p className="text-muted-foreground max-w-xs mt-2 text-xs md:text-sm">
            Enter a handle or niche to reveal viral strategies from across the web.
          </p>
        </div>
      )}
    </div>
  )
}

// THE FIX: Note the trailing slash here matches your Forge setup exactly
export const Route = createFileRoute('/_authenticated/competitor-pulse/')({
  component: CompetitorPulsePage,
})