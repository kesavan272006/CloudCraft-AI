import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CloudCraft AI
          </h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild><Link to="/sign-in">Sign In</Link></Button>
            <Button asChild><Link to="/sign-in">Get Started</Link></Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Content for Bharat
        </h2>
        <p className="text-xl text-gray-700 mb-12">Forge viral posts with intelligent agents.</p>
        <Button size="lg" asChild><Link to="/sign-in">Start Creating Free</Link></Button>
      </main>
    </div>
  )
}