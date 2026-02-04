import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from 'lucide-react'
import { 
  Sparkles, 
  Download, 
  Loader2, 
  Image as ImageIcon, 
  RefreshCw,
  Maximize2
} from "lucide-react"

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

  return (
    <div className="flex-1 h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="p-4 md:px-10 border-b flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight italic">Vision Lab</h1>
        </div>
        {result && (
           <Button variant="outline" size="sm" onClick={() => window.open(result.image_url, '_blank')}>
             <Maximize2 className="h-4 w-4 mr-2" /> Full View
           </Button>
        )}
      </div>

      {/* Main Content: Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6">
        <div className="max-w-4xl mx-auto grid gap-6">
          
          {/* Output Display */}
          <div className="min-h-[300px] md:min-h-[500px] w-full relative group">
            {!result && !loading ? (
              <div className="absolute inset-0 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center opacity-30">
                <ImageIcon className="h-16 w-16 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Awaiting Vision Prompt...</p>
              </div>
            ) : loading ? (
              <div className="absolute inset-0 bg-muted/20 animate-pulse rounded-3xl flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm font-black uppercase italic animate-bounce">Generating High-Res Magic...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <img 
                  src={result?.image_url} 
                  alt="Generated Content" 
                  className="w-full h-auto rounded-3xl shadow-2xl border bg-muted"
                />
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Sparkles className="h-3 w-3" /> AI Refined Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
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
      <div className="border-t bg-card/80 backdrop-blur-md p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Textarea 
              placeholder="Describe your vision (e.g., 'A rainy night in Kochi with neon lights')..."
              className="resize-none h-24 bg-background border-2 focus-visible:ring-primary rounded-xl"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt}
            className="w-full md:w-48 h-24 rounded-xl font-black text-sm flex flex-col gap-2 shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
            GENERATE
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})