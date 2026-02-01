import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Hammer, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex-1 space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Hammer className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">The Forge</h1>
            <p className="text-muted-foreground">Multi-agent content creation engine</p>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Try example prompt
        </Button>
      </div>

      <Separator />

      {/* Main card */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-amber-600" />
            Launch AI Agents
          </CardTitle>
          <CardDescription className="text-base">
            Describe your content goal. Researcher, Copywriter, Designer, and Compliance agents will collaborate in real time.
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">Researcher</span>
            <span className="rounded-full bg-muted px-3 py-1">Designer</span>
            <span className="rounded-full bg-muted px-3 py-1">Copywriter</span>
            <span className="rounded-full bg-muted px-3 py-1">Compliance</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Prompt input */}
          <div className="space-y-4">
            <Textarea
              placeholder="Write your content idea here...\n\nExamples:\n• Create a viral LinkedIn post about AI adoption in Kerala startups\n• Instagram reel script + captions for Onam celebration 2025\n• 7-day Twitter thread on sustainable tourism in India"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[180px] resize-y text-base font-medium placeholder:text-muted-foreground/70"
              disabled={loading}
            />

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Forging...
                  </>
                ) : (
                  "Start Forging"
                )}
              </Button>

              <Button variant="outline" size="lg" disabled={loading}>
                Upload reference (image / doc)
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Result display */}
          {result && (
            <div className="mt-8 rounded-xl border bg-muted/40 p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Agent Collaboration Results
              </h3>

              <div className="space-y-6">
                {/* Final Content */}
                <div className="rounded-lg border bg-background p-4">
                  <h4 className="font-medium mb-2 text-primary">Final Content</h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {result.final_content || "No content returned"}
                  </p>
                </div>

                {/* Agent Thoughts */}
                <div>
                  <h4 className="font-medium mb-3 text-primary">Agent Thoughts</h4>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {result.thoughts?.length > 0 ? (
                      result.thoughts.map((t: any, i: number) => (
                        <div key={i} className="rounded-lg border bg-background p-4">
                          <p className="font-medium text-sm">{t.agent}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Thought: {t.thought}
                          </p>
                          <p className="text-sm mt-2 whitespace-pre-wrap">
                            {t.output}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No agent thoughts returned
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder when idle */}
          {!result && !error && !loading && (
            <div className="rounded-xl border bg-muted/40 p-8 min-h-[380px] flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Hammer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Agent collaboration will appear here</h3>
              <p className="max-w-md text-muted-foreground">
                Enter your idea and click "Start Forging" to see step-by-step thoughts from each agent → final polished content
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