import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonaVariant } from "@/types/persona"
import { Copy, Check, Users, Briefcase, Baby, Globe, Rocket, CalendarDays } from "lucide-react"
import { useState } from "react"
import { ScheduleMissionDialog } from "./ScheduleMissionDialog"

interface PersonaVariantsDisplayProps {
    variants: PersonaVariant[]
    onSchedule?: (content: string, platform: string, personaName: string) => void
}

const PERSONA_ICONS: Record<string, any> = {
    gen_z: Users,
    professional: Briefcase,
    parent: Baby,
    regional_tamil: Globe,
    entrepreneur: Rocket,
}



export function PersonaVariantsDisplay({ variants, onSchedule }: PersonaVariantsDisplayProps) {
    const [selectedForSchedule, setSelectedForSchedule] = useState<{ content: string, platform: string, personaName: string } | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (content: string, personaId: string) => {
        navigator.clipboard.writeText(content)
        setCopiedId(personaId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleExecuteMission = async (data: { scheduled_at: string, webhook_url: string }) => {
        if (!selectedForSchedule) return

        const response = await fetch("http://127.0.0.1:8000/api/v1/nexus/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: selectedForSchedule.content,
                platform: selectedForSchedule.platform,
                persona_name: selectedForSchedule.personaName,
                scheduled_at: data.scheduled_at,
                webhook_url: data.webhook_url
            })
        })

        if (!response.ok) throw new Error("Failed to execute mission")
    }

    return (
        <div className="space-y-6">
            {/* Context Header */}
            <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Tribe Adaptations</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">Persona-specific content strategy</p>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {variants.map((variant, index) => {
                    const Icon = PERSONA_ICONS[variant.persona_id] || Users

                    return (
                        <Card
                            key={variant.persona_id}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="group flex flex-col bg-background border-border/60 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                        >
                            {/* Card Header / Persona Info */}
                            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-foreground leading-none">{variant.persona_name}</h4>
                                        <div className="flex gap-1.5 pt-1">
                                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background border-border/50 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary/70 uppercase tracking-tighter">
                                                {variant.platform_suggestion}
                                            </Badge>
                                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background border-border/50 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary/70 uppercase tracking-tighter">
                                                {variant.tone_used}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-md hover:bg-background hover:text-primary"
                                        onClick={() => handleCopy(variant.content, variant.persona_id)}
                                    >
                                        {copiedId === variant.persona_id ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                    {onSchedule && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-background hover:text-primary"
                                            onClick={() => setSelectedForSchedule({
                                                content: variant.content,
                                                platform: variant.platform_suggestion,
                                                personaName: variant.persona_name
                                            })}
                                        >
                                            <CalendarDays className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <CardContent className="p-5 flex-1 bg-gradient-to-br from-background via-background to-muted/5">
                                <p className="text-[13px] leading-relaxed text-foreground/80 font-medium whitespace-pre-wrap">
                                    {variant.content}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            {selectedForSchedule && (
                <ScheduleMissionDialog
                    isOpen={!!selectedForSchedule}
                    onClose={() => setSelectedForSchedule(null)}
                    content={selectedForSchedule.content}
                    platform={selectedForSchedule.platform}
                    personaName={selectedForSchedule.personaName}
                    onExecute={handleExecuteMission}
                />
            )}
        </div>
    )
}
