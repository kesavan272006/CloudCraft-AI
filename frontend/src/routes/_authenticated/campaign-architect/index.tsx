import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Plus, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createFileRoute } from '@tanstack/react-router'

export default function CampaignArchitectPage() {
  return (
    <div className="flex-1 space-y-8 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <CalendarDays className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Campaign Architect</h1>
            <p className="text-muted-foreground">Plan multi-day story arcs & content calendars</p>
          </div>
        </div>

        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Separator />

      <div className="space-y-8">
        {/* Current Campaign Overview */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  Active Campaign: "Kerala Tourism Summer 2025"
                </CardTitle>
                <CardDescription className="mt-1">
                  7-day Instagram + LinkedIn story arc targeting 18–35 audience
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                In Progress
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Calendar grid placeholder */}
            <div className="grid grid-cols-7 gap-3 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Day cards */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3 min-h-[120px] flex flex-col justify-between ${
                    i === 2 ? "border-primary bg-primary/5" : "bg-muted/30"
                  }`}
                >
                  <div className="text-xs text-muted-foreground">Day {i + 1}</div>
                  {i === 2 ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Reel: Backwater sunrise</p>
                      <p className="text-xs text-primary">High engagement expected</p>
                    </div>
                  ) : i === 0 ? (
                    <div className="text-xs text-muted-foreground italic">Teaser post</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">—</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                Edit Calendar
              </Button>
              <Button variant="outline">
                Generate Next 3 Days
              </Button>
              <Button>
                <ArrowRight className="mr-2 h-4 w-4" />
                Export to Buffer / Later
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Ideas / Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ready-to-Use Campaign Templates
            </CardTitle>
            <CardDescription>
              Start with proven structures optimized for Indian audiences & platforms
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Festival Series",
                  desc: "Onam / Diwali / Pongal – 5–7 day emotional storytelling arc",
                  platforms: ["Instagram", "LinkedIn", "X"],
                },
                {
                  title: "Product Launch Teaser",
                  desc: "3-day countdown + reveal post for new brand drop",
                  platforms: ["Instagram Reels", "LinkedIn"],
                },
                {
                  title: "Thought Leadership Thread",
                  desc: "7-day educational series with stats & tips",
                  platforms: ["LinkedIn", "X"],
                },
              ].map((template, i) => (
                <Card key={i} className="hover:border-primary transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {template.platforms.map((p) => (
                        <Badge key={p} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="mt-4 w-full justify-start text-primary">
                      Use this template →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/campaign-architect/')({
  component: CampaignArchitectPage,
})