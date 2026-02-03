import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BrandProfile {
    brandName: string
    brandDescription: string
    brandVoice: string
    targetAudience: string
}

interface BrandState extends BrandProfile {
    isLoading: boolean
    error: string | null

    // Actions
    setBrandProfile: (profile: Partial<BrandProfile>) => void
    fetchBrandProfile: () => Promise<void>
    saveBrandProfile: (profile: BrandProfile) => Promise<void>
    reset: () => void
    hasProfile: () => boolean
}

const defaultProfile: BrandProfile = {
    brandName: '',
    brandDescription: '',
    brandVoice: '',
    targetAudience: ''
}

export const useBrandStore = create<BrandState>()(
    persist(
        (set, get) => ({
            ...defaultProfile,
            isLoading: false,
            error: null,

            setBrandProfile: (profile) =>
                set((state) => ({ ...state, ...profile })),

            fetchBrandProfile: async () => {
                set({ isLoading: true, error: null })
                try {
                    const response = await fetch('http://localhost:8000/api/v1/brand')
                    if (response.ok) {
                        const data: BrandProfile = await response.json()
                        set({ ...data, isLoading: false })
                    } else {
                        // If 404, just stop loading
                        set({ isLoading: false })
                    }
                } catch (err: any) {
                    set({ isLoading: false, error: err.message })
                }
            },

            saveBrandProfile: async (profile: BrandProfile) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await fetch('http://localhost:8000/api/v1/brand', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(profile)
                    })

                    if (!response.ok) throw new Error("Failed to save brand profile")

                    const savedData = await response.json()
                    set({ ...savedData, isLoading: false })
                } catch (err: any) {
                    set({ isLoading: false, error: err.message })
                    throw err
                }
            },

            reset: () => set({ ...defaultProfile }),

            hasProfile: () => {
                const state = get()
                return !!(state.brandName || state.brandDescription)
            }
        }),
        {
            name: 'cloudcraft-brand-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                brandName: state.brandName,
                brandDescription: state.brandDescription,
                brandVoice: state.brandVoice,
                targetAudience: state.targetAudience
            })
        }
    )
)
