import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Rocket,
  Trash2,
  Clock,
  TrendingUp,
  Users,
  Loader2,
  Send
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ScheduledPost } from '@/types/calendar'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: CampaignCalendarPage,
})

function CampaignCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  // Quick Schedule State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostPlatform, setNewPostPlatform] = useState('LinkedIn')
  const [isScheduling, setIsScheduling] = useState(false)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/calendar/')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      toast.error('Failed to load your content calendar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleQuickSchedule = async () => {
    if (!newPostContent.trim() || !selectedDate) {
      toast.error('Please enter content and ensure a date is selected')
      return
    }

    setIsScheduling(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          platform: newPostPlatform,
          scheduled_time: selectedDate.toISOString(),
          performance_score: 75, // Default for manual entries
        })
      })

      if (response.ok) {
        toast.success('Post scheduled successfully!')
        setIsDialogOpen(false)
        setNewPostContent('')
        fetchPosts() // Refresh the calendar
      } else {
        throw new Error('Failed to schedule')
      }
    } catch (error) {
      toast.error('Failed to schedule post')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post from the calendar?')) return

    try {
      const response = await fetch(`http://localhost:8000/api/v1/calendar/${postId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
        toast.success('Post removed from calendar')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaign Calendar</h1>
            <p className="text-muted-foreground italic">Your AI-optimized content pipeline</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border border-border/50">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-bold min-w-[150px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center font-bold text-muted-foreground uppercase text-xs tracking-widest pb-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    const rows: any[] = []
    let days: any[] = []

    calendarDays.forEach((day, _i) => {
      const dayPosts = posts.filter(post => isSameDay(parseISO(post.scheduled_time), day))

      days.push(
        <div
          key={day.toString()}
          className={`min-h-[140px] border border-border/40 p-2 transition-all group ${!isSameMonth(day, monthStart) ? 'bg-muted/10 opacity-40' : 'bg-background hover:bg-muted/5'
            } ${isSameDay(day, new Date()) ? 'bg-primary/5 ring-1 ring-primary/20 inset shadow-inner' : ''}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : 'text-muted-foreground'}`}>
              {format(day, 'd')}
            </span>
            {isSameMonth(day, monthStart) && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setSelectedDate(day)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
            {dayPosts.map(post => (
              <TooltipProvider key={post.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group/post relative p-1.5 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors pointer-events-auto">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/30 text-primary bg-primary/5">
                          {post.platform.split(' ')[0]}
                        </Badge>
                        {post.performance_score && (
                          <div className="flex items-center text-[9px] text-green-600 font-bold">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                            {post.performance_score}%
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] line-clamp-2 text-foreground/80 leading-tight">
                        {post.content}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                        className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover/post:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-2 h-2" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span className="text-foreground">{post.platform}</span>
                        <span className="text-primary-foreground font-black">{format(parseISO(post.scheduled_time), 'h:mm a')}</span>
                      </div>
                      <Separator className="bg-border/50" />
                      <p className="text-[11px] text-foreground/90 leading-relaxed">{post.content}</p>
                      {post.persona_name && (
                        <div className="text-[10px] text-foreground/70 font-bold flex items-center gap-1 mt-1">
                          <Users className="w-2.5 h-2.5" />
                          Targeting: {post.persona_name}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )

      if (days.length === 7) {
        rows.push(<div key={day.toString() + 'row'} className="grid grid-cols-7">{days}</div>)
        days = []
      }
    })

    return <div className="rounded-2xl border border-border/50 overflow-hidden shadow-2xl">{rows}</div>
  }

  return (
    <div className="flex-1 min-h-screen bg-background p-8 md:p-12 overflow-y-auto">
      {renderHeader()}

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Calendar */}
              <div className="lg:col-span-3">
                {renderDays()}
                {renderCells()}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      Plan Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your content is optimized for the <span className="text-primary font-bold">Bharat High-Engagement Cycle</span>.
                      Suggested posting windows are typically between <span className="text-foreground font-medium">9 AM - 11 AM</span> and <span className="text-foreground font-medium">7 PM - 9 PM IST</span>.
                    </p>
                    <Separator className="bg-primary/10" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Scheduled Posts</span>
                        <span className="font-bold">{posts.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Avg. Performance</span>
                        <span className="font-bold text-green-600">
                          {posts.length > 0 ? Math.round(posts.reduce((acc, p) => acc + (p.performance_score || 0), 0) / posts.length) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Upcoming Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {posts.filter(p => parseISO(p.scheduled_time) > new Date()).slice(0, 3).map(post => (
                        <div key={post.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                          <div className="w-10 h-10 flex flex-col items-center justify-center rounded-md bg-muted text-[10px] font-bold">
                            <span>{format(parseISO(post.scheduled_time), 'MMM')}</span>
                            <span className="text-primary">{format(parseISO(post.scheduled_time), 'd')}</span>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-medium truncate">{post.content}</p>
                            <p className="text-[9px] text-muted-foreground">{post.platform} • {format(parseISO(post.scheduled_time), 'h:mm a')}</p>
                          </div>
                        </div>
                      ))}
                      {posts.filter(p => parseISO(p.scheduled_time) > new Date()).length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic text-center py-4">No upcoming posts scheduled.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Schedule Content</DialogTitle>
            <DialogDescription>
              Schedule a manual post for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={newPostPlatform} onValueChange={setNewPostPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Twitter">Twitter (X)</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What would you like to post?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickSchedule} disabled={isScheduling}>
              {isScheduling ? 'Scheduling...' : 'Schedule to Pipeline'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full bg-border ${className}`} />
}
