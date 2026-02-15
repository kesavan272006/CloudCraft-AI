import { Badge } from '@/components/ui/badge'
import { Rocket, Send, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ActivityFeed({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <Rocket className="h-10 w-10 text-muted-foreground opacity-20" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No active missions detected</p>
            </div>
        )
    }

    return (
        <div className='divide-y divide-border/30'>
            {activities.map((activity) => (
                <div key={activity.id} className='p-5 hover:bg-muted/30 transition-colors group cursor-pointer'>
                    <div className='flex items-start gap-4'>
                        <div className={cn(
                            "mt-1 p-2 rounded-lg transition-colors scale-90",
                            activity.status === 'dispatched' ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                        )}>
                            {activity.status === 'dispatched' ? <Send className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </div>
                        <div className='flex-1 space-y-1 overflow-hidden'>
                            <div className="flex items-center justify-between">
                                <p className='text-[11px] font-black uppercase tracking-tighter text-foreground truncate max-w-[180px]'>
                                    {activity.platform} Mission
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-bold text-muted-foreground">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        activity.status === 'dispatched' ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                                    )} />
                                </div>
                            </div>
                            <p className='text-[10px] text-muted-foreground leading-relaxed line-clamp-1 italic font-medium'>
                                "{activity.content}"
                            </p>
                            <div className="pt-1">
                                <Badge variant="outline" className={cn(
                                    "text-[8px] font-black px-1.5 py-0 h-4 uppercase",
                                    activity.status === 'dispatched' ? "border-emerald-500/20 text-emerald-600 bg-emerald-50/50" : "border-primary/20 text-primary bg-primary/5"
                                )}>
                                    {activity.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="p-4 bg-muted/20 text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Operations</button>
            </div>
        </div>
    )
}
