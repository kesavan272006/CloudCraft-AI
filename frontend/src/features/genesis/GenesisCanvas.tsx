
import { useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Search, Globe, Loader2, Building2, Palmtree, Laptop, Briefcase } from "lucide-react";
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

interface GenesisCanvasProps {
    initialInput?: string;
    autoStart?: boolean;
}

export const GenesisCanvas = ({ initialInput, autoStart }: GenesisCanvasProps) => {
    const { brandName, brandDescription, brandVoice, targetAudience } = useBrandStore();
    const [inputSource, setInputSource] = useState(initialInput || "");
    const [processId, setProcessId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    // Auto-start effect
    useEffect(() => {
        if (autoStart && initialInput && !processId && !isStarting) {
            handleStart();
        }
    }, [autoStart, initialInput]);

    // Sync input prop
    useEffect(() => {
        if (initialInput) setInputSource(initialInput);
    }, [initialInput]);

    const hasBrandProfile = brandName || brandDescription;

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Polling for updates
    const { data: graphData, refetch } = useQuery({
        queryKey: ['genesis-graph', processId],
        queryFn: async () => {
            if (!processId) return null;
            const res = await axios.get(`${API_URL}/${processId}`);
            return res.data as any;
        },
        enabled: !!processId,
        refetchInterval: (query) => {
            return query.state.data?.status === 'complete' ? false : 2000; // Poll every 2s until complete
        }
    });

    // Sync Graph Data to React Flow
    useEffect(() => {
        if (graphData) {
            // Basic diffing to avoid re-renders impacting drag - simplified for MVP
            // In prod, use deeper diff or custom hooks provided by ReactFlow
            // For now, we just overwrite nodes if count changes or status changes
            setNodes(() => {
                const newNodes = graphData.nodes.map((n: any) => ({
                    ...n,
                    type: n.type === 'root' ? 'source' : (n.type === 'strategy' ? 'strategy' : 'asset')
                }));
                return newNodes;
            });

            setEdges(graphData.edges);

            if (graphData.status === 'complete') {
                toast.success("Campaign Generation Complete!");
            }
        }
    }, [graphData, setNodes, setEdges]);

    const handleStart = async () => {
        if (!inputSource || isStarting) return;
        setIsStarting(true);
        try {
            // Inject brand context if available
            let enrichedInput = inputSource;
            if (hasBrandProfile) {
                enrichedInput += `\n\n--- BRAND CONTEXT ---\nBrand: ${brandName}\nDescription: ${brandDescription}\nVoice: ${brandVoice}\nTarget Audience: ${targetAudience}`;
            }

            const res = await axios.post(`${API_URL}/start`, { input_source: enrichedInput });
            setProcessId(res.data.process_id);
            toast.success(hasBrandProfile ? `Genesis Started for ${brandName}` : "Genesis Engine Started");
        } catch (e: any) {
            console.error(e);
            toast.error(`Failed to start Genesis: ${e.response?.data?.detail || e.message}`);
        } finally {
            setIsStarting(false);
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
                        <Zap className="h-3 w-3" /> Active Identity: {brandName}
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
                <Button size="lg" className="h-12 shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" onClick={handleStart} disabled={isStarting || !inputSource}>
                    {isStarting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />} {isStarting ? "IGNITING..." : "IGNITE GENESIS"}
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
                    minZoom={0.1}
                    maxZoom={4}
                    className="bg-slate-50 dark:bg-zinc-950"
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>


        </div>
    );
};
