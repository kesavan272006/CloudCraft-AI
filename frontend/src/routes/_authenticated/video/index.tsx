import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Video, Sparkles, Loader2, AlertCircle, Play, Download, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

export default function VideoStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a visual prompt first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          image_url: imageUrl.trim() || null 
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      toast.success("Cinematic video generated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to connect to the Video engine");
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-8 md:p-10 bg-background text-foreground overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-2 md:p-3">
            <Video className="h-6 w-6 md:h-7 md:w-7 text-teal-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">Video Studio</h1>
            <p className="text-muted-foreground text-xs md:text-sm">AI Motion Synthesis Engine</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full md:w-auto"
          onClick={() => setPrompt("Cinematic drone shot of a futuristic neon city in the clouds, high detail, 4k")}
        >
          <Sparkles className="mr-2 h-4 w-4 text-teal-500" />
          Try Example
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="border-border bg-card shadow-sm h-fit">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-teal-500" />
              Direct the Scene
            </CardTitle>
            <CardDescription>
              Provide a prompt or an image URL to animate your vision.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-teal-500/80">Visual Prompt</label>
                <Textarea
                  placeholder="Describe the motion, lighting, and camera movement..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none bg-background border-input"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-teal-500/80">Image Reference (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="https://image-link.com/asset.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="pl-10 bg-background"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                size="lg" 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synthesizing Motion...
                  </>
                ) : (
                  "Generate Cinematic Video"
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="border-border bg-black shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[300px] md:min-h-[450px]">
          {result?.video_url ? (
            <div className="w-full h-full relative group">
              <video 
                src={result.video_url} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={result.video_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-teal-500 p-2 rounded-full text-black hover:bg-teal-400"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center p-10">
              <div className="mb-4 rounded-full bg-teal-500/5 p-6 inline-block border border-teal-500/10">
                <Play className="h-10 w-10 text-teal-500/20" />
              </div>
              <h3 className="text-lg font-bold text-muted-foreground">Studio Preview</h3>
              <p className="max-w-[250px] text-muted-foreground/60 mt-2 text-sm">
                Your generated video will appear here in high fidelity.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Refined Prompt/Thought section - Matching Forge style */}
      {result?.refined_prompt && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="flex items-center gap-2 mb-4">
             <CheckCircle2 className="h-5 w-5 text-teal-500" />
             <h3 className="text-lg font-bold">Agentic Refinement</h3>
           </div>
           <Card className="bg-muted/20 border-teal-500/20">
             <CardContent className="p-6">
                <span className="text-[10px] font-black text-teal-500 uppercase">Expanded Visual Logic</span>
                <p className="mt-2 text-sm md:text-base italic leading-relaxed text-foreground/80">
                  "{result.refined_prompt}"
                </p>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/video/')({
  component: VideoStudioPage,
});