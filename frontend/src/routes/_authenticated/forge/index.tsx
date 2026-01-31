import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Hammer, Sparkles, PlayCircle } from "lucide-react"
import { createFileRoute } from '@tanstack/react-router'

export default function ForgePage() {
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
            <PlayCircle className="h-5 w-5 text-primary" />
            Launch AI Agents
          </CardTitle>
          <CardDescription className="text-base">
            Describe your content goal. Four specialized agents will collaborate in real time:
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
              className="min-h-[180px] resize-y text-base font-medium placeholder:text-muted-foreground/70"
            />

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="min-w-[200px]">
                Start Forging
              </Button>
              <Button variant="outline" size="lg">
                Upload reference (image / doc)
              </Button>
            </div>
          </div>

          {/* Agent thinking placeholder (this will become live later) */}
          <div className="rounded-xl border bg-muted/40 p-8 min-h-[380px] flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Hammer className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Agent collaboration will appear here</h3>
            <p className="max-w-md text-muted-foreground">
              You will see step-by-step thoughts from each agent → final polished content ready to post
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export const Route = createFileRoute('/_authenticated/forge/')({
  component: ForgePage,  // reference the function name (no arrow)
})