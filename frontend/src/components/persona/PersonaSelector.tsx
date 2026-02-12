import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PersonaInfo } from "@/types/persona"
import { Users, Briefcase, Baby, Globe, Rocket } from "lucide-react"

interface PersonaSelectorProps {
    personas: PersonaInfo[]
    selectedPersonas: string[]
    onTogglePersona: (personaId: string) => void
}

const PERSONA_ICONS: Record<string, any> = {
    gen_z: Users,
    professional: Briefcase,
    parent: Baby,
    regional_tamil: Globe,
    entrepreneur: Rocket,
}

const PERSONA_COLORS: Record<string, string> = {
    gen_z: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    professional: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    parent: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    regional_tamil: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    entrepreneur: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
}

export function PersonaSelector({ personas, selectedPersonas, onTogglePersona }: PersonaSelectorProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Select Target Audiences</h3>
                <Badge variant="outline" className="ml-auto">
                    {selectedPersonas.length} selected
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personas.map((persona) => {
                    const Icon = PERSONA_ICONS[persona.id] || Users
                    const colorClass = PERSONA_COLORS[persona.id] || "from-muted/40 to-muted/20 border-border/50"
                    const isSelected = selectedPersonas.includes(persona.id)

                    return (
                        <Card
                            key={persona.id}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${isSelected
                                ? `bg-gradient-to-br ${colorClass} shadow-lg`
                                : "bg-muted/20 border-border/40 hover:border-primary/30"
                                }`}
                            onClick={() => onTogglePersona(persona.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onTogglePersona(persona.id)}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <h4 className="text-sm font-semibold text-foreground">{persona.name}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {persona.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                {persona.age_range}
                                            </Badge>
                                            {persona.platforms.slice(0, 2).map((platform) => (
                                                <Badge key={platform} variant="outline" className="text-[10px] px-1.5 py-0">
                                                    {platform}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
