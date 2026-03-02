import React, { useState, useEffect } from 'react'
import { Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className='min-h-screen bg-[#000000] text-white flex overflow-hidden selection:bg-indigo-500/30'>

      {/* LEFT SIDE - VISUAL NARRATIVE (Hidden on small screens) */}
      <div className='relative hidden lg:flex flex-1 flex-col justify-between border-r border-white/10 bg-[#050505] overflow-hidden'>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

        {/* Content Top */}
        <div className='relative z-10 p-12'>
          <div className='flex items-center gap-3'>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)]'>
              <Sparkles className='h-5 w-5 text-zinc-100 z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' />
            </div>
            <span className='text-3xl font-black tracking-tighter text-white'>CloudCraft<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">.ai</span></span>
          </div>
        </div>

        {/* The "Terminal/Engine" Graphic */}
        <div className='relative z-10 flex-1 flex items-center justify-center p-12'>
          <div className={`relative w-full max-w-lg transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur opacity-20 animate-pulse"></div>
            <div className="relative bg-[#020202] rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
              </div>

              <div className="space-y-4 font-mono text-sm text-zinc-400">
                <p className="text-indigo-400">System.Initialize()</p>
                <p className="animate-pulse">&gt; Booting Core Agents...</p>
                <div className="flex items-center gap-3 py-2 border-b border-white/5">
                  <Cpu className="w-4 h-4 text-zinc-500" />
                  <span>Researcher Node: <span className="text-emerald-400">ONLINE</span></span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-white/5">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <span>Copywriter: <span className="text-emerald-400">ONLINE</span></span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-white/5">
                  <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  <span>Compliance Core: <span className="text-emerald-400">ONLINE</span></span>
                </div>
                <p className="text-fuchsia-400 mt-4">&gt; Awaiting Secure Authentication...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Bottom */}
        <div className='relative z-10 p-12'>
          <blockquote className='space-y-2'>
            <p className='text-lg tracking-wide font-light text-zinc-300'>
              "The most advanced multi-agent orchestration layer ever built for the Bharat ecosystem. We aren't just generating content; we are architecting reality."
            </p>
            <footer className='text-sm text-indigo-400 font-mono'>// CloudCraft AI Team</footer>
          </blockquote>
        </div>
      </div>

      {/* RIGHT SIDE - AUTHENTICATION BOX */}
      <div className='flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative'>
        {/* Mobile Logo */}
        <div className='lg:hidden absolute top-8 left-8 flex items-center gap-2'>
          <div className='relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10'>
            <Sparkles className='h-4 w-4 text-white z-10' />
          </div>
          <span className='text-xl font-bold tracking-tighter'>CloudCraft.</span>
        </div>

        {/* The Form Container */}
        <div className={`w-full max-w-[420px] transition-all duration-1000 delay-150 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {children}
        </div>

        <p className='absolute bottom-8 text-center text-xs text-zinc-600 font-mono'>
          SECURE_ENCLAVE_v2.0.1
        </p>
      </div>

    </div>
  )
}
