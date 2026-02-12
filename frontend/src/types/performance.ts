export interface PredictedMetrics {
    likes: number
    shares: number
    comments: number
    reach: number
}

export interface PerformancePrediction {
    overall_score: number
    engagement_potential: number
    platform_fit: number
    audience_alignment: number
    virality_score: number
    predicted_metrics: PredictedMetrics
    best_platform: string
    best_posting_time: string
    strengths: string[]
    improvements: string[]
    confidence: string
}

export interface PerformanceRequest {
    content: string
    platform?: string
    persona?: string
}

export interface PerformanceResponse {
    content: string
    platform: string
    persona: string
    prediction: PerformancePrediction
    status: string
}
