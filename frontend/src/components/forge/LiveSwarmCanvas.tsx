import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    PenTool,
    Layout,
    ShieldCheck,
    Sparkles,
    Loader2,
    Network,
    Zap,
    Terminal,
    CheckCircle2,
    X
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/lib/api-config';

interface LiveSwarmCanvasProps {
    prompt: string;
    onComplete: (result: any) => void;
    onCancel: () => void;
}

const AGENT_CONFIG: Record<string, { icon: React.ReactNode; color: string; accent: string; phase: string }> = {
    Researcher: {
        icon: <Search className="w-4 h-4" />,
        color: 'text-sky-500',
        accent: 'bg-sky-500/10 border-sky-500/20',
        phase: 'Intelligence Gathering'
    },
    Copywriter: {
        icon: <PenTool className="w-4 h-4" />,
        color: 'text-violet-500',
        accent: 'bg-violet-500/10 border-violet-500/20',
        phase: 'Narrative Architecture'
    },
    Designer: {
        icon: <Layout className="w-4 h-4" />,
        color: 'text-pink-500',
        accent: 'bg-pink-500/10 border-pink-500/20',
        phase: 'Visual Hierarchy'
    },
    Compliance: {
        icon: <ShieldCheck className="w-4 h-4" />,
        color: 'text-emerald-500',
        accent: 'bg-emerald-500/10 border-emerald-500/20',
        phase: 'Quality Assurance'
    },
};

