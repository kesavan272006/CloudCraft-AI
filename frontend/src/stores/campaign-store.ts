import { create } from 'zustand'
import { API_BASE_URL } from '@/lib/api-config'

interface AudienceSegment {
    segment_name: string
    pain_point: string
}

export interface CampaignStrategy {
    core_concept: string
    target_audience: AudienceSegment[]
    usps: string[]
    tone: string
    tagline: string
    visual_direction: string
    market_insight?: string
}

export interface Campaign {
    id: string
    name: string
    goal: string
    duration: string
    budget: string
    status: 'draft' | 'active' | 'completed'
    strategy?: CampaignStrategy
    created_at: string
}

export interface ComprehendData {
    sentiment: string
    market_confidence: number
    key_phrases: string[]
    entities: { text: string; type: string; score: number }[]
    competitor_names: string[]
}

export interface CampaignDelta {
    is_first_run: boolean
    similar_count: number
    market_trend: 'RISING' | 'FALLING' | 'STABLE' | 'BASELINE'
    new_competitors: string[]
    recurring_competitors: string[]
    avg_past_confidence: number | null
}

export interface LogLine {
    id: number
    step: string
    message: string
    type: 'info' | 'success' | 'warning' | 'fire' | 'aws'
    ts: string
}

export type PipelineStep = 'RECON' | 'COMPREHEND' | 'SYNTHESIS' | 'MEMORY'
export type StepStatus = 'pending' | 'running' | 'done' | 'error'

export interface StepState {
    status: StepStatus
    startedAt?: number
    elapsed?: number
    meta?: string
}

interface CampaignState {
    campaigns: Campaign[]
    activeCampaign: Campaign | null
    isFetching: boolean
    isSaving: boolean
    isGenerating: boolean
    error: string | null

    // Intelligence pipeline state
    pipelineRunning: boolean
    pipelineComplete: boolean
    steps: Record<PipelineStep, StepState>
    activeStep: PipelineStep | null
    logLines: LogLine[]
    comprehendData: ComprehendData | null
    delta: CampaignDelta | null
    opportunityAlert: boolean
    runId: string
    runElapsed: number
    radarScanning: boolean
    radarResult: any | null
    radarLogs: { ts: string; text: string }[]
    intelligencePayload: any | null

    fetchCampaigns: () => Promise<void>
    createCampaign: (data: { name: string; goal: string; duration: string; budget: string }) => Promise<void>
    generateStrategy: (campaignId: string) => Promise<void>
    streamIntelligence: (campaignId: string) => void
    runRadarScan: (campaignId: string) => Promise<void>
    setActiveCampaign: (campaign: Campaign | null) => void
    resetPipeline: () => void
    injectIntelligence: (payload: any) => void
}

const API_BASE = `${API_BASE_URL}/api/v1/campaigns`
let logIdCounter = 0

const PIPELINE_STEPS: PipelineStep[] = ['RECON', 'COMPREHEND', 'SYNTHESIS', 'MEMORY']

function emptySteps(): Record<PipelineStep, StepState> {
    return Object.fromEntries(
        PIPELINE_STEPS.map(s => [s, { status: 'pending' } as StepState])
    ) as Record<PipelineStep, StepState>
}

