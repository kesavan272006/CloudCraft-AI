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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <Card className="md:col-span-2 lg:col-span-3 border-primary/20 bg-primary/5">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm md:text-base">Strategy Summary: {result.competitor_handle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-lg leading-relaxed italic font-medium">
                "{result.summary}"
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center justify-between text-sm md:text-base text-primary">
                <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Suggestion</div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(result.suggestions.caption)}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg border text-xs md:text-sm leading-relaxed">
                {result.suggestions.caption}
              </div>
              <div className="flex flex-wrap gap-1">
                {result.suggestions.hashtags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-[9px]">#{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <TrendingUp className="h-4 w-4" /> Visual & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 text-xs md:text-sm">
              <p className="leading-relaxed"><span className="font-bold">Visual Idea:</span> {result.suggestions.visual_idea}</p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 font-bold">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Best Time</span>
                <span className="text-primary">{result.suggestions.best_time_to_post}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base text-primary">
                <ShieldCheck className="h-4 w-4" /> Strategy Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 text-xs md:text-sm">
              <p><span className="font-bold">Why it works:</span> {result.suggestions.why_it_works}</p>
              <Badge className="w-full justify-center py-1 text-[9px] uppercase font-black" variant="outline">
                {result.suggestions.compliance_note}
              </Badge>
            </CardContent>
          </Card>
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