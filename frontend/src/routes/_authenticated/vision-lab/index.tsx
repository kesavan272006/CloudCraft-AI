import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles, Download, Loader2, Camera,
  ArrowRight, Maximize2, CheckCircle2, RefreshCw,
  Eye, Upload, Copy, Zap, Aperture, ScanLine, Layers
} from "lucide-react"
import { VisionAudit } from "@/components/persona/VisionAudit"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { API_BASE_URL } from '@/lib/api-config'

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: false, disabled: false },
  { title: 'Brand Brain', href: '/brand_brain', isActive: false, disabled: false },
  { title: 'The Forge', href: '/forge', isActive: false, disabled: false },
  { title: 'Vision Lab', href: '/vision-lab', isActive: true, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]

const QUICK_PROMPTS = [
  { label: "Neon Skyline", style: "Urban", prompt: "Futuristic cyberpunk skyline at night, neon lights, rain-soaked streets, cinematic 8k" },
  { label: "Bioluminescence", style: "Nature", prompt: "Ethereal forest with bioluminescent plants, floating particles, dreamlike atmosphere 8k" },
  { label: "Product Spotlight", style: "Commercial", prompt: "Luxury product on dark marble surface, dramatic studio lighting, magazine quality shot" },
  { label: "Abstract Space", style: "Digital Art", prompt: "Abstract geometric art, flowing gradients, deep space aesthetic, hyper-detailed 4k" },
  { label: "Epic Vista", style: "Landscape", prompt: "Epic mountain range at golden hour, dramatic clouds, aerial perspective, National Geographic" },
]

const VL_STYLE = `
  @keyframes vlAperture{0%,100%{transform:rotate(0deg)}50%{transform:rotate(30deg)}}
  @keyframes vlFilm{0%{background-position:0 0}100%{background-position:60px 0}}
  @keyframes vlExpose{0%{opacity:0;filter:brightness(3)}100%{opacity:1;filter:brightness(1)}}
  @keyframes vlLens{0%,100%{box-shadow:0 0 20px rgba(251,191,36,.2),0 0 60px rgba(251,191,36,0)}50%{box-shadow:0 0 30px rgba(251,191,36,.4),0 0 80px rgba(251,191,36,.1)}}
  @keyframes vlSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes vlBlade{0%,100%{transform:rotate(0deg) scaleY(0.4)}50%{transform:rotate(60deg) scaleY(1)}}
  @keyframes vlPulse{0%,100%{opacity:.5;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
  @keyframes vlReveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
  @keyframes vlShutter{0%{transform:scaleX(1)}40%{transform:scaleX(0)}60%{transform:scaleX(0)}100%{transform:scaleX(1)}}
  .vl-filmstrip{background-image:repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(255,255,255,.04) 12px,rgba(255,255,255,.04) 14px);background-size:60px 100%}
  .vl-aperture-blade{position:absolute;width:50%;height:8px;top:50%;left:50%;transform-origin:left center;border-radius:0 4px 4px 0;background:currentColor}
`

type VisionMode = 'generate' | 'enhance'
type ResultTab = 'visual' | 'audit'