export const useCampaignStore = create<CampaignState>()((set, get) => ({
    campaigns: [],
    activeCampaign: null,
    isFetching: false,
    isSaving: false,
    isGenerating: false,
    error: null,

    pipelineRunning: false,
    pipelineComplete: false,
    steps: emptySteps(),
    activeStep: null,
    logLines: [],
    comprehendData: null,
    delta: null,
    opportunityAlert: false,
    runId: '',
    runElapsed: 0,
    radarScanning: false,
    radarResult: null,
    radarLogs: [] as { ts: string; text: string }[],
    intelligencePayload: null,

    fetchCampaigns: async () => {
        set({ isFetching: true, error: null })
        try {
            const res = await fetch(API_BASE)
            if (!res.ok) throw new Error('Failed to fetch campaigns')
            set({ campaigns: await res.json(), isFetching: false })
        } catch (err: any) {
            set({ error: err.message, isFetching: false })
        }
    },

    createCampaign: async (payload) => {
        set({ isSaving: true, error: null })
        try {
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Failed to create campaign')
            const newCampaign = await res.json()
            set(state => ({
                campaigns: [...state.campaigns, newCampaign],
                activeCampaign: newCampaign,
                isSaving: false,
            }))
        } catch (err: any) {
            set({ error: err.message, isSaving: false })
        }
    },

    generateStrategy: async (campaignId) => {
        set({ isGenerating: true, error: null })
        try {
            const res = await fetch(`${API_BASE}/${campaignId}/generate-strategy`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to generate strategy')
            const updatedCampaign = await res.json()
            set(state => ({
                campaigns: state.campaigns.map(c => c.id === campaignId ? updatedCampaign : c),
                activeCampaign: updatedCampaign,
                isGenerating: false,
            }))
        } catch (err: any) {
            set({ error: err.message, isGenerating: false })
        }
    },

    runRadarScan: async (campaignId) => {
        set({ radarScanning: true, error: null, radarLogs: [] })

        const mockLogs = [
            { ts: "0.0s", text: "Initializing autonomous watchdog override..." },
            { ts: "0.8s", text: "Deploying Tavily deep-search market agents..." },
            { ts: "1.2s", text: "Intercepting recent competitor press & signals..." },
            { ts: "2.5s", text: "Piping unstructured web data to AWS Comprehend..." },
            { ts: "3.1s", text: "Extracting ORGANIZATION entities and sentiment shifts..." },
            { ts: "3.9s", text: "Comparing deltas against DynamoDB historical baseline..." },
        ]

        let logIndex = 0;
        const logTimer = setInterval(() => {
            if (logIndex < mockLogs.length) {
                set(state => ({ radarLogs: [...state.radarLogs, mockLogs[logIndex]] }))
                logIndex++;
            }
        }, 600)

        try {
            const res = await fetch(`${API_BASE}/${campaignId}/rival-radar/scan`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to run Rival Radar scan')
            const data = await res.json()

            clearInterval(logTimer)
            // ensure all mock logs are shown before showing final result
            set(_state => ({
                radarResult: data,
                radarScanning: false,
                radarLogs: [
                    ...mockLogs,
                    { ts: "done", text: "Pipeline complete. Matrix payload ready." }
                ]
            }))
        } catch (err: any) {
            clearInterval(logTimer)
            set({ error: err.message, radarScanning: false })
        }
    },

    resetPipeline: () => {
        set({
            pipelineRunning: false,
            pipelineComplete: false,
            steps: emptySteps(),
            activeStep: null,
            logLines: [],
            comprehendData: null,
            delta: null,
            opportunityAlert: false,
            runId: '',
            runElapsed: 0,
            radarResult: null,
            radarLogs: []
        })
    },

    streamIntelligence: (campaignId: string) => {
        get().resetPipeline()
        set({ pipelineRunning: true, isGenerating: true })

        const startTime = Date.now()
        const timer = setInterval(() => {
            set({ runElapsed: Math.floor((Date.now() - startTime) / 1000) })
        }, 1000)

        const addLog = (step: string, message: string, type: LogLine['type'] = 'info') => {
            set(state => ({
                logLines: [...state.logLines.slice(-100), {
                    id: ++logIdCounter, step, message, type,
                    ts: new Date().toLocaleTimeString('en-IN', { hour12: false }),
                }]
            }))
        }

        const markRunning = (step: PipelineStep) => {
            set(state => ({
                activeStep: step,
                steps: {
                    ...state.steps,
                    [step]: { status: 'running', startedAt: Date.now() }
                }
            }))
        }

        const markDone = (step: PipelineStep, meta?: string) => {
            set(state => {
                const s = state.steps[step]
                const elapsed = s.startedAt
                    ? parseFloat(((Date.now() - s.startedAt) / 1000).toFixed(1))
                    : undefined
                return {
                    activeStep: null,
                    steps: { ...state.steps, [step]: { status: 'done', elapsed, meta } }
                }
            })
        }

        const url = `${API_BASE}/${campaignId}/intelligence-stream`
        const es = new EventSource(url)

        es.onmessage = (e) => {
            try {
                const { event, data } = JSON.parse(e.data)

                if (event === 'pipeline_start') {
                    addLog('SYSTEM', `Intelligence pipeline started for "${data.campaign_name}"`)
                }
                else if (event === 'step_start') {
                    markRunning(data.step as PipelineStep)
                    addLog(data.step, data.message)
                }
                else if (event === 'step_complete') {
                    markDone(data.step as PipelineStep, data.meta)
                    addLog(data.step, data.message, 'success')
                }
                else if (event === 'recon_query') {
                    addLog('RECON', data.message)
                }
                else if (event === 'recon_hit') {
                    addLog('RECON', data.message, data.hits > 0 ? 'success' : 'info')
                }
                else if (event === 'aws_call') {
                    addLog(data.service?.toUpperCase() || 'AWS', data.message, 'aws')
                }
                else if (event === 'comprehend_result') {
                    set({
                        comprehendData: {
                            sentiment: data.sentiment,
                            market_confidence: data.market_confidence,
                            key_phrases: data.key_phrases || [],
                            entities: data.entities || [],
                            competitor_names: data.competitor_names || [],
                        }
                    })
                    addLog('COMPREHEND', data.message, 'success')
                }
                else if (event === 'synthesis_result' || event === 'synthesis_fallback') {
                    addLog('SYNTHESIS', data.message, event === 'synthesis_result' ? 'success' : 'warning')
                }
                else if (event === 'memory_update') {
                    set({ delta: data.delta, runId: data.run_id || '' })
                    addLog('MEMORY', data.message, 'success')
                }
                else if (event === 'opportunity_alert') {
                    if (data.fired) set({ opportunityAlert: true })
                    addLog('SNS', data.message, data.fired ? 'fire' : 'info')
                }
                else if (event === 'intelligence_complete') {
                    // Update campaign strategy in local store
                    if (data.strategy) {
                        set(state => {
                            const updatedCampaign = state.activeCampaign
                                ? { ...state.activeCampaign, strategy: data.strategy, status: 'active' as const }
                                : state.activeCampaign
                            return {
                                activeCampaign: updatedCampaign,
                                campaigns: state.campaigns.map(c =>
                                    c.id === campaignId ? { ...c, strategy: data.strategy, status: 'active' as const } : c
                                ),
                            }
                        })
                    }
                    if (data.comprehend_data) set({ comprehendData: data.comprehend_data })
                    if (data.delta) set({ delta: data.delta })
                    if (data.opportunity_alert) set({ opportunityAlert: true })
                    if (data.run_id) set({ runId: data.run_id })

                    addLog('SYSTEM', 'Intelligence pipeline complete. All 4 steps executed.', 'success')
                    clearInterval(timer)
                    es.close()
                    set({ pipelineRunning: false, pipelineComplete: true, isGenerating: false })
                }
            } catch { /* ignore parse errors */ }
        }

        es.onerror = () => {
            addLog('SYSTEM', 'Stream connection error', 'warning')
            clearInterval(timer)
            es.close()
            set({ pipelineRunning: false, isGenerating: false })
        }
    },

    setActiveCampaign: (campaign) => {
        get().resetPipeline()
        set({ activeCampaign: campaign })
    },

    injectIntelligence: (payload) => {
        set({ intelligencePayload: payload })
    }
}))
