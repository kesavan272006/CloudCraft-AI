import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useCampaignStore, Campaign } from '@/stores/campaign-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Rocket, Sparkles, Target, Users, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})

function CampaignArchitectPage() {
  const { campaigns, activeCampaign, isFetching, isSaving, isGenerating, fetchCampaigns, createCampaign, setActiveCampaign, generateStrategy } = useCampaignStore()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: '', goal: '', duration: '', budget: '' })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.goal) return toast.error("Name and Goal are required")
    await createCampaign(formData)
    setIsCreating(false)
    setFormData({ name: '', goal: '', duration: '', budget: '' })
    toast.success("Campaign draft created!")
  }

  const handleGenerate = async () => {
    if (!activeCampaign) return
    toast.info("Consulting Marketing Strategist... This may take 30s.")
    await generateStrategy(activeCampaign.id)
    toast.success("Strategy generated successfully!")
  }

  if (activeCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setActiveCampaign(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{activeCampaign.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant={activeCampaign.status === 'active' ? 'default' : 'secondary'}>
                {activeCampaign.status.toUpperCase()}
              </Badge>
              <span>{activeCampaign.duration} • {activeCampaign.budget}</span>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        {activeCampaign.strategy ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Core Concept */}
            <Card className="md:col-span-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-400" /> Core Concept
                </CardTitle>
                <CardDescription>{activeCampaign.strategy.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium italic">"{activeCampaign.strategy.core_concept}"</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <strong>Tone:</strong> {activeCampaign.strategy.tone}
                </div>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" /> Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCampaign.strategy.target_audience.map((aud, i) => (
                  <div key={i} className="bg-secondary/50 p-3 rounded-lg">
                    <div className="font-semibold">{aud.segment_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{aud.pain_point}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* USPs */}
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-400" /> USPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {activeCampaign.strategy.usps.map((usp, i) => (
                    <li key={i}>{usp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Visual Direction */}
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" /> Visuals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeCampaign.strategy.visual_direction}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Strategy Not Generated</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Let our AI Marketing Strategist analyze your goal and audience to build a winning plan.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate Strategy
            </Button>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Architect</h2>
          <p className="text-muted-foreground">Plan, strategize, and execute your marketing campaigns.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/50 bg-primary/5 mb-8">
          <CardHeader><CardTitle>Draft New Campaign</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g. Summer Launch 2026" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="e.g. 4 Weeks" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Goal</Label>
              <Textarea placeholder="What do you want to achieve? (e.g. Increase signups by 20%)" value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Budget (Optional)</Label>
              <Input placeholder="e.g. $5,000" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {campaigns.length === 0 && !isCreating ? (
        <div className="text-center py-20 text-muted-foreground">
          {isFetching ? <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /> : "No campaigns found. Start by creating one!"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveCampaign(campaign)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl truncate">{campaign.name}</CardTitle>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>{campaign.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{campaign.goal}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>⏱ {campaign.duration}</span>
                  <span>💰 {campaign.budget}</span>
                </div>
                {campaign.strategy && (
                  <div className="mt-4 pt-4 border-t text-xs text-green-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Strategy Ready
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
