import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Download, 
  Loader2, 
  Image as ImageIcon, 
  RefreshCw,
  Maximize2,
  Wand2,
  Zap,
  Copy,
  Check,
  Lightbulb,
  ChevronRight
} from "lucide-react"

const quickPrompts = [
  "A futuristic city at night with flying cars and neon lights",
  "A serene mountain lake at sunrise with mist",
  "A cozy bookshop in Paris on a rainy evening",
  "A magical forest with glowing mushrooms and fireflies",
  "A vintage car on a desert highway at sunset"
]

export default function VisionLabPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ image_url: string; refined_prompt: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/vision/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Generation failed", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.image_url) return
    try {
      const response = await fetch(result.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vision-lab-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed", error)
    }
  }

  const copyPrompt = () => {
    if (result?.refined_prompt) {
      navigator.clipboard.writeText(result.refined_prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const useQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt)
    setShowQuickPrompts(false)
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5 text-foreground overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, rgba(120,119,198,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Header */}
      <div className="relative p-4 md:px-10 border-b border-border/40 flex items-center justify-between backdrop-blur-xl bg-card/30">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl shadow-lg shadow-primary/10 ring-1 ring-primary/20">
            <Wand2 className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase tracking-tight">
              Vision Lab
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">AI-Powered Image Generation</p>
          </div>
        </div>
        {result && (
           <div className="flex gap-2">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleDownload}
               className="group relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all"
             >
               <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" /> 
               Download
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => window.open(result.image_url, '_blank')}
               className="group relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all"
             >
               <Maximize2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> 
               Full View
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setResult(null)}
               className="hover:bg-destructive/10 hover:text-destructive transition-colors"
             >
               <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> 
               Reset
             </Button>
           </div>
        )}
      </div>

      {/* Main Content: Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 relative">
        <div className="max-w-5xl mx-auto grid gap-6">
          
          {/* Output Display */}
          <div className="min-h-[300px] md:min-h-[500px] w-full relative group">
            {!result && !loading ? (
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-transparent backdrop-blur-sm">
                <div className="relative">
                  <ImageIcon className="h-20 w-20 mb-6 text-primary/40 animate-pulse" />
                  <Sparkles className="h-6 w-6 text-primary/60 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm text-muted-foreground/60">Awaiting Vision Prompt...</p>
                <p className="text-xs text-muted-foreground/40 mt-2">Enter a description below to generate stunning visuals</p>
              </div>
            ) : loading ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/10 to-primary/5 animate-pulse rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm border border-primary/20">
                <div className="relative">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <p className="text-base font-black uppercase bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse mb-2">
                  Generating High-Res Magic...
                </p>
                <div className="flex gap-1 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-700">
                <div className="relative group/image">
                  <img 
                    src={result?.image_url} 
                    alt="Generated Content" 
                    className="w-full h-auto rounded-3xl shadow-2xl border border-border/50 bg-muted transition-all duration-500 group-hover/image:scale-[1.02] group-hover/image:shadow-primary/10"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform group-hover/image:translate-y-0 translate-y-2">
                    <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg">
                      <Zap className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>

                  {/* Quick Actions on Hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 transform group-hover/image:translate-y-0 translate-y-2">
                    <Button 
                      size="sm" 
                      onClick={handleDownload}
                      className="flex-1 bg-background/90 hover:bg-background text-foreground backdrop-blur-sm shadow-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => window.open(result?.image_url, '_blank')}
                      className="flex-1 bg-background/90 hover:bg-background text-foreground backdrop-blur-sm shadow-lg"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      View Full
                    </Button>
                  </div>
                </div>
                
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg shadow-primary/5 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <div className="p-1.5 bg-primary/20 rounded-md">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        AI Refined Prompt
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyPrompt}
                        className="h-7 px-2 hover:bg-primary/10"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {result?.refined_prompt}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Fixed Input Section */}
      <div className="relative border-t border-border/40 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        
        {/* Quick Prompts Dropdown */}
        {showQuickPrompts && (
          <div className="absolute bottom-full left-0 right-0 mb-2 px-4 md:px-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="max-w-5xl mx-auto">
              <Card className="bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Quick Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => useQuickPrompt(qp)}
                      className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
                          {qp}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-end relative">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Vision
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                className="h-7 text-xs hover:text-primary transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                {showQuickPrompts ? 'Hide' : 'Show'} Ideas
              </Button>
            </div>
            <div className="relative group">
              <Textarea 
                placeholder="Describe your vision in detail... (e.g., 'A cyberpunk street in Tokyo at sunset with neon signs reflecting on wet pavement')"
                className="resize-none h-28 bg-background/50 border-2 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 rounded-2xl transition-all duration-300 group-hover:border-primary/30 backdrop-blur-sm shadow-lg peer"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt && !loading) {
                    handleGenerate()
                  }
                }}
              />
              {prompt && (
                <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/60 font-medium">
                  {prompt.length} characters
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Press Ctrl+Enter to generate
            </p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt}
            className="w-full md:w-52 h-28 rounded-2xl font-black text-base flex flex-col gap-2 shadow-2xl shadow-primary/30 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />
                <span className="text-xs tracking-wider">GENERATING...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-7 w-7 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wider">GENERATE</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})