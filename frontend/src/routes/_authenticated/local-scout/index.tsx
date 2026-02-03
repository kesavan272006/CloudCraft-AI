import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Compass, 
  Loader2, 
  Radio, 
  MessageSquare,
  Globe,
  Zap,
  Flame,
  Lightbulb,
  Hash
} from "lucide-react"

// Types for our new JSON structure
interface ViralHook {
  title: string
  description: string
}

interface ScoutInsights {
  local_vibe: string
  viral_hooks: ViralHook[]
  strategic_recommendation: string
  sentiment_score: number
  trending_hashtags: string[]
}

export default function LocalScoutPage() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [city, setCity] = useState<string>("Locating base...")
  const [insights, setInsights] = useState<ScoutInsights | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          setLocation({ lat: latitude, lng: longitude })
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await res.json()
            const cityName = data.address.city || data.address.town || data.address.village || "Kerala Region"
            setCity(cityName)
          } catch (e) {
            setCity("Unknown Area")
          }
        },
        () => setCity("GPS Access Denied")
      )
    }
  }, [])

  const runScout = async () => {
    if (!location) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/scout/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, lat: location.lat, lng: location.lng }),
      })
      const data = await response.json()
      setInsights(data.insights)
    } catch (err) {
      console.error("Scout failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-10 bg-background text-foreground overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/20">
            <Radio className={`h-7 w-7 text-primary ${loading ? 'animate-ping' : ''}`} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic md:text-3xl">Local Agent Scout</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1 font-medium">
              <MapPin className="h-4 w-4 text-red-500" /> ACTIVE RADIUS: <span className="text-primary">{city}</span>
            </p>
          </div>
        </div>
        <Button onClick={runScout} disabled={loading || !location} size="lg" className="h-14 px-8 font-bold shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Compass className="mr-2 h-5 w-5" />}
          DEPLOY SCANNER
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Status and Metadata */}
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> System Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border">
                <span className="text-xs font-bold uppercase">GPS Lock</span>
                <Badge variant={location ? "default" : "outline"} className={location ? "bg-green-500" : ""}>
                  {location ? "CONNECTED" : "WAITING"}
                </Badge>
              </div>
              {insights && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                   <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                     <span>Regional Sentiment</span>
                     <span>{insights.sentiment_score}%</span>
                   </div>
                   <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${insights.sentiment_score}%` }} />
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          {insights?.trending_hashtags && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" /> Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {insights.trending_hashtags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-none">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Intel Report */}
        <div className="lg:col-span-2 space-y-6">
          {!insights && !loading ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl opacity-40">
              <Compass className="h-20 w-20 mb-4 animate-slow-spin" />
              <p className="font-bold uppercase tracking-widest text-sm">Waiting for Agent Deployment...</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-xl font-black uppercase italic">Nemotron is Thinking...</p>
                <p className="text-muted-foreground text-sm">Scanning Reddit and local news for {city}...</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 space-y-6">
              {/* Local Vibe Card */}
              <Card className="border-l-4 border-l-primary shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Flame className="h-6 w-6 text-orange-500" /> The Local Vibe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium leading-relaxed italic text-foreground/80">
                    "{insights?.local_vibe}"
                  </p>
                </CardContent>
              </Card>

              {/* Viral Hooks Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {insights?.viral_hooks.map((hook, idx) => (
                  <Card key={idx} className="bg-muted/30 border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Zap className="h-12 w-12" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-black uppercase text-primary">Hook #0{idx + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <h4 className="font-bold mb-1">{hook.title}</h4>
                      <p className="text-xs text-muted-foreground leading-snug">{hook.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strategy Recommendation */}
              <Card className="bg-primary text-primary-foreground shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="h-6 w-6" /> Mission Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold leading-tight">
                    {insights?.strategic_recommendation}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase opacity-70">
                    <MessageSquare className="h-3 w-3" /> Agent Note: Post during local peak hours.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/local-scout/')({
  component: LocalScoutPage,
})