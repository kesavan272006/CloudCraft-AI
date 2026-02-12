export interface ScheduledPost {
    id: string
    content: string
    platform: string
    scheduled_time: string
    status: 'scheduled' | 'posted' | 'draft'
    performance_score?: number
    persona_name?: string
}

export interface CalendarResponse {
    posts: ScheduledPost[]
    status: string
}
