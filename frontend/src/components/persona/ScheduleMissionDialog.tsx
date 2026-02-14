import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, Rocket, CheckCircle2, Loader2, Link } from "lucide-react"
import { format } from "date-fns"

interface ScheduleMissionDialogProps {
    isOpen: boolean
    onClose: () => void
    content: string
    platform: string
    personaName?: string
    onExecute: (data: { scheduled_at: string, webhook_url: string }) => Promise<void>
}

export function ScheduleMissionDialog({
    isOpen,
    onClose,
    content,
    platform,
    personaName,
    onExecute
}: ScheduleMissionDialogProps) {
    const [scheduledAt, setScheduledAt] = useState(format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm")) // Default 1 hour from now
    const [webhookUrl, setWebhookUrl] = useState("https://hook.eu1.make.com/h3h6kfi4dkvrixws6vuy3br784ryo4b9")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleExecute = async () => {
        setLoading(true)
        try {
            await onExecute({
                scheduled_at: new Date(scheduledAt).toISOString(),
                webhook_url: webhookUrl
            })
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 3000)
        } catch (error) {
            console.error("Execution failed", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] border-2 border-primary/20 bg-background shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight">Execute Mission</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm font-medium text-muted-foreground">
                        Dispatch a specialized agent to audit and post this content autonomously.
                    </DialogDescription>
                </DialogHeader>

                {!success ? (
                    <div className="grid gap-6 py-4 relative z-10">
                        <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Post Preview</Label>
                            <p className="text-xs line-clamp-3 text-foreground/80 font-medium italic">"{content}"</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{platform}</span>
                                {personaName && <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{personaName}</span>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-xs font-bold flex items-center gap-2">
                                <CalendarDays className="h-3 w-3 text-primary" />
                                Trigger Time (Local)
                            </Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="webhook" className="text-xs font-bold flex items-center gap-2">
                                <Link className="h-3 w-3 text-primary" />
                                Execution Bridge (Webhook)
                            </Label>
                            <Input
                                id="webhook"
                                placeholder="https://hook.us1.make.com/..."
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="bg-background/50 font-mono text-[10px]"
                            />
                            <p className="text-[9px] text-muted-foreground">The Nexus Agent will use this bridge to securely bypass OAuth walls.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in zoom-in-95 duration-500">
                        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500/20">
                            <CheckCircle2 className="h-8 w-8 text-green-500 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-foreground">Mission Confirmed</h4>
                            <p className="text-sm text-muted-foreground">AWS EventBridge has accepted the schedule.</p>
                        </div>
                    </div>
                )}

                <DialogFooter className="relative z-10 border-t border-border/40 pt-4 mt-2">
                    {!success && (
                        <>
                            <Button variant="ghost" onClick={onClose} disabled={loading} className="font-bold">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExecute}
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 min-w-[140px]"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Orbiting...</>
                                ) : (
                                    <><Rocket className="h-4 w-4 mr-2" /> Launch Mission</>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
