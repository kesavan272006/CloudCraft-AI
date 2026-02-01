import { useNavigate } from '@tanstack/react-router'
import { signOut } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      // 1. Tell Firebase to end the session
      await signOut(firebaseAuth)
      
      // 2. THE FIX: Don't call .reset(). Manually set the state to empty.
      // This bypasses the "is not a function" error entirely.
      useAuthStore.setState((state) => ({
        ...state,
        auth: {
          ...state.auth,
          user: null,
          accessToken: '',
        }
      }))
      
      // 3. UI Cleanup
      onOpenChange(false)
      
      // 4. Move to Landing Page
      await navigate({ to: '/', replace: true })
      
      toast.success('Logged out successfully')

      // 5. Hard refresh to kill any remaining ghost state in memory
      window.location.reload()
      
    } catch (error: any) {
      console.error('Logout Error:', error)
      toast.error('Failed to log out.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ready to leave?</AlertDialogTitle>
          <AlertDialogDescription>
            Logging out will end your current session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay</AlertDialogCancel>
          <AlertDialogAction 
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            onClick={handleSignOut}
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}