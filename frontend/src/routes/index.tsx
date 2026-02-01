import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Brain, Hammer, Eye } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: IndexSwitcher,
})

function IndexSwitcher() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-2'>
          <Sparkles className='h-8 w-8 animate-pulse text-primary' />
          <p className='text-sm text-muted-foreground'>Initializing CloudCraft AI...</p>
        </div>
      </div>
    )
  }

  // Redirect if logged in
  if (user) {
    return <Navigate to='/dashboard' />
  }

  return <LandingPageUI />
}

function LandingPageUI() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Navbar aligned with Shadcn Header styles */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <Sparkles className='h-5 w-5' />
            </div>
            <span className='text-xl font-bold tracking-tight'>CloudCraft AI</span>
          </div>
          
          <nav className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' asChild>
              <Link to='/sign-in'>Sign In</Link>
            </Button>
            <Button size='sm' asChild>
              <Link to='/sign-in'>Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className='container mx-auto px-4'>
        {/* Hero Section */}
        <section className='flex flex-col items-center justify-center py-24 text-center md:py-32'>
          <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
            Content Intelligence for <br className='hidden md:block' />
            <span className='text-primary'>Creators in Bharat</span>
          </h1>
          <p className='mt-6 max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8'>
            Forge viral campaigns with intelligent agents that understand your brand voice, 
            target audience, and local trends. From research to final delivery.
          </p>
          <div className='mt-10 flex flex-col gap-4 sm:flex-row'>
            <Button size='lg' className='h-12 px-8' asChild>
              <Link to='/sign-in'>Start Creating Free</Link>
            </Button>
            <Button size='lg' variant='outline' className='h-12 px-8' asChild>
              <Link to='/sign-in'>View Demo</Link>
            </Button>
          </div>
        </section>

        {/* Features using Shadcn Cards */}
        <section className='grid gap-6 pb-20 md:grid-cols-3'>
          <FeatureCard 
            title="Brand Brain" 
            icon={<Brain className="h-6 w-6 text-primary" />}
            desc="RAG-powered intelligence that remembers your brand guidelines and voice forever." 
          />
          <FeatureCard 
            title="The Forge" 
            icon={<Hammer className="h-6 w-6 text-primary" />}
            desc="Multi-agent orchestration to generate posts, reels, and scripts in minutes." 
          />
          <FeatureCard 
            title="Vision Lab" 
            icon={<Eye className="h-6 w-6 text-primary" />}
            desc="Advanced scene analysis and visual suggestions using fine-tuned vision models." 
          />
        </section>
      </main>
    </div>
  )
}

function FeatureCard({ title, icon, desc }: { title: string, icon: React.ReactNode, desc: string }) {
  return (
    <Card className='relative overflow-hidden transition-all hover:border-primary/50'>
      <CardHeader>
        <div className='mb-2'>{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground leading-relaxed'>{desc}</p>
      </CardContent>
    </Card>
  )
}