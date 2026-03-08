import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    MessageSquare, Users, Square,
    CheckCircle2, Sparkles, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/lib/api-config';

interface DigitalFocusGroupProps {
    content: string;
    /** sessionKey ties this instance's results to a specific forge session */
    sessionKey?: string;
}

const STORAGE_KEY = 'forge_focus_group_v1';

function loadStored(key: string): { reactions: any[]; isComplete: boolean } | null {
    try {
        const raw = sessionStorage.getItem(`${STORAGE_KEY}__${key}`);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveStored(key: string, data: { reactions: any[]; isComplete: boolean }) {
    try { sessionStorage.setItem(`${STORAGE_KEY}__${key}`, JSON.stringify(data)); }
    catch { /* quota */ }
}

function clearStored(key: string) {
    try { sessionStorage.removeItem(`${STORAGE_KEY}__${key}`); }
    catch { /* ignore */ }
}

export const DigitalFocusGroup: React.FC<DigitalFocusGroupProps> = ({ content, sessionKey }) => {
    const storageKey = sessionKey || content.slice(0, 64); // use first 64 chars of content as key if no sessionKey

    // Restore from sessionStorage on first mount so navigation-away-and-back doesn't re-run
    const stored = useRef(loadStored(storageKey));

    const [reactions, setReactions] = useState<any[]>(stored.current?.reactions ?? []);
    const [isAssembling, setIsAssembling] = useState(!stored.current);
    const [isThinking, setIsThinking] = useState<Record<string, boolean>>({});
    const [isComplete, setIsComplete] = useState(stored.current?.isComplete ?? false);
    const [hasRun, setHasRun] = useState(!!stored.current); // true if we already ran (or restored)

    const abortRef = useRef<AbortController | null>(null);
    const streamingRef = useRef(false);

    const startStream = useCallback(() => {
        if (streamingRef.current || !content) return;
        streamingRef.current = true;

        setIsComplete(false);
        setReactions([]);
        setIsAssembling(true);
        setIsThinking({});
        setHasRun(true);
        clearStored(storageKey);

        const controller = new AbortController();
        abortRef.current = controller;

        const url = `${API_BASE_URL}/api/v1/forge/focus-group/stream?content=${encodeURIComponent(content)}`;

        (async () => {
            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: { 'Accept': 'text/event-stream' }
                });
                if (!response.ok || !response.body) {
                    setIsComplete(true);
                    streamingRef.current = false;
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
                // Natural completion — allow future rerun if needed
                streamingRef.current = false;
                setIsComplete(true);
                setIsThinking({});
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    // Intentional abort (unmount/stop) — do NOT reset streamingRef
                    // so a StrictMode remount can't accidentally restart the stream
                    return;
                }
                console.error('Focus group stream error:', err);
                streamingRef.current = false;
                setIsComplete(true);
                setIsThinking({});
            }
        })();
    }, [content, storageKey]);

    // Auto-start ONLY if there's no stored result from a previous run
    useEffect(() => {
        if (!content || stored.current) return;
        startStream();
        return () => {
            // On unmount: abort fetch, but DON'T clear stored results
            abortRef.current?.abort();
            abortRef.current = null;
        };
    }, []); // empty deps — fires once on mount

    const handleEvent = (data: any) => {
        const { event, data: payload } = data;
        switch (event) {
            case 'focus_group_start':
                setIsAssembling(false);
                break;
            case 'persona_thinking':
                setIsThinking(prev => ({ ...prev, [payload.name]: true }));
                break;
            case 'persona_reaction':
                setIsThinking(prev => ({ ...prev, [payload.name]: false }));
                setReactions(prev => {
                    const next = [...prev, payload];
                    saveStored(storageKey, { reactions: next, isComplete: false });
                    return next;
                });
                break;
            case 'focus_group_complete':
            case 'stream_done':
                // Abort the fetch reader (stream is done)
                abortRef.current?.abort();
                abortRef.current = null;
                streamingRef.current = false;
                setIsComplete(true);
                setIsThinking({});
                setReactions(prev => {
                    saveStored(storageKey, { reactions: prev, isComplete: true });
                    return prev;
                });
                break;
            case 'error':
                abortRef.current?.abort();
                abortRef.current = null;
                streamingRef.current = false;
                setIsComplete(true);
                setIsThinking({});
                break;
        }
    };

    const stopSimulation = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        streamingRef.current = false;
        setIsComplete(true);
        setIsThinking({});
    };

    const rerun = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        streamingRef.current = false;
        stored.current = null;
        startStream();
    };

    const anyThinking = Object.values(isThinking).some(Boolean);

    return (
        <Card className="border-border bg-card rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground">Audience Focus Group</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">Synthetic persona reactions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isComplete && (
                        <Button variant="ghost" size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
                            onClick={rerun} title="Re-run focus group">
                            <RefreshCw className="w-3 h-3" />
                        </Button>
                    )}
                    {!isComplete && hasRun && (
                        <Button variant="ghost" size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive rounded-md"
                            onClick={stopSimulation}>
                            <Square className="w-3 h-3 fill-current" />
                        </Button>
                    )}
                    <Badge variant="outline" className={cn(
                        "text-[10px] font-medium h-5 px-2",
                        isComplete
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                            : "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400 animate-pulse"
                    )}>
                        {isComplete ? 'Done' : hasRun ? 'Live' : 'Ready'}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[320px]">
                <div className="p-4 space-y-3">
                    {/* Assembling state */}
                    {isAssembling && hasRun && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3 opacity-60">
                            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-violet-500 animate-pulse" />
                            </div>
                            <p className="text-xs text-muted-foreground">Recruiting personas...</p>
                        </div>
                    )}

                    {/* Not yet run (no stored results, auto-start is delayed) */}
                    {!hasRun && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-violet-500" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Starting focus group...</p>
                        </div>
                    )}

                    {/* Reactions */}
                    {reactions.map((r, i) => (
                        <div key={i} className="flex gap-2.5 animate-in slide-in-from-bottom-2 duration-400">
                            <div className="relative shrink-0 mt-0.5">
                                <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-sm leading-none">
                                    {r.emoji}
                                </div>
                                {i === reactions.length - 1 && !isComplete && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full border-[1.5px] border-background" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[11px] font-semibold text-foreground">{r.name}</span>
                                    <span className="text-[9px] text-muted-foreground font-mono opacity-60">#{idxHash(r.name)}</span>
                                </div>
                                <div className="bg-secondary/40 rounded-lg rounded-tl-none px-3 py-2 border border-border/40">
                                    <p className="text-[12px] leading-relaxed text-foreground/80 italic">"{r.reaction}"</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Thinking skeleton */}
                    {anyThinking && (
                        <div className="flex gap-2.5 animate-pulse">
                            <div className="w-7 h-7 rounded-lg bg-secondary border border-border shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1.5 pt-1">
                                <div className="h-2.5 bg-secondary rounded w-20" />
                                <div className="h-8 bg-secondary/50 rounded-lg" />
                            </div>
                        </div>
                    )}

                    {/* No reactions yet */}
                    {!isAssembling && reactions.length === 0 && !anyThinking && hasRun && (
                        <div className="flex items-center justify-center gap-2 py-6 opacity-30">
                            <MessageSquare className="w-5 h-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Waiting for first reaction...</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border/50 bg-secondary/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span className="text-[10px] text-muted-foreground">Synthetic Audience Simulation</span>
                </div>
                <div className="flex items-center gap-1">
                    {isComplete && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    <span className="text-[10px] font-mono text-muted-foreground">{reactions.length} reactions</span>
                </div>
            </div>
        </Card>
    );
};

const idxHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 9999).toString().padStart(4, '0');
};
