import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Save, RotateCcw, Loader2, Sparkles, AlertCircle, Search as SearchIcon, X, Network, Zap } from 'lucide-react'
import { useBrandStore } from '@/stores/brand-store'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { motion } from 'framer-motion'

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

      <Main className="px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-10 relative overflow-hidden">
        {/* PREMIUM DOT-MATRIX BACKGROUND GRID */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>

        {/* PREMIUM GRADIENT MESH OVERLAY */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30"
          style={{ 
            background: 'radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)'
          }}>
        </div>

        {/* FLOATING ORBS BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-fuchsia-500/20 via-pink-500/20 to-purple-500/20 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ top: '10%', left: '5%' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 blur-3xl"
            animate={{
              x: [0, -60, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            style={{ bottom: '15%', right: '10%' }}
          />
        </div>

        {/* HERO SECTION */}
        <motion.div 
          className='flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <motion.div 
              className="inline-flex items-center px-3 py-1 rounded-full border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/15 via-fuchsia-500/10 to-fuchsia-500/15 text-fuchsia-500 text-xs font-bold mb-2 shadow-lg shadow-fuchsia-500/20 uppercase tracking-widest gap-2 backdrop-blur-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isMemoryActive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50"></span>
                  </span>
                  Memory Active
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Memory Uninitialized
                </>
              )}
            </motion.div>
            <motion.h1 
              className='text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center gap-3'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Brand Brain
              <Zap className="h-8 w-8 md:h-10 md:w-10 text-fuchsia-500 animate-pulse" />
            </motion.h1>
            <motion.p 
              className="text-muted-foreground text-sm md:text-base font-medium pr-10 md:w-3/4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Configure your vector-embedded brand guidelines. This centralized truth dictates the tone, style, and guardrails across all autonomous agents in your orchestration.
            </motion.p>
          </div>

          <motion.div 
            className='flex items-center space-x-3 shrink-0 mt-4 md:mt-0'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button variant="outline" size="sm" onClick={() => fetchBrandProfile()} className="h-10 font-semibold shadow-lg shadow-black/5 transition-all hover:bg-secondary hover:scale-105 hover:shadow-xl border-border/50 backdrop-blur-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Sync Cloud
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isSaving} 
              className="h-10 px-5 font-bold shadow-xl shadow-fuchsia-500/25 transition-all bg-gradient-to-r from-fuchsia-500 via-fuchsia-600 to-fuchsia-500/90 text-white hover:shadow-2xl hover:shadow-fuchsia-500/40 hover:scale-105 border-0 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              {isLoading || isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
              ) : (
                <Save className="mr-2 h-4 w-4 relative z-10" />
              )}
              <span className="relative z-10">{isSaving ? "Embedding..." : "Save Identity"}</span>
            </Button>
          </motion.div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant="destructive" className="relative z-10 border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent backdrop-blur-xl shadow-xl shadow-red-500/10 before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-r before:from-red-500/20 before:via-transparent before:to-transparent before:opacity-50 before:-z-10">
              {/* Premium glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent opacity-50 blur-lg rounded-lg pointer-events-none" />
              
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Synchronization Error</AlertTitle>
              <AlertDescription className="text-sm">
                {error}. Operating from local cache. Verify connectivity to the orchestration core.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* MAIN CONFIGURATION CARD */}
          <motion.div
            className="lg:col-span-2"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-fuchsia-500/10 transition-all duration-500 bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-fuchsia-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
              {/* Premium outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/10 to-transparent opacity-0 hover:opacity-100 blur-xl rounded-lg transition-opacity duration-500 pointer-events-none" />
              
              {/* Animated gradient orb */}
              <motion.div 
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              <CardHeader className="border-b border-border/30 bg-gradient-to-r from-muted/20 via-muted/10 to-transparent pb-4 relative z-10">
                <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                  <Network className="h-5 w-5 text-fuchsia-500 drop-shadow-lg" />
                  Core Vectors
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-muted-foreground mt-1.5">
                  The foundational parameters that inform AI generation.
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6 pt-6 relative z-10">
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="brandName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" />
                  Entity Designation
                </Label>
                <Input
                  id="brandName"
                  placeholder="e.g. Acme Corp"
                  className="bg-background/80 focus-visible:ring-2 focus-visible:ring-fuchsia-500 border-border/50 shadow-sm hover:shadow-md hover:border-fuchsia-500/30 transition-all backdrop-blur-sm"
                  value={brandName}
                  onChange={(e) => setBrandProfile({ brandName: e.target.value })}
                />
              </motion.div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="brandDescription" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" />
                  Mission & Values
                </Label>
                <Textarea
                  id="brandDescription"
                  placeholder="Describe your market position, ultimate goals, and strict negative constraints..."
                  className="min-h-[160px] bg-background/80 focus-visible:ring-2 focus-visible:ring-fuchsia-500 leading-relaxed resize-none border-border/50 shadow-sm hover:shadow-md hover:border-fuchsia-500/30 transition-all backdrop-blur-sm"
                  value={brandDescription}
                  onChange={(e) => setBrandProfile({ brandDescription: e.target.value })}
                />
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-6">
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Label htmlFor="brandVoice" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" />
                    Linguistic Voice
                  </Label>
                  <Select
                    value={brandVoice}
                    onValueChange={(value) => setBrandProfile({ brandVoice: value })}
                  >
                    <SelectTrigger className="bg-background/80 focus:ring-2 focus:ring-fuchsia-500 border-border/50 shadow-sm hover:shadow-md hover:border-fuchsia-500/30 transition-all backdrop-blur-sm">
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
                </motion.div>

                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Label htmlFor="targetAudience" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" />
                    Target Demographic
                  </Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g. DevSecOps Engineers"
                    className="bg-background/80 focus-visible:ring-2 focus-visible:ring-fuchsia-500 border-border/50 shadow-sm hover:shadow-md hover:border-fuchsia-500/30 transition-all backdrop-blur-sm"
                    value={targetAudience}
                    onChange={(e) => setBrandProfile({ targetAudience: e.target.value })}
                  />
                </motion.div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* SIDEBAR EXPLANATION / HUD */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative border border-border/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-2xl overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-amber-500/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                {/* Premium glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 hover:opacity-100 blur-lg rounded-lg transition-opacity duration-500 pointer-events-none" />
                
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="text-sm font-bold flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 drop-shadow-lg" />
                    System Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4 relative z-10">
                  <p className="leading-relaxed">
                    When you embed these parameters, they are injected into the <strong className="text-foreground">global system prompt</strong> of every agent online.
                  </p>
                  <div className="space-y-3 pt-2">
                    <motion.div 
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all"
                      whileHover={{ x: 4 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg shadow-primary/10">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Content Adherence</p>
                        <p className="text-[11px] mt-0.5 text-muted-foreground">The Forge Engine enforces your exact tonal constraints.</p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative border border-fuchsia-500/30 shadow-xl shadow-fuchsia-500/10 bg-gradient-to-br from-fuchsia-500/10 via-fuchsia-500/5 to-transparent backdrop-blur-xl overflow-hidden before:absolute before:inset-0 before:rounded-lg before:p-[1px] before:bg-gradient-to-br before:from-fuchsia-500/20 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10">
                {/* Premium glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 hover:opacity-100 blur-lg rounded-lg transition-opacity duration-500 pointer-events-none" />
                
                <CardContent className="p-5 relative z-10">
                  <h4 className="font-bold text-fuchsia-500 text-sm mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Orchestrator Tip
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Be incredibly specific in your "Mission & Values". Include what your brand <strong className="text-foreground">does not</strong> do. Supplying negative constraints (e.g., "Do not use emojis") significantly increases alignment success rates.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </Main>
    </>
  )
}