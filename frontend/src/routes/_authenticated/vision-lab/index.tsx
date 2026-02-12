import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Download,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Zap,
  Lightbulb,
  ArrowRight,
  Stars,
  Palette,
  Maximize2
} from "lucide-react"

const quickPrompts = [
  { text: "A futuristic city at night with flying cars and neon lights", emoji: "🌃" },
  { text: "A serene mountain lake at sunrise with mist", emoji: "🏔️" },
  { text: "A cozy bookshop in Paris on a rainy evening", emoji: "📚" },
  { text: "A magical forest with glowing mushrooms and fireflies", emoji: "🌲" },
  { text: "A vintage car on a desert highway at sunset", emoji: "🚗" }
]

export default function VisionLabPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ image_url: string; refined_prompt: string } | null>(null)

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

  const useQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt)
  }

  return (
    <div className="flex-1 h-screen flex bg-background text-foreground overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      {/* LEFT PANEL - Input & Controls */}
      <div className="w-full md:w-[480px] lg:w-[560px] border-r border-border/50 flex flex-col relative z-10 backdrop-blur-sm bg-background/50">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative p-2.5 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Vision Lab</h1>
              <p className="text-xs text-muted-foreground font-medium">AI-Powered Image Generation</p>
            </div>
          </div>
        </div>

        {/* Main Input Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Palette className="h-3.5 w-3.5 text-primary" />
              </div>
              <label className="text-sm font-bold text-foreground">Your Vision</label>
            </div>

            <div className="relative group">
              {/* Glow effect on focus */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-500" />

              <Textarea
                placeholder="Describe what you want to create... Be specific about style, mood, colors, and details."
                className="relative min-h-[160px] resize-none bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl text-sm transition-all hover:border-primary/30"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt && !loading) {
                    handleGenerate()
                  }
                }}
              />
              {prompt && (
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border/50 shadow-sm">
                  {prompt.length} chars
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3 text-primary/60" />
                <span>Press <kbd className="px-1.5 py-0.5 bg-muted/50 border border-border/50 rounded text-[10px] font-mono">Ctrl+Enter</kbd></span>
              </div>
              {prompt && (
                <span className="text-xs text-primary/70 font-medium animate-pulse">Ready ✨</span>
              )}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
              </div>
              <label className="text-sm font-bold text-foreground">Quick Ideas</label>
            </div>

            <div className="space-y-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => useQuickPrompt(qp.text)}
                  className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 hover:from-primary/10 hover:to-primary/5 border border-border/40 hover:border-primary/50 transition-all duration-300 text-xs text-foreground/80 hover:text-primary group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <div className="flex items-center gap-2.5 relative">
                    <span className="text-base">{qp.emoji}</span>
                    <span className="flex-1 line-clamp-1">{qp.text}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Refined Prompt (if result exists) */}
          {result && (
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 shadow-lg shadow-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
              <CardContent className="p-4 space-y-2 relative">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Stars className="h-3.5 w-3.5" />
                  AI Enhanced Prompt
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {result.refined_prompt}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generate Button */}
        <div className="p-6 border-t border-border/50 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin relative z-10" />
                <span className="relative z-10">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Generate Image</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL - Preview */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Preview Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-background/60 to-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Preview</span>
            {result && (
              <Badge variant="outline" className="ml-2 gap-1 bg-primary/5 border-primary/20">
                <Sparkles className="h-2.5 w-2.5" />
                Generated
              </Badge>
            )}
          </div>
          {result && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(result.image_url, '_blank')}
                className="gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
                Full View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-8 flex items-center justify-center bg-gradient-to-br from-muted/10 via-background to-muted/20">
          {!result && !loading ? (
            <div className="text-center space-y-6 max-w-md animate-in fade-in duration-700">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative p-10 bg-gradient-to-br from-muted/40 to-muted/20 rounded-3xl border border-border/50">
                  <ImageIcon className="h-24 w-24 text-muted-foreground/40" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Ready to Create
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter your vision on the left and click Generate to bring it to life with AI
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-sm">
                  <Zap className="h-3 w-3 text-primary" />
                  High Quality
                </Badge>
                <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Enhanced
                </Badge>
                <Badge variant="outline" className="gap-1.5 bg-background/50 backdrop-blur-sm">
                  <Wand2 className="h-3 w-3 text-primary" />
                  Instant
                </Badge>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full animate-pulse" />
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-primary animate-spin" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 blur-xl animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-pulse">
                  Creating Your Vision
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is painting your imagination into reality...
                </p>
                <div className="flex gap-1.5 justify-center pt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 animate-in fade-in zoom-in duration-700">
              <div className="relative group max-w-full max-h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                <img
                  src={result?.image_url}
                  alt="Generated"
                  className="relative max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-border/50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})