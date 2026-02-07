import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Hammer, Sparkles, Loader2, AlertCircle, MessageSquare, CheckCircle2, Copy, Check, Globe, RefreshCcw, Zap, Clock, Info, BrainCircuit, LayoutTemplate } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Transmute State
  const [transmuting, setTransmuting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('LinkedIn Post');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [transmuteResult, setTransmuteResult] = useState<any>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Content copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanContent = (text: string) => {
    if (!text) return "";
    return text
      .replace(/NEXT:.*$/gm, '')
      .replace(/REASON:.*$/gm, '')
      .replace(/Compliance output:/gi, '')
      .replace(/Designer output:/gi, '')
      .replace(/Copywriter output:/gi, '')
      .replace(/Researcher output:/gi, '')
      .trim();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setTransmuteResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/forge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Backend error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the Forge engine");
    } finally {
      setLoading(false);
    }
  };

  const handleTransmute = async () => {
    setTransmuting(true);
    try {
      const contentToTransmute = cleanContent(result?.final_content || "");
      if (!contentToTransmute || contentToTransmute.length < 10) {
        throw new Error("Source content appears empty or too short.");
      }

      const response = await fetch('http://localhost:8000/api/v1/transmute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToTransmute,
          target_format: targetFormat,
          target_language: targetLanguage
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Transmutation failed");
      }
      const data = await response.json();
      setTransmuteResult(data);
      toast.success(`Success! Converted to ${targetFormat} in ${targetLanguage}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Transmutation failed: " + err.message);
    } finally {
      setTransmuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex-none border-b p-4 flex items-center justify-between bg-card z-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Hammer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">The Forge</h1>
            <p className="text-muted-foreground text-xs">AI Content Operations</p>
          </div>
        </div>
        {!result && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrompt("Create a viral LinkedIn post about the future of AI in 2026")}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Load Example
          </Button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Area (Left Pane) */}
        <div className="flex-1 flex flex-col border-r bg-muted/5 p-6 overflow-y-auto">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">What are we building today?</h2>
                <p className="text-muted-foreground">Orchestrate a team of AI agents to research, write, and refine your content.</p>
              </div>

              <div className="w-full space-y-4">
                <Textarea
                  placeholder="Describe your content goal..."
                  className="min-h-[150px] text-lg p-6 rounded-xl shadow-sm border-2 focus-visible:ring-primary/20"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button size="lg" className="w-full h-12 text-base font-bold shadow-lg" onClick={handleGenerate} disabled={loading || !prompt.trim()}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                  {loading ? "Agents at Work..." : "Ignite The Forge"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="px-3 py-1 border-green-500/30 text-green-600 bg-green-500/5">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Content Ready
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(cleanContent(result.final_content))}>
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
              </div>

              <Card className="shadow-sm border-border">
                <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-primary">Master Consolidated Content</h3>
                </div>
                <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown>{cleanContent(result.final_content)}</ReactMarkdown>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-8">
                <Button variant="outline" onClick={() => setResult(null)}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Start New Session
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Tools (Right Pane) */}
        {result && (
          <div className="w-[400px] flex-none bg-card border-l shadow-xl h-[calc(100vh-8rem)] flex flex-col">
            <Tabs defaultValue="transmute" className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b flex-none">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="timeline" className="gap-2"><BrainCircuit className="w-4 h-4" /> Intelligence</TabsTrigger>
                  <TabsTrigger value="transmute" className="gap-2"><Globe className="w-4 h-4" /> Transmute</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="timeline" className="flex-1 overflow-y-auto p-0 m-0">
                <div className="p-4 space-y-4">
                  {result.thoughts?.map((t: any, i: number) => (
                    <div key={i} className="relative pl-6 pb-6 border-l-2 border-muted last:border-0 last:pb-0">
                      <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">{t.agent}</span>
                          <span className="text-[10px] text-muted-foreground">Step {i + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                          <ReactMarkdown>{t.thought}</ReactMarkdown>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transmute" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div className="space-y-4 bg-muted/10 p-4 rounded-xl border border-dashed">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Platform</label>
                      <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Twitter Thread">Twitter / X Thread</SelectItem>
                          <SelectItem value="Instagram Reel Script">Instagram Reel Script</SelectItem>
                          <SelectItem value="LinkedIn Post">LinkedIn Professional</SelectItem>
                          <SelectItem value="Blog Post">Long-form Blog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Regional Dialect</label>
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English (Global)</SelectItem>
                          <SelectItem value="Hinglish">Hinglish (North India)</SelectItem>
                          <SelectItem value="Hindi">Hindi (Devanagari)</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                          <SelectItem value="Malayalam">Malayalam</SelectItem>
                          <SelectItem value="Kannada">Kannada</SelectItem>
                          <SelectItem value="Marathi">Marathi</SelectItem>
                          <SelectItem value="Bengali">Bengali</SelectItem>
                          <SelectItem value="Telugu">Telugu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full font-bold uppercase tracking-wider" onClick={handleTransmute} disabled={transmuting}>
                      {transmuting ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 fill-current" />}
                      Transmute
                    </Button>
                  </div>

                  {transmuteResult && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <Badge variant="secondary" className="font-bold">RESULT</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {transmuteResult.estimated_reading_time}
                        </span>
                      </div>
                      <div className="bg-background border rounded-lg p-4 text-sm leading-relaxed max-h-[400px] overflow-y-auto shadow-inner">
                        <ReactMarkdown>{transmuteResult.transformed_content}</ReactMarkdown>
                      </div>
                      <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                        "{transmuteResult.regional_nuance}"
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {transmuteResult.suggested_tags?.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[10px] text-primary border-primary/20">{t}</Badge>
                        ))}
                      </div>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => handleCopy(transmuteResult.transformed_content)}>
                        Copy Result
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/forge/')({
  component: ForgePage,
});