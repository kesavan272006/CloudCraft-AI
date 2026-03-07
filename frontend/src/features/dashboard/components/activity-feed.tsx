import { Badge } from '@/components/ui/badge'
import { Rocket, Send, Clock, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function ActivityFeed({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center p-12 text-center space-y-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative">
                    <motion.div 
                        className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Rocket className="h-10 w-10 text-muted-foreground relative z-10 opacity-50" />
                    </motion.div>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Awaiting Transmissions</p>
                <p className="text-[10px] text-muted-foreground/60 w-3/4">The orchestration engine hasn't recorded any dispatches yet.</p>
            </motion.div>
        )
    }

    return (
        <div className='relative'>
            {/* Continuous vertical timeline trace */}
            <div className="absolute left-7 top-0 bottom-12 w-0.5 bg-gradient-to-b from-border via-border/40 to-transparent z-0 hidden sm:block" />

            <div className='flex flex-col'>
                {activities.map((activity, index) => (
                    <motion.div 
                        key={activity.id} 
                        className='relative px-6 py-4 hover:bg-muted/20 transition-all duration-300 group cursor-pointer border-b border-border/20 last:border-0 z-10'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        whileHover={{ x: 4, backgroundColor: "rgba(var(--muted) / 0.3)" }}
                    >
                        <div className='flex items-start gap-4'>

                            {/* Icon Container with glowing orbit on hover */}
                            <div className="relative shrink-0 hidden sm:flex items-center justify-center w-9 h-9">
                                <motion.div 
                                    className={cn(
                                        "absolute inset-0 rounded-full blur-lg transition-opacity duration-500",
                                        activity.status === 'dispatched' ? "bg-emerald-500/30" : "bg-primary/30"
                                    )}
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1, scale: 1.3 }}
                                />
                                <motion.div 
                                    className={cn(
                                        "relative p-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300",
                                        activity.status === 'dispatched' ? "border-emerald-500/40 text-emerald-500" : "border-primary/40 text-primary"
                                    )}
                                    whileHover={{ scale: 1.15, rotate: 360 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {activity.status === 'dispatched' ? <Send className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                </motion.div>
                            </div>

                            {/* Mobile Icon */}
                            <motion.div 
                                className="sm:hidden mt-0.5 p-1.5 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm shrink-0"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                            >
                                {activity.status === 'dispatched' ? <Send className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-primary" />}
                            </motion.div>

                            <div className='flex-1 space-y-1 overflow-hidden'>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <motion.p 
                                            className='text-sm font-bold text-foreground tracking-tight'
                                            whileHover={{ x: 3 }}
                                        >
                                            {activity.platform} Operation
                                        </motion.p>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.08 + 0.15 }}
                                        >
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold px-2 py-0.5 h-5 uppercase tracking-widest border",
                                                activity.status === 'dispatched' 
                                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30" 
                                                    : "text-primary bg-primary/10 border-primary/30"
                                            )}>
                                                {activity.status}
                                            </Badge>
                                        </motion.div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <motion.div
                                            animate={activity.status === 'dispatched' ? {} : { scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <CircleDot className={cn(
                                                "h-2 w-2",
                                                activity.status === 'dispatched' ? "text-emerald-500 fill-emerald-500" : "text-amber-500 fill-amber-500"
                                            )} />
                                        </motion.div>
                                    </div>
                                </div>
                                <p className='text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 pr-4 font-medium'>
                                    {activity.content}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div 
                className="relative group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.button 
                    className="relative z-20 w-full py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-t border-border/20 bg-muted/5 hover:bg-muted/20"
                    whileHover={{ backgroundColor: "rgba(var(--primary) / 0.05)" }}
                    whileTap={{ scale: 0.99 }}
                >
                    Load Expanded Telemetry
                </motion.button>
            </motion.div>
        </div>
    )
}
