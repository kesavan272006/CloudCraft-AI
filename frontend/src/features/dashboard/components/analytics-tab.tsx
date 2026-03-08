import { useState, useEffect } from 'react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, BarChart3, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '@/lib/api-config'

const PRIMARY_COLOR = '#6366f1' // Indigo-500
const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

export function AnalyticsTab() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/analytics`)
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (e) {
                console.error("Analytics fetch failed")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <motion.div 
                className="flex h-[400px] items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-8 w-8 text-primary opacity-20" />
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div 
            className="grid gap-6 md:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* PERFORMANCE TREND */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                    {/* Premium glow */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 blur-lg rounded-lg transition-opacity duration-500 pointer-events-none" />
                    
                    <CardHeader className="border-b border-border/30 px-6 pt-5 pb-4 relative z-10">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                            <TrendingUp className="h-5 w-5 text-primary drop-shadow-lg" /> Performance Index
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold mt-1.5 text-muted-foreground">Weekly viral score trending</CardDescription>
                    </CardHeader>
                <CardContent className="pt-8">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.trending}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-popover border border-border rounded-xl shadow-2xl backdrop-blur-xl p-3 min-w-[140px]">
                                                    <p className="text-sm font-bold text-popover-foreground mb-1">
                                                        {payload[0].payload.name}
                                                    </p>
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Viral Score: <span className="text-primary font-bold text-sm">{payload[0].value}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke={PRIMARY_COLOR}
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: PRIMARY_COLOR, strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
                </Card>
            </motion.div>

            {/* PLATFORM ENGAGEMENT */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-amber-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                    {/* Premium glow */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 hover:opacity-100 blur-lg rounded-lg transition-opacity duration-500 pointer-events-none" />
                    
                    <CardHeader className="border-b border-border/30 px-6 pt-5 pb-4 relative z-10">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2.5">
                            <BarChart3 className="h-5 w-5 text-primary drop-shadow-lg" /> Reach Analytics
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold mt-1.5 text-muted-foreground">Avg. Engagement by Platform</CardDescription>
                    </CardHeader>
                <CardContent className="pt-8">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.platform_performance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#888888' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        color: 'hsl(var(--popover-foreground))',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)',
                                        backdropFilter: 'blur(20px)',
                                        padding: '0'
                                    }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-popover border border-border rounded-xl shadow-2xl backdrop-blur-xl p-3 min-w-[140px]">
                                                    <p className="text-sm font-bold text-popover-foreground mb-1">
                                                        {payload[0].payload.name}
                                                    </p>
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Engagement: <span className="text-primary font-bold text-sm">{payload[0].value?.toLocaleString()}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="engagement" radius={[6, 6, 0, 0]}>
                                    {data?.platform_performance.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
