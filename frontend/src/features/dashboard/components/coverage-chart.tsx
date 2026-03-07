import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { useState } from 'react'

const VIBRANT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function CoverageChart({ data }: { data: any[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    
    if (!data || data.length === 0) return null;

    return (
        <motion.div 
            className='h-[350px] w-full relative'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple/5 rounded-xl blur-2xl"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                    <Pie
                        data={data}
                        cx='50%'
                        cy='50%'
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey='value'
                        stroke="none"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {data.map((_, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]}
                                style={{
                                    filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px currentColor)' : 'none',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-popover border border-border rounded-xl shadow-2xl backdrop-blur-xl p-3 min-w-[140px]">
                                        <p className="text-sm font-bold text-popover-foreground mb-1">
                                            {payload[0].name}
                                        </p>
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            Coverage: <span className="text-primary font-bold text-sm">{payload[0].value}%</span>
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
