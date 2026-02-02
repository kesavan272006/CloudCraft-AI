import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Hammer, Sparkles, Loader2, AlertCircle, MessageSquare, CheckCircle2, Copy, Check } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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

  return (
    <div className="flex-1 space-y-4 p-4 md:space-y-8 md:p-10 bg-background text-foreground overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 md:p-3">
            <Hammer className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-3xl">The Forge</h1>
            <p className="text-muted-foreground text-xs md:text-sm">Multi-agent content orchestration</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full md:w-auto"
          onClick={() => setPrompt("Create a viral LinkedIn post about the future of AI in 2026")}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Try Example
        </Button>
      </div>

      <Separator />

      {/* Main Input Card */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Launch AI Agents
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Your prompt will be handled by a collaborative squad of specialized AI agents.
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Researcher', 'Copywriter', 'Designer', 'Compliance'].map((agent) => (
              <span key={agent} className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] md:text-xs font-bold text-secondary-foreground uppercase">
                {agent}
              </span>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <div className="space-y-4">
            <Textarea
              placeholder="What should we create today?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[140px] md:min-h-[180px] resize-y text-sm md:text-base bg-background border-input"
              disabled={loading}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button 
                size="lg" 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full sm:w-auto font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Forging...
                  </>
                ) : (
                  "Start Agent Collaboration"
                )}
              </Button>

              <Button variant="outline" size="lg" disabled={loading} className="w-full sm:w-auto">
                Reference Assets
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Area */}
          {result && (
            <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Final Content Block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                    Final Content
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(result.final_content)}
                    className="h-8 px-2 text-xs"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Copy</span>
                  </Button>
                </div>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground bg-muted/30 p-5 md:p-8 rounded-xl border border-primary/20 break-words shadow-inner">
                  <ReactMarkdown>
                    {result.final_content || ""}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Agent Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  Agent Thought Process
                </h3>
                
                <div className="grid gap-4">
                  {result.thoughts?.map((t: any, i: number) => (
                    <Card key={i} className="bg-card border-border overflow-hidden shadow-sm">
                      <div className="bg-primary/5 px-4 py-2 border-b border-border flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary uppercase">
                          Agent: {t.agent}
                        </span>
                        <span className="text-[9px] text-muted-foreground">STEP {i + 1}</span>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-muted-foreground uppercase">Reasoning</span>
                          <p className="text-xs md:text-sm text-foreground/80 italic leading-relaxed border-l-2 border-primary/20 pl-3">
                            {t.thought}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-primary uppercase">Draft Output</span>
                          <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none bg-background p-4 rounded-lg border border-border/50 break-words">
                            <ReactMarkdown>
                              {t.output}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty/Idle State */}
          {!result && !error && !loading && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-12 md:p-24 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-primary/5 p-6 md:p-8 text-primary/30">
                <Hammer className="h-12 w-12 md:h-16 md:w-16" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">The Forge is Idle</h3>
              <p className="max-w-xs md:max-w-md text-muted-foreground mt-2 text-sm md:text-base">
                Ready to transform your ideas? Watch AI agents collaborate to generate viral content.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/forge/')({
  component: ForgePage,
});