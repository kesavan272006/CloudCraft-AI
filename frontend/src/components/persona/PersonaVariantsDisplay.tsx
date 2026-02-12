import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonaVariant } from "@/types/persona"
import { Copy, Check, Users, Briefcase, Baby, Globe, Rocket, CalendarDays } from "lucide-react"
import { useState } from "react"

interface PersonaVariantsDisplayProps {
    variants: PersonaVariant[]
    originalContent: string
    onSchedule?: (content: string, platform: string, personaName: string) => void
}

const PERSONA_ICONS: Record<string, any> = {
    gen_z: Users,
    professional: Briefcase,
    parent: Baby,
    regional_tamil: Globe,
    entrepreneur: Rocket,
}

const PERSONA_COLORS: Record<string, string> = {
    gen_z: "from-purple-500/10 to-pink-500/10 border-purple-500/30",
    professional: "from-blue-500/10 to-cyan-500/10 border-blue-500/30",
    parent: "from-green-500/10 to-emerald-500/10 border-green-500/30",
    regional_tamil: "from-orange-500/10 to-red-500/10 border-orange-500/30",
    entrepreneur: "from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
}

export function PersonaVariantsDisplay({ variants, originalContent, onSchedule }: PersonaVariantsDisplayProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (content: string, personaId: string) => {
        navigator.clipboard.writeText(content)
        setCopiedId(personaId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Original Content */}
            <Card className="bg-muted/30 border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground">Original Content</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(originalContent, 'original')}
                            className="h-7 px-2"
                        >
                            {copiedId === 'original' ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {originalContent}
                    </p>
                </CardContent>
            </Card>

            {/* Persona Variants */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Persona-Adapted Variants
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {variants.map((variant) => {
                        const Icon = PERSONA_ICONS[variant.persona_id] || Users
                        const colorClass = PERSONA_COLORS[variant.persona_id] || "from-muted/40 to-muted/20 border-border/50"

                        return (
                            <Card
                                key={variant.persona_id}
                                className={`bg-gradient-to-br ${colorClass} shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-primary" />
                                            <h4 className="text-sm font-bold text-foreground">{variant.persona_name}</h4>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(variant.content, variant.persona_id)}
                                                className="h-7 px-2"
                                            >
                                                {copiedId === variant.persona_id ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3" />
                                                )}
                                            </Button>
                                            {onSchedule && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onSchedule(variant.content, variant.platform_suggestion, variant.persona_name)}
                                                    className="h-7 px-2 text-primary"
                                                >
                                                    <CalendarDays className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                            {variant.platform_suggestion}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                            {variant.tone_used}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {variant.content}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
