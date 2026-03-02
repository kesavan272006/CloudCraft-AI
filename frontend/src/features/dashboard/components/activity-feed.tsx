import { Badge } from '@/components/ui/badge'
import { Rocket, Send, Clock, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ActivityFeed({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Rocket className="h-10 w-10 text-muted-foreground relative z-10 opacity-50" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Awaiting Transmissions</p>
                <p className="text-[10px] text-muted-foreground/60 w-3/4">The orchestration engine hasn't recorded any dispatches yet.</p>
            </div>
        )
    }

    return (
        <div className='relative'>
            {/* Continuous vertical timeline trace */}
            <div className="absolute left-8 top-0 bottom-12 w-[2px] bg-gradient-to-b from-border via-border/50 to-transparent z-0 hidden sm:block" />

            <div className='flex flex-col'>
                {activities.map((activity) => (
                    <div key={activity.id} className='relative p-5 hover:bg-muted/30 transition-colors group cursor-pointer border-b border-border/30 last:border-0 z-10'>
                        <div className='flex items-start gap-5'>

                            {/* Icon Container with glowing orbit on hover */}
                            <div className="relative shrink-0 hidden sm:flex items-center justify-center w-10 h-10">
                                <div className={cn(
                                    "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500",
                                    activity.status === 'dispatched' ? "bg-emerald-500/40" : "bg-primary/40"
                                )} />
                                <div className={cn(
                                    "relative p-2.5 rounded-full border bg-background shadow-sm transition-transform duration-300 group-hover:scale-110",
                                    activity.status === 'dispatched' ? "border-emerald-500/30 text-emerald-500" : "border-primary/30 text-primary"
                                )}>
                                    {activity.status === 'dispatched' ? <Send className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                            </div>

                            {/* Mobile Icon */}
                            <div className="sm:hidden mt-1 p-2 rounded-full border bg-background shadow-sm shrink-0">
                                {activity.status === 'dispatched' ? <Send className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-primary" />}
                            </div>

                            <div className='flex-1 space-y-1.5 overflow-hidden'>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <p className='text-[13px] font-semibold text-foreground tracking-tight'>
                                            {activity.platform} Operation
                                        </p>
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-bold px-1.5 py-0 h-4 uppercase tracking-widest border-transparent bg-secondary",
                                            activity.status === 'dispatched' ? "text-emerald-500 bg-emerald-500/10" : "text-primary bg-primary/10"
                                        )}>
                                            {activity.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <CircleDot className={cn(
                                            "h-2 w-2",
                                            activity.status === 'dispatched' ? "text-emerald-500 fill-emerald-500" : "text-amber-500 fill-amber-500 animate-pulse"
                                        )} />
                                    </div>
                                </div>
                                <p className='text-[12px] text-muted-foreground leading-relaxed line-clamp-2 pr-6'>
                                    {activity.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative p-0 group">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10 h-full w-full opacity-0" />
                <button className="relative z-20 w-full p-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors border-t border-border/30 bg-muted/10 group-hover:bg-muted/30">
                    Load Expanded Telemetry
                </button>
            </div>
        </div>
    )
}
