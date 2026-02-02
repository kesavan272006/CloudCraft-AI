import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, Upload, Eye, Sparkles, Wand2, Loader2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createFileRoute } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const Route = createFileRoute('/_authenticated/vision-lab/')({
  component: VisionLabPage,
})

interface VisionResult {
  detected_elements: string[]
  mood: string
  mood_description: string
  dominant_colors: string[]
  caption_idea: string
  edit_suggestion: string
}

export default function VisionLabPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VisionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.")
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
      setResult(null) // Reset previous results
      // Auto-analyze on select
      analyzeImage(file)
    }
  }

  const analyzeImage = async (file: File) => {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:8000/api/v1/vision/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to analyze image")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.")
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Status Indicator */}
        {isLoading && (
          <Badge variant="outline" className="animate-pulse">
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Analyzing Scene...
          </Badge>
        )}
      </div>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Upload & Preview */}
        <Card className="overflow-hidden border-primary/20 h-fit">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Image or Video Frame
            </CardTitle>
            <CardDescription>
              Drop your photo/video screenshot here for AI analysis
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!previewUrl ? (
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/50 bg-muted/20 p-12 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 text-lg font-medium">Click to upload image</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Supports JPG, PNG, WEBP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border bg-background overflow-hidden relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full object-contain max-h-[400px] bg-black/5"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full relative"
                  disabled={isLoading}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                  />
                  Upload Different Image
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right: Analysis & Suggestions */}
        {result ? (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Scene Intelligence Results
              </CardTitle>
              <CardDescription>
                AI-detected elements, mood, and suggestions
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
                  {result.detected_elements.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-base py-1.5 px-3 capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Mood & Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Mood Analysis
                  </h4>
                  <div className="py-1">
                    <p className="text-xl font-semibold tracking-tight text-foreground">{result.mood}</p>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {result.mood_description}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col justify-between">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">Dominant Colors</h4>
                  <div className="flex gap-3 flex-wrap">
                    {result.dominant_colors.map((color, i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full ring-1 ring-border shadow-sm transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <h4 className="font-medium">Suggested Actions & Captions</h4>
                <div className="space-y-3">
                  <div className="rounded-md border p-4 bg-muted/30">
                    <p className="font-medium flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Caption Idea
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{result.caption_idea}"
                    </p>
                  </div>
                  <div className="rounded-md border p-4 bg-muted/30">
                    <p className="font-medium">Edit Suggestion</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.edit_suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Placeholder state before upload */
          !isLoading && (
            <div className="hidden lg:flex flex-col items-center justify-center p-12 text-muted-foreground border-2 border-dashed rounded-xl h-full min-h-[400px] bg-muted/10">
              <Sparkles className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg">Upload an image to reveal AI insights</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}