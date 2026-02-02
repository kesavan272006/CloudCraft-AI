import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BrandProfile {
    brandName: string
    brandDescription: string
    brandVoice: string
    targetAudience: string
}

interface BrandState {
    brand: BrandProfile & {
        setBrandName: (name: string) => void
        setBrandDescription: (desc: string) => void
        setBrandVoice: (voice: string) => void
        setTargetAudience: (audience: string) => void
        setBrandProfile: (profile: Partial<BrandProfile>) => void
        reset: () => void
        hasProfile: () => boolean
    }
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
            brand: {
                ...defaultProfile,
                setBrandName: (brandName) =>
                    set((state) => ({ brand: { ...state.brand, brandName } })),
                setBrandDescription: (brandDescription) =>
                    set((state) => ({ brand: { ...state.brand, brandDescription } })),
                setBrandVoice: (brandVoice) =>
                    set((state) => ({ brand: { ...state.brand, brandVoice } })),
                setTargetAudience: (targetAudience) =>
                    set((state) => ({ brand: { ...state.brand, targetAudience } })),
                setBrandProfile: (profile) =>
                    set((state) => ({ brand: { ...state.brand, ...profile } })),
                reset: () =>
                    set(() => ({
                        brand: {
                            ...defaultProfile,
                            setBrandName: get().brand.setBrandName,
                            setBrandDescription: get().brand.setBrandDescription,
                            setBrandVoice: get().brand.setBrandVoice,
                            setTargetAudience: get().brand.setTargetAudience,
                            setBrandProfile: get().brand.setBrandProfile,
                            reset: get().brand.reset,
                            hasProfile: get().brand.hasProfile
                        }
                    })),
                hasProfile: () => {
                    const state = get()
                    return !!(state.brand.brandName || state.brand.brandDescription)
                }
            }
        }),
        {
            name: 'cloudcraft-brand-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                brand: {
                    brandName: state.brand.brandName,
                    brandDescription: state.brand.brandDescription,
                    brandVoice: state.brand.brandVoice,
                    targetAudience: state.brand.targetAudience
                }
            })
        }
    )
)