export default function VisionLabPage() {
  const [mode, setMode] = useState<VisionMode | null>(null)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ image_url: string; refined_prompt: string } | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedResult, setEnhancedResult] = useState<{ enhanced_image_url: string; enhancement_prompt: string } | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('visual')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasResult = !!(result || enhancedResult)
  const finalImageUrl = enhancedResult?.enhanced_image_url || result?.image_url
  const resetAll = () => {
    setMode(null); setPrompt(""); setResult(null); setImageAnalysis(null)
    setUploadedImageUrl(null); setUploadedImageBase64(null); setEnhancedResult(null)
    setActiveTab('visual')
  }

  const handleGenerate = async (_e?: any, autoPrompt?: string) => {
    const p = autoPrompt || prompt;
    if (!p.trim()) return
    if (autoPrompt) setPrompt(p);
    setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vision/generate-image`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: p }),
      })
      setResult(await res.json()); toast.success("Visual developed")
    } catch { toast.error("Generation failed") }
    finally { setLoading(false) }
  }

  const handleFileUpload = (file: File) => {
    setUploadedImageUrl(null); setImageAnalysis(null); setEnhancedResult(null)
    const reader = new FileReader()
    reader.onloadend = () => { setUploadedImageUrl(reader.result as string); setUploadedImageBase64(reader.result as string); setMode('enhance') }
    reader.readAsDataURL(file)
  }

  const handleAudit = async () => {
    if (!uploadedImageBase64) return; setAnalyzingImage(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vision/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_base64: uploadedImageBase64 })
      })
      if (res.ok) { setImageAnalysis(await res.json()); toast.success("Aesthetic audit complete") }
      else toast.error("Audit failed")
    } catch { toast.error("Audit failed") } finally { setAnalyzingImage(false) }
  }

  const handleEnhance = async () => {
    if (!uploadedImageBase64 || !imageAnalysis) return; setEnhancing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vision/enhance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: uploadedImageBase64, audit_results: imageAnalysis, user_prompt: prompt })
      })
      if (res.ok) { setEnhancedResult(await res.json()); toast.success("Master asset ready") }
      else toast.error("Enhancement failed")
    } catch { toast.error("Enhancement failed") } finally { setEnhancing(false) }
  }

  const handleDownload = async () => {
    if (!finalImageUrl) return
    try {
      const blob = await fetch(finalImageUrl).then(r => r.blob())
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `vision-${Date.now()}.png` })
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href)
    } catch { console.error("Download failed") }
  }

  // Param Autofill from Chronos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autofill') === 'true' && params.get('prompt')) {
      const p = params.get('prompt') || '';
      setMode('generate');
      setPrompt(p);
      setTimeout(() => {
        handleGenerate(undefined, p);
      }, 500);
      window.history.replaceState({}, '', '/vision-lab');
    }
  }, []);

  return (
    <>
      <style>{VL_STYLE}</style>
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6">
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
          style={{ background: 'radial-gradient(circle at 15% 25%, rgba(251,191,36,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 65%, rgba(139,92,246,0.10) 0%, transparent 50%), radial-gradient(circle at 55% 50%, rgba(59,130,246,0.07) 0%, transparent 50%)' }}
        />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-125 h-125 rounded-full bg-linear-to-r from-amber-500/12 via-yellow-500/10 to-orange-500/12 blur-3xl"
            animate={{ x: [0, 70, 0], y: [0, -50, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: '5%', left: '-5%' }}
          />
          <motion.div
            className="absolute w-100 h-100 rounded-full bg-linear-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl"
            animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.18, 1] }}
            transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            style={{ bottom: '10%', right: '2%' }}
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
              className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/30 bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 text-amber-500 text-xs font-bold mb-2 shadow-lg shadow-amber-500/20 uppercase tracking-widest gap-2 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-lg shadow-amber-500/50" />
              </span>
              Vertex AI · Darkroom Online
            </motion.div>
            <motion.h1
              className="text-3xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Vision <span className="italic bg-linear-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Lab</span>
              <Aperture className="h-8 w-8 md:h-10 md:w-10 text-amber-500" style={{ animation: 'vlSpin 12s linear infinite' }} />
            </motion.h1>
            <motion.p
              className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Develop visual intelligence — generate photorealistic masterpieces from raw imagination, or master existing assets with AI aesthetic intelligence.
            </motion.p>
          </div>

          <motion.div
            className="flex items-center gap-3 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {mode && (
              <div className="hidden md:flex items-center gap-2">
                {[
                  { label: 'ƒ', val: mode === 'generate' ? '1.4' : '2.8' },
                  { label: 'ISO', val: mode === 'generate' ? '100' : '800' },
                  { label: '1/', val: mode === 'generate' ? '125' : '60' },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-baseline gap-0.5 px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border/50 backdrop-blur-xl">
                    <span className="text-[9px] text-muted-foreground font-mono">{label}</span>
                    <span className="text-xs font-bold font-mono text-amber-500">{val}</span>
                  </div>
                ))}
              </div>
            )}
            {(mode || hasResult) && (
              <Button variant="outline" onClick={resetAll} className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl">
                <RefreshCw className="w-4 h-4 mr-2" /> New Session
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* ── CONTENT ── */}
        <div className="relative z-10 space-y-6">

          {/* ── MODE SELECTOR ── */}
          {!mode && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {/* Oracle — Generate */}
              <div
                onClick={() => setMode('generate')}
                className="group relative rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-amber-500/5 backdrop-blur-xl cursor-pointer overflow-hidden hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-500/40 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-500/40 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-500/40 rounded-bl-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-500/40 rounded-br-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-linear-to-br from-amber-500/0 to-amber-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="p-8 flex flex-col items-center text-center gap-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full border border-amber-500/15 group-hover:border-amber-500/35 transition-colors"
                      style={{ animation: 'vlSpin 12s linear infinite' }} />
                    <div className="absolute inset-1.5 rounded-full border-t border-amber-500/40"
                      style={{ animation: 'vlSpin 8s linear infinite reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Aperture className="h-8 w-8 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px w-10 bg-amber-500/30" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500/70">Mode A</span>
                      <div className="h-px w-10 bg-amber-500/30" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">The Oracle</h3>
                    <p className="text-sm text-muted-foreground max-w-65 mx-auto leading-relaxed">
                      Describe your vision. AI expands, stylizes, and renders a photorealistic masterpiece.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { icon: Sparkles, label: 'AI Prompt Expand' },
                      { icon: Layers, label: 'Style Optimize' },
                      { icon: Eye, label: '4K Render' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="p-2.5 rounded-xl bg-secondary/50 border border-amber-500/15 text-center group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-colors">
                        <Icon className="h-3.5 w-3.5 text-amber-500 mx-auto mb-1" />
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="h-9 px-5 text-xs font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/50 group-hover:border-amber-500/50 transition-all gap-2 shadow-lg shadow-amber-500/5">
                    <Aperture className="h-3.5 w-3.5" />Enter Oracle <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Master — Enhance */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) handleFileUpload(f) }}
                className={cn(
                  "group relative rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-blue-500/5 backdrop-blur-xl cursor-pointer overflow-hidden hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300",
                  dragOver && "border-blue-500/50 bg-blue-500/5 scale-[1.01] shadow-xl shadow-blue-500/10"
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-blue-500/40 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-blue-500/40 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-blue-500/40 rounded-bl-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-blue-500/40 rounded-br-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="p-8 flex flex-col items-center text-center gap-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-full border border-blue-500/15 group-hover:border-blue-500/30 transition-colors"
                      style={{ animation: 'vlSpin 15s linear infinite' }} />
                    <div className="absolute inset-1.5 rounded-full border-t border-blue-500/40"
                      style={{ animation: 'vlSpin 10s linear infinite reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px w-10 bg-blue-500/30" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500/70">Mode B</span>
                      <div className="h-px w-10 bg-blue-500/30" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">The Master</h3>
                    <p className="text-sm text-muted-foreground max-w-65 mx-auto leading-relaxed">
                      Upload your asset. AI runs an aesthetic intelligence audit then enhances to master quality.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { icon: ScanLine, label: 'Aesthetic Audit' },
                      { icon: Zap, label: 'AI Enhance' },
                      { icon: Layers, label: 'Before/After' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className={cn("p-2.5 rounded-xl bg-secondary/50 border border-blue-500/15 text-center group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-colors", dragOver && "border-blue-500/30")}>
                        <Icon className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                        <p className="text-[9px] font-medium text-muted-foreground leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="h-9 px-5 text-xs font-bold border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/50 group-hover:border-blue-500/50 transition-all gap-2 shadow-lg shadow-blue-500/5">
                    <Upload className="h-3.5 w-3.5" />{dragOver ? 'Drop to Upload' : 'Upload Asset'} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
              </div>
            </motion.div>
          )}

          {/* ── GENERATE MODE ── */}
          {mode === 'generate' && !hasResult && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="lg:col-span-2 space-y-5">
                {/* Darkroom console */}
                <Card className="relative border-amber-500/20 bg-linear-to-br from-card via-card to-amber-500/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-amber-500/8">
                  <div className="absolute -inset-1 bg-linear-to-br from-amber-500/8 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                  <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/15 bg-amber-500/5 relative">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      </div>
                      <span className="text-xs font-mono text-amber-500/70 ml-1 font-bold">oracle://vision-prompt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                      </span>
                      <span className="text-[10px] font-mono text-amber-500/70 font-bold tracking-widest">READY</span>
                    </div>
                  </div>

                  {!loading ? (
                    <CardContent className="p-0 relative">
                      <Textarea
                        placeholder={"› Describe your visual directive...\n\n  e.g., 'A lone lighthouse on a stormy coast, long exposure, cinematic grain, dramatic sky'"}
                        className="min-h-55 bg-transparent border-0 focus-visible:ring-0 text-sm font-mono leading-relaxed placeholder:text-muted-foreground/30 resize-none px-6 py-6"
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && prompt && !loading) handleGenerate() }}
                      />
                      <div className="px-5 py-4 border-t border-amber-500/12 bg-amber-500/3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {prompt && <span className="text-xs text-amber-500/60 font-mono">{prompt.length} ch</span>}
                          <span className="text-xs text-muted-foreground/40 hidden sm:block font-mono">
                            <kbd className="px-1.5 py-0.5 bg-secondary border border-border/60 rounded text-[10px]">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-secondary border border-border/60 rounded text-[10px] ml-1">↵</kbd>
                          </span>
                        </div>
                        <Button
                          className={cn(
                            "h-9 px-5 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg gap-2 group relative overflow-hidden",
                            prompt.trim()
                              ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black hover:scale-105 hover:shadow-amber-500/40 hover:shadow-xl"
                              : "bg-secondary text-muted-foreground cursor-not-allowed"
                          )}
                          onClick={handleGenerate} disabled={!prompt.trim()}>
                          {prompt.trim() && (
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                          )}
                          <Aperture className="h-3.5 w-3.5" />Develop
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <div className="p-12 flex flex-col items-center gap-8 relative">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" style={{ animation: 'vlSpin 8s linear infinite' }} />
                        <div className="absolute inset-2 rounded-full border border-amber-500/30" style={{ animation: 'vlSpin 5s linear infinite reverse' }} />
                        <div className="absolute inset-4 rounded-full border-t-2 border-amber-500/70" style={{ animation: 'vlSpin 3s linear infinite' }} />
                        <div className="absolute inset-6 rounded-full bg-amber-500/10 blur-sm" style={{ animation: 'vlPulse 1.5s ease-in-out infinite' }} />
                        <Aperture className="w-7 h-7 text-amber-500" style={{ animation: 'vlSpin 2s linear infinite' }} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-base font-bold">Developing your vision...</p>
                        <p className="text-xs text-muted-foreground font-mono">Neural rendering in progress · Vertex AI</p>
                      </div>
                      <div className="flex gap-4">
                        {['Prompt Expand', 'Style Apply', 'Render', 'Upscale'].map((s, i) => (
                          <div key={s} className="flex flex-col items-center gap-2">
                            <div className="w-9 h-9 rounded-xl border border-amber-500/20 bg-amber-500/8 flex items-center justify-center shadow-lg shadow-amber-500/5">
                              <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDelay: `${i * .2}s` }} />
                            </div>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Quick starters */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Directives</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map(({ label, style, prompt: qp }) => (
                      <button key={label} onClick={() => setPrompt(qp)}
                        className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50 bg-secondary/30 hover:border-amber-500/40 hover:bg-amber-500/8 transition-all duration-200 backdrop-blur-sm">
                        <span className="text-[9px] text-amber-500/60 font-mono uppercase tracking-wider">{style}</span>
                        <div className="h-3 w-px bg-border/60" />
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Oracle Pipeline */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Oracle Pipeline</p>
                <div className="space-y-2.5">
                  {[
                    { n: '01', label: 'Prompt Intelligence', desc: 'Expands your brief into a detailed scene description', color: 'text-amber-500', bg: 'bg-amber-500/8', b: 'border-amber-500/20' },
                    { n: '02', label: 'Style Synthesis', desc: 'Applies cinematic photography techniques automatically', color: 'text-violet-400', bg: 'bg-violet-500/8', b: 'border-violet-500/20' },
                    { n: '03', label: 'Neural Render', desc: 'Vertex AI generates the high-fidelity visual output', color: 'text-blue-400', bg: 'bg-blue-500/8', b: 'border-blue-500/20' },
                    { n: '04', label: 'Quality Export', desc: '300 DPI PNG delivered with refined prompt metadata', color: 'text-emerald-400', bg: 'bg-emerald-500/8', b: 'border-emerald-500/20' },
                  ].map(({ n, label, desc, color, bg, b }) => (
                    <div key={n} className={cn(`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg`, b, bg)}>
                      <span className={cn(`text-[11px] font-black font-mono mt-0.5 shrink-0`, color)}>{n}</span>
                      <div>
                        <p className={cn(`text-xs font-bold`, color)}>{label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[{ l: 'Engine', v: 'Vertex AI' }, { l: 'Format', v: 'PNG · 300DPI' }, { l: 'Style', v: 'Cinematic' }, { l: 'Quality', v: '4K HDR' }].map(({ l, v }) => (
                    <div key={l} className="p-3 rounded-xl border border-border/40 bg-secondary/20 backdrop-blur-sm">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{l}</p>
                      <p className="text-xs font-bold mt-0.5 font-mono">{v}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── ENHANCE MODE ── */}
          {mode === 'enhance' && !hasResult && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-5">
                {/* Source asset */}
                <Card className="relative border-blue-500/20 bg-linear-to-br from-card via-card to-blue-500/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-blue-500/8">
                  <div className="absolute -inset-1 bg-linear-to-br from-blue-500/8 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                  <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/15 bg-blue-500/5 relative">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-mono text-blue-400/80 font-bold">master://source-asset</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-400/70 hover:text-blue-400 gap-1 hover:bg-blue-500/10" onClick={() => fileInputRef.current?.click()}>
                      <RefreshCw className="h-3 w-3" />Replace
                    </Button>
                  </div>
                  <div className="p-4 relative">
                    <div className="relative rounded-xl overflow-hidden border border-border/40 bg-black group">
                      <img src={uploadedImageUrl || ""} className="w-full object-cover max-h-50" alt="Source" />
                      <div className="absolute inset-0 pointer-events-none border-[5px] border-black/30 rounded-xl" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[9px] font-bold text-white uppercase tracking-wider font-mono backdrop-blur-sm">RAW</div>
                    </div>
                  </div>
                </Card>

                {/* Audit panel */}
                <Card className="relative border-blue-500/20 bg-linear-to-br from-card via-card to-blue-500/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-blue-500/8">
                  <div className="absolute -inset-1 bg-linear-to-br from-blue-500/8 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                  <div className="px-5 py-4 border-b border-blue-500/15 bg-blue-500/5 flex items-center gap-2 relative">
                    <ScanLine className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-blue-400/80 font-bold">master://aesthetic-audit</span>
                  </div>
                  <div className="p-5 space-y-4 relative">
                    <Button
                      className={cn("w-full h-10 text-xs font-bold gap-2 rounded-xl transition-all",
                        imageAnalysis
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/15 shadow-lg shadow-emerald-500/10"
                          : "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] hover:shadow-blue-500/40")}
                      disabled={analyzingImage || !!imageAnalysis} onClick={handleAudit}>
                      {analyzingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : imageAnalysis ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ScanLine className="h-3.5 w-3.5" />}
                      {analyzingImage ? 'Scanning...' : imageAnalysis ? 'Audit Complete' : 'Launch Aesthetic Scan'}
                    </Button>

                    {imageAnalysis && (
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Scan Results</p>
                            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/8">{imageAnalysis.suggested_tone}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed">"{imageAnalysis.vibe_description}"</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground font-mono">Clarity</span>
                              <span className="font-bold text-emerald-500 font-mono">{imageAnalysis.aesthetic_audit?.clarity_score}%</span>
                            </div>
                            <Progress value={imageAnalysis.aesthetic_audit?.clarity_score} className="h-1.5" />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                            {[
                              { k: 'Brightness', v: imageAnalysis.aesthetic_audit?.brightness?.toFixed?.(1) + 'x' },
                              { k: 'Contrast', v: imageAnalysis.aesthetic_audit?.contrast?.toFixed?.(1) + 'x' },
                              { k: 'Saturation', v: imageAnalysis.aesthetic_audit?.saturation?.toFixed?.(1) + 'x' },
                              { k: 'Temperature', v: imageAnalysis.aesthetic_audit?.temperature },
                            ].map(({ k, v }) => (
                              <div key={k} className="flex justify-between px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border/40">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="text-foreground font-semibold">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enhancement Bias</label>
                          <Textarea
                            placeholder="Guide the AI... (cinematic, moody, vivid, editorial)"
                            className="bg-secondary/30 border-border/50 text-xs rounded-xl h-16 resize-none font-mono placeholder:text-muted-foreground/30"
                            value={prompt} onChange={e => setPrompt(e.target.value)}
                          />
                        </div>
                        <Button
                          className="w-full h-10 text-xs font-black uppercase tracking-wider gap-2 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] hover:shadow-blue-500/40 transition-all"
                          onClick={handleEnhance} disabled={enhancing}>
                          {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          {enhancing ? 'Enhancing...' : 'Generate Master'}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Canvas */}
              <div className="lg:col-span-2">
                <Card className="relative border-blue-500/20 bg-linear-to-br from-card via-card to-blue-500/5 backdrop-blur-xl rounded-2xl overflow-hidden h-full shadow-xl shadow-blue-500/8">
                  <div className="absolute -inset-1 bg-linear-to-br from-blue-500/8 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                  <div className="px-5 py-4 border-b border-blue-500/15 bg-blue-500/5 flex items-center gap-3 relative">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                    </span>
                    <span className="text-xs font-mono text-blue-400/80 font-bold">master://canvas</span>
                    <Badge className="ml-auto bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-mono">ENHANCE</Badge>
                  </div>
                  <div className="flex items-center justify-center min-h-100 p-8 relative">
                    {enhancing ? (
                      <div className="flex flex-col items-center gap-7 text-center">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" style={{ animation: 'vlSpin 8s linear infinite' }} />
                          <div className="absolute inset-3 rounded-full border border-blue-500/35" style={{ animation: 'vlSpin 5s linear infinite reverse' }} />
                          <div className="absolute inset-5 rounded-full border-t-2 border-blue-500/70" style={{ animation: 'vlSpin 3s linear infinite' }} />
                          <div className="absolute inset-7 rounded-full bg-blue-500/15 blur-sm" style={{ animation: 'vlPulse 1.5s ease-in-out infinite' }} />
                          <Camera className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-base font-bold">Mastering asset...</p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">Aesthetic intelligence processing</p>
                        </div>
                        <div className="flex gap-4">
                          {['Parse Audit', 'Calibrate', 'Render Pass', 'QA'].map((s, i) => (
                            <div key={s} className="flex flex-col items-center gap-2">
                              <div className="w-9 h-9 rounded-xl border border-blue-500/20 bg-blue-500/8 flex items-center justify-center shadow-lg shadow-blue-500/5">
                                <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" style={{ animationDelay: `${i * .2}s` }} />
                              </div>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : !imageAnalysis ? (
                      <motion.div
                        className="text-center space-y-5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/40 flex items-center justify-center mx-auto bg-secondary/20">
                          <ScanLine className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Run the Aesthetic Scan first</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">Click "Launch Aesthetic Scan" to analyze your image</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="text-center space-y-5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                          <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Scan complete — ready to master</p>
                          <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-xs mx-auto leading-relaxed">{imageAnalysis.aesthetic_audit?.pro_tip || 'Set your enhancement bias and generate the master asset'}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {hasResult && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Result Header */}
              <Card className="relative border-border/50 bg-linear-to-r from-card via-card to-secondary/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-black/10 p-5">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: mode === 'generate' ? 'radial-gradient(circle at 30% 50%, rgba(251,191,36,0.5), transparent 70%)' : 'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.5), transparent 70%)' }} />
                <div className="flex items-center gap-4 relative">
                  <motion.div
                    className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", mode === 'generate' ? 'bg-linear-to-br from-amber-500 to-orange-500' : 'bg-linear-to-br from-blue-500 to-violet-600')}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {mode === 'generate' ? <Aperture className="w-7 h-7 text-black" /> : <Camera className="w-7 h-7 text-white" />}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold tracking-tight">{mode === 'generate' ? 'Developed Frame Ready' : 'Master Asset Ready'}</h2>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">✓ PIPELINE COMPLETE</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {mode === 'generate' ? 'Vertex AI · Neural Render · PNG 300DPI' : 'Aesthetic Intelligence · Master Enhancement · Vision AI'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center bg-secondary/50 rounded-xl p-1 gap-0.5 border border-border/50 backdrop-blur-xl">
                  {([
                    { id: 'visual' as const, label: mode === 'generate' ? 'Developed Frame' : 'Before / After', Icon: Eye },
                    ...(mode === 'enhance' && imageAnalysis ? [{ id: 'audit' as const, label: 'Aesthetic Report', Icon: ScanLine }] : []),
                  ]).map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                        activeTab === id ? 'bg-background border border-border shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                      <Icon className={cn('w-3.5 h-3.5', activeTab === id ? (mode === 'generate' ? 'text-amber-500' : 'text-blue-500') : '')} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-xs font-semibold shadow-lg shadow-black/5 transition-all hover:scale-105 border-border/50"
                    onClick={() => { navigator.clipboard.writeText(finalImageUrl || ''); toast.success('URL copied') }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />Copy URL
                  </Button>
                  <Button size="sm"
                    className={cn("h-9 text-xs font-black uppercase tracking-wider shadow-lg transition-all hover:scale-105", mode === 'generate' ? "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/25" : "bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-blue-500/25")}
                    onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Export PNG
                  </Button>
                </div>
              </div>

              {activeTab === 'visual' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={cn("relative border bg-linear-to-br from-card via-card to-secondary/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl", mode === 'generate' ? 'border-amber-500/20 shadow-amber-500/8' : 'border-blue-500/20 shadow-blue-500/8')}>
                    <div className={cn("absolute -inset-1 opacity-40 blur-xl rounded-2xl pointer-events-none", mode === 'generate' ? 'bg-linear-to-br from-amber-500/8 to-transparent' : 'bg-linear-to-br from-blue-500/8 to-transparent')} />
                    {mode === 'generate' ? (
                      <>
                        <div className="px-5 py-4 border-b border-amber-500/15 bg-amber-500/5 flex items-center justify-between relative">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                              <Aperture className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold">Developed Frame</h3>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Oracle AI · PNG · 300 DPI</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => window.open(result?.image_url, '_blank')}>
                            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />Fullscreen
                          </Button>
                        </div>
                        <div className="p-6 grid lg:grid-cols-3 gap-6 relative">
                          <div className="lg:col-span-2">
                            <div className="relative rounded-xl overflow-hidden border border-border/30 bg-black group"
                              style={{ boxShadow: '0 0 0 1px rgba(251,191,36,.08), 0 24px 70px rgba(0,0,0,.5)' }}>
                              <img src={result?.image_url} alt="Generated" className="w-full object-contain max-h-[65vh]" style={{ animation: 'vlExpose .8s ease-out' }} />
                              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                                style={{ backgroundImage: 'url(data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(%23n)" opacity=".5"/></svg>)' }} />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-3 gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl backdrop-blur-xl" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl backdrop-blur-xl" onClick={() => window.open(result?.image_url, '_blank')}><Maximize2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/8 space-y-2.5">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Refined Prompt</p>
                              <p className="text-xs text-muted-foreground italic leading-relaxed">"{result?.refined_prompt}"</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[{ l: 'Format', v: 'PNG' }, { l: 'DPI', v: '300' }, { l: 'Engine', v: 'Vertex AI' }, { l: 'Mode', v: 'Oracle' }].map(({ l, v }) => (
                                <div key={l} className="p-3 rounded-xl border border-border/40 bg-secondary/20 backdrop-blur-sm">
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{l}</p>
                                  <p className="text-sm font-bold mt-0.5 font-mono">{v}</p>
                                </div>
                              ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/8 hover:border-amber-500/50 font-bold transition-all"
                              onClick={() => { setResult(null) }}>
                              <RefreshCw className="h-3.5 w-3.5" />Regenerate
                            </Button>
                            <Button size="sm" className="w-full h-9 text-xs gap-1.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all" onClick={handleDownload}>
                              <Download className="h-3.5 w-3.5" />Download
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-5 py-4 border-b border-blue-500/15 bg-blue-500/5 flex items-center justify-between relative">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Camera className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold">Master Enhancement</h3>
                              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Before / After · Comparison</p>
                            </div>
                          </div>
                          <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">MASTER</Badge>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-5 relative">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground font-mono">Before · Raw</span>
                              <Badge variant="secondary" className="text-[10px] font-mono">RAW</Badge>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-border/30 bg-black shadow-xl shadow-black/20">
                              <img src={uploadedImageUrl || ""} alt="Source" className="w-full object-contain max-h-[60vh]" />
                              <div className="absolute inset-0 border-[5px] border-black/30 rounded-xl pointer-events-none" />
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-white font-mono backdrop-blur-sm">ORIGINAL</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono">After · Master</span>
                              <Badge className="text-[10px] bg-linear-to-r from-blue-500 to-violet-500 text-white font-mono border-0">MASTER</Badge>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/30 bg-black group hover:scale-[1.01] transition-transform duration-500"
                              style={{ boxShadow: '0 0 50px rgba(59,130,246,.15), 0 24px 70px rgba(0,0,0,.4)' }}>
                              <img src={enhancedResult?.enhanced_image_url || ""} alt="Master" className="w-full object-contain max-h-[60vh]" style={{ animation: 'vlExpose .8s ease-out' }} />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3 gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl backdrop-blur-xl" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-xl backdrop-blur-xl" onClick={() => window.open(enhancedResult?.enhanced_image_url, '_blank')}><Maximize2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === 'audit' && imageAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="relative border-blue-500/20 bg-linear-to-br from-card via-card to-blue-500/5 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-blue-500/8">
                    <div className="absolute -inset-1 bg-linear-to-br from-blue-500/8 to-transparent opacity-40 blur-xl rounded-2xl pointer-events-none" />
                    <div className="px-5 py-4 border-b border-blue-500/15 bg-blue-500/5 flex items-center gap-3 relative">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <ScanLine className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Aesthetic Intelligence Report</h3>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Vision Audit · Full Analysis</p>
                      </div>
                    </div>
                    <div className="p-6 relative">
                      <VisionAudit analysis={imageAnalysis} imageUrl={uploadedImageUrl || ""} />
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

        </div>
      </Main>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
    </>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})