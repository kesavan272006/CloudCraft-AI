
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Twitter, Linkedin, Mail, Instagram, Video, Loader2, Brain, Copy } from "lucide-react";

const icons = {
    twitter_thread: <Twitter className="h-4 w-4 text-blue-400" />,
    linkedin_post: <Linkedin className="h-4 w-4 text-blue-700" />,
    cmo_email: <Mail className="h-4 w-4 text-gray-500" />,
    insta_visual: <Instagram className="h-4 w-4 text-pink-500" />,
    tiktok_script: <Video className="h-4 w-4 text-black" />,
    strategy: <Brain className="h-4 w-4 text-primary" />
};

export const AssetNode = ({ data }: any) => {
    const isStrategy = data.type === 'strategy';

    return (
        <div className="min-w-[400px] max-w-[600px]">
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />

            <Card className={`border-2 shadow-2xl transition-all ${isStrategy ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        {icons[data.id as keyof typeof icons] || <span>📄</span>}
                        <CardTitle className="text-base font-bold">{data.label}</CardTitle>
                    </div>
                    {data.content === "Generating..." ? (
                        <Badge variant="outline" className="animate-pulse flex gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Generating
                        </Badge>
                    ) : (
                        <div className="flex gap-1 items-center">
                            {data.dialect && (
                                <Badge variant="outline" className="text-xs border-indigo-500 text-indigo-500">
                                    {data.dialect}
                                </Badge>
                            )}
                            <Badge variant={isStrategy ? "default" : "secondary"}>Ready</Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent drag interference
                                    navigator.clipboard.writeText(data.content);
                                    toast.success("Content copied to clipboard!");
                                }}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="text-sm text-foreground/90 font-medium whitespace-pre-wrap bg-background/50 p-3 rounded-md border shadow-inner">
                        {data.content}
                    </div>
                </CardContent>
            </Card>

            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
        </div>
    );
};
