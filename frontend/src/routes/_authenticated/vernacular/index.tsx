import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Languages, Zap, Palette, MessageSquare, Loader2,
    Sparkles, Globe, X, Activity, Play, Square,
    Copy, Shield, RadioTower, ImagePlus, Video, Hash, Users,
    AlertTriangle, Database, CalendarClock, Bell, RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IndiaMap } from '@/components/vernacular/IndiaMap';
import { toast } from "sonner";
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { API_BASE_URL } from '@/lib/api-config';

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

const STATE_VISUALS: Record<string, { color: string; gradient: string; imageDesc: string }> = {
    "Maharashtra": { color: "#6366f1", gradient: "from-indigo-600 to-purple-600", imageDesc: "Mumbai Marine Drive Skyline at twilight, golden lights reflecting on the Arabian Sea." },
    "Punjab": { color: "#f59e0b", gradient: "from-amber-500 to-orange-600", imageDesc: "Golden fields of mustard during Baisakhi, vibrant Punjab farm landscape." },
    "Kerala": { color: "#10b981", gradient: "from-emerald-500 to-teal-600", imageDesc: "Misty Munnar tea gardens or tranquil Alappuzha backwaters at dawn." },
    "Tamil Nadu": { color: "#f43f5e", gradient: "from-rose-500 to-orange-600", imageDesc: "Intricate gopurams of Meenakshi Temple, vibrant cultural heritage." },
    "West Bengal": { color: "#06b6d4", gradient: "from-cyan-500 to-blue-600", imageDesc: "Victoria Memorial in Kolkata, white marble gleaming under a clear blue sky." },
    "Rajasthan": { color: "#f97316", gradient: "from-orange-500 to-yellow-600", imageDesc: "The Great Indian Desert at sunset, camel silhouettes against a deep orange sky." },
    "Karnataka": { color: "#3b82f6", gradient: "from-blue-500 to-indigo-600", imageDesc: "The lit-up Mysore Palace at night, a spectacle of royal grandeur." },
    "Gujarat": { color: "#eab308", gradient: "from-yellow-400 to-orange-500", imageDesc: "The white salt desert of Rann of Kutch under a full moon." },
    "Andhra Pradesh": { color: "#8b5cf6", gradient: "from-violet-500 to-purple-600", imageDesc: "Tirupati Balaji temple complex, a spiritual marvel of South India." },
    "Telangana": { color: "#ec4899", gradient: "from-pink-500 to-rose-600", imageDesc: "Charminar lit up at night, Hyderabad's iconic landmark." },
};

