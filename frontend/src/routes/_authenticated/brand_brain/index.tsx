import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, UploadCloud, FileText, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { createFileRoute } from '@tanstack/react-router'

export default function BrandBrainPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Brain className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Brand Brain</h1>
          <p className="text-muted-foreground">Your brand memory, guidelines & compliance vault</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Upload & Knowledge Vault */}
        <Card className="border-dashed border-2 border-primary/30 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Add to Brand Knowledge
            </CardTitle>
            <CardDescription>
              Upload brand guidelines, previous high-performing posts, tone of voice docs, color palettes, logos...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/50 p-10 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Drag & drop or click to upload</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, PNG, JPG, TXT, DOCX (max 20MB per file)
              </p>
              <Button variant="outline" className="mt-6">
                Select files
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Recently added</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-md border bg-background p-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Brand_Guidelines_2025_v2.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploaded 2 hours ago • 1.8 MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border bg-background p-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Top_Instagram_Posts_Q4_2024.xlsx</p>
                    <p className="text-xs text-muted-foreground">Uploaded yesterday • 420 KB</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Auditor & Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Brand Compliance Auditor
            </CardTitle>
            <CardDescription>
              AI scans your drafts against uploaded brand rules and gives instant feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Tone & Voice Alignment</span>
                  <span className="font-medium text-green-600">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Visual Style Consistency</span>
                  <span className="font-medium text-yellow-600">81%</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Key Messages & Hashtags</span>
                  <span className="font-medium text-blue-600">4/5</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Prohibited Words/Phrases</span>
                  <span className="font-medium text-red-600">0 violations</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-1">Quick summary:</p>
              <p className="text-muted-foreground">
                Your brand voice is strong and consistent. Minor improvements needed in visual mood matching for Instagram content.
              </p>
            </div>

            <Button className="w-full">
              Run Full Brand Audit on Current Draft
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/brand_brain/')({
  component: BrandBrainPage,
})