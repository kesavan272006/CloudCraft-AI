import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      const result = await signInWithPopup(firebaseAuth, provider)
      const firebaseUser = result.user

      const userData = {
        accountNo: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar: firebaseUser.photoURL || '',
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }

      const token = await firebaseUser.getIdToken()

      useAuthStore.setState((state) => ({
        ...state,
        auth: {
          ...state.auth,
          user: userData,
          accessToken: token,
        }
      }))

      toast.success(`Welcome back, ${userData.name}!`, {
        description: "CloudCraft Engine online.",
        className: "bg-[#09090b] text-white border-white/10"
      })

      const targetPath = redirectTo || '/dashboard'
      navigate({ to: targetPath, replace: true })

    } catch (error: any) {
      console.error("Auth Error:", error)
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.error('Session initialization cancelled', { className: "bg-[#09090b] text-white border-white/10" })
      } else {
        toast.error(error.message || 'Failed to authenticate securely', { className: "bg-[#09090b] text-white border-white/10" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Button
        variant='outline'
        type='button'
        disabled={isLoading}
        onClick={handleGoogleSignIn}
        className="w-full h-16 text-lg bg-black text-white border border-white/20 hover:bg-white hover:text-black transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-2xl group relative overflow-hidden"
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-50 group-hover:opacity-0 transition-opacity" />
        {isLoading ? (
          <Loader2 className='mr-3 h-6 w-6 animate-spin text-indigo-400' />
        ) : (
          <svg className="mr-3 h-6 w-6 text-white group-hover:text-black transition-colors" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )}
        <span className="font-semibold tracking-tight">Sync via Google Workspace</span>
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-white/10' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-[#09090b] px-4 font-mono tracking-widest text-[#a1a1aa] drop-shadow-[0_0_5px_rgba(0,0,0,1)]'>
            Secure Enclave
          </span>
        </div>
      </div>
    </div>
  )
}