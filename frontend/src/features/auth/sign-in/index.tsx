import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <Card className='gap-4 bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-2xl relative z-10 w-full overflow-hidden text-white rounded-3xl p-4'>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-fuchsia-500" />

          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className='text-3xl font-bold tracking-tighter'>Initialize Session</CardTitle>
            <CardDescription className="text-zinc-400 font-light text-base">
              Authenticate to deploy the <br />
              <span className="text-indigo-400 font-mono text-sm mt-1 block">CloudCraft Architecture</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            <UserAuthForm redirectTo={redirect} />
          </CardContent>

          <CardFooter className="pt-4 border-t border-white/5 mx-6">
            <p className='text-center text-xs text-zinc-500 leading-relaxed font-light'>
              By proceeding, you unlock the autonomous engine and agree to our{' '}
              <a href='/terms' className='underline underline-offset-4 hover:text-white transition-colors'>Terms</a>
              {' '}and{' '}
              <a href='/privacy' className='underline underline-offset-4 hover:text-white transition-colors'>Privacy Protocols</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AuthLayout>
  )
}
