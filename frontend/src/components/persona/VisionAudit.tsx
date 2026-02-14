import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Camera, Sliders, CheckCircle2 } from "lucide-react"

interface AestheticAudit {
    brightness: number
    contrast: number
    saturation: number
    temperature: string
    clarity_score: number
    pro_tip: string
}

interface VisionAuditProps {
    analysis: {
        vibe_description: string
        detected_context: string
        suggested_tone: string
        aesthetic_audit: AestheticAudit
    }
    imageUrl: string
}

export function VisionAudit({ analysis, imageUrl }: VisionAuditProps) {
    const { aesthetic_audit } = analysis

    return (
        <Card className="overflow-hidden border-primary/20 bg-muted/30 shadow-2xl backdrop-blur-sm">
            <CardHeader className="bg-primary/10 border-b border-primary/10 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    Vision Lab Audit Complete
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Preview */}
                    <div className="relative group overflow-hidden bg-black/40 flex items-center justify-center min-h-[200px]">
                        <img
                            src={imageUrl}
                            alt="Analyzed content"
                            className="max-h-[300px] w-full object-contain transition-all duration-700 group-hover:scale-110"
                            style={{
                                filter: `brightness(${aesthetic_audit.brightness}) contrast(${aesthetic_audit.contrast}) saturate(${aesthetic_audit.saturation})`
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-[10px]">
                                {analysis.detected_context}
                            </Badge>
                            <Badge variant="secondary" className="bg-primary/60 backdrop-blur-md border-white/10 text-[10px]">
                                {analysis.suggested_tone} Tone
                            </Badge>
                        </div>
                    </div>

                    {/* Audit Details */}
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Camera className="h-3 w-3" />
                                Vibe Analysis
                            </h4>
                            <p className="text-sm font-medium italic text-foreground">
                                "{analysis.vibe_description}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Sliders className="h-3 w-3" />
                                Aesthetic Audit
                            </h4>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] items-center">
                                    <span className="text-muted-foreground">Professional Clarity</span>
                                    <span className="font-bold text-primary">{aesthetic_audit.clarity_score}%</span>
                                </div>
                                <Progress value={aesthetic_audit.clarity_score} className="h-1 bg-black/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                                <div className="flex justify-between border-b border-border/50 pb-1">
                                    <span className="text-muted-foreground">Brightness</span>
                                    <span className="font-mono">{aesthetic_audit.brightness.toFixed(1)}x</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-1">
                                    <span className="text-muted-foreground">Contrast</span>
                                    <span className="font-mono">{aesthetic_audit.contrast.toFixed(1)}x</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-1">
                                    <span className="text-muted-foreground">Temperature</span>
                                    <span className="font-mono capitalize">{aesthetic_audit.temperature}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/50 pb-1">
                                    <span className="text-muted-foreground">Saturation</span>
                                    <span className="font-mono">{aesthetic_audit.saturation.toFixed(1)}x</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                            <h5 className="text-[10px] font-bold text-primary flex items-center gap-1.5 mb-1 text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                PRO-TIP FOR HIGH ENGAGEMENT
                            </h5>
                            <p className="text-[11px] text-foreground font-medium leading-relaxed">
                                {aesthetic_audit.pro_tip}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
