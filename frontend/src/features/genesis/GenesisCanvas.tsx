
import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Search, TrendingUp, Globe, Loader2, Building2, Palmtree, Laptop, Briefcase } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { AssetNode } from './nodes/AssetNode';
import { useQuery } from '@tanstack/react-query';
import { useBrandStore } from '@/stores/brand-store';
import { Badge } from '@/components/ui/badge';

const nodeTypes = {
    strategy: AssetNode,
    asset: AssetNode,
    source: AssetNode
};

const API_URL = "http://localhost:8000/api/v1/genesis"; // Hardcoded for hackathon speed

export const GenesisCanvas = () => {
    const { brand } = useBrandStore();
    const [inputSource, setInputSource] = useState("");
    const [processId, setProcessId] = useState<string | null>(null);
    const [isTrending, setIsTrending] = useState(false);

    const hasBrandProfile = brand.brandName || brand.brandDescription;

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Polling for updates
    const { data: graphData, refetch } = useQuery({
        queryKey: ['genesis-graph', processId],
        queryFn: async () => {
            if (!processId) return null;
            const res = await axios.get(`${API_URL}/${processId}`);
            return res.data;
        },
        enabled: !!processId,
        refetchInterval: (data) => data?.status === 'complete' ? false : 2000 // Poll every 2s until complete
    });

    // Sync Graph Data to React Flow
    useEffect(() => {
        if (graphData) {
            // Basic diffing to avoid re-renders impacting drag - simplified for MVP
            // In prod, use deeper diff or custom hooks provided by ReactFlow
            // For now, we just overwrite nodes if count changes or status changes
            setNodes((nds) => {
                const newNodes = graphData.nodes.map((n: any) => ({
                    ...n,
                    type: n.type === 'root' ? 'source' : (n.type === 'strategy' ? 'strategy' : 'asset')
                }));
                return newNodes;
            });

            setEdges(graphData.edges);

            if (graphData.status === 'complete' && !isTrending) {
                toast.success("Campaign Generation Complete!");
            }
        }
    }, [graphData, setNodes, setEdges]);

    const handleStart = async () => {
        if (!inputSource) return;
        try {
            // Inject brand context if available
            let enrichedInput = inputSource;
            if (hasBrandProfile) {
                enrichedInput += `\n\n--- BRAND CONTEXT ---\nBrand: ${brand.brandName}\nDescription: ${brand.brandDescription}\nVoice: ${brand.brandVoice}\nTarget Audience: ${brand.targetAudience}`;
            }

            const res = await axios.post(`${API_URL}/start`, { input_source: enrichedInput });
            setProcessId(res.data.process_id);
            toast.success(hasBrandProfile ? `Genesis Started for ${brand.brandName}` : "Genesis Engine Started");
        } catch (e) {
            toast.error("Failed to start Genesis");
        }
    };

    const handleTrendJack = async () => {
        if (!processId) return;
        setIsTrending(true);
        try {
            await axios.post(`${API_URL}/trend-jack`, {
                process_id: processId,
                trend: "Barbie Movie Styling (Pink, Plastic, Fantastic)"
            });
            toast.info("Injecting Global Trend...");
            refetch(); // Force immediate update check
        } catch (e) {
            toast.error("Trend Jack failed");
        } finally {
            setIsTrending(false);
        }
    };

    const handleTune = async (dialect: string) => {
        if (!processId) return;
        try {
            toast.message(`Applying Cultural Layer: ${dialect}...`);
            await axios.post(`${API_URL}/tune`, {
                process_id: processId,
                dialect: dialect
            });
            refetch();
        } catch (e) {
            toast.error("Tuning failed");
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] w-full flex flex-col relative bg-slate-50 dark:bg-black">

            {/* Brand Identity Badge */}
            {hasBrandProfile && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                    <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary px-3 py-1 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Active Identity: {brand.brandName}
                    </Badge>
                </div>
            )}

            {/* Search Bar Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[600px] flex gap-2" style={{ marginTop: hasBrandProfile ? '2rem' : '0' }}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Paste URL, PDF link, or Product Description..."
                        className="pl-9 h-12 bg-background/80 backdrop-blur border-primary/20 shadow-xl"
                        value={inputSource}
                        onChange={(e) => setInputSource(e.target.value)}
                    />
                </div>
                <Button size="lg" className="h-12 shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" onClick={handleStart}>
                    <Zap className="mr-2 h-4 w-4" /> IGNITE GENESIS
                </Button>

                {processId && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 border-primary/20 bg-background/50 backdrop-blur">
                                <Globe className="mr-2 h-4 w-4" /> Tune Dialect
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleTune("Hinglish")}><Building2 className="h-4 w-4 mr-2" /> Hinglish (North)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTune("Tanglish")}><Palmtree className="h-4 w-4 mr-2" /> Tanglish (South)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTune("Bengaluru")}><Laptop className="h-4 w-4 mr-2" /> Bengaluru Tech</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTune("Corporate")}><Briefcase className="h-4 w-4 mr-2" /> Formal Corp</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Main Canvas */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-slate-50 dark:bg-zinc-950"
                >
                    <Background gap={20} color="#64748b" className="opacity-5" />
                    <Controls />
                    <MiniMap className="dark:bg-zinc-900 border-zinc-800" />
                </ReactFlow>
            </div>

            {/* Floating Trend Dock */}
            {processId && (
                <div className="absolute bottom-8 right-8 z-10">
                    <Card className="bg-background/80 backdrop-blur border-pink-500/30 overflow-hidden w-80 shadow-2xl">
                        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                        <CardContent className="p-4">
                            <h4 className="font-bold flex items-center gap-2 text-pink-600 mb-2">
                                <TrendingUp className="h-4 w-4" /> Live Trends
                            </h4>
                            <p className="text-xs text-muted-foreground mb-4">
                                Detected: "Barbie" is trending globally. Match this campaign?
                            </p>
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                onClick={handleTrendJack}
                                disabled={isTrending}
                            >
                                {isTrending ? <Loader2 className="animate-spin h-4 w-4" /> : "Inject Trend 'Barbie'"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