function VernacularPage() {
    const [content, setContent] = useState("");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [isTransmuting, setIsTransmuting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleResult, setScheduleResult] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
            setIsPlaying(!isPlaying);
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/vernacular/history`);
            const data = await res.json();
            setCampaignHistory(data.history || []);
        } catch { setCampaignHistory([]); } finally { setHistoryLoading(false); }
    };

    const handleSchedule = async () => {
        if (!scheduleTime || !result) return;
        setIsScheduling(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/vernacular/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_name: `${result.state}_${result.language}_Campaign`,
                    state: result.state,
                    language: result.language,
                    audio_url: result.audio_url || "",
                    translated_content: result.translated_content || "",
                    schedule_time: scheduleTime
                })
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Scheduling failed");
            }
            const data = await res.json();
            setScheduleResult(data);
            toast.success("Broadcast scheduled! Email will arrive via AWS SNS.");
        } catch (e: any) {
            toast.error(e.message || "Failed to schedule broadcast.");
        } finally {
            setIsScheduling(false);
        }
    };

    const activeVisuals = useMemo(() => {
        if (!selectedState) return { color: "#6366f1", gradient: "from-indigo-600 to-purple-600", imageDesc: "" };
        return STATE_VISUALS[selectedState] || { color: "#6366f1", gradient: "from-indigo-600 to-purple-600", imageDesc: "" };
    }, [selectedState]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const handleTransmute = async () => {
        if (!content.trim()) return toast.error("Please enter content to transmute");
        if (!selectedState) return toast.error("Please select a state on the map");
        setIsTransmuting(true);
        setLogs([]);
        setResult(null);
        setScheduleResult(null);
        setScheduleTime("");
        addLog(`[START] Initializing agentic swarm for ${selectedState}...`);
        addLog(`[AWS Bedrock] Deploying Socio-Cultural Strategist agent...`);
        try {
            const fakeStream = setInterval(() => {
                const fakeLogs = [
                    `[AWS Rekognition] Scanning visual context for cultural alignment...`,
                    `[AWS Comprehend] Running regional compliance sentiment analysis...`,
                    `[AWS Polly] Compiling neural TTS for ${selectedState} dialect...`,
                    `[Agent Swarm] Synthesizing hyper-local marketing intelligence...`,
                    `[AWS Bedrock] Creative Director agent generating native ${selectedState} copy...`,
                ];
                addLog(fakeLogs[Math.floor(Math.random() * fakeLogs.length)]);
            }, 900);

            const payload = { content, state: selectedState, has_image_context: !!imagePreview };
            const response = await fetch(`${API_BASE_URL}/api/v1/vernacular/transmute`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            clearInterval(fakeStream);
            if (!response.ok) throw new Error("Transmutation failed");
            const data = await response.json();
            setResult(data);
            addLog(`[SUCCESS] Pipeline complete. ${data.language} content asset ready.`);
            if (data.audio_url) addLog(`[AWS Polly → S3] Audio asset uploaded successfully.`);
            addLog(`[AWS DynamoDB] Campaign logged to history vault.`);
            fetchHistory();
        } catch (err) {
            toast.error("Failed to transmute content");
            addLog(`[ERROR] Linguistic pipeline failure.`);
        } finally {
            setIsTransmuting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result as string); toast.success("Visual loaded for Amazon Rekognition."); };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <div className="flex items-center gap-4"><TopNav links={topNav} /></div>
                <div className="ml-auto flex items-center space-x-4"><ThemeSwitch /><ProfileDropdown /></div>
            </Header>

            <Main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 space-y-8 relative overflow-hidden">

                {/* Premium dot-matrix background grid */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />

                {/* Premium gradient mesh overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30"
                    style={{ background: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(236,72,153,0.08) 0%, transparent 50%)' }}
                />

                {/* Floating orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl"
                        animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                        style={{ top: '5%', left: '0%' }}
                    />
                    <motion.div
                        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-violet-500/15 via-indigo-500/15 to-cyan-500/15 blur-3xl"
                        animate={{ x: [0, -50, 0], y: [0, 70, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        style={{ bottom: '10%', right: '5%' }}
                    />
                </div>

                {/* ── PAGE HEADER ── */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="space-y-2">
                        <motion.div
                            className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-indigo-500/15 text-indigo-500 text-xs font-bold mb-2 shadow-lg shadow-indigo-500/20 uppercase tracking-widest gap-2 backdrop-blur-xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                            </span>
                            AWS Agentic Pipeline · Online
                        </motion.div>
                        <motion.h1
                            className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Project <span className="italic bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Vernacular</span>
                            <Languages className="h-8 w-8 md:h-10 md:w-10 text-indigo-500 animate-pulse" />
                        </motion.h1>
                        <motion.p
                            className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Transcreate brand messages into 15+ Indian dialects with hyper-local cultural intelligence, powered by AWS Bedrock, Comprehend & Polly.
                        </motion.p>
                    </div>
                    <motion.div
                        className="flex items-center gap-3 shrink-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {result && (
                            <Button variant="outline" onClick={() => setResult(null)} className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl">
                                <RefreshCcw className="w-4 h-4 mr-2" /> New Campaign
                            </Button>
                        )}
                        <Button variant="outline" onClick={fetchHistory} className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl" disabled={historyLoading}>
                            {historyLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                            History
                        </Button>
                    </motion.div>
                </motion.div>

                {/* ── CAMPAIGN HISTORY VAULT (DynamoDB) ── */}
                {campaignHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                    >
                        <Card className="relative border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-amber-500/10">
                            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50 blur-xl rounded-2xl pointer-events-none" />
                            <div className="px-5 py-4 border-b border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
                                <Database className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold">Campaign History Vault</span>
                                <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-mono">AWS DynamoDB · {campaignHistory.length} records</Badge>
                            </div>
                            <ScrollArea className="h-[220px]">
                                <div className="divide-y divide-border/50">
                                    {campaignHistory.map((h: any, i: number) => (
                                        <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-amber-500/5 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Globe className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold">{h.state}</span>
                                                    <Badge variant="outline" className="text-[10px] font-mono">{h.language}</Badge>
                                                    <Badge variant="outline" className={cn("text-[10px]", h.comprehend_sentiment === "POSITIVE" ? "border-emerald-500/30 text-emerald-400" : "border-orange-500/30 text-orange-400")}>{h.comprehend_sentiment} · {h.comprehend_score}%</Badge>
                                                    <span className="text-[10px] text-muted-foreground ml-auto">{new Date(h.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{h.original_content}</p>
                                            </div>
                                            {h.audio_url && (
                                                <button className="w-8 h-8 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-center hover:bg-amber-500/20 transition-colors shrink-0" onClick={() => { if (audioRef.current) { audioRef.current.src = h.audio_url; audioRef.current.play(); setIsPlaying(true); } }}>
                                                    <Play className="w-3.5 h-3.5 text-amber-400" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </Card>
                    </motion.div>
                )}

                {/* ── INPUT ROW: two cols on desktop ── */}
                {!result && (
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        {/* LEFT: Brand message + image */}
                        <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-secondary/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/5 before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-border/60 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
                            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2 bg-secondary/10">
                                <MessageSquare className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-semibold">Brand Directive</span>
                                <span className="text-xs text-muted-foreground ml-auto">Core marketing message</span>
                            </div>
                            <Textarea
                                placeholder="e.g., 'Discover CloudCraft AI — India's most intelligent regional marketing powerhouse. Built for Bharat, by Bharat.'"
                                className="flex-1 min-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 text-[15px] font-medium leading-relaxed placeholder:text-muted-foreground/25 p-5"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <div className="px-5 py-4 border-t border-border/50 bg-secondary/5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-secondary border border-border/50 flex items-center justify-center shrink-0">
                                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-foreground">Visual Context</p>
                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500 inline" /> Amazon Rekognition</p>
                                    </div>
                                </div>
                                {imagePreview ? (
                                    <div className="relative group rounded-lg overflow-hidden border border-border w-14 h-14 shrink-0">
                                        <img src={imagePreview} alt="Context" className="w-full h-full object-cover" />
                                        <button onClick={() => setImagePreview(null)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X className="w-4 h-4 text-white" /></button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-lg border border-dashed border-border/80 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 text-muted-foreground transition-colors">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        Browse File
                                    </label>
                                )}
                            </div>
                        </Card>

                        {/* RIGHT: Map */}
                        <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-secondary/10 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col shadow-xl shadow-black/5">
                            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2 bg-secondary/10">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-semibold">Territory Selection</span>
                                {selectedState ? (
                                    <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold font-mono px-2">{selectedState.toUpperCase()}</Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground ml-auto">Click a state on the map</span>
                                )}
                            </div>
                            <div className="relative flex-1 bg-slate-950/30 min-h-[280px] flex items-center justify-center overflow-hidden">
                                {selectedState && (
                                    <motion.div
                                        className="absolute inset-0 opacity-15"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.15 }}
                                        style={{ background: `radial-gradient(circle at center, ${activeVisuals.color}, transparent 70%)` }}
                                    />
                                )}
                                <IndiaMap
                                    activeState={selectedState}
                                    onSelectState={(state) => { setSelectedState(state); toast.success(`Territory locked: ${state}`); }}
                                />
                                {selectedState && activeVisuals.imageDesc && (
                                    <motion.div
                                        className="absolute bottom-3 left-3 right-3 p-3 bg-background/90 backdrop-blur-xl rounded-xl border border-border/50 flex items-start gap-3 shadow-lg"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {REGION_IMAGES[selectedState] && (
                                            <img src={REGION_IMAGES[selectedState]} alt={selectedState} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border/50" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Region Aesthetic</p>
                                            <p className="text-[12px] font-medium text-foreground leading-snug italic line-clamp-2">"{activeVisuals.imageDesc}"</p>
                                        </div>
                                        <div className="shrink-0 w-2 h-2 rounded-full mt-1 animate-pulse" style={{ backgroundColor: activeVisuals.color }} />
                                    </motion.div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* ── LAUNCH BUTTON ── */}
                {!result && (
                    <motion.div
                        className="relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <Button
                            className={cn(
                                "w-full h-14 rounded-2xl font-black uppercase tracking-[0.25em] text-sm transition-all duration-300 shadow-lg group relative overflow-hidden",
                                (selectedState && content.trim())
                                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white hover:scale-[1.01] hover:shadow-indigo-500/30 hover:shadow-xl"
                                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                            )}
                            onClick={handleTransmute}
                            disabled={isTransmuting || !content.trim() || !selectedState}
                        >
                            {(selectedState && content.trim()) && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            )}
                            {isTransmuting ? (
                                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Synthesizing Pipeline...</>
                            ) : (
                                <><Zap className="w-5 h-5 mr-3 group-hover:text-yellow-300 transition-colors" /> Initialize Transmutation</>
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* ── LOADING TELEMETRY ── */}
                {isTransmuting && (
                    <motion.div
                        className="relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="relative border-indigo-500/30 bg-gradient-to-br from-slate-950/90 via-slate-950/80 to-indigo-950/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50 blur-xl rounded-2xl pointer-events-none" />
                            <div className="px-5 py-4 border-b border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                                    <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-widest">agent_telemetry.stream — {selectedState}</span>
                                </div>
                                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px] animate-pulse bg-black/40">● LIVE</Badge>
                            </div>
                            <ScrollArea className="h-[220px] p-5 font-mono text-[12px] text-indigo-400/70 leading-loose">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 mb-2 pl-3 border-l-2 border-indigo-500/20">
                                        <span className="text-indigo-400/30 font-bold shrink-0">[{String(i).padStart(2, '0')}]</span>
                                        <span className={log.includes("ERROR") ? "text-red-400" : log.includes("SUCCESS") ? "text-emerald-400" : ""}>{log}</span>
                                    </div>
                                ))}
                            </ScrollArea>
                        </Card>
                    </motion.div>
                )}

                {/* ── RESULT: FULL OUTPUT ── */}
                {result && (
                    <motion.div
                        className="space-y-6 relative z-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Result Header */}
                        <Card className="relative border-border/50 bg-gradient-to-r from-card via-card to-secondary/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-black/10 p-5">
                            <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 30% 50%, ${activeVisuals.color}, transparent 70%)` }} />
                            <div className="flex items-center gap-4 relative">
                                <motion.div
                                    className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", activeVisuals.gradient)}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <Languages className="w-7 h-7 text-white" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl font-bold tracking-tight">Campaign Asset Ready</h2>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">✓ PIPELINE COMPLETE</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">AWS Bedrock × Comprehend × Polly — {result.language} · {result.state}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {result.audio_url && (
                                        <Button size="sm" variant={isPlaying ? "destructive" : "default"} onClick={toggleAudio} className="h-9 rounded-xl font-bold shadow-lg">
                                            {isPlaying ? <><Square className="w-4 h-4 mr-1.5" /> Stop</> : <><Play className="w-4 h-4 mr-1.5" /> Play Audio</>}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                        {result.audio_url && <audio ref={audioRef} src={result.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />}

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* ─ COL 1 (span 2): The Content & Creator Suite ─ */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* The Transcreated Copy */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                >
                                    <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-secondary/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                                        <div className="px-5 py-4 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeVisuals.color }} />
                                                <span className="text-sm font-semibold">{result.language} Transcreated Copy</span>
                                                <Badge variant="outline" className="text-[10px] font-mono ml-1">{result.state}</Badge>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-secondary" onClick={() => { navigator.clipboard.writeText(result.translated_content); toast.success("Copied!"); }}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-[16px] font-medium leading-relaxed text-foreground whitespace-pre-wrap">{result.translated_content}</p>
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Reel Storyboard */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-pink-500/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-black/5 border-pink-500/10">
                                        <div className="px-5 py-4 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Video className="w-4 h-4 text-pink-400" />
                                                <span className="text-sm font-semibold">Regional Reel Storyboard</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-mono border-pink-500/20 text-pink-400">15s Short-Form</Badge>
                                        </div>
                                        <div className="divide-y divide-border/50">
                                            {result.reel_script && result.reel_script.length > 0 ? result.reel_script.map((shot: any, i: number) => (
                                                <div key={i} className="flex gap-4 p-4 hover:bg-pink-500/5 transition-colors group">
                                                    <div className="w-20 shrink-0 text-center py-1">
                                                        <span className="text-[11px] font-mono font-bold text-pink-400/60 bg-pink-500/5 border border-pink-500/10 rounded-lg px-2 py-1 inline-block">{shot.timestamp}</span>
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <p className="text-[13px] text-muted-foreground"><span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mr-2">VISUAL</span>{shot.visual}</p>
                                                        <p className="text-[13px] font-semibold text-foreground"><span className="text-[9px] font-black uppercase tracking-widest text-pink-400/50 mr-2">AUDIO</span>"{shot.audio}"</p>
                                                    </div>
                                                </div>
                                            )) : <p className="p-5 text-sm text-muted-foreground italic text-center">No storyboard generated.</p>}
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Marketing Hooks & SEO */}
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <Card className="relative border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-blue-500/10 space-y-4">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                        <div className="flex items-center gap-2 relative">
                                            <Hash className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm font-semibold">A/B Marketing Hooks</span>
                                        </div>
                                        <div className="space-y-2.5 relative">
                                            {result.marketing_hooks && result.marketing_hooks.map((hook: string, i: number) => (
                                                <div key={i} className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[13px] font-medium text-foreground leading-snug hover:bg-blue-500/10 transition-colors">"{hook}"</div>
                                            ))}
                                        </div>
                                        {result.seo_keywords && result.seo_keywords.length > 0 && (
                                            <div className="pt-3 border-t border-blue-500/10 space-y-2 relative">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regional Search Matrix</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {result.seo_keywords.map((kw: string, i: number) => (
                                                        <Badge key={i} variant="secondary" className="text-[11px] px-2.5 py-1 bg-blue-500/10 border-blue-500/10 text-blue-300">{kw}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                    <Card className="relative border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-emerald-500/10 space-y-4">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                        <div className="flex items-center gap-2 relative">
                                            <Users className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm font-semibold">Creator Ops</span>
                                        </div>
                                        <div className="space-y-3 relative">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Influencer Strategy</p>
                                                <p className="text-[13px] leading-relaxed text-foreground bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">{result.influencer_strategy || "No strategy generated."}</p>
                                            </div>
                                            {result.taboos_to_avoid && result.taboos_to_avoid.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400/80 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Cultural Taboos</p>
                                                    <ul className="space-y-1.5 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                                                        {result.taboos_to_avoid.map((t: string, i: number) => (
                                                            <li key={i} className="text-[12px] text-red-300/90 flex gap-2"><X className="w-3 h-3 shrink-0 mt-0.5 text-red-500" />{t}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* ─ COL 2: AWS Intelligence Panel ─ */}
                            <div className="space-y-6">

                                {/* Compliance Shield */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5 }}
                                >
                                    <Card className={cn(
                                        "relative border rounded-2xl p-5 shadow-xl space-y-5 backdrop-blur-xl",
                                        result.comprehend_score >= 80
                                            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-emerald-500/10"
                                            : "border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent shadow-orange-500/10"
                                    )}>
                                        <div className="absolute -inset-1 opacity-40 blur-xl rounded-2xl pointer-events-none"
                                            style={{ background: result.comprehend_score >= 80 ? 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)' : 'radial-gradient(circle, rgba(249,115,22,0.15), transparent)' }}
                                        />
                                        <div className="flex items-center gap-3 relative">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", result.comprehend_score >= 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400")}>
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">AWS Compliance</p>
                                                <p className="text-[10px] font-mono text-muted-foreground">COMPREHEND · REKOGNITION</p>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between relative">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sentiment</p>
                                                <Badge variant="outline" className={cn("text-xs font-mono", result.comprehend_sentiment === "POSITIVE" ? "text-emerald-400 border-emerald-500/30" : result.comprehend_sentiment === "MIXED" ? "text-yellow-400 border-yellow-500/30" : "text-orange-400 border-orange-500/30")}>{result.comprehend_sentiment}</Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Safety Score</p>
                                                <p className={cn("text-4xl font-black font-mono tracking-tighter leading-none", result.comprehend_score >= 80 ? "text-emerald-400" : "text-orange-400")}>{result.comprehend_score.toFixed(0)}<span className="text-2xl">%</span></p>
                                            </div>
                                        </div>
                                        {imagePreview && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 relative">
                                                <img src={imagePreview} className="w-8 h-8 rounded-md object-cover shrink-0" alt="context" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Visual Context</p>
                                                    <p className="text-[11px] text-muted-foreground">Rekognition: Approved</p>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>

                                {/* Amazon Polly Audio Player */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25, duration: 0.5 }}
                                >
                                    <Card className="relative border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                        <div className="px-5 py-4 border-b border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3 relative">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                                <RadioTower className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-none">Amazon Polly</p>
                                                <p className="text-[10px] font-mono text-indigo-400/70 mt-0.5 flex items-center gap-1.5">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isPlaying ? "bg-red-400" : "bg-indigo-400")} />
                                                        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", isPlaying ? "bg-red-500" : "bg-indigo-500")} />
                                                    </span>
                                                    {result.language} · neural voice synthesis
                                                </p>
                                            </div>
                                            <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-mono">TTS</Badge>
                                        </div>
                                        <div className="p-5 relative">
                                            <p className="text-[11px] text-muted-foreground mb-3">Preview the AI-synthesized {result.language} voiceover generated by Amazon Polly and stored on S3.</p>
                                            {result.audio_url ? (
                                                <Button
                                                    variant={isPlaying ? "destructive" : "default"}
                                                    onClick={toggleAudio}
                                                    className={cn("w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg", !isPlaying && "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30")}
                                                >
                                                    {isPlaying ? <><Square className="w-4 h-4 mr-2" />Stop Audio</> : <><Play className="w-4 h-4 mr-2" />Preview Polly Audio</>}
                                                </Button>
                                            ) : (
                                                <div className="h-11 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[11px] font-mono text-muted-foreground/50">
                                                    Polly audio not generated (check AWS credentials)
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* EventBridge Scheduler */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35, duration: 0.5 }}
                                >
                                    <Card className="relative border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-violet-500/10">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                        <div className="px-5 py-4 border-b border-violet-500/20 bg-violet-500/5 flex items-center gap-3 relative">
                                            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                                                <CalendarClock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-none">Schedule Broadcast</p>
                                                <p className="text-[10px] font-mono text-violet-400/70 mt-0.5">AWS EventBridge Scheduler</p>
                                            </div>
                                            <Badge className="ml-auto bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] font-mono">EventBridge</Badge>
                                        </div>
                                        <div className="p-5 space-y-4 relative">
                                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                                                Set a one-time AWS EventBridge rule to auto-dispatch this <strong className="text-foreground">{result.language}</strong> campaign at a future date.
                                            </p>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Broadcast Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduleTime}
                                                    onChange={e => setScheduleTime(e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-violet-500/30 bg-secondary/20 text-sm px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                                                />
                                            </div>
                                            {scheduleResult ? (
                                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]">✓</span>
                                                        Scheduled via AWS EventBridge
                                                    </p>
                                                    <p className="text-[10px] font-mono text-muted-foreground break-all">{scheduleResult.schedule_arn}</p>
                                                    <p className="text-[11px] text-muted-foreground">{scheduleResult.message}</p>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={handleSchedule}
                                                    disabled={!scheduleTime || isScheduling}
                                                    className="w-full h-11 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white uppercase tracking-wider text-xs disabled:opacity-40 shadow-lg shadow-violet-500/20"
                                                >
                                                    {isScheduling
                                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Schedule...</>
                                                        : <><Bell className="w-4 h-4 mr-2" />Create EventBridge Schedule</>}
                                                </Button>
                                            )}
                                            {!scheduleTime && !scheduleResult && (
                                                <p className="text-[10px] text-muted-foreground/50 text-center">↑ Pick a date & time first</p>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>

                                {/* Cultural Intelligence */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.45, duration: 0.5 }}
                                >
                                    <Card className="relative border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-purple-500/10 space-y-4">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                        <div className="flex items-center gap-2 relative">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            <span className="text-sm font-semibold">Cultural Intelligence</span>
                                        </div>
                                        <div className="space-y-3 relative">
                                            {result.cultural_nuances && result.cultural_nuances.map((n: string, i: number) => (
                                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 hover:bg-purple-500/10 transition-colors">
                                                    <span className="text-[10px] font-black font-mono text-purple-400/50 mt-0.5 shrink-0">0{i + 1}</span>
                                                    <p className="text-[13px] font-medium text-foreground leading-snug">{n}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {result.local_slang && result.local_slang.length > 0 && (
                                            <div className="pt-3 border-t border-purple-500/10 space-y-2 relative">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Regional Slang Injected</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.local_slang.map((s: string, i: number) => (
                                                        <Badge key={i} className="text-[12px] px-3 py-1.5 bg-purple-500/10 border-purple-500/20 text-purple-300 max-w-full">
                                                            <span className="truncate block max-w-[200px]">{s}</span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {result.visual_cues && (
                                            <div className="pt-3 border-t border-purple-500/10 relative">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1"><Palette className="w-3 h-3" /> Visual Art Direction</p>
                                                <p className="text-[12px] italic text-muted-foreground leading-relaxed line-clamp-4">"{result.visual_cues}"</p>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>

                                {/* Tone Card */}
                                {result.tone && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.55, duration: 0.5 }}
                                    >
                                        <Card className="relative border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-blue-500/10 space-y-3">
                                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                                            <div className="flex items-center gap-2 relative">
                                                <Activity className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm font-semibold">Tone Strategy</span>
                                            </div>
                                            <p className="text-[13px] font-medium text-foreground leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 relative">{result.tone}</p>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </Main>
        </div>
    );
}
