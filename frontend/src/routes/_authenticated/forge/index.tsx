import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hammer, Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, Globe, RefreshCcw, Zap, Users, Wand2, ChevronDown, ChevronUp, CalendarDays, Clock, Calendar as CalendarIcon, Search as SearchIcon, X } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { NexusMissionStatus } from "@/components/persona/NexusMissionStatus";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { PersonaVariantsDisplay } from "@/components/persona/PersonaVariantsDisplay";
import { PerformanceCard } from "@/components/performance/PerformanceCard";
import type { PersonaInfo, PersonaResponse } from "@/types/persona";
import type { PerformanceResponse } from "@/types/performance";
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { Input } from '@/components/ui/input';

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: true, disabled: false },
  { title: 'Missions', href: '/tasks', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
];

type ResultTab = 'output' | 'score' | 'personas' | 'transmute';
type AgentStatus = 'queued' | 'active' | 'complete';

const AGENTS = [
  { key: 'researcher', name: 'Researcher', role: 'Scanning market signals & data vectors', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', barColor: 'bg-yellow-500' },
  { key: 'copywriter', name: 'Copywriter', role: 'Synthesizing narrative & content structure', icon: Wand2, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', barColor: 'bg-blue-500' },
  { key: 'designer', name: 'Designer', role: 'Architecting format & visual hierarchy', icon: Globe, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', barColor: 'bg-violet-500' },
  { key: 'compliance', name: 'Compliance', role: 'Running brand & compliance audit', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', barColor: 'bg-emerald-500' },
] as const;

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('output');
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(['queued', 'queued', 'queued', 'queued']);

  const [analyzingPerformance, setAnalyzingPerformance] = useState(false);
  const [performanceResult, setPerformanceResult] = useState<PerformanceResponse | null>(null);

  const [transmuting, setTransmuting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('LinkedIn Post');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [transmuteResult, setTransmuteResult] = useState<any>(null);

  const [personas, setPersonas] = useState<PersonaInfo[]>([
    { id: "gen_z", name: "Gen-Z (18-24)", description: "Young, digital-native, trend-conscious", age_range: "18-24", platforms: ["Instagram", "TikTok", "Snapchat"] },
    { id: "professional", name: "Working Professional (25-35)", description: "Career-focused, value-driven, time-conscious", age_range: "25-35", platforms: ["LinkedIn", "Twitter"] },
    { id: "parent", name: "Parents (30-50)", description: "Family-focused, health-conscious, practical", age_range: "30-50", platforms: ["Facebook", "WhatsApp"] },
    { id: "entrepreneur", name: "Entrepreneurs (25-40)", description: "Visionary, growth-minded, innovation-focused", age_range: "25-40", platforms: ["Twitter", "LinkedIn"] },
  ]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [generatingPersonas, setGeneratingPersonas] = useState(false);
  const [personaResult, setPersonaResult] = useState<PersonaResponse | null>(null);

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [schedulingContent, setSchedulingContent] = useState('');
  const [schedulingPlatform, setSchedulingPlatform] = useState('');
  const [schedulingPersona, setSchedulingPersona] = useState<string | undefined>();
  const [schedulingScore, setSchedulingScore] = useState<number | undefined>();
  const [isFinalizingSchedule, setIsFinalizingSchedule] = useState(false);

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  const cleanContent = (text: string) => {
    if (!text) return "";
    return text.replace(/NEXT:.*$/gm, '').replace(/REASON:.*$/gm, '').replace(/Compliance output:/gi, '').replace(/Designer output:/gi, '').replace(/Copywriter output:/gi, '').replace(/Researcher output:/gi, '').trim();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError("Please enter a prompt first"); return; }
    setLoading(true); setError(null); setResult(null);
    setTransmuteResult(null); setPersonaResult(null); setPerformanceResult(null);
    setActiveResultTab('output');
    setAgentStatuses(['active', 'queued', 'queued', 'queued']);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/forge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error((await response.text()) || `Backend error ${response.status}`);
      setResult(await response.json());
    } catch (err: any) {
      setError(err.message || "Failed to connect to the Forge engine");
    } finally {
      setLoading(false);
      setAgentStatuses(['complete', 'complete', 'complete', 'complete']);
    }
  };

  // Cycle agent statuses during loading
  useEffect(() => {
    if (!loading) return;
    const t1 = setTimeout(() => setAgentStatuses(['complete', 'active', 'queued', 'queued']), 3500);
    const t2 = setTimeout(() => setAgentStatuses(['complete', 'complete', 'active', 'queued']), 8000);
    const t3 = setTimeout(() => setAgentStatuses(['complete', 'complete', 'complete', 'active']), 13000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading]);

  const handlePredictPerformance = async () => {
    setAnalyzingPerformance(true);
    try {
      const content = cleanContent(result?.final_content || "");
      if (content.length < 10) throw new Error("Content too short.");
      const res = await fetch('http://127.0.0.1:8000/api/v1/performance/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform: "General", persona: "General Audience" }),
      });
      if (!res.ok) throw new Error("Failed to analyze performance");
      setPerformanceResult(await res.json());
      toast.success("Performance analysis complete!");
    } catch (err: any) { toast.error("Analysis failed: " + err.message); }
    finally { setAnalyzingPerformance(false); }
  };

  const handleSchedule = (content: string, platform: string, personaName?: string, score?: number) => {
    setSchedulingContent(content); setSchedulingPlatform(platform);
    setSchedulingPersona(personaName); setSchedulingScore(score);
    const d = new Date(); d.setDate(d.getDate() + 1);
    setScheduleDate(d); setIsScheduleDialogOpen(true);
  };

  const confirmSchedule = async () => {
    setIsFinalizingSchedule(true);
    try {
      const [h, m] = scheduleTime.split(':').map(Number);
      const d = new Date(scheduleDate); d.setHours(h, m, 0, 0);
      const res = await fetch('http://127.0.0.1:8000/api/v1/calendar/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanContent(schedulingContent), platform: schedulingPlatform, scheduled_time: d.toISOString(), performance_score: schedulingScore || 70, persona_name: schedulingPersona }),
      });
      if (res.ok) { toast.success("Scheduled!"); setIsScheduleDialogOpen(false); }
      else throw new Error("Failed");
    } catch { toast.error("Failed to schedule post"); }
    finally { setIsFinalizingSchedule(false); }
  };

  const handleTransmute = async () => {
    setTransmuting(true);
    try {
      const content = cleanContent(result?.final_content || "");
      if (content.length < 10) throw new Error("Content too short.");
      const res = await fetch('http://127.0.0.1:8000/api/v1/transmute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, target_format: targetFormat, target_language: targetLanguage }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Failed"); }
      setTransmuteResult(await res.json());
      toast.success(`Converted to ${targetFormat}`);
    } catch (err: any) { toast.error("Transmutation failed: " + err.message); }
    finally { setTransmuting(false); }
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/persona/list').then(r => r.ok && r.json()).then(d => d && setPersonas(d)).catch(() => { });
  }, []);

  const handleTogglePersona = (id: string) =>
    setSelectedPersonas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleGeneratePersonas = async () => {
    if (!selectedPersonas.length) { toast.error("Select at least one persona"); return; }
    setGeneratingPersonas(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/persona/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanContent(result?.final_content || ""), personas: selectedPersonas }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPersonaResult(data);
      toast.success(`${data.variants.length} variants generated!`);
    } catch (e: any) { toast.error("Failed: " + e.message); }
    finally { setGeneratingPersonas(false); }
  };

  const prose = `
    .fp h1,.fp h2,.fp h3{font-weight:600;margin-top:1.4em;margin-bottom:.4em;color:hsl(var(--foreground))}
    .fp h1{font-size:1.2rem;border-bottom:1px solid hsl(var(--border)/.4);padding-bottom:.4em}
    .fp h2{font-size:1.05rem}.fp h3{font-size:.95rem;color:hsl(var(--muted-foreground))}
    .fp p{line-height:1.8;margin-bottom:.85em;font-size:.9rem;color:hsl(var(--foreground)/.9)}
    .fp ul,.fp ol{padding-left:1.4em;margin-bottom:.85em}
    .fp li{margin-bottom:.3em;line-height:1.7;font-size:.9rem;color:hsl(var(--foreground)/.88)}
    .fp strong{font-weight:600;color:hsl(var(--foreground))}.fp em{color:hsl(var(--muted-foreground))}
    .fp code{background:hsl(var(--secondary));padding:.1em .35em;border-radius:4px;font-size:.82rem;font-family:monospace}
    .fp blockquote{border-left:3px solid hsl(var(--primary)/.4);padding-left:1em;margin:1em 0;color:hsl(var(--muted-foreground));font-style:italic}
    .fp hr{border:none;border-top:1px solid hsl(var(--border)/.4);margin:1.4em 0}
  `;

  return (
    <>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4"><TopNav links={topNav} /></div>
        <div className="ms-auto flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden md:flex items-center">
            <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg text-sm shadow-none" />
            {searchQuery && <X className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setSearchQuery('')} />}
          </div>
          <ThemeSwitch /><ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 py-6 md:px-6 space-y-6 relative w-full">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-2 uppercase tracking-widest gap-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
              Swarm Engine Online
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">The Forge</h1>
            <p className="text-sm text-muted-foreground">Deploy a parallel AI agent swarm to research, synthesize, and generate high-conversion content.</p>
          </div>
          {result && (
            <Button variant="outline" className="h-9 font-medium self-start" onClick={() => { setResult(null); setTransmuteResult(null); setPersonaResult(null); }}>
              <RefreshCcw className="w-4 h-4 mr-2" />New Session
            </Button>
          )}
        </div>

        <div className="relative z-10 space-y-6">
          {/* INPUT + LOADING */}
          {!result && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {!loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Command console */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="border-border shadow-sm bg-card/60 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/60" /></div>
                          <span className="text-xs font-mono text-muted-foreground ml-2">forge://mission-directive</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />Ready
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <Textarea
                          placeholder={"› What shall the swarm forge?\n\n  e.g., 'Draft a viral LinkedIn post on the AI market in India for Q1 2026 — include data hooks and strong CTAs.'"}
                          className="min-h-[220px] w-full bg-transparent border-0 focus-visible:ring-0 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/40 resize-none px-5 py-5"
                          value={prompt} onChange={e => setPrompt(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt && !loading) handleGenerate(); }}
                        />
                        <div className="px-4 py-3 border-t border-border/50 bg-secondary/20 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {prompt && <span className="text-xs text-muted-foreground font-mono">{prompt.length} chars</span>}
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono ml-1">↵</kbd>
                            </span>
                          </div>
                          <Button className="h-8 px-4 text-xs font-semibold" onClick={handleGenerate} disabled={!prompt.trim()}>
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />Deploy Swarm
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Quick directives</p>
                      <div className="flex flex-wrap gap-2">
                        {["Viral LinkedIn post on India AI market", "Instagram reel script for D2C brand launch", "Twitter thread: 5 SaaS growth frameworks", "Blog intro: Future of vernacular content"].map(s => (
                          <button key={s} onClick={() => setPrompt(s)} className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/60 transition-all font-medium">{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Agent panel */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Swarm Agents</p>
                    <div className="space-y-2">
                      {AGENTS.map(({ name, role, icon: Icon, color, bg, border }) => (
                        <div key={name} className={`flex items-center gap-3 p-3 rounded-xl border ${border} ${bg}`}>
                          <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-semibold">{name}</p><p className="text-[10px] text-muted-foreground truncate">{role}</p></div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">Standby</span>
                        </div>
                      ))}
                    </div>
                    <Card className="border-border shadow-sm bg-card/60">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-xs font-semibold flex items-center gap-2"><Hammer className="w-3.5 h-3.5 text-primary" />Pipeline Capabilities</p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {['Multi-platform content generation', 'Brand compliance auto-checks', 'Persona-targeted variants', 'Regional dialect adaptation', 'Performance score prediction'].map(i => (
                            <div key={i} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary shrink-0" />{i}</div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                /* LOADING — two-column mission control */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-400">
                  <style>{`
                    /* Ring spins around Z axis; offsets spread agents around their orbit */
                    @keyframes r1{from{transform:rotateZ(0deg)}to{transform:rotateZ(360deg)}}
                    @keyframes r2{from{transform:rotateZ(90deg)}to{transform:rotateZ(450deg)}}
                    @keyframes r3{from{transform:rotateZ(180deg)}to{transform:rotateZ(540deg)}}
                    @keyframes r4{from{transform:rotateZ(270deg)}to{transform:rotateZ(630deg)}}
                    /* Counter-rotations: undo Z spin + undo parent's 65deg X tilt = cards face camera */
                    @keyframes cn1{from{transform:rotateZ(0deg) rotateX(-65deg)}to{transform:rotateZ(-360deg) rotateX(-65deg)}}
                    @keyframes cn2{from{transform:rotateZ(-90deg) rotateX(-65deg)}to{transform:rotateZ(-450deg) rotateX(-65deg)}}
                    @keyframes cn3{from{transform:rotateZ(-180deg) rotateX(-65deg)}to{transform:rotateZ(-540deg) rotateX(-65deg)}}
                    @keyframes cn4{from{transform:rotateZ(-270deg) rotateX(-65deg)}to{transform:rotateZ(-630deg) rotateX(-65deg)}}
                    @keyframes spinCW{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                    @keyframes spinCCW{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
                    @keyframes coreGlow{0%,100%{transform:scale(.9);opacity:.75}50%{transform:scale(1.1);opacity:1}}
                    @keyframes bPulse{0%{width:15%}40%{width:82%}70%{width:50%}100%{width:72%}}
                    @keyframes bPulse2{0%{width:8%}50%{width:68%}100%{width:40%}}
                    @keyframes bPulse3{0%{width:5%}60%{width:88%}100%{width:28%}}
                    @keyframes bPulse4{0%{width:3%}55%{width:75%}100%{width:35%}}
                    @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
                  `}</style>

                  {/* LEFT: 3D Orbital System */}
                  <Card className="border-border bg-card/60 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500/50"/><div className="w-2 h-2 rounded-full bg-yellow-500/50"/><div className="w-2 h-2 rounded-full bg-green-500/50"/></div>
                        <span className="text-xs font-mono text-muted-foreground ml-1">agent://swarm-core</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-[10px] font-semibold text-primary uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping inline-block"/>Swarm Active
                      </div>
                    </div>
                    <CardContent className="flex items-center justify-center py-8 px-4">
                      {/*
                        True 3D orbit:
                          - Outer div sets perspective (camera distance)
                          - Scene pivot (zero-size div at center) applies rotateX(65deg) tilt
                          - Each ring div is centered at pivot via negative margins, spins on Z
                          - Agents sit at top of ring (top: -22px, margin-left: -22px)
                          - Counter animations undo Z spin AND X tilt so cards always face camera
                      */}
                      <div style={{width:'100%',height:'320px',position:'relative',perspective:'680px',perspectiveOrigin:'50% 32%'}}>

                        {/* Ambient background glow */}
                        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'200px',height:'200px',borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%)',pointerEvents:'none'}}/>

                        {/* Scene pivot — tilted 65° on X axis */}
                        <div style={{position:'absolute',top:'52%',left:'50%',width:0,height:0,transformStyle:'preserve-3d',transform:'translate(-50%,-50%) rotateX(65deg)'}}>

                          {/* Floor glow disc (rotated to sit flat in the orbital plane) */}
                          <div style={{position:'absolute',top:'-120px',left:'-120px',width:'240px',height:'240px',borderRadius:'50%',background:'rgba(99,102,241,.08)',filter:'blur(30px)',pointerEvents:'none'}}/>

                          {/* ── Ring 1: Research (yellow) r=70px, 4.5s, starts 0° ── */}
                          <div style={{position:'absolute',top:'-70px',left:'-70px',width:'140px',height:'140px',borderRadius:'50%',border:'1px solid rgba(234,179,8,.5)',transformStyle:'preserve-3d',animation:'r1 4.5s linear infinite',boxShadow:'0 0 12px rgba(234,179,8,.15) inset'}}>
                            <div style={{position:'absolute',top:'-22px',marginLeft:'-22px',left:'50%',transformStyle:'preserve-3d',animation:'cn1 4.5s linear infinite'}}>
                              <div style={{width:'44px',height:'44px',borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',background:'hsl(var(--card))',border:'1px solid rgba(234,179,8,.7)',boxShadow:'0 0 20px rgba(234,179,8,1),0 0 40px rgba(234,179,8,.4),0 0 70px rgba(234,179,8,.15),inset 0 1px 0 rgba(255,255,255,.07)'}}>
                                <Zap style={{width:'16px',height:'16px',color:'rgb(250,204,21)'}}/>
                                <span style={{fontSize:'6px',fontWeight:'700',textTransform:'uppercase',color:'rgb(250,204,21)',letterSpacing:'0.1em'}}>Research</span>
                              </div>
                            </div>
                          </div>

                          {/* ── Ring 2: Copywriter (blue) r=110px, 7.5s, starts 90° ── */}
                          <div style={{position:'absolute',top:'-110px',left:'-110px',width:'220px',height:'220px',borderRadius:'50%',border:'1px solid rgba(59,130,246,.4)',transformStyle:'preserve-3d',animation:'r2 7.5s linear infinite',boxShadow:'0 0 10px rgba(59,130,246,.12) inset'}}>
                            <div style={{position:'absolute',top:'-22px',marginLeft:'-22px',left:'50%',transformStyle:'preserve-3d',animation:'cn2 7.5s linear infinite'}}>
                              <div style={{width:'44px',height:'44px',borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',background:'hsl(var(--card))',border:'1px solid rgba(59,130,246,.7)',boxShadow:'0 0 20px rgba(59,130,246,1),0 0 40px rgba(59,130,246,.4),0 0 70px rgba(59,130,246,.15),inset 0 1px 0 rgba(255,255,255,.07)'}}>
                                <Wand2 style={{width:'16px',height:'16px',color:'rgb(96,165,250)'}}/>
                                <span style={{fontSize:'6px',fontWeight:'700',textTransform:'uppercase',color:'rgb(96,165,250)',letterSpacing:'0.1em'}}>Draft</span>
                              </div>
                            </div>
                          </div>

                          {/* ── Ring 3: Designer (violet) r=150px, 12s, starts 180° ── */}
                          <div style={{position:'absolute',top:'-150px',left:'-150px',width:'300px',height:'300px',borderRadius:'50%',border:'1px solid rgba(139,92,246,.32)',transformStyle:'preserve-3d',animation:'r3 12s linear infinite',boxShadow:'0 0 8px rgba(139,92,246,.1) inset'}}>
                            <div style={{position:'absolute',top:'-22px',marginLeft:'-22px',left:'50%',transformStyle:'preserve-3d',animation:'cn3 12s linear infinite'}}>
                              <div style={{width:'44px',height:'44px',borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',background:'hsl(var(--card))',border:'1px solid rgba(139,92,246,.7)',boxShadow:'0 0 20px rgba(139,92,246,1),0 0 40px rgba(139,92,246,.4),0 0 70px rgba(139,92,246,.15),inset 0 1px 0 rgba(255,255,255,.07)'}}>
                                <Globe style={{width:'16px',height:'16px',color:'rgb(167,139,250)'}}/>
                                <span style={{fontSize:'6px',fontWeight:'700',textTransform:'uppercase',color:'rgb(167,139,250)',letterSpacing:'0.1em'}}>Design</span>
                              </div>
                            </div>
                          </div>

                          {/* ── Ring 4: Compliance (emerald) r=190px, 18s, starts 270° ── */}
                          <div style={{position:'absolute',top:'-190px',left:'-190px',width:'380px',height:'380px',borderRadius:'50%',border:'1px solid rgba(34,197,94,.24)',transformStyle:'preserve-3d',animation:'r4 18s linear infinite',boxShadow:'0 0 6px rgba(34,197,94,.08) inset'}}>
                            <div style={{position:'absolute',top:'-22px',marginLeft:'-22px',left:'50%',transformStyle:'preserve-3d',animation:'cn4 18s linear infinite'}}>
                              <div style={{width:'44px',height:'44px',borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',background:'hsl(var(--card))',border:'1px solid rgba(34,197,94,.7)',boxShadow:'0 0 20px rgba(34,197,94,1),0 0 40px rgba(34,197,94,.4),0 0 70px rgba(34,197,94,.15),inset 0 1px 0 rgba(255,255,255,.07)'}}>
                                <CheckCircle2 style={{width:'16px',height:'16px',color:'rgb(52,211,153)'}}/>
                                <span style={{fontSize:'6px',fontWeight:'700',textTransform:'uppercase',color:'rgb(52,211,153)',letterSpacing:'0.1em'}}>Audit</span>
                              </div>
                            </div>
                          </div>

                          {/* Center core — counter-rotated to face the camera */}
                          <div style={{position:'absolute',top:'-28px',left:'-28px',width:'56px',height:'56px',transform:'rotateX(-65deg)',transformStyle:'preserve-3d',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <div style={{animation:'coreGlow 2.6s ease-in-out infinite',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              {/* Outer glow disc */}
                              <div style={{position:'absolute',width:'56px',height:'56px',borderRadius:'50%',background:'rgba(99,102,241,.25)',filter:'blur(14px)'}}/>
                              {/* Outer ring CW */}
                              <div style={{position:'absolute',width:'52px',height:'52px',borderRadius:'50%',border:'1px solid rgba(99,102,241,.25)',animation:'spinCW 10s linear infinite'}}>
                                <div style={{position:'absolute',top:'-3px',left:'50%',marginLeft:'-3px',width:'6px',height:'6px',borderRadius:'50%',background:'rgba(99,102,241,.7)',boxShadow:'0 0 8px rgba(99,102,241,1)'}}/>
                              </div>
                              {/* Inner ring CCW */}
                              <div style={{position:'absolute',width:'38px',height:'38px',borderRadius:'50%',border:'1.5px solid rgba(99,102,241,.45)',animation:'spinCCW 6s linear infinite'}}>
                                <div style={{position:'absolute',top:'-4px',left:'50%',marginLeft:'-4px',width:'8px',height:'8px',borderRadius:'50%',background:'rgba(99,102,241,.9)',boxShadow:'0 0 10px rgba(99,102,241,1)'}}/>
                              </div>
                              {/* Core orb */}
                              <div style={{width:'26px',height:'26px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'hsl(var(--card))',border:'2px solid rgba(99,102,241,.8)',boxShadow:'0 0 24px rgba(99,102,241,1),0 0 48px rgba(99,102,241,.55),0 0 80px rgba(99,102,241,.22),inset 0 0 12px rgba(99,102,241,.35)',position:'relative',zIndex:10}}>
                                <Loader2 style={{width:'12px',height:'12px',color:'rgb(129,140,248)',animation:'spin 1s linear infinite'}}/>
                              </div>
                            </div>
                          </div>

                        </div>{/* end scene pivot */}
                      </div>{/* end perspective wrapper */}
                    </CardContent>
                  </Card>

                                    {/* RIGHT: Agent status */}
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Pipeline</p>
                      <span className="text-[10px] text-primary font-mono animate-pulse">● Processing</span>
                    </div>
                    {AGENTS.map(({ name, role, icon: Icon, color, bg, border, barColor }, i) => {
                      const status = agentStatuses[i];
                      const barAnims = ['bPulse', 'bPulse2', 'bPulse3', 'bPulse4'];
                      return (
                        <div key={name} className={`p-3.5 rounded-xl border ${border} ${bg} space-y-2`} style={{ animation: `fadeUp .35s ease-out ${i * .08}s both` }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-foreground">{name}</p>
                                <span className={cn('text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                                  status === 'complete' ? 'text-emerald-600 bg-emerald-500/10' :
                                    status === 'active' ? `${color} animate-pulse` : 'text-muted-foreground')}>
                                  {status === 'complete' ? '✓ done' : status === 'active' ? '● running' : '○ queued'}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{role}</p>
                            </div>
                          </div>
                          <div className="h-1 bg-border/40 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor} transition-all`}
                              style={status === 'complete' ? { width: '100%', opacity: .6 } : status === 'active' ? { animation: `${barAnims[i]} 3s ease-in-out infinite` } : { width: 0 }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-1 p-3 rounded-xl border border-border/50 bg-secondary/30 font-mono text-[10px] text-muted-foreground space-y-1">
                      {agentStatuses[0] !== 'queued' && <p className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />Research vectors calibrated</p>}
                      {agentStatuses[1] === 'active' && <p className="flex items-center gap-2 text-primary"><Loader2 className="w-3 h-3 animate-spin shrink-0" />Synthesizing content matrix...</p>}
                      {agentStatuses[2] === 'active' && <p className="flex items-center gap-2 text-violet-400"><Loader2 className="w-3 h-3 animate-spin shrink-0" />Architecting format structure...</p>}
                      {agentStatuses[3] === 'active' && <p className="flex items-center gap-2 text-emerald-400"><Loader2 className="w-3 h-3 animate-spin shrink-0" />Running compliance audit...</p>}
                      {agentStatuses[1] === 'queued' && <p className="flex items-center gap-2 opacity-40"><span className="w-3 shrink-0 text-center">›</span>Awaiting draft...</p>}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Orchestration Failure</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* RESULTS — Tab navigation */}
          {result && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-400">
              <style>{prose}</style>

              {/* Tab bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center bg-secondary/50 rounded-xl p-1 gap-0.5 border border-border/50">
                  {([
                    { id: 'output' as const, label: 'Output', Icon: CheckCircle2, dot: false, dotColor: '' },
                    { id: 'score' as const, label: 'Performance', Icon: Zap, dot: !!performanceResult, dotColor: 'bg-yellow-500' },
                    { id: 'personas' as const, label: 'Personas', Icon: Users, dot: !!personaResult, dotColor: 'bg-violet-500' },
                    { id: 'transmute' as const, label: 'Transmute', Icon: Globe, dot: !!transmuteResult, dotColor: 'bg-blue-500' },
                  ]).map(({ id, label, Icon, dot, dotColor }) => (
                    <button key={id} onClick={() => setActiveResultTab(id)}
                      className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                        activeResultTab === id ? 'bg-background border border-border shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80')}>
                      <Icon className={cn('w-3.5 h-3.5', activeResultTab === id ? (id === 'output' ? 'text-primary' : id === 'score' ? 'text-yellow-500' : id === 'personas' ? 'text-violet-500' : 'text-blue-500') : '')} />
                      {label}
                      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ml-0.5`} />}
                    </button>
                  ))}
                </div>
                {activeResultTab === 'output' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleCopy(cleanContent(result.final_content))}><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</Button>
                    <Button size="sm" className="h-8 text-xs" onClick={() => handleSchedule(result.final_content, "General", undefined, performanceResult?.prediction?.overall_score)}><CalendarDays className="w-3.5 h-3.5 mr-1.5" />Schedule</Button>
                  </div>
                )}
              </div>

              {/* OUTPUT TAB */}
              {activeResultTab === 'output' && (
                <Card className="border-border shadow-sm bg-card overflow-hidden animate-in fade-in duration-300">
                  <div className="px-5 py-3.5 border-b border-border/50 flex items-center gap-3 bg-secondary/20">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /></div>
                    <div><h3 className="text-sm font-semibold">Swarm Output</h3><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Multi-Agent · Final Synthesis</p></div>
                    <div className="ml-auto">
                      {!performanceResult && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={handlePredictPerformance} disabled={analyzingPerformance}>
                          {analyzingPerformance ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />}
                          {analyzingPerformance ? 'Analyzing...' : 'Predict Score'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="fp"><ReactMarkdown>{cleanContent(result.final_content)}</ReactMarkdown></div>
                  </div>
                  <div className="px-6 py-4 border-t border-border/50 bg-secondary/10 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-muted-foreground mr-2">Next step:</span>
                    {[{ tab: 'score' as const, label: 'Predict Performance', cls: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 hover:bg-yellow-500/10', Icon: Zap },
                    { tab: 'personas' as const, label: 'Audience Personas', cls: 'border-violet-500/30 bg-violet-500/5 text-violet-600 hover:bg-violet-500/10', Icon: Users },
                    { tab: 'transmute' as const, label: 'Transmute Format', cls: 'border-blue-500/30 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10', Icon: Globe }
                    ].map(({ tab, label, cls, Icon }) => (
                      <button key={tab} onClick={() => setActiveResultTab(tab)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${cls}`}>
                        <Icon className="w-3 h-3" />{label}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* PERFORMANCE TAB */}
              {activeResultTab === 'score' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  {!performanceResult ? (
                    <Card className="border-border bg-card/80">
                      <CardContent className="p-12 flex flex-col items-center gap-5 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center"><Zap className="w-7 h-7 text-yellow-500" /></div>
                        <div><h3 className="text-base font-semibold mb-1">Oracle Performance Score</h3><p className="text-sm text-muted-foreground max-w-sm">AI-powered engagement prediction. Analyzes hooks, CTAs, emotional triggers, and virality signals.</p></div>
                        <Button className="h-10 px-8 font-semibold bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20" onClick={handlePredictPerformance} disabled={analyzingPerformance}>
                          {analyzingPerformance ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Analyzing...</> : <><Zap className="mr-2 w-4 h-4" />Run Oracle Analysis</>}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-yellow-500" /></div>
                          <div><h3 className="text-sm font-semibold">Performance Prediction</h3><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Oracle AI Analysis</p></div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPerformanceResult(null)}>Re-run</Button>
                      </div>
                      <PerformanceCard prediction={performanceResult.prediction} platform={performanceResult.platform} persona={performanceResult.persona} />
                    </div>
                  )}
                </div>
              )}

              {/* PERSONAS TAB */}
              {activeResultTab === 'personas' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  {!personaResult ? (
                    <Card className="border-violet-500/20 bg-card/80">
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-violet-500/5">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-violet-500" /></div>
                        <div><h3 className="text-sm font-semibold">Audience Personas</h3><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Multi-Variant Generation</p></div>
                      </div>
                      <CardContent className="p-5 space-y-5">
                        <PersonaSelector personas={personas} selectedPersonas={selectedPersonas} onTogglePersona={handleTogglePersona} />
                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button variant="outline" size="sm" className="h-9" onClick={() => { setSelectedPersonas([]); setActiveResultTab('output'); }}>Cancel</Button>
                          <Button className="h-9 font-semibold bg-violet-600 hover:bg-violet-500 text-white flex-1" onClick={handleGeneratePersonas} disabled={generatingPersonas || !selectedPersonas.length}>
                            {generatingPersonas ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Generating...</> : <><Sparkles className="mr-2 w-4 h-4" />Generate {selectedPersonas.length} Variant{selectedPersonas.length !== 1 ? 's' : ''}</>}
                          </Button>
                        </div>
                        <NexusMissionStatus />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                          <div><h3 className="text-sm font-semibold">Persona Variants Ready</h3><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{personaResult.variants.length} variants</p></div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setPersonaResult(null); setSelectedPersonas([]); }}><RefreshCcw className="w-3.5 h-3.5 mr-1.5" />Reset</Button>
                      </div>
                      <Card className="border-border bg-card/80"><CardContent className="p-5"><PersonaVariantsDisplay variants={personaResult.variants} onSchedule={handleSchedule} /></CardContent></Card>
                    </div>
                  )}
                </div>
              )}

              {/* TRANSMUTE TAB */}
              {activeResultTab === 'transmute' && (
                <div className="animate-in fade-in duration-300 space-y-4">
                  {!transmuteResult ? (
                    <Card className="border-blue-500/20 bg-card/80">
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-blue-500/5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Globe className="w-4 h-4 text-blue-500" /></div>
                        <div><h3 className="text-sm font-semibold">Platform Transmute</h3><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Format & Dialect Conversion</p></div>
                      </div>
                      <CardContent className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Platform</label>
                            <Select value={targetFormat} onValueChange={setTargetFormat}>
                              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Twitter Thread">Twitter / X Thread</SelectItem>
                                <SelectItem value="Instagram Reel Script">Instagram Reel Script</SelectItem>
                                <SelectItem value="LinkedIn Post">LinkedIn Professional</SelectItem>
                                <SelectItem value="Blog Post">Long-form Blog</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regional Dialect</label>
                            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['English', 'Hinglish', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'Marathi', 'Bengali', 'Telugu'].map(l => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button variant="outline" size="sm" className="h-9" onClick={() => setActiveResultTab('output')}>Cancel</Button>
                          <Button className="h-9 font-semibold bg-blue-600 hover:bg-blue-500 text-white flex-1" onClick={handleTransmute} disabled={transmuting}>
                            {transmuting ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Transmuting...</> : <><Zap className="mr-2 w-4 h-4" />Transmute</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-blue-500" /></div>
                          <div><h3 className="text-sm font-semibold">Transmutation Complete</h3><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{targetFormat} · {targetLanguage}</p></div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleCopy(transmuteResult.transformed_content)}><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTransmuteResult(null)}><RefreshCcw className="w-3.5 h-3.5 mr-1.5" />Re-transmute</Button>
                        </div>
                      </div>
                      <Card className="border-blue-500/20 bg-card/80">
                        <CardContent className="p-6 space-y-5">
                          <div className="fp"><ReactMarkdown>{transmuteResult.transformed_content}</ReactMarkdown></div>
                          <div className="pt-4 border-t border-border/50 space-y-3">
                            <div className="flex items-start gap-3 bg-secondary/40 p-3 rounded-lg border border-border/50">
                              <Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <div><p className="text-xs font-semibold">Regional & Format Nuance</p><p className="text-xs text-muted-foreground italic mt-0.5">"{transmuteResult.regional_nuance}"</p></div>
                            </div>
                            {transmuteResult.suggested_tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {transmuteResult.suggested_tags.map((t: string) => (
                                  <Badge key={t} variant="outline" className="text-xs px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">#{t.replace('#', '')}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Schedule Dialog */}
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogContent className="sm:max-w-[425px] border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-semibold"><CalendarDays className="w-4 h-4 text-primary" />Schedule Implementation</DialogTitle>
                <DialogDescription className="text-sm">Set the optimal date and time for this content to go live.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-9 justify-start text-left font-normal text-sm", !scheduleDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={scheduleDate} onSelect={d => d && setScheduleDate(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Select Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                      className="pl-9 h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                </div>
                {schedulingScore && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
                    <div><p className="text-xs font-semibold">Oracle Score</p><p className="text-xs text-muted-foreground">{schedulingScore}/100 engagement prediction</p></div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="h-9 text-sm" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                <Button className="h-9 text-sm" onClick={confirmSchedule} disabled={isFinalizingSchedule}>
                  {isFinalizingSchedule ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Scheduling...</> : <><CalendarDays className="mr-2 w-4 h-4" />Confirm Schedule</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  );
}

export const Route = createFileRoute('/_authenticated/forge/')({
  component: ForgePage,
});
