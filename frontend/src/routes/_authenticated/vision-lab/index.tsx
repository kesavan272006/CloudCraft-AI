import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, Upload, Eye, Sparkles, Wand2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createFileRoute } from '@tanstack/react-router'

export default function VisionLabPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <ImageIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vision Lab</h1>
            <p className="text-muted-foreground">Scene intelligence & visual content suggestions</p>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Auto-suggest caption
        </Button>
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Upload & Preview */}
        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Image or Video Frame
            </CardTitle>
            <CardDescription>
              Drop your photo/video screenshot here — AI will detect objects, mood, colors and suggest edits/captions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/50 bg-muted/20 p-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 cursor-pointer">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-4 text-lg font-medium">Drag & drop or click to upload</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP, MP4 screenshot (max 10MB)
              </p>
              <Button variant="secondary" className="mt-6">
                Choose file
              </Button>
            </div>

            {/* Preview placeholder */}
            <div className="rounded-lg border bg-background overflow-hidden aspect-video relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/40">
                <ImageIcon className="h-16 w-16 mb-4 opacity-40" />
                <p className="text-lg font-medium">Image preview will appear here</p>
                <p className="text-sm mt-1 max-w-xs text-center">
                  Upload an image to start scene analysis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Analysis & Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Scene Intelligence Results
            </CardTitle>
            <CardDescription>
              AI-detected elements, mood, dominant colors and suggested improvements
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detected objects */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Detected Elements
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-base py-1.5 px-3">Person</Badge>
                <Badge variant="secondary" className="text-base py-1.5 px-3">Backwaters</Badge>
                <Badge variant="secondary" className="text-base py-1.5 px-3">Houseboat</Badge>
                <Badge variant="secondary" className="text-base py-1.5 px-3">Sunset</Badge>
                <Badge variant="secondary" className="text-base py-1.5 px-3">Nature</Badge>
                <Badge variant="secondary" className="text-base py-1.5 px-3">Kerala</Badge>
              </div>
            </div>

            {/* Mood & Colors */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium">Mood Analysis</h4>
                <div className="rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 text-center">
                  <p className="text-xl font-semibold">Serene & Nostalgic</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Calm, peaceful, reflective atmosphere
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Dominant Colors</h4>
                <div className="flex gap-3 flex-wrap">
                  <div className="h-12 w-12 rounded-md bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm" title="Sunset Orange" />
                  <div className="h-12 w-12 rounded-md bg-gradient-to-br from-emerald-600 to-teal-700 shadow-sm" title="Kerala Green" />
                  <div className="h-12 w-12 rounded-md bg-gradient-to-br from-blue-800 to-indigo-900 shadow-sm" title="Water Blue" />
                  <div className="h-12 w-12 rounded-md bg-gradient-to-br from-amber-300 to-yellow-400 shadow-sm" title="Golden Hour" />
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <h4 className="font-medium">Suggested Actions & Captions</h4>
              <div className="space-y-3">
                <div className="rounded-md border p-4 bg-muted/30">
                  <p className="font-medium">Caption Idea 1</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    "Floating through serenity... Kerala backwaters at golden hour 🛶✨ #KeralaTourism #GodsOwnCountry"
                  </p>
                </div>
                <div className="rounded-md border p-4 bg-muted/30">
                  <p className="font-medium">Edit Suggestion</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Increase warmth filter +10% and boost vibrance for more inviting tropical feel
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4">
              Generate Optimized Caption & Hashtags
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,  // change to match your function name
})