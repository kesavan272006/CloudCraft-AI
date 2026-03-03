import React from 'react';
import { cn } from "@/lib/utils";
import { STATES, INDIA_OUTLINE, VIEW_BOX } from './statesData';

interface IndiaMapProps {
    activeState: string | null;
    onSelectState: (stateName: string) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ activeState, onSelectState }) => {
    return (
        <div className="relative w-full h-[550px] flex items-center justify-center p-4">
            {/* 3D Perspective Wrapper */}
            <div
                className="relative w-full h-full transition-all duration-1000 ease-out preserve-3d"
                style={{
                    transform: "perspective(1200px) rotateX(25deg) rotateY(-8deg)",
                    transformStyle: 'preserve-3d'
                }}
            >
                <svg
                    viewBox={VIEW_BOX}
                    className="w-full h-full drop-shadow-[0_50px_50px_rgba(0,0,0,0.6)]"
                    style={{ overflow: 'visible' }}
                >
                    {/* Floating Base Blur - Silhouette context */}
                    <path
                        d={INDIA_OUTLINE}
                        fill="rgba(79, 70, 229, 0.08)"
                        className="animate-pulse"
                        style={{ transform: 'translateZ(-60px)', filter: 'blur(35px)' }}
                    />

                    {/* Main Landmass Shadow Layer */}
                    <path
                        d={INDIA_OUTLINE}
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="rgba(99, 102, 241, 0.3)"
                        strokeWidth="12"
                        style={{ transform: 'translateZ(-25px)' }}
                    />

                    {/* Main Landmass Surface (The Base Plate) */}
                    <path
                        d={INDIA_OUTLINE}
                        fill="rgba(30, 41, 59, 1)"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1.5"
                    />

                    {/* Individual States with 3D Elevation */}
                    {STATES.map((state) => (
                        <g
                            key={state.id}
                            className="group cursor-pointer"
                        >
                            {/* State Shadow Depth */}
                            <path
                                d={state.path}
                                fill="black"
                                opacity="0.6"
                                className="transition-all duration-500"
                                style={{ transform: activeState === state.name ? 'translateZ(-15px) scale(1.08)' : 'translateZ(-8px)' }}
                            />

                            {/* State Body - High Precision Vector */}
                            <path
                                d={state.path}
                                className={cn(
                                    "transition-all duration-500 ease-out outline-none",
                                    activeState === state.name
                                        ? "fill-indigo-500 stroke-white/40 stroke-[1.5] filter drop-shadow-[0_0_25px_rgba(99,102,241,0.9)]"
                                        : "fill-slate-800/95 stroke-white/10 hover:fill-indigo-600/40 hover:stroke-indigo-400/50"
                                )}
                                style={{
                                    transform: activeState === state.name ? 'translateZ(45px) scale(1.08)' : 'translateZ(10px)',
                                    transformOrigin: 'center'
                                }}
                                onClick={() => onSelectState(state.name)}
                            />

                            {/* Geographical Data Label - Anchored to Bounding Box Center */}
                            <text
                                x={state.centroid.x}
                                y={state.centroid.y}
                                className={cn(
                                    "text-[7px] pointer-events-none transition-all duration-500 font-bold tracking-tighter",
                                    activeState === state.name ? "fill-white opacity-100 scale-150" : "fill-slate-500/50 opacity-0 group-hover:opacity-100"
                                )}
                                style={{
                                    transform: activeState === state.name ? 'translateZ(60px)' : 'translateZ(15px)',
                                    textShadow: activeState === state.name ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'
                                }}
                                textAnchor="middle"
                            >
                                {state.id}
                            </text>

                            {/* Pulsing Beacon for Active Location */}
                            {activeState === state.name && (
                                <g style={{ transform: 'translateZ(65px)' }}>
                                    <circle
                                        cx={state.centroid.x}
                                        cy={state.centroid.y}
                                        r="3"
                                        className="fill-white animate-ping"
                                    />
                                    <circle
                                        cx={state.centroid.x}
                                        cy={state.centroid.y}
                                        r="1.5"
                                        className="fill-indigo-200"
                                    />
                                </g>
                            )}
                        </g>
                    ))}

                    {/* Cyberpunk Map Grid Overlay */}
                    <g opacity="0.03" style={{ transform: 'translateZ(-15px)' }}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="800" stroke="white" strokeWidth="0.5" />
                        ))}
                        {Array.from({ length: 20 }).map((_, i) => (
                            <line key={`h-${i}`} x1="0" y1={i * 45} x2="700" y2={i * 45} stroke="white" strokeWidth="0.5" />
                        ))}
                    </g>
                </svg>

                {/* Floating Telemetry HUD */}
                {activeState && (
                    <div
                        className="absolute top-4 left-4 p-4 bg-slate-900/60 backdrop-blur-2xl border-l-4 border-indigo-500 rounded-lg shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500"
                        style={{ transform: 'translateZ(100px)' }}
                    >
                        <p className="text-[9px] uppercase tracking-widest text-indigo-400 font-black mb-0.5">Territory Locked</p>
                        <p className="text-lg font-black text-white uppercase leading-none">{activeState}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                            </div>
                            <span className="text-[8px] font-mono text-indigo-300">SYNCED</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Geo-Coordinate Telemetry Overlay */}
            <div className="absolute top-8 right-8 flex flex-col gap-4">
                <div className="p-3 border border-white/5 rounded-lg bg-black/40 backdrop-blur-md text-[10px] font-mono text-indigo-400 shadow-xl border-r-indigo-500/50">
                    <span className="opacity-50 tracking-tighter">SURVEY_UNIT:</span> CC-AI-01<br />
                    <span className="opacity-50 tracking-tighter">PRECISION:</span> GEOGRAPHIC_HD<br />
                    <span className="opacity-50 tracking-tighter">COORD_GRID:</span> 20.59°N / 78.96°E
                </div>
            </div>
        </div>
    );
};
