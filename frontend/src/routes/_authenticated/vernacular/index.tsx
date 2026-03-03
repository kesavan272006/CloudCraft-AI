import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Languages,
    Zap,
    Palette,
    MessageSquare,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Info,
    History,
    Sparkles,
    Eye,
    Globe,
    Search as SearchIcon,
    X,
    Cpu,
    Activity,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IndiaMap } from '@/components/vernacular/IndiaMap';
import { toast } from "sonner";
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/_authenticated/vernacular/')({
    component: VernacularPage,
})

const topNav = [
    { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
    { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
    { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
    { title: 'Vernacular', href: '/vernacular', isActive: true, disabled: false },
    { title: 'Settings', href: '/settings', isActive: false, disabled: false },
];

const REGION_IMAGES: Record<string, string> = {
    "Maharashtra": "/images/vernacular/maharashtra.png",
    "Punjab": "/images/vernacular/punjab.png",
    "Kerala": "/images/vernacular/kerala.png",
    "Rajasthan": "/images/vernacular/rajasthan.png",
};

// Visual Transmutation Config
const STATE_VISUALS: Record<string, { theme: string, color: string, gradient: string, imageDesc: string, pattern?: string }> = {
    "Maharashtra": {
        theme: "indigo",
        color: "#6366f1",
        gradient: "from-indigo-600/40 to-purple-600/40",
        imageDesc: "Mumbai Marine Drive Skyline at twilight, golden lights reflecting on the Arabian Sea."
    },
    "Punjab": {
        theme: "amber",
        color: "#f59e0b",
        gradient: "from-amber-500/40 to-orange-600/40",
        imageDesc: "Golden fields of mustard during Baisakhi, vibrant Punjab farm landscape."
    },
    "Kerala": {
        theme: "emerald",
        color: "#10b981",
        gradient: "from-emerald-500/40 to-teal-600/40",
        imageDesc: "Misty Munnar tea gardens or tranquil Alappuzha backwaters at dawn."
    },
    "Tamil Nadu": {
        theme: "rose",
        color: "#f43f5e",
        gradient: "from-rose-500/40 to-orange-600/40",
        imageDesc: "Intricate gopurams of Meenakshi Temple, vibrant cultural heritage."
    },
    "West Bengal": {
        theme: "cyan",
        color: "#06b6d4",
        gradient: "from-cyan-500/40 to-blue-600/40",
        imageDesc: "Victoria Memorial in Kolkata, white marble gleaming under a clear blue sky."
    },
    "Rajasthan": {
        theme: "orange",
        color: "#f97316",
        gradient: "from-orange-500/40 to-yellow-600/40",
        imageDesc: "The Great Indian Desert at sunset, camel silhouettes against a deep orange sky."
    },
    "Karnataka": {
        theme: "blue",
        color: "#3b82f6",
        gradient: "from-blue-500/40 to-indigo-600/40",
        imageDesc: "The lit-up Mysore Palace at night, a spectacle of royal grandeur."
    },
    "Gujarat": {
        theme: "yellow",
        color: "#eab308",
        gradient: "from-yellow-400/40 to-orange-500/40",
        imageDesc: "The white salt desert of Rann of Kutch under a full moon."
    }
};

function VernacularPage() {
    const [content, setContent] = useState("");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [isTransmuting, setIsTransmuting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const activeVisuals = useMemo(() => {
        if (!selectedState) return { theme: "slate", color: "#64748b", gradient: "from-slate-600/20 to-slate-900/20", imageDesc: "" };
        return STATE_VISUALS[selectedState] || { theme: "indigo", color: "#6366f1", gradient: "from-indigo-600/20 to-indigo-900/20", imageDesc: "" };
    }, [selectedState]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleTransmute = async () => {
        if (!content.trim()) return toast.error("Please enter content to transmute");
        if (!selectedState) return toast.error("Please select a state on the map");

        setIsTransmuting(true);
        setLogs([]);
        setResult(null);

        addLog(`Initiating Project Vernacular for ${selectedState}...`);
        addLog(`Deploying Socio-Cultural Agent to analyze regional demographics and sentiment...`);
        addLog(`Synchronizing with ${selectedState} edge nodes for dialect high-fidelity...`);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/vernacular/transmute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, state: selectedState })
            });

            if (!response.ok) throw new Error("Transmutation failed");

            addLog(`Linguistic Agent transcreating content into ${selectedState} vernacular...`);
            await new Promise(r => setTimeout(r, 800));
            addLog(`Aesthetic Agent adjusting UI tokens to match regional color psychology...`);
            await new Promise(r => setTimeout(r, 600));

            const data = await response.json();
            setResult(data);
            addLog(`Success: Content culturally pivoted for ${selectedState}.`);
        } catch (err) {
            toast.error("Failed to transmute content");
            addLog(`Error: Linguistic pipeline failure.`);
        } finally {
            setIsTransmuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-4"><TopNav links={topNav} /></div>
                <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
                    <div className="relative hidden md:flex items-center">
                        <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search vernacular assets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg text-sm shadow-none" />
                        {searchQuery && <X className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setSearchQuery('')} />}
                    </div>
                    <ThemeSwitch /><ProfileDropdown />
                </div>
            </Header>

            <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 relative">
                {/* Background grid - matches Dashboard */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                {/* Dynamic State Accent Blur */}
                {selectedState && (
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 opacity-20"
                        style={{ backgroundColor: `${activeVisuals.color}44` }}
                    />
                )}

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-2 uppercase tracking-widest gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            Cultural Swarm Active
                        </div>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                            Project <span className="text-primary italic">Vernacular</span>
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl font-medium">
                            Synthesize regional identities and transcreate brand messages into 15+ Indian dialects with hyper-local socio-cultural nuances.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    {/* Left Side: Map & Identity Lock */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                        <Card className="border-border bg-card/60 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md">
                            <CardHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center justify-between bg-secondary/10">
                                <div>
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" /> Territory Identity Matrix
                                    </CardTitle>
                                    <CardDescription className="text-xs">Synchronize with a regional node to begin transmutation.</CardDescription>
                                </div>
                                {selectedState && (
                                    <Badge variant="outline" className="h-6 bg-primary/10 border-primary/20 text-primary font-bold px-3">
                                        <MapPin className="w-3 h-3 mr-1.5" /> {selectedState.toUpperCase()}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 relative bg-slate-950/20 min-h-[500px] flex items-center justify-center">
                                <IndiaMap
                                    activeState={selectedState}
                                    onSelectState={(state) => {
                                        setSelectedState(state);
                                        toast.success(`Identity Locked: ${state}`);
                                    }}
                                />

                                {selectedState && (
                                    <div className="absolute bottom-6 left-6 right-6 p-5 bg-background/40 backdrop-blur-2xl rounded-3xl border border-white/10 animate-in slide-in-from-bottom-8 duration-700 shadow-2xl max-w-lg overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        <div className="flex gap-5 relative z-10">
                                            {REGION_IMAGES[selectedState] && (
                                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                                    <img
                                                        src={REGION_IMAGES[selectedState]}
                                                        alt={selectedState}
                                                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-1.5 rounded-lg bg-white/10 shadow-inner">
                                                        <Palette className="w-3.5 h-3.5 text-white" style={{ color: activeVisuals.color }} />
                                                    </div>
                                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Region Aesthetic Insight</span>
                                                </div>
                                                <p className="text-sm text-slate-200 font-bold tracking-tight mb-1">
                                                    {selectedState} Identity Matrix Locked
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                                                    "{activeVisuals.imageDesc}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-2xl rounded-full opacity-30" style={{ backgroundColor: activeVisuals.color }} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Agent Telemetry Log */}
                        <Card className="border-border bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Swarm_Telemetry.log</span>
                                </div>
                                {isTransmuting && <div className="text-[9px] text-indigo-400 animate-pulse font-mono tracking-widest">PROCESSING_CULTURAL_WEIGHTS...</div>}
                            </div>
                            <ScrollArea className="h-[140px] p-5 font-mono text-[11px] text-indigo-300/70 leading-relaxed">
                                {logs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                                        <Cpu className="w-8 h-8 mb-2" />
                                        <p>Awaiting high-priority cultural directive...</p>
                                    </div>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className="flex gap-4 mb-1.5 border-l border-white/5 pl-4">
                                            <span className="text-white/20 shrink-0 font-bold">L-{i.toString().padStart(2, '0')}</span>
                                            <p className={cn(log.includes("Error") ? "text-red-400" : "")}>{log}</p>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                        </Card>
                    </div>

                    {/* Right Side: Command & Identity Sync */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                        <Card className="border-border bg-card/60 rounded-3xl shadow-sm backdrop-blur-md overflow-hidden flex flex-col h-full">
                            <CardHeader className="border-b border-border/50 py-4 px-6 bg-secondary/20">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" /> Directive Console
                                </CardTitle>
                                <CardDescription className="text-xs">Paste brand asset or content to transmute.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <Textarea
                                    placeholder="e.g., 'Discover our latest organic tea collection from the hills...'"
                                    className="flex-1 min-h-[250px] resize-none bg-transparent border-0 focus-visible:ring-0 p-6 text-base font-medium leading-relaxed placeholder:text-muted-foreground/30"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <div className="p-6 border-t border-border/50 bg-secondary/10 space-y-4">
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                                        <span>Input Integrity: OK</span>
                                        <span>Target: {selectedState || 'NONE'}</span>
                                    </div>
                                    <Button
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all duration-500 text-xs shadow-lg",
                                            selectedState ? "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]" : "bg-secondary text-muted-foreground"
                                        )}
                                        onClick={handleTransmute}
                                        disabled={isTransmuting || !content || !selectedState}
                                    >
                                        {isTransmuting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Synthesizing...
                                            </>
                                        ) : (
                                            <><Sparkles className="w-4 h-4 mr-2" /> Launch Transmutation</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* RESULT VIEW: High Fidelity Bento Grid */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 relative z-10 pt-8 border-t border-border/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2 italic">
                                    Identity <span className="text-primary underline decoration-primary/20">Synthesized</span>
                                </h2>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Linguistic & Cultural weights converged</p>
                            </div>
                            <Button variant="outline" className="h-9 font-black uppercase tracking-widest text-[10px]" onClick={() => setResult(null)}>
                                <History className="w-3.5 h-3.5 mr-2" /> New Directive
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Region Aesthetic Insight Card */}
                            <Card className="lg:col-span-1 bg-card/60 border-border rounded-[2.5rem] overflow-hidden shadow-sm group">
                                <div className="h-48 relative overflow-hidden">
                                    {REGION_IMAGES[selectedState as string] ? (
                                        <img
                                            src={REGION_IMAGES[selectedState as string]}
                                            alt={selectedState as string}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className={cn("w-full h-full bg-gradient-to-br transition-all duration-1000", activeVisuals.gradient)}>
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                    <div className="absolute bottom-4 left-6">
                                        <Badge className="bg-primary hover:bg-primary font-black uppercase tracking-[0.2em] text-[9px] mb-2 px-3">AESTHETIC_LOCKED</Badge>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{selectedState} Identity</h3>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/40 pb-2">
                                            <span>Tone Matrix</span>
                                            <span className="text-primary">{result.tone}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/40 pb-2">
                                            <span>Dialect Root</span>
                                            <span className="text-primary">{result.language}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                        <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em] mb-3">DNA Snapshot</h4>
                                        <p className="text-xs text-foreground font-medium italic leading-relaxed">
                                            "{result.visual_cues}"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Linguistic Pivot & Local Salt */}
                            <Card className="lg:col-span-2 bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden border-2 border-primary/10 group">
                                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-white/5">
                                    <div className="space-y-1">
                                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3" /> Dialect Synthesis Output
                                        </CardTitle>
                                        <CardDescription className="text-xs opacity-50 font-mono">CC-TRANS-V2.04 // {result.language.toUpperCase()}_PIVOT</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => { navigator.clipboard.writeText(result.translated_content); toast.success("Copied to clipboard"); }}>
                                            <History className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-10">
                                    <div className="relative">
                                        <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 to-transparent" />
                                        <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tight leading-none uppercase mb-6 selection:bg-primary selection:text-white break-words">
                                            {result.translated_content.split('\n')[0]}
                                        </h3>
                                        <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed">
                                            {result.translated_content}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-indigo-400" /> Injected "Local Salt" Idioms:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.local_slang.map((slang: string, i: number) => (
                                                <Badge key={i} className="bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 rounded-xl px-4 py-1.5 text-xs font-bold italic transition-all cursor-default shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                                    "{slang}"
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Cultural Nuance Swarm:</h4>
                                            <div className="space-y-2">
                                                {result.cultural_nuances.slice(0, 3).map((n: string, i: number) => (
                                                    <div key={i} className="flex gap-3 items-start group/n">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover/n:scale-125 transition-transform" />
                                                        <p className="text-xs text-slate-400 font-medium">{n}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-black uppercase tracking-widest text-xs group/btn shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                                                Sync to Campaigns <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest">
                                                Download Creative Pack
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Initial Empty State */}
                {!result && !isTransmuting && !selectedState && (
                    <div className="h-[250px] flex flex-col items-center justify-center text-center opacity-40 animate-pulse relative z-10 border-2 border-dashed border-border/50 rounded-[3rem]">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-8 shadow-inner">
                            <Globe className="w-10 h-10 text-indigo-400/50" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-[0.3em] italic text-slate-400">Territory Sync Required</h3>
                        <p className="text-xs font-black text-slate-500 mt-4 uppercase tracking-widest max-w-sm">
                            Lock in a regional identity matrix on the map above to initialize linguistic swarm synchronization.
                        </p>
                    </div>
                )}
            </Main>
        </div>
    );
}