export const LiveSwarmCanvas: React.FC<LiveSwarmCanvasProps> = ({ prompt, onComplete, onCancel }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [activeAgent, setActiveAgent] = useState<string | null>(null);
    const [agentStreams, setAgentStreams] = useState<Record<string, string>>({
        Researcher: '', Copywriter: '', Designer: '', Compliance: ''
    });
    const [isGenerating, setIsGenerating] = useState(true);
    const canvasEndRef = useRef<HTMLDivElement>(null);

    const abortRef = useRef<AbortController | null>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const controller = new AbortController();
        abortRef.current = controller;

        const url = `${API_BASE_URL}/api/v1/forge/stream?prompt=${encodeURIComponent(prompt)}`;

        (async () => {
            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: { 'Accept': 'text/event-stream' }
                });
                if (!response.ok || !response.body) {
                    setIsGenerating(false);
                    return;
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    // Parse SSE lines from buffer
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
                    console.error('Forge stream error:', err);
                }
            } finally {
                setIsGenerating(false);
            }
        })();

        return () => {
            controller.abort();
            abortRef.current = null;
        };
    }, []); // empty deps: fire exactly once on mount

    const handleEvent = (data: any) => {
        const { event, data: payload } = data;
        switch (event) {
            case 'agent_start': setActiveAgent(payload.agent); break;
            case 'agent_chunk':
                setAgentStreams(prev => ({ ...prev, [payload.agent]: prev[payload.agent] + payload.chunk }));
                break;
            case 'agent_complete': setActiveAgent(null); break;
            case 'error':
                setIsGenerating(false);
                // Abort the fetch (no-op if already done)
                abortRef.current?.abort();
                setTimeout(() => onCancel(), 3000);
                break;
            case 'aws_telemetry':
                // Handled implicitly by pushing to events array
                break;
            case 'workflow_complete':
                setIsGenerating(false);
                onComplete(payload);
                // Abort so fetch reader stops (stream is done)
                abortRef.current?.abort();
                break;
        }
        setEvents(prev => [...prev, data]);
    };

    useEffect(() => {
        if (isGenerating) {
            canvasEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [agentStreams, isGenerating]);

    const completedAgents = events.filter(e => e.event === 'agent_complete').map(e => e.data.agent);
    const progress = (completedAgents.length / 4) * 100;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header Status Bar */}
            <Card className="border-border bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Network className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Swarm Pipeline Active</h3>
                            <p className="text-xs text-muted-foreground">{completedAgents.length} of 4 agents completed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Agent avatar chips */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            {Object.entries(AGENT_CONFIG).map(([name, cfg]) => {
                                const isDone = completedAgents.includes(name);
                                const isActive = activeAgent === name;
                                return (
                                    <div key={name} title={name} className={cn(
                                        "w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-300",
                                        isActive ? cn(cfg.accent, "ring-2 ring-offset-1 ring-offset-background ring-primary/40 scale-110") :
                                            isDone ? "bg-secondary/50 border-border/50 opacity-40" : "bg-secondary/30 border-border/30 opacity-60"
                                    )}>
                                        <span className={cn("w-3.5 h-3.5", isActive ? cfg.color : "text-muted-foreground")}>
                                            {cfg.icon}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {isGenerating && (
                            <Badge variant="outline" className="gap-1.5 bg-primary/5 text-primary border-primary/20 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Live
                            </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={onCancel}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-0.5 w-full bg-border/50 relative">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: isGenerating ? `${Math.max(progress, 10)}%` : '100%' }}
                    />
                </div>
            </Card>

            {/* Main Grid: Sidebar + Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Sidebar: Agent Event Log */}
                <Card className="lg:col-span-3 border-border bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="px-4 py-3 border-b border-border/50">
                        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" /> Agent Log
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="h-[420px]">
                        <div className="p-3 space-y-2">
                            {events.map((ev, i) => {
                                if (ev.event === 'agent_start') {
                                    const cfg = AGENT_CONFIG[ev.data.agent];
                                    return (
                                        <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg bg-secondary/30 animate-in slide-in-from-left duration-300">
                                            <div className={cn("w-6 h-6 rounded-md border flex items-center justify-center shrink-0", cfg?.accent)}>
                                                <span className={cn("w-3 h-3", cfg?.color)}>{cfg?.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold">{ev.data.agent}</p>
                                                <p className="text-[10px] text-muted-foreground">{cfg?.phase}</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (ev.event === 'agent_complete') {
                                    return (
                                        <div key={i} className="flex items-center gap-2 py-1 px-2 opacity-50">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="text-xs text-muted-foreground">{ev.data.agent} complete</span>
                                        </div>
                                    );
                                }
                                if (ev.event === 'aws_telemetry') {
                                    return (
                                        <div key={i} className="flex flex-col gap-1.5 py-2 px-3 rounded-md bg-stone-950 border border-orange-500/30 animate-in slide-in-from-left duration-300 shadow-[0_0_15px_rgba(249,115,22,0.1)] mt-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Terminal className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-[10px] font-mono text-orange-400 font-bold tracking-widest uppercase">AWS {ev.data.service} Engine</span>
                                            </div>
                                            <p className="text-[11px] font-mono text-stone-300 leading-snug">{ev.data.message}</p>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            {activeAgent && (
                                <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-primary/5 border border-primary/20 animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                                    <span className="text-xs font-medium text-primary">{activeAgent} active...</span>
                                </div>
                            )}
                            {events.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-32 text-center opacity-40">
                                    <Zap className="w-6 h-6 mb-2 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Initializing swarm...</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Canvas: Streaming Content */}
                <Card className="lg:col-span-9 border-border bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden">
                    <CardHeader className="px-5 py-3 border-b border-border/50">
                        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" /> Synthesis Canvas
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="h-[420px]">
                        <CardContent className="p-5 space-y-6">
                            {/* Researcher */}
                            {agentStreams["Researcher"] && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                            <Search className="w-3 h-3 text-sky-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phase 01 · Intelligence</span>
                                        <div className="h-px flex-1 bg-border/50" />
                                    </div>
                                    <div className="text-sm leading-relaxed text-foreground/90 bg-secondary/20 rounded-lg p-4 border border-border/40">
                                        <ReactMarkdown>{agentStreams["Researcher"]}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Copywriter */}
                            {agentStreams["Copywriter"] && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                            <PenTool className="w-3 h-3 text-violet-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phase 02 · Narrative</span>
                                        <div className="h-px flex-1 bg-border/50" />
                                    </div>
                                    <div className="text-sm leading-relaxed text-foreground/90 bg-secondary/20 rounded-lg p-4 border border-border/40">
                                        <ReactMarkdown>{agentStreams["Copywriter"]}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Designer */}
                            {agentStreams["Designer"] && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-md bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                                            <Layout className="w-3 h-3 text-pink-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phase 03 · Visual</span>
                                        <div className="h-px flex-1 bg-border/50" />
                                    </div>
                                    <div className="text-sm leading-relaxed text-foreground/90 bg-secondary/20 rounded-lg p-4 border border-border/40">
                                        <ReactMarkdown>{agentStreams["Designer"]}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Compliance */}
                            {agentStreams["Compliance"] && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phase 04 · Compliance</span>
                                        <div className="h-px flex-1 bg-border/50" />
                                    </div>
                                    <div className="text-sm leading-relaxed text-foreground/90 bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
                                        <ReactMarkdown>{agentStreams["Compliance"]}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {Object.values(agentStreams).every(s => s === '') && (
                                <div className="flex flex-col items-center justify-center h-60 text-center opacity-40 space-y-3">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-muted-foreground animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Swarm initializing</p>
                                        <p className="text-xs text-muted-foreground mt-1">Agents are warming up...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={canvasEndRef} className="h-2" />
                        </CardContent>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    );
};
