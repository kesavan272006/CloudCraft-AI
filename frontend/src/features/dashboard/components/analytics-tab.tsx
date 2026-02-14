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

const PRIMARY_COLOR = '#6366f1' // Indigo-500
const CHART_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

export function AnalyticsTab() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/dashboard/analytics')
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
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-500">
            {/* PERFORMANCE TREND */}
            <Card className="border-border/40 shadow-xl overflow-hidden bg-card/30">
                <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> Performance Index
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/60">Weekly viral score trending</CardDescription>
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
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
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

            {/* PLATFORM ENGAGEMENT */}
            <Card className="border-border/40 shadow-xl overflow-hidden bg-card/30">
                <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" /> Reach Analytics
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/60">Avg. Engagement by Platform</CardDescription>
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
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
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
        </div>
    )
}
