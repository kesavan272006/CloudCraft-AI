import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { useSessionState } from '@/hooks/useSessionState';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Hammer, Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, Globe,
  RefreshCcw, Zap, Users, Wand2, CalendarDays, Clock,
  Calendar as CalendarIcon, Search as SearchIcon, X, Cpu,
  BarChart3
} from "lucide-react";
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
import { LiveSwarmCanvas } from '@/components/forge/LiveSwarmCanvas';
import { DigitalFocusGroup } from '@/components/forge/DigitalFocusGroup';
import { AutonomousAutoPilot } from '@/components/forge/AutonomousAutoPilot';

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: true, disabled: false },
  { title: 'Missions', href: '/tasks', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
];

type ResultTab = 'output' | 'score' | 'personas' | 'transmute';

const AGENTS = [
  { name: 'Researcher', role: 'Market intelligence & data signals', icon: Zap, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { name: 'Copywriter', role: 'Narrative synthesis & content structure', icon: Wand2, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { name: 'Designer', role: 'Format architecture & visual hierarchy', icon: Globe, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { name: 'Compliance', role: 'Brand alignment & quality audit', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
] as const;

const QUICK_PROMPTS = [
  "Viral LinkedIn post on India AI market",
  "Instagram reel script for D2C brand launch",
  "Twitter thread: 5 SaaS growth frameworks",
  "Blog intro: Future of vernacular content",
];

export default function ForgePage() {
  // ── Persisted state: survives navigate-away and back ──────────────────────
  const [prompt, setPrompt] = useSessionState<string>('forge_prompt', '');
  const [result, setResult] = useSessionState<any>('forge_result', null);
  const [activeResultTab, setActiveResultTab] = useSessionState<ResultTab>('forge_tab', 'output');
  const [performanceResult, setPerformanceResult] = useSessionState<PerformanceResponse | null>('forge_perf', null);
  const [personaResult, setPersonaResult] = useSessionState<PersonaResponse | null>('forge_persona', null);
  const [transmuteResult, setTransmuteResult] = useSessionState<any>('forge_transmute', null);
  const [isAutoPilotActive, setIsAutoPilotActive] = useSessionState<boolean>('forge_autopilot', false);
  const [targetFormat, setTargetFormat] = useSessionState<string>('forge_format', 'LinkedIn Post');
  const [targetLanguage, setTargetLanguage] = useSessionState<string>('forge_language', 'English');

  const [loading, setLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingPerformance, setAnalyzingPerformance] = useState(false);
  const [transmuting, setTransmuting] = useState(false);
  const [personas, setPersonas] = useState<PersonaInfo[]>([
    { id: "gen_z", name: "Gen-Z (18-24)", description: "Young, digital-native, trend-conscious", age_range: "18-24", platforms: ["Instagram", "TikTok"] },
    { id: "professional", name: "Working Professional (25-35)", description: "Career-focused, value-driven", age_range: "25-35", platforms: ["LinkedIn"] },
    { id: "parent", name: "Parents (30-50)", description: "Family-focused, practical", age_range: "30-50", platforms: ["Facebook"] },
    { id: "entrepreneur", name: "Entrepreneurs (25-40)", description: "Growth-minded, innovation-focused", age_range: "25-40", platforms: ["Twitter", "LinkedIn"] },
  ]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [generatingPersonas, setGeneratingPersonas] = useState(false);

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [schedulingContent, setSchedulingContent] = useState('');
  const [schedulingPlatform, setSchedulingPlatform] = useState('');
  const [schedulingPersona, setSchedulingPersona] = useState<string | undefined>();
  const [schedulingScore, setSchedulingScore] = useState<number | undefined>();
  const [isFinalizingSchedule, setIsFinalizingSchedule] = useState(false);

  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); };

  const cleanContent = (text: string) => {
    if (!text) return "";
    return text
      .replace(/NEXT:.*$/gm, '').replace(/REASON:.*$/gm, '')
      .replace(/Compliance output:/gi, '').replace(/Designer output:/gi, '')
      .replace(/Copywriter output:/gi, '').replace(/Researcher output:/gi, '').trim();
  };

  // Frozen snapshot of original generated content — computed once.
  // Prevents DigitalFocusGroup / AutoPilot from restarting when AutoPilot
  // calls onOptimize and updates result.final_content.
  const frozenResultRef = useRef<string | null>(null);
  if (result?.final_content && frozenResultRef.current === null) {
    frozenResultRef.current = cleanContent(result.final_content);
  }
  const frozenContent = frozenResultRef.current ?? '';

  const handleForge = async (e?: React.MouseEvent | React.KeyboardEvent, autoPrompt?: string) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const inputPrompt = autoPrompt || prompt;
    if (!inputPrompt.trim()) { setError("Please enter a prompt first"); return; }
    if (autoPrompt) setPrompt(autoPrompt);
    setLoading(true); setError(null); setResult(null);
    setTransmuteResult(null); setPersonaResult(null); setPerformanceResult(null);
    setActiveResultTab('output');
    setIsLiveMode(true);
  };

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
      toast.success("Performance analysis complete");
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
        body: JSON.stringify({
          content: cleanContent(schedulingContent), platform: schedulingPlatform,
          scheduled_time: d.toISOString(), performance_score: schedulingScore || 70,
          persona_name: schedulingPersona
        }),
      });
      if (res.ok) { toast.success("Scheduled successfully!"); setIsScheduleDialogOpen(false); }
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
    fetch('http://127.0.0.1:8000/api/v1/persona/list')
      .then(r => r.ok && r.json()).then(d => d && setPersonas(d)).catch(() => { });

    // Param Autofill from Chronos
    const params = new URLSearchParams(window.location.search);
    if (params.get('autofill') === 'true' && params.get('prompt')) {
      const p = params.get('prompt') || '';
      setPrompt(p);
      setTimeout(() => {
        handleForge(undefined, p);
      }, 500);
      window.history.replaceState({}, '', '/forge');
    }
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
      toast.success(`${data.variants.length} variants generated`);
    } catch (e: any) { toast.error("Failed: " + e.message); }
    finally { setGeneratingPersonas(false); }
  };
  const handleNewSession = () => {
    // Clear all forge session keys (including focus group) from sessionStorage
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('forge_session_v1__') || k.startsWith('forge_focus_group_v1__'))
      .forEach(k => sessionStorage.removeItem(k));
    frozenResultRef.current = null;
    setResult(null); setTransmuteResult(null); setPersonaResult(null); setPerformanceResult(null);
    setIsLiveMode(false); setLoading(false); setPrompt(''); setError(null);
    setIsAutoPilotActive(false);
    toast.info("Session reset — ready for new directive.");
  };

  const prose = `
    .fp h1,.fp h2,.fp h3{font-weight:600;margin-top:1.4em;margin-bottom:.4em;color:hsl(var(--foreground))}
    .fp h1{font-size:1.2rem;border-bottom:1px solid hsl(var(--border)/.4);padding-bottom:.4em}
    .fp h2{font-size:1.05rem}.fp h3{font-size:.95rem;color:hsl(var(--muted-foreground))}
    .fp p{line-height:1.8;margin-bottom:.85em;font-size:.9rem;color:hsl(var(--foreground)/.9)}
    .fp ul,.fp ol{padding-left:1.4em;margin-bottom:.85em}
    .fp li{margin-bottom:.3em;line-height:1.7;font-size:.9rem}
    .fp strong{font-weight:600}.fp em{color:hsl(var(--muted-foreground))}
    .fp code{background:hsl(var(--secondary));padding:.1em .35em;border-radius:4px;font-size:.82rem;font-family:monospace}
    .fp blockquote{border-left:3px solid hsl(var(--primary)/.4);padding-left:1em;margin:1em 0;color:hsl(var(--muted-foreground));font-style:italic}
    .fp hr{border:none;border-top:1px solid hsl(var(--border)/.4);margin:1.4em 0}
  `;

  const resultTabs = [
    { id: 'output' as const, label: 'Output', Icon: CheckCircle2 },
    { id: 'score' as const, label: 'Performance', Icon: BarChart3, dot: !!performanceResult },
    { id: 'personas' as const, label: 'Personas', Icon: Users, dot: !!personaResult },
    { id: 'transmute' as const, label: 'Transmute', Icon: Globe, dot: !!transmuteResult },
  ];

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

      <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-8 relative w-full overflow-hidden">
        {/* Premium dot-matrix background grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        {/* Premium gradient mesh overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30"
          style={{ 
            background: 'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
          }}>
        </div>

        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ top: '10%', left: '5%' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-pink-500/20 blur-3xl"
            animate={{
              x: [0, -60, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            style={{ bottom: '15%', right: '10%' }}
          />
        </div>

        {/* Page Header with Premium Animations */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10"
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
              Swarm Engine Online
            </motion.div>
            <motion.h1 
              className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              The Forge
              <Hammer className="h-8 w-8 md:h-10 md:w-10 text-indigo-500 animate-pulse" />
            </motion.h1>
            <motion.p 
              className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Deploy a parallel AI agent swarm to research, synthesize, and generate high-conversion content.
            </motion.p>
          </div>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="outline" className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl" onClick={handleNewSession}>
                <RefreshCcw className="w-4 h-4 mr-2" />New Session
              </Button>
            </motion.div>
          )}
        </motion.div>

        <div className="relative z-10 space-y-6">
          {/* INPUT SECTION */}
          {!result && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {isLiveMode ? (
                <LiveSwarmCanvas
                  prompt={prompt}
                  onComplete={(payload) => { setResult(payload); setIsLiveMode(false); setLoading(false); toast.success("Swarm synthesis complete!"); }}
                  onCancel={() => { setIsLiveMode(false); setLoading(false); }}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Command Input */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl rounded-xl overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-indigo-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                      {/* Premium outer glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 hover:opacity-100 blur-xl rounded-xl transition-opacity duration-500 pointer-events-none" />
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-muted/20 via-muted/10 to-transparent relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground ml-2">forge://mission-directive</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />Ready
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <Textarea
                          placeholder={"What shall the swarm forge?\n\ne.g., 'Draft a viral LinkedIn post on the AI market in India for Q1 2026 — include data hooks and strong CTAs.'"}
                          className="min-h-[180px] w-full bg-transparent border-0 focus-visible:ring-0 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/40 resize-none px-4 py-4"
                          value={prompt} onChange={e => setPrompt(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt && !loading) { e.preventDefault(); handleForge(e); } }}
                        />
                        <div className="px-4 py-3 border-t border-border/50 bg-secondary/10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {prompt && <span className="text-xs text-muted-foreground font-mono">{prompt.length} chars</span>}
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono ml-1">↵</kbd>
                            </span>
                          </div>
                          <Button className="h-8 px-4 text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500/90 text-white hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 border-0 relative overflow-hidden group" onClick={(e) => handleForge(e)} disabled={!prompt.trim() || loading}>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 relative z-10" />
                            <span className="relative z-10">Deploy Swarm</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick prompts */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Quick directives</p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map(s => (
                          <button key={s} onClick={() => setPrompt(s)}
                            className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/60 transition-all font-medium">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Agent Panel */}
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Swarm Agents</p>
                    <div className="space-y-2">
                      {AGENTS.map(({ name, role, icon: Icon, color, bg, border }) => (
                        <div key={name} className={`flex items-center gap-3 p-3 rounded-xl border ${border} ${bg}`}>
                          <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{role}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">Standby</span>
                        </div>
                      ))}
                    </div>

                    <Card className="relative border border-border/40 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-xl rounded-xl overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-indigo-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                      <CardContent className="p-4 space-y-3 relative z-10">
                        <p className="text-xs font-semibold flex items-center gap-2">
                          <Hammer className="w-3.5 h-3.5 text-primary" />Pipeline Capabilities
                        </p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {['Multi-platform content generation', 'Brand compliance auto-checks', 'Persona-targeted variants', 'Regional dialect adaptation', 'Performance score prediction'].map(i => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary shrink-0" />{i}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert variant="destructive" className="relative z-10 border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent backdrop-blur-xl shadow-xl shadow-red-500/10 before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-red-500/20 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
                    {/* Premium glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent opacity-50 blur-lg rounded-lg pointer-events-none" />
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Orchestration Failure</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESULTS SECTION */}
          {result && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <style>{prose}</style>

              {/* Tab Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center bg-secondary/50 rounded-xl p-1 gap-0.5 border border-border/50">
                  {resultTabs.map(({ id, label, Icon, dot }) => (
                    <button key={id} onClick={() => setActiveResultTab(id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                        activeResultTab === id
                          ? 'bg-background border border-border shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      )}>
                      <Icon className={cn('w-3.5 h-3.5', activeResultTab === id && 'text-primary')} />
                      {label}
                      {dot && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
                    </button>
                  ))}
                </div>

                {activeResultTab === 'output' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-orange-600 border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
                      onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}>
                      <Cpu className="w-3.5 h-3.5" />
                      {isAutoPilotActive ? "Close AutoPilot" : "Auto-Optimize"}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
                      onClick={() => handleCopy(cleanContent(result.final_content))}>
                      <Copy className="w-3.5 h-3.5" />Copy
                    </Button>
                    <Button size="sm" className="h-8 text-xs gap-1.5"
                      onClick={() => handleSchedule(result.final_content, "General", undefined, performanceResult?.prediction?.overall_score)}>
                      <CalendarDays className="w-3.5 h-3.5" />Schedule
                    </Button>
                  </div>
                )}
              </div>

              {/* Output Tab */}
              {activeResultTab === 'output' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Main output card */}
                  <div className={cn("flex flex-col", isAutoPilotActive ? "lg:col-span-7" : "lg:col-span-8")}>
                    <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl rounded-xl overflow-hidden flex flex-col before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-indigo-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                      {/* Premium outer glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 hover:opacity-100 blur-xl rounded-xl transition-opacity duration-500 pointer-events-none" />
                      {/* Compact card header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-muted/20 via-muted/10 to-transparent relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">Swarm Output</p>
                            <p className="text-[10px] text-muted-foreground">Multi-agent final synthesis</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground"
                          onClick={() => handleCopy(cleanContent(result.final_content))}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {/* Content */}
                      <CardContent className="p-5 flex-1 relative z-10">
                        <div className="fp"><ReactMarkdown>{cleanContent(result.final_content)}</ReactMarkdown></div>
                      </CardContent>
                      {/* Footer actions */}
                      <div className="px-4 py-3 border-t border-border/50 bg-secondary/[0.04] flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Next step:</span>
                        {[
                          { tab: 'score' as const, label: 'Performance', Icon: BarChart3, cls: 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 dark:text-yellow-400' },
                          { tab: 'personas' as const, label: 'Personas', Icon: Users, cls: 'text-violet-600 border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 dark:text-violet-400' },
                          { tab: 'transmute' as const, label: 'Transmute', Icon: Globe, cls: 'text-sky-600 border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 dark:text-sky-400' },
                        ].map(({ tab, label, Icon, cls }) => (
                          <button key={tab} onClick={() => setActiveResultTab(tab)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${cls}`}>
                            <Icon className="w-3 h-3" />{label}
                          </button>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Right Sidebar — sticky */}
                  <div className={cn(isAutoPilotActive ? "lg:col-span-5" : "lg:col-span-4")}>
                    <div className="sticky top-[72px] space-y-3">
                      {/* AutoPilot — only shown when toggled */}
                      {isAutoPilotActive && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <AutonomousAutoPilot
                            initialContent={frozenContent}
                            onOptimize={(optimized) => setResult({ ...result, final_content: optimized })}
                          />

                        </div>
                      )}

                      <DigitalFocusGroup
                        content={frozenContent}
                        sessionKey={`fg_${prompt.slice(0, 48).replace(/\s+/g, '_')}`}
                      />


                      {/* Compact action strip */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={handlePredictPerformance}
                          disabled={analyzingPerformance}
                          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors disabled:opacity-50">
                          {analyzingPerformance ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                          <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">{analyzingPerformance ? 'Scoring…' : 'Score'}</span>
                        </button>
                        <button
                          onClick={() => handleSchedule(result.final_content, "General")}
                          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Schedule</span>
                        </button>
                        <button
                          onClick={() => setActiveResultTab('transmute')}
                          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
                          <Globe className="w-4 h-4 text-sky-500" />
                          <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">Transmute</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeResultTab === 'score' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {!performanceResult ? (
                    <Card className="relative border border-yellow-500/30 shadow-xl shadow-yellow-500/10 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent backdrop-blur-xl rounded-xl overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-yellow-500/20 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
                      {/* Premium glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-50 blur-xl rounded-xl transition-opacity duration-500 pointer-events-none" />
                      <CardContent className="p-12 flex flex-col items-center gap-5 text-center relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold mb-1">Oracle Performance Score</h3>
                          <p className="text-sm text-muted-foreground max-w-sm">AI-powered engagement prediction analyzing hooks, CTAs, emotional triggers, and virality signals.</p>
                        </div>
                        <Button className="h-10 px-8 font-bold shadow-xl shadow-yellow-500/25 transition-all bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500/90 text-black hover:shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 border-0 relative overflow-hidden group"
                          onClick={handlePredictPerformance} disabled={analyzingPerformance}>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          {analyzingPerformance ? <><Loader2 className="animate-spin mr-2 w-4 h-4 relative z-10" />Analyzing...</> : <><Zap className="mr-2 w-4 h-4 relative z-10" />Run Oracle Analysis</>}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Performance Prediction</h3>
                            <p className="text-xs text-muted-foreground">Oracle AI Analysis</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPerformanceResult(null)}>Re-run</Button>
                      </div>
                      <PerformanceCard prediction={performanceResult.prediction} platform={performanceResult.platform} persona={performanceResult.persona} />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Personas Tab */}
              {activeResultTab === 'personas' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {!personaResult ? (
                    <Card className="relative border border-violet-500/30 shadow-xl shadow-violet-500/10 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent backdrop-blur-xl rounded-xl overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-violet-500/20 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
                      {/* Premium glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/10 to-transparent opacity-50 blur-xl rounded-xl transition-opacity duration-500 pointer-events-none" />
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">Audience Personas</h3>
                          <p className="text-xs text-muted-foreground">Multi-variant generation</p>
                        </div>
                      </div>
                      <CardContent className="p-5 space-y-5">
                        <PersonaSelector personas={personas} selectedPersonas={selectedPersonas} onTogglePersona={handleTogglePersona} />
                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button variant="outline" size="sm" className="h-9" onClick={() => { setSelectedPersonas([]); setActiveResultTab('output'); }}>Cancel</Button>
                          <Button className="h-9 font-bold bg-gradient-to-r from-violet-500 via-violet-600 to-violet-500/90 hover:from-violet-600 hover:via-violet-700 hover:to-violet-600/90 text-white flex-1 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all hover:scale-105 relative overflow-hidden group"
                            onClick={handleGeneratePersonas} disabled={generatingPersonas || !selectedPersonas.length}>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                            {generatingPersonas ? <><Loader2 className="animate-spin mr-2 w-4 h-4 relative z-10" />Generating...</> : <><Sparkles className="mr-2 w-4 h-4 relative z-10" />Generate {selectedPersonas.length} Variant{selectedPersonas.length !== 1 ? 's' : ''}</>}
                          </Button>
                        </div>
                        <NexusMissionStatus />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Persona Variants Ready</h3>
                            <p className="text-xs text-muted-foreground">{personaResult.variants.length} variants generated</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setPersonaResult(null); setSelectedPersonas([]); }}>
                          <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />Reset
                        </Button>
                      </div>
                      <Card className="border-border bg-card/60 rounded-xl"><CardContent className="p-5"><PersonaVariantsDisplay variants={personaResult.variants} onSchedule={handleSchedule} /></CardContent></Card>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Transmute Tab */}
              {activeResultTab === 'transmute' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {!transmuteResult ? (
                    <Card className="relative border border-sky-500/30 shadow-xl shadow-sky-500/10 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent backdrop-blur-xl rounded-xl overflow-hidden before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-sky-500/20 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
                      {/* Premium glow */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-sky-500/10 to-transparent opacity-50 blur-xl rounded-xl transition-opacity duration-500 pointer-events-none" />
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-sky-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">Platform Transmute</h3>
                          <p className="text-xs text-muted-foreground">Format & dialect conversion</p>
                        </div>
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
                          <Button className="h-9 font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500/90 hover:from-sky-600 hover:via-sky-700 hover:to-sky-600/90 text-white flex-1 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 transition-all hover:scale-105 relative overflow-hidden group"
                            onClick={handleTransmute} disabled={transmuting}>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                              initial={{ x: '-100%' }}
                              whileHover={{ x: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                            {transmuting ? <><Loader2 className="animate-spin mr-2 w-4 h-4 relative z-10" />Transmuting...</> : <><Zap className="mr-2 w-4 h-4 relative z-10" />Transmute</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-sky-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Transmutation Complete</h3>
                            <p className="text-xs text-muted-foreground">{targetFormat} · {targetLanguage}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleCopy(transmuteResult.transformed_content)}>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />Copy
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTransmuteResult(null)}>
                            <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />Re-transmute
                          </Button>
                        </div>
                      </div>
                      <Card className="border-sky-500/20 bg-card/60 rounded-xl">
                        <CardContent className="p-6 space-y-5">
                          <div className="fp"><ReactMarkdown>{transmuteResult.transformed_content}</ReactMarkdown></div>
                          <div className="pt-4 border-t border-border/50 space-y-3">
                            <div className="flex items-start gap-3 bg-secondary/40 p-3 rounded-lg border border-border/50">
                              <Zap className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold">Regional & Format Nuance</p>
                                <p className="text-xs text-muted-foreground italic mt-0.5">"{transmuteResult.regional_nuance}"</p>
                              </div>
                            </div>
                            {transmuteResult.suggested_tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {transmuteResult.suggested_tags.map((t: string) => (
                                  <Badge key={t} variant="outline" className="text-xs px-2.5 py-0.5 bg-sky-500/10 text-sky-600 border-sky-500/20 font-mono dark:text-sky-400">#{t.replace('#', '')}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Schedule Dialog */}
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogContent className="sm:max-w-[425px] border-border rounded-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarDays className="w-4 h-4 text-primary" />Schedule Post
                </DialogTitle>
                <DialogDescription className="text-sm">Set the optimal date and time for this content to publish.</DialogDescription>
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
                      className="pl-9 h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                  </div>
                </div>
                {schedulingScore && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">Oracle Score</p>
                      <p className="text-xs text-muted-foreground">{schedulingScore}/100 engagement prediction</p>
                    </div>
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
