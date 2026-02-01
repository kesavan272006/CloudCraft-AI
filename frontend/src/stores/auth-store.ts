import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthUser {
  accountNo: string
  email: string
  name?: string
  avatar?: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    reset: () => void
  }
}

// Persist ONLY the serializable data (user + accessToken). Keep functions out of
// the persisted payload so they remain available after hydration.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        user: null,
        accessToken: '',
        setUser: (user) =>
          set((state) => ({ auth: { ...state.auth, user } })),
        setAccessToken: (accessToken) =>
          set((state) => ({ auth: { ...state.auth, accessToken } })),
        reset: () =>
          set(() => ({
            auth: {
              user: null,
              accessToken: '',
              setUser: () => {},
              setAccessToken: () => {},
              reset: () => {},
            },
          })),
      },
    }),
    {
      name: 'cloudcraft-auth-storage', // Key in LocalStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: { user: state.auth.user, accessToken: state.auth.accessToken },
      }),
    }
  )
)