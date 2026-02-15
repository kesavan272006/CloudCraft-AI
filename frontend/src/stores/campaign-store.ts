import { create } from 'zustand'

interface AudienceSegment {
    segment_name: string
    pain_point: string
}

interface CampaignStrategy {
    core_concept: string
    target_audience: AudienceSegment[]
    usps: string[]
    tone: string
    tagline: string
    visual_direction: string
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

interface CampaignState {
    campaigns: Campaign[]
    activeCampaign: Campaign | null
    isFetching: boolean
    isSaving: boolean
    isGenerating: boolean
    error: string | null

    fetchCampaigns: () => Promise<void>
    createCampaign: (data: { name: string, goal: string, duration: string, budget: string }) => Promise<void>
    generateStrategy: (campaignId: string) => Promise<void>
    setActiveCampaign: (campaign: Campaign | null) => void
}

const API_BASE = 'http://localhost:8000/api/v1/campaigns'

export const useCampaignStore = create<CampaignState>()(
    // Persist active campaign selection locally if needed, but strict API sync is better for lists
    // We'll skip persist for now to rely on fresh API data
    (set) => ({
        campaigns: [],
        activeCampaign: null,
        isFetching: false,
        isSaving: false,
        isGenerating: false,
        error: null,

        fetchCampaigns: async () => {
            set({ isFetching: true, error: null })
            try {
                const res = await fetch(API_BASE)
                if (!res.ok) throw new Error("Failed to fetch campaigns")
                const data = await res.json()
                set({ campaigns: data, isFetching: false })
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
                    body: JSON.stringify(payload)
                })
                if (!res.ok) throw new Error("Failed to create campaign")
                const newCampaign = await res.json()
                set((state) => ({
                    campaigns: [...state.campaigns, newCampaign],
                    activeCampaign: newCampaign,
                    isSaving: false
                }))
            } catch (err: any) {
                set({ error: err.message, isSaving: false })
            }
        },

        generateStrategy: async (campaignId) => {
            set({ isGenerating: true, error: null })
            try {
                const res = await fetch(`${API_BASE}/${campaignId}/generate-strategy`, {
                    method: 'POST'
                })
                if (!res.ok) throw new Error("Failed to generate strategy")
                const updatedCampaign = await res.json()

                set((state) => ({
                    campaigns: state.campaigns.map(c => c.id === campaignId ? updatedCampaign : c),
                    activeCampaign: updatedCampaign,
                    isGenerating: false
                }))
            } catch (err: any) {
                set({ error: err.message, isGenerating: false })
            }
        },

        setActiveCampaign: (campaign) => set({ activeCampaign: campaign })
    })
)
