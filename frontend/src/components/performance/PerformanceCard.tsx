import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PerformancePrediction } from "@/types/performance"
import { TrendingUp, Users, Smartphone, Zap, ThumbsUp, MessageCircle, Share2, Eye, Calendar, Award, AlertTriangle, CheckCircle2 } from "lucide-react"

interface PerformanceCardProps {
    prediction: PerformancePrediction
    platform?: string
    persona?: string
}

export function PerformanceCard({ prediction, platform = "General", persona = "General" }: PerformanceCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 60) return "text-yellow-500"
        return "text-red-500"
    }

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-green-500"
        if (score >= 60) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Score */}
                <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/20 shadow-lg relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${getProgressColor(prediction.overall_score)}`} />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Performance Score
                            <Award className={`h-4 w-4 ${getScoreColor(prediction.overall_score)}`} />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold ${getScoreColor(prediction.overall_score)}`}>
                                {prediction.overall_score}
                            </span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Confidence: <span className="font-medium text-foreground capitalize">{prediction.confidence}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Prediction Metrics */}
                <Card className="md:col-span-2 bg-gradient-to-br from-background to-muted/20 border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Projected Engagement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="space-y-1">
                                <ThumbsUp className="h-4 w-4 mx-auto text-blue-500" />
                                <div className="text-lg font-bold">{prediction.predicted_metrics.likes.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes</div>
                            </div>
                            <div className="space-y-1">
                                <Share2 className="h-4 w-4 mx-auto text-green-500" />
                                <div className="text-lg font-bold">{prediction.predicted_metrics.shares.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</div>
                            </div>
                            <div className="space-y-1">
                                <MessageCircle className="h-4 w-4 mx-auto text-purple-500" />
                                <div className="text-lg font-bold">{prediction.predicted_metrics.comments.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Comments</div>
                            </div>
                            <div className="space-y-1">
                                <Eye className="h-4 w-4 mx-auto text-orange-500" />
                                <div className="text-lg font-bold">{prediction.predicted_metrics.reach.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Reach</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detail Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breakdown */}
                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Score Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Engagement Potential</span>
                                <span className="font-bold">{prediction.engagement_potential}%</span>
                            </div>
                            <Progress value={prediction.engagement_potential} className="h-2" indicatorColor={getProgressColor(prediction.engagement_potential)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Platform Fit ({platform})</span>
                                <span className="font-bold">{prediction.platform_fit}%</span>
                            </div>
                            <Progress value={prediction.platform_fit} className="h-2" indicatorColor={getProgressColor(prediction.platform_fit)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Audience Alignment ({persona})</span>
                                <span className="font-bold">{prediction.audience_alignment}%</span>
                            </div>
                            <Progress value={prediction.audience_alignment} className="h-2" indicatorColor={getProgressColor(prediction.audience_alignment)} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Virality Potential</span>
                                <span className="font-bold">{prediction.virality_score}%</span>
                            </div>
                            <Progress value={prediction.virality_score} className="h-2" indicatorColor={getProgressColor(prediction.virality_score)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Insights */}
                <Card className="border-border/40 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Strategic Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                                <div className="text-xs text-muted-foreground uppercase">Best Platform</div>
                                <div className="font-bold text-sm flex items-center gap-1.5">
                                    <Smartphone className="h-3 w-3" />
                                    {prediction.best_platform}
                                </div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                                <div className="text-xs text-muted-foreground uppercase">Best Time</div>
                                <div className="font-bold text-sm flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    {prediction.best_posting_time}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xs font-bold text-green-600 mb-2 uppercase flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Strengths
                                </h4>
                                <ul className="space-y-1">
                                    {prediction.strengths.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <span className="mt-1 block h-1 w-1 rounded-full bg-green-500 flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-yellow-600 mb-2 uppercase flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Improvements
                                </h4>
                                <ul className="space-y-1">
                                    {prediction.improvements.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                            <span className="mt-1 block h-1 w-1 rounded-full bg-yellow-500 flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
