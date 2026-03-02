import React, { useState, useEffect, useRef } from 'react'
import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  Sparkles, Brain, Eye, Zap,
  ShieldCheck, Globe, ChevronRight, Github, Twitter, Linkedin,
  Terminal, Database, Cpu, Network, ArrowRight,
  Workflow, Activity, Search, Focus, Box
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: IndexSwitcher,
})

function IndexSwitcher() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#000000] text-white overflow-hidden perspective-1000'>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className='relative flex flex-col items-center justify-center z-10 animate-float'>
          <div className="h-32 w-32 relative flex items-center justify-center mb-12 transform-style-3d rotate-x-12 rotate-y-12">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border-r-2 border-fuchsia-500 animate-[spin_3s_linear_infinite_reverse]" />
            <div className="absolute inset-4 rounded-full border-b-2 border-cyan-500 animate-[spin_4s_linear_infinite]" />
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className='text-sm font-mono tracking-[0.4em] text-zinc-400 uppercase animate-pulse'>Igniting 3D Core Engine...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to='/dashboard' />
  }

  return <LandingPageUI />
}

// --- 3D & INTERACTIVE COMPONENTS ---

// Spotlight Card with 3D Tilt
function TiltCard({ children, className = "", spotlightColor = "rgba(99,102,241,0.15)" }: { children: React.ReactNode, className?: string, spotlightColor?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    // Spotlight Logic
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // 3D Tilt Logic
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateX = (mouseY / (rect.height / 2)) * -10; // Max 10 deg
    const rotateY = (mouseX / (rect.width / 2)) * 10;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.1s ease-out' }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#050505] shadow-2xl ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 ease-in-out z-0"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

// Continuous Marquee
function Marquee({ children, reverse = false }: { children: React.ReactNode, reverse?: boolean }) {
  return (
    <div className="overflow-hidden flex w-full relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
      <div className={`flex whitespace-nowrap min-w-full shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        <div className="flex justify-around items-center min-w-full shrink-0 gap-8 px-4">
          {children}
        </div>
        <div className="flex justify-around items-center min-w-full shrink-0 gap-8 px-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// MAIN PAGE VIEW
// ----------------------------------------------------------------------

function LandingPageUI() {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    let animationFrameId: number;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className='min-h-screen bg-[#000000] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative perspective-1000'>

      {/* CSS ANIMATIONS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        @keyframes marquee-reverse { 0% { transform: translateX(-100%); } 100% { transform: translateX(0); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 30s linear infinite; }
        
        @keyframes custom-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes custom-float-alt { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
        @keyframes spin-slow { 100% { transform: rotate(360deg); } }
        
        .animate-float { animation: custom-float 6s ease-in-out infinite; }
        .animate-float-alt { animation: custom-float-alt 12s ease-in-out infinite; }
        
        /* 3D Utility Classes */
        .preserve-3d { transform-style: preserve-3d; }
        .translate-z-10 { transform: translateZ(20px); }
        .translate-z-20 { transform: translateZ(40px); }
        .translate-z-30 { transform: translateZ(60px); }
      `}} />

      {/* REACTIVE 3D CURSOR GLOW (Moves oppositely slightly in 3D space) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-50 transition-transform duration-100 preserve-3d">
        <div
          className="absolute w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[150px] ease-out"
          style={{ transform: `translate3d(${mousePos.x - 300}px, ${mousePos.y - 300}px, -100px)` }}
        />
        <div
          className="absolute w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[150px] ease-out"
          style={{ transform: `translate3d(${mousePos.x - 250 + 100}px, ${mousePos.y - 250 + 100}px, 50px)` }}
        />
      </div>

      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* NAVBAR */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 border-b ${scrolled ? 'bg-black/60 backdrop-blur-2xl border-white/10 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'bg-transparent border-transparent py-6'}`}>
        <div className='container mx-auto px-6 max-w-7xl flex items-center justify-between'>
          <div className='flex items-center gap-3 group cursor-pointer preserve-3d hover:scale-105 transition-transform'>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden translate-z-10 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-shadow duration-500'>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
              <Sparkles className='h-5 w-5 text-zinc-100 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' />
            </div>
            <span className='text-2xl font-bold tracking-tighter text-white translate-z-20'>Cloud<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Craft</span></span>
          </div>
          <nav className='flex items-center gap-8'>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#engine" className="hover:text-white hover:-translate-y-0.5 transition-all">The Engine</a>
              <a href="#topology" className="hover:text-white hover:-translate-y-0.5 transition-all">Topology</a>
              <a href="#scale" className="hover:text-white hover:-translate-y-0.5 transition-all">Scale</a>
            </div>
            <div className="w-px h-5 bg-white/10 hidden md:block"></div>
            <Link to='/sign-in' className='hidden md:block text-sm font-medium text-white hover:text-indigo-400 transition-colors'>
              Log In
            </Link>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full opacity-50 blur-md group-hover:opacity-100 transition duration-500"></div>
              <Button className='relative h-10 rounded-full px-6 bg-[#050505] text-white hover:bg-black font-semibold border border-white/20 transition-all preserve-3d hover:translate-z-10' asChild>
                <Link to='/sign-in'>Initialize Runtime <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className='relative z-10'>

        {/* HERO SECTION - GENESIS */}
        <section className='relative pt-44 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[95vh] preserve-3d'>

          {/* 3D Grid Floor / Horizon */}
          <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:100px_100px] [transform:rotateX(70deg)_translateZ(-200px)_translateY(200px)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_50%)] opacity-40 pointer-events-none" />

          {/* Floating Massive 3D Objects */}
          <div className="absolute top-1/4 left-[5%] animate-float-alt opacity-60 pointer-events-none hidden lg:block">
            <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-3xl [transform:rotateX(45deg)_rotateY(45deg)] mix-blend-screen shadow-[0_0_50px_rgba(99,102,241,0.2)]" />
          </div>
          <div className="absolute bottom-1/4 right-[10%] animate-float opacity-60 pointer-events-none hidden lg:block" style={{ animationDelay: '2s' }}>
            <div className="w-40 h-40 border-4 border-fuchsia-500/20 rounded-full [transform:rotateX(60deg)_rotateY(20deg)] mix-blend-screen shadow-[0_0_50px_rgba(236,72,153,0.2)]" />
          </div>

          {/* Core Content Box with 3D Tilt */}
          <div
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-6xl mx-auto preserve-3d transition-transform duration-200"
            style={{ transform: `rotateX(${(mousePos.y - window.innerHeight / 2) * -0.01}deg) rotateY(${(mousePos.x - window.innerWidth / 2) * 0.01}deg)` }}
          >

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md mb-8 hover:bg-indigo-500/20 transition-all cursor-pointer translate-z-10 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase font-mono">Kernel v2.0 Operational</span>
            </div>

            <h1 className='text-6xl sm:text-7xl md:text-[8rem] lg:text-[9.5rem] font-black tracking-tighter leading-[0.85] text-white mb-8 translate-z-30 drop-shadow-2xl'>
              <span className="opacity-40 blur-[2px] absolute inset-0 text-indigo-500 translate-y-4 -translate-z-30 pointer-events-none">Agentic</span>
              Agentic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-zinc-600 relative">
                Reality.
              </span>
            </h1>

            <p className='text-xl md:text-3xl text-zinc-400 max-w-4xl font-light leading-relaxed tracking-wide mb-14 translate-z-20 drop-shadow-md'>
              Welcome to the Era of the <strong className="text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">AI Hivemind.</strong>
              <br /> A centralized engine of specialized agents that autonomously research, design, copywrite, and deploy.
            </p>

            <div className='flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto z-20 translate-z-30'>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full opacity-70 blur-xl group-hover:opacity-100 transition duration-500 animate-[spin_4s_linear_infinite] group-hover:animate-none"></div>
                <Button className='relative h-16 px-10 rounded-full bg-white text-black hover:bg-zinc-200 text-xl font-bold transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.5)] flex items-center gap-3' asChild>
                  <Link to='/sign-in'>
                    Boot System Control <Zap className="w-5 h-5 fill-black" />
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </section>

        {/* METRICS MARQUEE - 3D STRIP */}
        <div className="border-y border-white/10 py-6 overflow-hidden relative backdrop-blur-3xl bg-black/40 z-20 shadow-[0_10px_50px_rgba(0,0,0,1)]">
          <Marquee>
            {[
              { label: "Token Processing", value: "2M+/sec", icon: Cpu },
              { label: "Agent Synchronization", value: "< 50ms", icon: Network },
              { label: "Cultural Alignment", value: "Bharat-Native", icon: Focus },
              { label: "Context Memory", value: "Infinite Vector", icon: Database },
              { label: "Uptime", value: "99.99%", icon: Activity },
            ].map((metric, i) => (
              <div key={i} className="flex items-center gap-4 px-12 border-r border-white/5 last:border-r-0">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <metric.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-2xl tracking-tighter">{metric.value}</div>
                  <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{metric.label}</div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* CONTEXT 1: THE ENGINE ROOM (3D GRID) */}
        <section id="engine" className="py-40 px-6 relative preserve-3d">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                <Box className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-semibold tracking-wider text-fuchsia-200 uppercase">The 5 Pillars</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 relative">
                  Hivemind.
                  <div className="absolute inset-x-0 bottom-2 h-2 bg-indigo-500/30 blur-sm"></div>
                </span>
              </h2>
              <p className="mt-6 text-2xl text-zinc-400 font-light max-w-2xl mx-auto">
                Five highly specialized AI runtimes operating in parallel, communicating via shared vector memory.
              </p>
            </div>

            {/* 3D Agent Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">

              {/* Agent 01 */}
              <TiltCard spotlightColor="rgba(59,130,246,0.2)" className="p-8 h-96 flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors">01</span>
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Search className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Researcher Node</h3>
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">Scrapes the live internet via Tavily APIs. It hunts for micro-trends, competitor gaps, and virality triggers unique to the Indian market.</p>
                </div>
              </TiltCard>

              {/* Agent 02 */}
              <TiltCard spotlightColor="rgba(168,85,247,0.2)" className="p-8 h-96 flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-white/5 group-hover:text-purple-500/10 transition-colors">02</span>
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <Terminal className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Copywriter Engine</h3>
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">Ingests the research and drafts hooks in Hinglish, English, or regional tones. Calibrates perfectly to your exact brand voice.</p>
                </div>
              </TiltCard>

              {/* Agent 03 */}
              <TiltCard spotlightColor="rgba(236,72,153,0.2)" className="p-8 h-96 flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-white/5 group-hover:text-pink-500/10 transition-colors">03</span>
                  <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                    <Eye className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Vision Lab</h3>
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">Prompts visual models using high-context architectural awareness to generate assets that don't look awkwardly "AI generated".</p>
                </div>
              </TiltCard>

              {/* Agent 04 */}
              <TiltCard spotlightColor="rgba(245,158,11,0.2)" className="p-8 h-96 flex flex-col justify-between group lg:col-start-1 lg:col-end-3">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-white/5 group-hover:text-amber-500/10 transition-colors">04</span>
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="max-w-xl">
                  <h3 className="text-3xl font-bold text-white mb-4">Compliance Sentinel</h3>
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">The ultimate gatekeeper. It audits every piece of text and image against your stored Brand RAG vectors to ensure absolute safety and PR compliance before output.</p>
                </div>
                <div className="absolute right-8 bottom-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <ShieldCheck className="w-40 h-40 text-amber-500" />
                </div>
              </TiltCard>

              {/* Agent 05 */}
              <TiltCard spotlightColor="rgba(16,185,129,0.2)" className="p-8 h-96 flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <span className="text-6xl font-black text-white/5 group-hover:text-emerald-500/10 transition-colors">05</span>
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Brain className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Supervisor Core</h3>
                  <p className="text-zinc-400 text-lg font-light leading-relaxed">The Manager. Delegates tasks between the 4 sub-agents, resolves conflicts, and packages the final multi-channel campaign.</p>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* CONTEXT 2: TOPOLOGY EXPLODED VIEW */}
        <section id="topology" className="py-40 relative bg-[#020202] border-y border-white/5 perspective-1000 overflow-hidden">
          {/* Crazy layered background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] [transform:rotateX(60deg)]" />

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">

            {/* Left UX: Exploded 3D view */}
            <div className="relative h-[600px] w-full preserve-3d group">
              {/* Z-Layer 1: Base */}
              <div className="absolute inset-x-10 bottom-10 h-64 rounded-[3rem] bg-indigo-950/20 border border-indigo-500/30 [transform:rotateX(60deg)_rotateZ(45deg)_translateZ(0px)] shadow-[0_0_50px_rgba(99,102,241,0.2)] transition-transform duration-1000 group-hover:-translate-y-4 group-hover:shadow-[0_0_100px_rgba(99,102,241,0.4)] backdrop-blur-md flex items-center justify-center">
                <Database className="w-20 h-20 text-indigo-500/50 [transform:rotateX(-60deg)_rotateZ(-45deg)]" />
              </div>

              {/* Z-Layer 2: Logic */}
              <div className="absolute inset-x-10 bottom-10 h-64 rounded-[3rem] bg-fuchsia-950/20 border border-fuchsia-500/30 [transform:rotateX(60deg)_rotateZ(45deg)_translateZ(100px)] shadow-[0_0_50px_rgba(236,72,153,0.2)] transition-transform duration-1000 group-hover:-translate-y-8 backdrop-blur-md flex items-center justify-center">
                <Workflow className="w-20 h-20 text-fuchsia-500/50 [transform:rotateX(-60deg)_rotateZ(-45deg)]" />
              </div>

              {/* Z-Layer 3: Output */}
              <div className="absolute inset-x-10 bottom-10 h-64 rounded-[3rem] bg-cyan-950/20 border border-cyan-500/30 [transform:rotateX(60deg)_rotateZ(45deg)_translateZ(200px)] shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-transform duration-1000 group-hover:-translate-y-12 backdrop-blur-md flex items-center justify-center">
                <Globe className="w-20 h-20 text-cyan-500/50 [transform:rotateX(-60deg)_rotateZ(-45deg)]" />
              </div>

              {/* Interactive Data Lines */}
              <div className="absolute left-1/2 top-0 bottom-10 w-px bg-gradient-to-b from-white to-transparent shadow-[0_0_20px_white] -translate-x-1/2 animate-pulse" />
            </div>

            {/* Right: Text Context */}
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                Data Architecture <br /> <span className="text-zinc-600 font-normal italic font-serif">Deep Dive.</span>
              </h2>
              <p className="text-xl text-zinc-400 font-light leading-relaxed">
                To achieve 0% hallucination and 100% brand consistency, we engineered a 3-layer topological stack:
              </p>
              <ul className="space-y-8 mt-8">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-indigo-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">The Memory Base</h4>
                    <p className="text-zinc-400">DynamoDB tightly coupled with ChromaDB vector storage anchors the agents, giving them permanent memory of your campaigns.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-fuchsia-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Runtime Logic (FastAPI)</h4>
                    <p className="text-zinc-400">High-performance asynchronous python instances utilizing LangChain to multiplex agent communications.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-cyan-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Omni-Delivery</h4>
                    <p className="text-zinc-400">Final payloads are transmuted into native formats—from S3 image storage to direct platform integrations.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* BOTTOM CTA - THE VORTEX */}
        <section className="relative py-48 overflow-hidden bg-black border-t border-white/5 perspective-1000">

          <div className="absolute inset-0 flex items-center justify-center perspective-1000 opacity-40">
            <div className="w-[120vw] h-[120vw] border-[1px] border-indigo-500/20 rounded-full [transform:rotateX(75deg)] shadow-[inset_0_0_100px_rgba(99,102,241,0.5)] animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[100vw] h-[100vw] border-[2px] border-fuchsia-500/20 rounded-full [transform:rotateX(75deg)] shadow-[0_0_100px_rgba(236,72,153,0.3)] animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute w-[80vw] h-[80vw] border-[4px] border-cyan-500/20 rounded-full [transform:rotateX(75deg)] shadow-[0_0_150px_rgba(6,182,212,0.4)] animate-[spin_20s_linear_infinite]" />
          </div>

          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-4xl preserve-3d">
            <div className="w-24 h-24 rounded-3xl bg-black border border-white/20 backdrop-blur-xl flex items-center justify-center mb-10 shadow-[0_0_100px_rgba(255,255,255,0.2)] translate-z-20">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>

            <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-8 translate-z-30 drop-shadow-2xl">
              Step Into <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">The Future.</span>
            </h2>

            <p className="text-2xl text-zinc-400 font-light mb-14 leading-relaxed max-w-2xl translate-z-10">
              The hackathon is over. The autonomous revolution begins. Claim your agent squad.
            </p>

            <div className="relative group translate-z-30">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 animate-[spin_3s_linear_infinite]"></div>
              <Button className='relative h-24 px-20 rounded-full bg-black text-white hover:bg-zinc-900 border border-white/30 text-3xl font-bold transition-all hover:scale-110 shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-6' asChild>
                <Link to='/sign-in'>
                  Engage CloudCraft <ArrowRight className="w-8 h-8" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* ULTRA FAT FOOTER */}
      <footer className="border-t border-white/10 bg-[#000000] pt-24 pb-12 relative z-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white">CloudCraft</span>
              </div>
              <p className="text-xl font-light text-zinc-500 max-w-md leading-relaxed mb-10">
                The ultimate orchestration layer for generative AI marketing. Built for extreme scale and surgical precision.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1"><Linkedin className="w-6 h-6" /></a>
                <a href="https://github.com/kesavan272006/cloudcraft-ai" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1"><Github className="w-6 h-6" /></a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold text-xl mb-8">Infrastructure</h4>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">FastAPI Core</a>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">Chroma Vectors</a>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">DynamoDB Ledger</a>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">Bedrock LLMs</a>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold text-xl mb-8">Ecosystem</h4>
              <a href="https://github.com/kesavan272006/cloudcraft-ai" className="block text-zinc-500 hover:text-white transition-colors text-lg">Hackathon Repo</a>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">REST API Specs</a>
              <a href="#" className="block text-zinc-500 hover:text-white transition-colors text-lg">Architecture Deck</a>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm font-mono text-emerald-500 flex items-center gap-3 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,1)]" />
              CORE_ONLINE / 0.1ms PING
            </div>
            <div className="text-lg font-light text-zinc-600">
              TEAM CLOUDCRAFT © 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}