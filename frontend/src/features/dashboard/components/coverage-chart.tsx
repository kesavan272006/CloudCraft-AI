import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'

const VIBRANT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function CoverageChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return null;

    return (
        <div className='h-[350px] w-full'>
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
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
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
        </div>
    )
}
