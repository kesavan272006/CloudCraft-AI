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
  Clock,
  Lightbulb,
  ShieldCheck,
  Loader2,
  Instagram,
  Zap,
  Check,
  Copy
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from 'sonner'

export default function CompetitorPulsePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Strategy copied!")
    setTimeout(() => setCopied(false), 2000)
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
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Summary Hero */}
          <Card className="border-primary/20 bg-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Instagram className="h-24 w-24" />
            </div>
            <CardHeader className="p-4 md:p-6 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Competitor Audit</Badge>
                <CardTitle className="text-sm md:text-xl font-black">{result.competitor_handle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-xl leading-relaxed font-medium text-foreground/80">
                {result.summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Winning Patterns */}
            <Card className="border-border shadow-md hover:shadow-lg transition-shadow bg-card/50">
              <CardHeader className="p-4 bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary uppercase tracking-wider font-black">
                  <TrendingUp className="h-4 w-4" /> Winning Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" /> Top Hooks
                  </h4>
                  <div className="space-y-2">
                    {result.winning_patterns.hooks.map((hook: string, i: number) => (
                      <div key={i} className="text-xs p-2 rounded bg-muted/50 border border-border/50 italic">
                        "{hook}"
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Visual Style</h4>
                    <p className="text-xs text-foreground/70">{result.winning_patterns.visuals}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Psychology</h4>
                    <p className="text-xs text-foreground/70">{result.winning_patterns.engagement_triggers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Counter-Play */}
            <Card className="border-primary/30 shadow-md hover:shadow-lg transition-all bg-primary/[0.02] scale-[1.02] ring-1 ring-primary/20">
              <CardHeader className="p-4 bg-primary/10 border-b">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary uppercase tracking-wider font-black">
                  <Radar className="h-4 w-4" /> The Counter-Play
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="text-[10px] uppercase font-bold text-primary mb-1">The Pivot (Our Edge)</h4>
                  <p className="text-sm font-semibold">{result.counter_play.the_pivot}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Suggested Content Idea</h4>
                  <p className="text-xs leading-relaxed">{result.counter_play.suggested_content_idea}</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded border bg-background">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Focus Metric</span>
                  <Badge variant="secondary" className="font-black text-primary uppercase">{result.counter_play.target_metric}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Assets */}
            <Card className="border-border shadow-md hover:shadow-lg transition-shadow bg-card/50">
              <CardHeader className="p-4 bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base text-foreground uppercase tracking-wider font-black">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Asset Drafts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 overflow-y-auto max-h-[400px] space-y-6">
                {result.suggested_assets.map((asset: any, i: number) => (
                  <div key={i} className="space-y-3 p-3 rounded-lg border bg-background/50 relative group">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold">{asset.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(asset.caption)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Caption</h4>
                      <p className="text-xs italic leading-relaxed">"{asset.caption}"</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Visual Concept</h4>
                      <p className="text-[11px] text-foreground/70">{asset.visual_description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1 text-[9px]">
                      {asset.hashtags.map((tag: string) => (
                        <span key={tag} className="text-primary font-medium">#{tag.replace('#', '')}</span>
                      ))}
                    </div>
                    {i < result.suggested_assets.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
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