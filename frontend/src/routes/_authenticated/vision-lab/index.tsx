import { useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Download,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Camera,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  LayoutGrid,
  Zap,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Palette
} from "lucide-react"
import { VisionAudit } from "@/components/persona/VisionAudit"
import { toast } from "sonner"

type VisionMode = 'generate' | 'enhance' | 'idle'

const quickPrompts = [
  "Futuristic skyline with neon architecture",
  "Serene mountain landscape at dawn",
  "Cyberpunk street photography",
  "Minimalist product shot with soft lighting",
  "Ethereal forest with bioluminescent plants"
]

export default function VisionLabPage() {
  // Navigation & Mode State
  const [activeMode, setActiveMode] = useState<VisionMode>('idle')
  const [showResult, setShowResult] = useState(false)

  // Generation State
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ image_url: string; refined_prompt: string } | null>(null)

  // Audit & Enhance State
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedResult, setEnhancedResult] = useState<{ enhanced_image_url: string; enhancement_prompt: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetAll = () => {
    setActiveMode('idle')
    setShowResult(false)
    setPrompt("")
    setResult(null)
    setImageAnalysis(null)
    setUploadedImageUrl(null)
    setUploadedImageBase64(null)
    setEnhancedResult(null)
  }

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    setResult(null)
    setEnhancedResult(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/vision/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      setResult(data)
      setShowResult(true)
      toast.success("Generation complete")
    } catch (error) {
      toast.error("Generation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedImageUrl(null)
    setImageAnalysis(null)
    setEnhancedResult(null)
    setResult(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImageUrl(reader.result as string)
      setUploadedImageBase64(reader.result as string)
      setActiveMode('enhance')
    }
    reader.readAsDataURL(file)
  }

  const handleAudit = async () => {
    if (!uploadedImageBase64) return
    setAnalyzingImage(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: uploadedImageBase64 })
      })
      if (response.ok) {
        const data = await response.json()
        setImageAnalysis(data)
        toast.success("Audit complete")
      } else {
        toast.error("Audit failed")
      }
    } catch (error) {
      toast.error("Audit failed")
    } finally {
      setAnalyzingImage(false)
    }
  }

  const handleEnhance = async () => {
    if (!uploadedImageBase64 || !imageAnalysis) return
    setEnhancing(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/vision/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: uploadedImageBase64,
          audit_results: imageAnalysis,
          user_prompt: prompt
        })
      })
      if (response.ok) {
        const data = await response.json()
        setEnhancedResult(data)
        setShowResult(true)
        toast.success("Master image ready")
      } else {
        toast.error("Enhancement failed")
      }
    } catch (error) {
      toast.error("Enhancement failed")
    } finally {
      setEnhancing(false)
    }
  }

  const handleDownload = async () => {
    const url = enhancedResult?.enhanced_image_url || result?.image_url
    if (!url) return
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `vision-master-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Download failed", error)
    }
  }

  // --- RENDERING ---

  if (activeMode === 'idle') {
    return (
      <div className="flex-1 h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

        <div className="relative space-y-12 max-w-5xl w-full px-6 text-center z-10 animate-in fade-in zoom-in duration-700">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter text-foreground">
              Vision <span className="text-primary">Lab</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your path to visual excellence. Generate from raw imagination or audit and enhance your existing assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* PATH A: THE ORACLE */}
            <div
              onClick={() => setActiveMode('generate')}
              className="group relative h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-[2.5rem] border-2 border-border/50 hover:border-primary/40 p-8 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Wand2 className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">The Oracle</h3>
                <p className="text-muted-foreground text-sm max-w-[240px]">Create stunning visuals from scratch with AI expansion.</p>
              </div>
              <Button variant="outline" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                Enter Generator <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* PATH B: THE MASTER */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-[2.5rem] border-2 border-border/50 hover:border-emerald-500/40 p-8 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-500 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Camera className="h-10 w-10 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">The Master</h3>
                <p className="text-muted-foreground text-sm max-w-[240px]">Audit aesthetics and enhance existing photos to master quality.</p>
              </div>
              <Button variant="outline" className="rounded-full group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                Upload Asset <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-screen flex bg-background text-foreground overflow-hidden">
      {/* SIDEBAR PANEL (Only if not showResult) */}
      {!showResult && (
        <aside className="w-[440px] border-r border-border/50 flex flex-col bg-muted/20 backdrop-blur-md animate-in slide-in-from-left duration-500">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={resetAll} className="h-8 gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Choice
            </Button>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {activeMode === 'generate' ? 'Oracle Mode' : 'Master Mode'}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeMode === 'generate' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Palette className="h-4 w-4 text-primary" /> Describe Vision
                  </div>
                  <Textarea
                    placeholder="Enter keywords or a detailed description..."
                    className="min-h-[200px] bg-background/50 border-2 border-border/50 focus-visible:border-primary/50 transition-all text-sm rounded-2xl"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Quick Starters</p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(qp)}
                        className="text-left px-4 py-3 rounded-xl bg-background/50 border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-xs"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-4 bg-background/50 rounded-2xl border-2 border-border/50">
                  <p className="text-xs font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">Source Asset</p>
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                    <img src={uploadedImageUrl || ""} className="w-full h-full object-cover" alt="Source" />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full h-14 rounded-2xl font-bold gap-2 text-lg"
                    disabled={analyzingImage || !!imageAnalysis}
                    onClick={handleAudit}
                  >
                    {analyzingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    {imageAnalysis ? "Audit Complete" : "Launch Vision Audit"}
                  </Button>

                  {imageAnalysis && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top duration-500">
                      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-emerald-600 text-xs font-medium flex gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Aesthetics analyzed. Ready for Master Enhancement.
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Bias Influence (Optional)</label>
                        <Textarea
                          placeholder="Guide the enhancement... (e.g. moody, bright, cinematic)"
                          className="bg-background/50 border-border/50 text-xs rounded-xl h-20"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black gap-2 text-lg shadow-lg shadow-emerald-500/20"
                        onClick={handleEnhance}
                        disabled={enhancing}
                      >
                        {enhancing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 " />}
                        Generate Master Asset
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {activeMode === 'generate' && (
            <div className="p-6 border-t border-border/50">
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Ignite Vision
              </Button>
            </div>
          )}
        </aside>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-background/60 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-foreground/80">
              <LayoutGrid className="h-4 w-4" />
              Vision Studio
            </div>
            {showResult && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 uppercase text-[10px] font-black">
                Master Asset Ready
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {showResult && (
              <>
                <Button variant="outline" size="sm" className="rounded-full gap-2 px-6" onClick={() => setShowResult(false)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reconfigure
                </Button>
                <Button size="sm" className="rounded-full bg-primary text-primary-foreground gap-2 px-6" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" /> Export Master
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-dot-pattern flex flex-col items-center justify-center p-8">
          {!showResult ? (
            <div className="w-full max-w-4xl space-y-8 flex flex-col items-center">
              {(loading || enhancing) ? (
                <div className="flex flex-col items-center gap-6 animate-pulse">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                    <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-foreground">{enhancing ? "Fining Aesthetic Details..." : "Architecting Vision..."}</h2>
                    <p className="text-muted-foreground text-sm">Processing through professional neural networks...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[600px] bg-muted/20 border-2 border-dashed border-border/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center">
                  <div className="p-6 rounded-3xl bg-background/50 border border-border/50">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-muted-foreground">Ready for Input</p>
                    <p className="text-xs text-muted-foreground/60">Please complete the configuration on the left</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center gap-12 max-w-7xl animate-in fade-in zoom-in duration-700">

              {/* COMPARISON VIEW */}
              <div className="w-full grid md:grid-cols-2 gap-8 items-start">
                {/* BEFORE / SOURCE */}
                {activeMode === 'enhance' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Source Asset</span>
                      <Badge variant="secondary" className="rounded-full">Raw</Badge>
                    </div>
                    <div className="relative group rounded-3xl overflow-hidden border-2 border-border/50 shadow-xl bg-background">
                      <img
                        src={uploadedImageUrl || ""}
                        alt="Source"
                        className="w-full object-contain max-h-[60vh]"
                        style={imageAnalysis && !enhancedResult ? {
                          filter: `brightness(${imageAnalysis.aesthetic_audit.brightness}) contrast(${imageAnalysis.aesthetic_audit.contrast}) saturate(${imageAnalysis.aesthetic_audit.saturation})`
                        } : {}}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Aesthetic Analysis</span>
                      <Badge variant="secondary" className="rounded-full">Logic</Badge>
                    </div>
                    <div className="p-8 rounded-3xl border-2 border-border/50 bg-muted/20 h-full flex flex-col justify-center gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-primary uppercase">Prompt Logic</p>
                        <p className="text-sm italic text-muted-foreground leading-relaxed">"{result?.refined_prompt}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-background border border-border/30">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">DPI</p>
                          <p className="text-xl font-black">300</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-background border border-border/30">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Format</p>
                          <p className="text-xl font-black">PNG</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AFTER / MASTER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Master Result</span>
                    <Badge className="rounded-full bg-primary text-primary-foreground">Optimized</Badge>
                  </div>
                  <div className="relative group rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl shadow-primary/10 bg-background transition-transform duration-500 hover:scale-[1.01]">
                    <img
                      src={enhancedResult?.enhanced_image_url || result?.image_url || ""}
                      alt="Master Result"
                      className="w-full object-contain max-h-[60vh]"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={handleDownload}>
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full" onClick={() => window.open(enhancedResult?.enhanced_image_url || result?.image_url, '_blank')}>
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AUDIT DETAILS (Only if enhanced) */}
              {imageAnalysis && (
                <div className="w-full bg-muted/20 rounded-3xl p-8 border border-border/50">
                  <div className="flex items-center gap-4 mb-8">
                    <Settings2 className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-bold text-xl">Aesthetic Intelligence Report</h3>
                      <p className="text-xs text-muted-foreground">Hardware-accelerated analysis results</p>
                    </div>
                  </div>
                  <VisionAudit analysis={imageAnalysis} imageUrl={uploadedImageUrl || ""} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})