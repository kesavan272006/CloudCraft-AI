import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Play,
    CheckCircle2,
    Cpu,
    BarChart3,
    Zap,
    ShieldAlert,
    Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/lib/api-config';

interface AutonomousAutoPilotProps {
    initialContent: string;
    onOptimize: (newContent: string) => void;
}

export const AutonomousAutoPilot: React.FC<AutonomousAutoPilotProps> = ({ initialContent, onOptimize }) => {
    const [status, setStatus] = useState<string>("READY");
    const [metrics, setMetrics] = useState<any>(null);
    const [prevMetrics, setPrevMetrics] = useState<any>(null);
    const [log, setLog] = useState<any[]>([]);
    const [pivot, setPivot] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [optimizedContent, setOptimizedContent] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const stopLoop = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsLive(false);
        setStatus("STOPPED");
        addLog("Loop manually stopped.", "warning");
    };

    const startLoop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Abort any existing stream
        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        setIsLive(true);
        setStatus("INITIALIZING");
        setLog([]);
        setPivot(null);
        setOptimizedContent(null);

        const url = `${API_BASE_URL}/api/v1/forge/autopilot/stream?content=${encodeURIComponent(initialContent)}`;

        (async () => {
            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: { 'Accept': 'text/event-stream' }
                });
                if (!response.ok || !response.body) {
                    setIsLive(false);
                    setStatus("FAILED");
                    return;
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                handleEvent(data);
                            } catch { /* ignore malformed */ }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('Autopilot stream error:', err);
                    setStatus("FAILED");
                    addLog(`Stream error: ${err.message}`, "warning");
                }
            } finally {
                setIsLive(false);
            }
        })();
    };

    const handleEvent = (data: any) => {
        const { event, data: payload } = data;
        switch (event) {
            case 'autopilot_start': setStatus("INITIALIZING"); break;
            case 'autopilot_step':
                setStatus(payload.step);
                addLog(payload.message, "info");
                break;
            case 'autopilot_metrics':
                setMetrics((current: any) => {
                    setPrevMetrics(current); // save old value before updating
                    return payload;
                });
                break;
            case 'autopilot_pivot':
                setPivot(payload.fix);
                addLog(`Pivot: ${payload.reason}`, "warning");
                break;
            case 'autopilot_complete':
                abortRef.current?.abort(); abortRef.current = null;
                setStatus("STABLE");
                setIsLive(false);
                if (payload.final_content) { setOptimizedContent(payload.final_content); onOptimize(payload.final_content); }
                addLog("Cycle complete — loop terminated.", "success");
                break;
            case 'stream_done':
                // Redundant safety: ensure connection is closed after terminal signal
                abortRef.current?.abort(); abortRef.current = null;
                setIsLive(false);
                break;
            case 'error':
                abortRef.current?.abort(); abortRef.current = null;
                setStatus("FAILED");
                setIsLive(false);
                addLog(`Error: ${payload.message}`, "warning");
                break;
        }
    };

    const addLog = (msg: string, type: 'info' | 'warning' | 'success') => {
        setLog(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    return (
        <Card className="border-border bg-card rounded-xl shadow-sm overflow-hidden">
            {/* Compact header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-orange-500/[0.04]">
                <div className="flex items-center gap-2.5">
                    <div className="relative w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                        <Cpu className="w-3.5 h-3.5 text-orange-500" />
                        {isLive && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full border-[1.5px] border-background animate-pulse" />}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground">Campaign AutoPilot</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Self-optimizing content engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                        "text-[10px] font-medium h-5 px-2",
                        status === "STABLE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" :
                            status === "READY" || status === "STOPPED" ? "bg-secondary/80 text-muted-foreground border-border" :
                                "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse dark:text-orange-400"
                    )}>
                        {status}
                    </Badge>
                    {!isLive && (status === "READY" || status === "STOPPED" || status === "FAILED") && (
                        <Button onClick={startLoop} size="sm"
                            className="h-7 px-3 text-[11px] font-semibold bg-orange-500 hover:bg-orange-600 text-white gap-1">
                            <Play className="w-2.5 h-2.5 fill-current" />Run
                        </Button>
                    )}
                    {isLive && (
                        <Button variant="ghost" size="sm" onClick={stopLoop}
                            className="h-7 px-2.5 text-[11px] text-destructive hover:bg-destructive/10 gap-1">
                            <Square className="w-2.5 h-2.5 fill-current" />Stop
                        </Button>
                    )}
                </div>
            </div>

            {/* Performance metrics — compact 2×2 grid */}
            <div className="px-4 pt-3 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                    <BarChart3 className="w-3 h-3" />Metrics
                </p>
                {metrics ? (
                    <div className="grid grid-cols-2 gap-2">
                        <MetricBox label="Reach" value={metrics.metrics.reach} prev={prevMetrics?.metrics?.reach} />
                        <MetricBox label="Engagement" value={metrics.metrics.likes} prev={prevMetrics?.metrics?.likes} />
                        <MetricBox label="Score" value={`${metrics.score}%`} prev={prevMetrics?.score ? `${prevMetrics.score}%` : undefined} />
                        <MetricBox
                            label="Est. Lift"
                            value={prevMetrics?.metrics?.reach && metrics.metrics.reach
                                ? `${(metrics.metrics.reach / prevMetrics.metrics.reach).toFixed(1)}×`
                                : '—'}
                            isStat
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-4 opacity-30">
                        <Activity className="w-4 h-4 animate-pulse text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Waiting for loop...</p>
                    </div>
                )}
            </div>

            {/* Pivot alert — only when present */}
            {pivot && (
                <div className="mx-4 mb-2 p-2.5 bg-orange-500/5 rounded-lg border border-orange-500/20 flex items-start gap-2">
                    <Zap className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Strategic Pivot</p>
                        <p className="text-[11px] text-foreground/80 italic mt-0.5">"{pivot}"</p>
                    </div>
                </div>
            )}

            {/* Log — scrollable, compact */}
            <div className="border-t border-border/50">
                <div className="px-4 py-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Action Log</p>
                </div>
                <ScrollArea className="h-[90px]">
                    <div className="px-4 pb-3 space-y-1">
                        {log.length === 0 ? (
                            <div className="flex items-center justify-center py-3 opacity-30">
                                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                            </div>
                        ) : log.map((entry, i) => (
                            <div key={i} className="flex items-baseline gap-2">
                                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1",
                                    entry.type === 'warning' ? "bg-orange-500" :
                                        entry.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                                )} />
                                <p className="text-[11px] text-foreground/80 leading-relaxed flex-1">{entry.msg}</p>
                                <span className="text-[9px] text-muted-foreground font-mono shrink-0">{entry.time}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Optimized output — only when complete */}
            {optimizedContent && (
                <div className="border-t border-emerald-500/20 bg-emerald-500/[0.03]">
                    <div className="px-4 py-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Optimized Output Ready</p>
                    </div>
                    <ScrollArea className="max-h-[120px]">
                        <p className="px-4 pb-3 text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{optimizedContent.slice(0, 400)}{optimizedContent.length > 400 ? '…' : ''}</p>
                    </ScrollArea>
                </div>
            )}
        </Card>
    );
};

const MetricBox = ({ label, value, prev, isStat }: { label: string; value: any; prev?: any; isStat?: boolean }) => {
    const isUp = prev ? parseFloat(value) > parseFloat(prev) : true;
    return (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 border border-border/30">
            <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-1.5">
                <span className={cn("text-xs font-bold", isStat ? "text-orange-500" : "text-foreground")}>
                    {value}
                </span>
                {prev && (
                    <span className={cn("text-[9px] flex items-center font-semibold",
                        isUp ? "text-emerald-500" : "text-red-500")}>
                        {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    </span>
                )}
            </div>
        </div>
    );
};
