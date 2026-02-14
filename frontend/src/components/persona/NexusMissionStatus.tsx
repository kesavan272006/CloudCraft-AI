import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle, Terminal, Orbit } from "lucide-react"

interface Mission {
    id: string
    content: string
    platform: string
    scheduled_time: string
    status: 'scheduled' | 'auditing' | 'dispatched' | 'failed'
    persona_name?: string
}

export function NexusMissionStatus() {
    const [missions, setMissions] = useState<Mission[]>([])
    const [loading, setLoading] = useState(true)

    const fetchMissions = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/calendar/")
            const data = await response.json()
            setMissions(data.posts || [])
        } catch (error) {
            console.error("Failed to fetch missions", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMissions()
        const interval = setInterval(fetchMissions, 5000)
        return () => clearInterval(interval)
    }, [])

    if (missions.length === 0 && !loading) return null

    return (
        <div className="space-y-4 animate-in fade-in duration-700 mt-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Orbit className="h-5 w-5 text-primary animate-spin-slow" />
                    <h3 className="text-[10px] font-black text-foreground tracking-[0.2em] uppercase">Nexus Live Feed</h3>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary uppercase">
                    AWS EventBridge Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {missions.map((mission) => (
                    <Card key={mission.id} className="bg-background/40 backdrop-blur-md border-border/60 overflow-hidden group hover:border-primary/30 transition-colors">
                        <CardContent className="p-0">
                            <div className="flex items-center p-4 gap-4">
                                <div className={`p-2 rounded-lg ${mission.status === 'dispatched' ? 'bg-green-500/10 text-green-500' :
                                    mission.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                        mission.status === 'auditing' ? 'bg-primary/10 text-primary' :
                                            'bg-muted text-muted-foreground'
                                    }`}>
                                    {mission.status === 'auditing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                        mission.status === 'dispatched' ? <CheckCircle2 className="h-4 w-4" /> :
                                            mission.status === 'failed' ? <AlertCircle className="h-4 w-4" /> :
                                                <Terminal className="h-4 w-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-[11px] font-bold text-foreground truncate">
                                            {mission.platform} Adaption
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {new Date(mission.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate italic">
                                        "{mission.content}"
                                    </p>
                                </div>

                                <div className="text-right">
                                    <Badge variant="secondary" className={`text-[9px] font-black uppercase tracking-tighter ${mission.status === 'dispatched' ? 'bg-green-500/10 text-green-600 border-green-500/20 border' :
                                        mission.status === 'auditing' ? 'bg-primary/10 text-primary animate-pulse' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                        {mission.status}
                                    </Badge>
                                </div>
                            </div>

                            {mission.status === 'auditing' && (
                                <div className="h-0.5 w-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary animate-progress-line transition-all" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
