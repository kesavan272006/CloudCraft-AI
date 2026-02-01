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

      // 1. Prepare user data
      const userData = {
        accountNo: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar: firebaseUser.photoURL || '',
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000, 
      }

      const token = await firebaseUser.getIdToken()

      // 2. THE FIX: Directly update the state without calling "setUser"
      // This uses the built-in setState which CANNOT be "not a function"
      useAuthStore.setState((state) => ({
        ...state,
        auth: {
          ...state.auth,
          user: userData,
          accessToken: token,
        }
      }))

      toast.success(`Welcome back, ${userData.name}!`)
      
      // 3. Navigate to dashboard
      const targetPath = redirectTo || '/dashboard'
      navigate({ to: targetPath, replace: true })
      
    } catch (error: any) {
      console.error("Auth Error:", error)
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled')
      } else {
        toast.error(error.message || 'Failed to sign in with Google')
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
        className="w-full py-6 text-lg border-2 hover:bg-accent hover:text-accent-foreground transition-all"
      >
        {isLoading ? (
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )}
        Continue with Google
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground text-[10px]'>
            CloudCraft AI Hackathon Secure Access
          </span>
        </div>
      </div>
    </div>
  )
}