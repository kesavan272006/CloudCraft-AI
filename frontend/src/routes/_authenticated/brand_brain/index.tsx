import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Save, Check, RotateCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useBrandStore } from '@/stores/brand-store'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const Route = createFileRoute('/_authenticated/brand_brain/')({
  component: BrandBrainPage,
})

function BrandBrainPage() {
  const {
    brandName,
    brandDescription,
    brandVoice,
    targetAudience,
    setBrandProfile,
    saveBrandProfile,
    fetchBrandProfile,
    isLoading,
    error,
    hasProfile
  } = useBrandStore()

  const [isSaving, setIsSaving] = useState(false)

  // Load brand profile on mount
  useEffect(() => {
    fetchBrandProfile()
  }, [fetchBrandProfile])

  const handleSave = async () => {
    if (!brandName || !brandDescription) {
      toast.error("Please fill in at least the Brand Name and Description")
      return
    }

    setIsSaving(true)
    try {
      await saveBrandProfile({
        brandName,
        brandDescription,
        brandVoice,
        targetAudience
      })
      toast.success("Brand identity saved to cloud memory!")
    } catch (error) {
      console.error("Failed to save:", error)
      toast.error("Failed to save to cloud memory")
    } finally {
      setIsSaving(false)
    }
  }

  // Determine if the brand memory is active
  const isMemoryActive = hasProfile()

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Brand Brain
          </h1>
          <p className="text-muted-foreground mt-2">
            Define your brand's core identity. This memory is shared across all AI agents.
          </p>
        </div>
        {isMemoryActive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium border border-green-500/20">
            <Check className="h-4 w-4" />
            Memory Active
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {error}. Using local cache if available.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Configuration Card */}
        <Card className="md:col-span-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Core Identity
            </CardTitle>
            <CardDescription>
              The fundamental truths about your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="e.g. CloudCraft AI"
                value={brandName}
                onChange={(e) => setBrandProfile({ brandName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandDescription">Brand Description & Mission</Label>
              <Textarea
                id="brandDescription"
                placeholder="Describe what your company does, your values, and your unique selling proposition..."
                className="min-h-[120px]"
                value={brandDescription}
                onChange={(e) => setBrandProfile({ brandDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice</Label>
                <Select
                  value={brandVoice}
                  onValueChange={(value) => setBrandProfile({ brandVoice: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional & Authoritative</SelectItem>
                    <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                    <SelectItem value="playful">Playful & Witty</SelectItem>
                    <SelectItem value="visionary">Visionary & Inspiring</SelectItem>
                    <SelectItem value="technical">Technical & Precise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g. Startup Founders"
                  value={targetAudience}
                  onChange={(e) => setBrandProfile({ targetAudience: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
            <Button variant="ghost" size="sm" onClick={() => fetchBrandProfile()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset / Reload
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving} className="min-w-[140px]">
              {isLoading || isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Memory
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Info/Preview Card */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Why this matters?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              Your <strong>Brand Brain</strong> is the central source of truth for all AI agents in CloudCraft.
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Genesis Engine</strong> uses this to tailor campaign strategies.</li>
              <li><strong>The Forge</strong> ensures all copy and visuals match your tone.</li>
              <li><strong>Competitor Pulse</strong> analyzes rivals from <em>your</em> perspective.</li>
            </ul>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-1">Pro Tip</h4>
              <p>Be specific in your description. The more context the AI has, the better the output.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}