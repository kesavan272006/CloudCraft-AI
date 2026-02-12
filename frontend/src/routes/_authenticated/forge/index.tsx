import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Hammer, Sparkles, Loader2, AlertCircle, CheckCircle2, Copy, Globe, RefreshCcw, Zap, Users, ArrowRight, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { createFileRoute } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { PersonaVariantsDisplay } from "@/components/persona/PersonaVariantsDisplay";
import { PerformanceCard } from "@/components/performance/PerformanceCard";
import type { PersonaInfo, PersonaResponse } from "@/types/persona";
import type { PerformanceResponse } from "@/types/performance";

export default function ForgePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Performance State
  const [analyzingPerformance, setAnalyzingPerformance] = useState(false);
  const [performanceResult, setPerformanceResult] = useState<PerformanceResponse | null>(null);

  // Transmute State
  const [transmuting, setTransmuting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('LinkedIn Post');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [transmuteResult, setTransmuteResult] = useState<any>(null);

  // Persona State
  const [personas, setPersonas] = useState<PersonaInfo[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [generatingPersonas, setGeneratingPersonas] = useState(false);
  const [personaResult, setPersonaResult] = useState<PersonaResponse | null>(null);

  // UI State - Collapsible sections
  const [showMasterContent, setShowMasterContent] = useState(true);
  const [showTools, setShowTools] = useState(false);
  const [activeTool, setActiveTool] = useState<'personas' | 'transmute' | null>(null);


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Content copied to clipboard");
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
    setPersonaResult(null);
    setPerformanceResult(null);
    setShowMasterContent(true);
    setShowTools(false);
    setActiveTool(null);

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
      // Auto-show tools after content is generated
      setTimeout(() => setShowTools(true), 500);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the Forge engine");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictPerformance = async () => {
    setAnalyzingPerformance(true);
    try {
      const contentToAnalyze = cleanContent(result?.final_content || "");
      if (!contentToAnalyze || contentToAnalyze.length < 10) {
        throw new Error("Content appears empty or too short.");
      }

      const response = await fetch('http://localhost:8000/api/v1/performance/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToAnalyze,
          platform: "General",
          persona: "General Audience"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze performance");
      }
      const data = await response.json();
      setPerformanceResult(data);
      toast.success("Performance analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error("Analysis failed: " + err.message);
    } finally {
      setAnalyzingPerformance(false);
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

  // Fetch available personas on mount
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/persona/list');
        if (response.ok) {
          const data = await response.json();
          setPersonas(data);
        }
      } catch (error) {
        console.error('Failed to fetch personas:', error);
      }
    };
    fetchPersonas();
  }, []);

  const handleTogglePersona = (personaId: string) => {
    setSelectedPersonas(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleGeneratePersonas = async () => {
    if (selectedPersonas.length === 0) {
      toast.error("Please select at least one persona");
      return;
    }

    setGeneratingPersonas(true);
    try {
      const contentToAdapt = cleanContent(result?.final_content || "");

      const response = await fetch('http://localhost:8000/api/v1/persona/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToAdapt,
          personas: selectedPersonas
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate persona variants");
      }

      const data = await response.json();
      setPersonaResult(data);
      toast.success(`Generated ${data.variants.length} persona variants!`);
    } catch (error: any) {
      console.error(error);
      toast.error("Persona generation failed: " + error.message);
    } finally {
      setGeneratingPersonas(false);
    }
  };

  const handleStartPersonas = () => {
    setActiveTool('personas');
    setTransmuteResult(null);
    setPersonaResult(null);
    setShowMasterContent(false);
    setShowTools(false); // Hide tools to show persona selector
  };

  const handleStartTransmute = () => {
    setActiveTool('transmute');
    setPersonaResult(null);
    setTransmuteResult(null);
    setShowMasterContent(false);
    setShowTools(false); // Hide tools to show transmute form
  };

  return (
    <div className="flex-1 h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex-none border-b p-6 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative p-2.5 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <Hammer className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">The Forge</h1>
              <p className="text-xs text-muted-foreground font-medium">AI Content Operations</p>
            </div>
          </div>
          {result && (
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setTransmuteResult(null);
                setPersonaResult(null);
                setShowMasterContent(true);
                setShowTools(false);
              }}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              New Session
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8 space-y-6">
          {/* Input Section */}
          {!result && (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  What are we building today?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Orchestrate a team of AI agents to research, write, and refine your content
                </p>
              </div>

              <Card className="bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <Textarea
                    placeholder="Describe your content goal... (e.g., 'Create a viral LinkedIn post about the future of AI in 2026')"
                    className="min-h-[180px] text-base resize-none bg-background/50 border-2 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && prompt && !loading) {
                        handleGenerate();
                      }
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Press <kbd className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-mono">Ctrl+Enter</kbd> to generate
                    </div>
                    {prompt && (
                      <span className="text-xs text-primary/70 font-medium">{prompt.length} chars</span>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden group"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 relative z-10" />
                        <span className="relative z-10">Agents at Work...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 relative z-10" />
                        <span className="relative z-10">Ignite The Forge</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* Generated Content - Collapsible */}
              <Card className="bg-gradient-to-br from-green-500/5 via-background to-green-500/5 border-green-500/20 shadow-xl">
                <div
                  className="bg-gradient-to-r from-green-500/10 to-green-500/5 px-6 py-4 border-b border-green-500/20 flex items-center justify-between cursor-pointer hover:bg-green-500/15 transition-colors"
                  onClick={() => setShowMasterContent(!showMasterContent)}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-lg text-green-600">Master Content</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {showMasterContent && (
                      <>
                        {!performanceResult && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePredictPerformance();
                            }}
                            disabled={analyzingPerformance}
                          >
                            {analyzingPerformance ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                            {analyzingPerformance ? "Analyzing..." : "Predict Score"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(cleanContent(result.final_content));
                          }}
                          className="hover:bg-green-500/10"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </>
                    )}
                    {showMasterContent ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {showMasterContent && (
                  <CardContent className="p-8 prose prose-lg dark:prose-invert max-w-none animate-in slide-in-from-top duration-300">
                    <ReactMarkdown>{cleanContent(result.final_content)}</ReactMarkdown>
                  </CardContent>
                )}
              </Card>

              {/* Performance Prediction Result */}
              {performanceResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Performance Prediction
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPerformanceResult(null)}
                      className="text-muted-foreground hover:text-foreground h-8"
                    >
                      Dismiss
                    </Button>
                  </div>
                  <PerformanceCard
                    prediction={performanceResult.prediction}
                    platform={performanceResult.platform}
                    persona={performanceResult.persona}
                  />
                </div>
              )}

              {/* Tools Section - Only show if no active tool */}
              {showTools && !personaResult && !transmuteResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-primary" />
                    What's Next?
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Personas Tool */}
                    <Card
                      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
                      onClick={handleStartPersonas}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Users className="h-6 w-6 text-purple-500" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="font-bold text-foreground">Audience Personas</h4>
                            <p className="text-sm text-muted-foreground">
                              Adapt content for Gen-Z, Professionals, Parents, and more
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transmute Tool */}
                    <Card
                      className="cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                      onClick={handleStartTransmute}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Globe className="h-6 w-6 text-blue-500" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className="font-bold text-foreground">Platform Transmute</h4>
                            <p className="text-sm text-muted-foreground">
                              Convert to Twitter threads, Instagram scripts, and more
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Personas Workflow */}
              {activeTool === 'personas' && !personaResult && (
                <Card className="bg-gradient-to-br from-purple-500/5 via-background to-purple-500/5 border-purple-500/20 shadow-xl animate-in slide-in-from-right duration-500">
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 px-6 py-4 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-lg text-purple-600">Audience Personas</h3>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <PersonaSelector
                      personas={personas}
                      selectedPersonas={selectedPersonas}
                      onTogglePersona={handleTogglePersona}
                    />

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveTool(null);
                          setShowTools(true);
                          setSelectedPersonas([]);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        className="flex-[2] h-12 font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={handleGeneratePersonas}
                        disabled={generatingPersonas || selectedPersonas.length === 0}
                      >
                        {generatingPersonas ? (
                          <>
                            <Loader2 className="animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2" />
                            Generate for {selectedPersonas.length} Persona{selectedPersonas.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Persona Results */}
              {personaResult && (
                <Card className="bg-gradient-to-br from-purple-500/5 via-background to-purple-500/5 border-purple-500/20 shadow-xl animate-in slide-in-from-right duration-500">
                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-lg text-foreground">{personaResult.variants.length} Persona Variants</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPersonaResult(null);
                        setSelectedPersonas([]);
                        setActiveTool(null);
                        setShowTools(true);
                      }}
                    >
                      <RefreshCcw className="w-3 h-3 mr-2" />
                      Back to Tools
                    </Button>
                  </div>
                  <CardContent className="p-8">
                    <PersonaVariantsDisplay
                      variants={personaResult.variants}
                      originalContent={personaResult.original_content}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Transmute Workflow */}
              {activeTool === 'transmute' && !transmuteResult && (
                <Card className="bg-gradient-to-br from-blue-500/5 via-background to-blue-500/5 border-blue-500/20 shadow-xl animate-in slide-in-from-right duration-500">
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 px-6 py-4 border-b border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-lg text-blue-600">Platform Transmute</h3>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Platform</label>
                        <Select value={targetFormat} onValueChange={setTargetFormat}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Twitter Thread">Twitter / X Thread</SelectItem>
                            <SelectItem value="Instagram Reel Script">Instagram Reel Script</SelectItem>
                            <SelectItem value="LinkedIn Post">LinkedIn Professional</SelectItem>
                            <SelectItem value="Blog Post">Long-form Blog</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Regional Dialect</label>
                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
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
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveTool(null);
                          setShowTools(true);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        className="flex-[2] h-12 font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        onClick={handleTransmute}
                        disabled={transmuting}
                      >
                        {transmuting ? (
                          <>
                            <Loader2 className="animate-spin mr-2" />
                            Transmuting...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2" />
                            Transmute Content
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transmute Results */}
              {transmuteResult && (
                <Card className="bg-gradient-to-br from-blue-500/5 via-background to-blue-500/5 border-blue-500/20 shadow-xl animate-in slide-in-from-right duration-500">
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-lg text-foreground">Transmuted Content</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(transmuteResult.transformed_content)}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTransmuteResult(null);
                          setActiveTool(null);
                          setShowTools(true);
                        }}
                      >
                        <RefreshCcw className="w-3 h-3 mr-2" />
                        Back to Tools
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-4">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <ReactMarkdown>{transmuteResult.transformed_content}</ReactMarkdown>
                    </div>
                    <div className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-lg">
                      "{transmuteResult.regional_nuance}"
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {transmuteResult.suggested_tags?.map((t: string) => (
                        <Badge key={t} variant="outline" className="text-[10px] text-primary border-primary/20">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/forge/')({
  component: ForgePage,
});