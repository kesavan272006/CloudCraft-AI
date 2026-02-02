import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Brain, Save, Sparkles, CheckCircle2 } from "lucide-react"
import { createFileRoute } from '@tanstack/react-router'
import { useBrandStore } from "@/stores/brand-store"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BrandBrainPage() {
  const { brand } = useBrandStore()
  const [localName, setLocalName] = useState(brand.brandName)
  const [localDesc, setLocalDesc] = useState(brand.brandDescription)
  const [localVoice, setLocalVoice] = useState(brand.brandVoice)
  const [localAudience, setLocalAudience] = useState(brand.targetAudience)

  const handleSave = () => {
    brand.setBrandProfile({
      brandName: localName,
      brandDescription: localDesc,
      brandVoice: localVoice,
      targetAudience: localAudience
    })
    toast.success("Brand Identity Saved to Memory!")
  }

  const hasProfile = brand.brandName || brand.brandDescription

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Brand Brain</h1>
            <p className="text-muted-foreground">Your brand memory & identity vault</p>
          </div>
        </div>
        {hasProfile && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Identity Active</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Brand Identity Form */}
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Brand Identity
            </CardTitle>
            <CardDescription>
              Define your brand once. Genesis will remember it everywhere.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="e.g., CloudCraft AI"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandDesc">Brand Description</Label>
              <Textarea
                id="brandDesc"
                placeholder="What does your brand do? Who are you?"
                className="min-h-[100px]"
                value={localDesc}
                onChange={(e) => setLocalDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandVoice">Brand Voice</Label>
              <Select value={localVoice} onValueChange={setLocalVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your brand voice..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Trustworthy</SelectItem>
                  <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                  <SelectItem value="witty">Witty & Humorous</SelectItem>
                  <SelectItem value="visionary">Visionary & Tech-Forward</SelectItem>
                  <SelectItem value="empathetic">Empathetic & Caring</SelectItem>
                  <SelectItem value="bold">Bold & Disruptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Indian tech founders, 25-40"
                value={localAudience}
                onChange={(e) => setLocalAudience(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="mr-2 h-4 w-4" />
              Save to Brand Memory
            </Button>
          </CardContent>
        </Card>

        {/* Right: Memory Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Active Brand Memory</CardTitle>
            <CardDescription>
              This is what Genesis sees when generating content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasProfile ? (
              <>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Brand Name</p>
                    <p className="font-bold text-lg">{brand.brandName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{brand.brandDescription || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Voice</p>
                    <p className="text-sm font-medium">{brand.brandVoice || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Audience</p>
                    <p className="text-sm">{brand.targetAudience || "Not set"}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Genesis Engine will automatically use this context when generating campaigns
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No brand identity saved yet. Fill in the form and click "Save to Brand Memory" to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/brand_brain/')({
  component: BrandBrainPage,
})