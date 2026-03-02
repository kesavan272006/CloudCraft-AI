import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Save, RotateCcw, Loader2, Sparkles, AlertCircle, Search as SearchIcon, X, Network } from 'lucide-react'
import { useBrandStore } from '@/stores/brand-store'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// LAYOUT IMPORTS
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/brand_brain/')({
  component: BrandBrainPage,
})

const topNav = [
  {
    title: 'Overview',
    href: '/dashboard',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Brand Brain',
    href: '/brand_brain',
    isActive: true,
    disabled: false,
  },
  {
    title: 'The Forge',
    href: '/forge',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Missions',
    href: '/tasks',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  }
]

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
  const [searchQuery, setSearchQuery] = useState('')

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
      toast.success("Brand identity saved to vector memory!")
    } catch (error) {
      console.error("Failed to save:", error)
      toast.error("Failed to sync with cloud memory")
    } finally {
      setIsSaving(false)
    }
  }

  // Determine if the brand memory is active
  const isMemoryActive = hasProfile()

  return (
    <>
      {/* UNIVERSAL HEADER */}
      <Header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <TopNav links={topNav} />
        </div>
        <div className='ms-auto flex items-center space-x-2 sm:space-x-4'>
          <div className="relative hidden md:flex items-center">
            <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search autonomous tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-secondary/50 border-secondary rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-sm shadow-none"
            />
            {searchQuery && (
              <X
                className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 relative">
        {/* PREMIUM DOT-MATRIX BACKGROUND GRID */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none hidden dark:block"></div>

        {/* HERO SECTION */}
        <div className='flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10'>
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-500 text-xs font-semibold mb-2 shadow-sm uppercase tracking-widest gap-2">
              {isMemoryActive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                  </span>
                  Memory Active
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Memory Uninitialized
                </>
              )}
            </div>
            <h1 className='text-3xl md:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-2'>
              Brand Brain
            </h1>
            <p className="text-muted-foreground text-sm font-medium pr-10 md:w-3/4">
              Configure your vector-embedded brand guidelines. This centralized truth dictates the tone, style, and guardrails across all autonomous agents in your orchestration.
            </p>
          </div>

          <div className='flex items-center space-x-3 shrink-0 mt-4 md:mt-0'>
            <Button variant="outline" size="sm" onClick={() => fetchBrandProfile()} className="shadow-sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Sync Cloud
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving} className="shadow-sm bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-0">
              {isLoading || isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Embedding..." : "Save Identity"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="relative z-10 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Synchronization Error</AlertTitle>
            <AlertDescription>
              {error}. Operating from local cache. Verify connectivity to the orchestration core.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* MAIN CONFIGURATION CARD */}
          <Card className="lg:col-span-2 border-border shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-3xl rounded-full pointer-events-none" />

            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="h-5 w-5 text-fuchsia-500" />
                Core Vectors
              </CardTitle>
              <CardDescription className="text-xs">
                The foundational parameters that inform AI generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="brandName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entity Designation</Label>
                <Input
                  id="brandName"
                  placeholder="e.g. Acme Corp"
                  className="bg-background/50 focus-visible:ring-fuchsia-500"
                  value={brandName}
                  onChange={(e) => setBrandProfile({ brandName: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="brandDescription" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mission & Values</Label>
                <Textarea
                  id="brandDescription"
                  placeholder="Describe your market position, ultimate goals, and strict negative constraints..."
                  className="min-h-[160px] bg-background/50 focus-visible:ring-fuchsia-500 leading-relaxed resize-none"
                  value={brandDescription}
                  onChange={(e) => setBrandProfile({ brandDescription: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="brandVoice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linguistic Voice</Label>
                  <Select
                    value={brandVoice}
                    onValueChange={(value) => setBrandProfile({ brandVoice: value })}
                  >
                    <SelectTrigger className="bg-background/50 focus:ring-fuchsia-500">
                      <SelectValue placeholder="Select primary dialect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Enterprise & Authoritative</SelectItem>
                      <SelectItem value="friendly">Approachable & Warm</SelectItem>
                      <SelectItem value="playful">Consumer Playful</SelectItem>
                      <SelectItem value="visionary">Futuristic & Visionary</SelectItem>
                      <SelectItem value="technical">Developer-Centric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetAudience" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Demographic</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g. DevSecOps Engineers"
                    className="bg-background/50 focus-visible:ring-fuchsia-500"
                    value={targetAudience}
                    onChange={(e) => setBrandProfile({ targetAudience: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SIDEBAR EXPLANATION / HUD */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  System Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground/80 space-y-4">
                <p className="leading-relaxed">
                  When you embed these parameters, they are injected into the <strong>global system prompt</strong> of every agent online.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center shrink-0 border border-border">
                      <Brain className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Content Adherence</p>
                      <p className="text-[11px] mt-0.5">The Forge Engine enforces your exact tonal constraints.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-fuchsia-500/20 shadow-sm bg-fuchsia-500/5">
              <CardContent className="p-5">
                <h4 className="font-semibold text-fuchsia-500 text-sm mb-2 uppercase tracking-wide">Orchestrator Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Be incredibly specific in your "Mission & Values". Include what your brand <strong>does not</strong> do. Supplying negative constraints (e.g., "Do not use emojis") significantly increases alignment success rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}