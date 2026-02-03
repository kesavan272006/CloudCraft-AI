

import asyncio
import uuid
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta
import json
import re
from src.core.llm_factory import LLMFactory
from src.utils.logger import get_logger
from src.services.brand_service import BrandService
from src.agents.marketing_strategist_agent import MarketingStrategistAgent

logger = get_logger(__name__)

class GenesisService:
    """
    The Engine Room for 'The Genesis Engine'.
    Orchestrates:
    1. Input Analysis (Strategist)
    2. Node Graph Construction (Recursive Spawning)
    3. Content Generation (Parallel Execution)
    4. Trend Jacking (Live Updates)
    """

    # In-memory store for active processes (MVP only - use Redis/DB in prod)
    _active_processes: Dict[str, Dict[str, Any]] = {}

    @classmethod
    async def start_genesis(cls, input_source: str) -> Dict[str, Any]:
        """
        Starts the Genesis process.
        Returns the initial graph structure immediately, then processes in background.
        """
        process_id = str(uuid.uuid4())
        
        # 1. Initialize the Graph
        initial_graph = {
            "id": process_id,
            "status": "analyzing", # analyzing -> generating -> complete
            "nodes": [
                {
                    "id": "root",
                    "type": "source",
                    "data": {"label": "Source Input", "content": input_source},
                    "position": {"x": 0, "y": 0}
                }
            ],
            "edges": []
        }

        # Store state
        cls._active_processes[process_id] = initial_graph

        # 2. Fire and Forget Background Task
        asyncio.create_task(cls._run_genesis_pipeline(process_id, input_source))

        return {"process_id": process_id, "message": "Genesis initialized", "graph": initial_graph}

    @classmethod
    async def _run_genesis_pipeline(cls, process_id: str, input_source: str):
        """
        The main async pipeline.
        """
        logger.info(f"[{process_id}] Pipeline started for: {input_source}")
        
        try:
            # Step A: Strategy Analysis
            strategist = MarketingStrategistAgent()
            
            # Get Brand Context
            # Get Brand Context
            from fastapi.concurrency import run_in_threadpool
            brand_context = await run_in_threadpool(BrandService.get_brand_context)
            
            strategy_result = await strategist.async_run(
                task=f"""
                {brand_context}
                
                Analyze this input and create a campaign strategy: {input_source}
                """
            )
            
            
            # Update Graph with Strategy Node
            # We strictly format the node content for display (Markdown), but keep using the raw JSON for logic
            display_content = strategy_result.output
            try:
                # Attempt to parse and pretty print
                import json
                clean_json = strategy_result.output.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean_json)
                
                display_content = f"""**{data.get('tagline', 'Campaign Strategy')}**
                
**Core Concept:** {data.get('core_concept')}

**Target Audience:**
{chr(10).join([f"- {s['segment_name']}: {s['pain_point']}" for s in data.get('target_audience', [])])}

**USPs:**
{chr(10).join([f"- {u}" for u in data.get('usps', [])])}

**Tone:** {data.get('tone')}
**Visuals:** {data.get('visual_direction')}
"""
            except Exception as e:
                logger.warning(f"Failed to format strategy display: {e}")

            cls._add_node(process_id, "strategy", "strategy", "Campaign Strategy", display_content, "root")
            
            # Step B: Spawn Asset Nodes (The "Explosion")
            # In a real app, the Strategist would decide WHICH assets to create. 
            # For MVP/Hackathon, we hardcode the "Winning 5 Channels".
            
            assets_to_create = [
                {"id": "twitter_thread", "label": "Twitter Thread", "prompt": "Write a viral 5-tweet thread based on the strategy."},
                {"id": "linkedin_post", "label": "LinkedIn Post", "prompt": "Write a professional storytelling post for LinkedIn."},
                {"id": "cmo_email", "label": "Email Sequence", "prompt": "Write a cold email to a CMO pitching this."},
                {"id": "insta_visual", "label": "Instagram Visual", "prompt": "Describe a high-converting visual for Instagram."},
                {"id": "tiktok_script", "label": "TikTok Script", "prompt": "Write a funny, fast-paced 30s TikTok script."}
            ]

            tasks = []
            for asset in assets_to_create:
                # Add placeholder nodes first (visual feedback)
                cls._add_node(process_id, asset["id"], "asset", asset["label"], "Generating...", "strategy")
                
                # Queue generation task
                tasks.append(
                    cls._generate_asset_content(process_id, asset["id"], asset["prompt"], strategy_result.output)
                )

            # Step C: Parallel Execution
            await asyncio.gather(*tasks)

            # Mark Complete
            cls._update_status(process_id, "complete")
            logger.info(f"[{process_id}] Pipeline complete.")

        except Exception as e:
            logger.error(f"[{process_id}] Pipeline failed: {e}")
            cls._update_status(process_id, "error")

    @classmethod
    async def _generate_asset_content(cls, process_id: str, node_id: str, prompt: str, strategy: str):
        """
        Generates content for a specific asset node using the Strategy as context.
        """
        from src.agents.content_creator_agent import ContentCreatorAgent
        agent = ContentCreatorAgent() # dedicated agent for text
        
        response = await agent.async_run(
            task=f"{prompt}\n\nStrictly follow this strategy context:\n{strategy}"
        )

        # Update Node with real content
        cls._update_node_content(process_id, node_id, response.output)

    @classmethod
    async def trend_jack(cls, process_id: str, trend: str) -> Dict[str, Any]:
        """
        Refactors the ENTIRE campaign to fit a trend.
        """
        logger.info(f"[{process_id}] Trend Jacking: {trend}")
        
        graph = cls.get_graph(process_id)
        if not graph:
            return {"error": "Process not found"}

        # 1. Update Strategy Node
        cls._update_status(process_id, "trend_jacking")
        
        # In a real app, we'd re-run the whole pipeline.
        # For MVP, we'll just append local tasks to re-write content.
        
        prompt_modifier = f"RE-WRITE THIS to fit the viral trend: '{trend}'. Make it relevant but keep core values."
        
        tasks = []
        for node in graph["nodes"]:
            if node["type"] == "asset":
                 current_content = node["data"]["content"]
                 # Re-generate
                 tasks.append(
                     cls._generate_asset_content(process_id, node["id"], f"{prompt_modifier}\nOriginal Content: {current_content}", "")
                 )
        
        await asyncio.gather(*tasks)
        cls._update_status(process_id, "complete")
        
        return {"message": "Trend Jack complete"}

    @classmethod
    async def tune_campaign(cls, process_id: str, dialect: str) -> Dict[str, Any]:
        """
        Rewrites the campaign to fit a specific cultural dialect.
        """
        logger.info(f"[{process_id}] Tuning Campaign to: {dialect}")
        
        graph = cls.get_graph(process_id)
        if not graph:
            return {"error": "Process not found"}
        
        cls._update_status(process_id, "tuning")

        # Define Persona Prompts
        personas = {
            "hinglish": "Rewrite this content in 'Hinglish'. Mix Hindi words (yaar, boss, jugaad, matlab, sahi hai) naturally into English sentences. Use Roman script. Keep the core message but make it sound like a North Indian urban conversation.",
            "tanglish": "Rewrite this content in 'Tanglish'. Mix Tamil slang (Macha, Gethu, Semma, Aiyyo) naturally. Use Roman script. Keep it high-energy.",
            "bengaluru": "Rewrite this content in 'Bengaluru Tech Bro' slang. Use words like 'disrupting', 'synergy', 'bandwidth', 'circular back', 'ecosystem', 'funding'. Keep it casual but overly corporate-tech.",
            "corporate": "Rewrite this content in standard, professional corporate English. Remove any slang. Make it sound formal and trustworthy."
        }
        
        persona_prompt = personas.get(dialect.lower(), "Rewrite this content to be more engaging.")

        tasks = []
        for node in graph["nodes"]:
            if node["type"] == "asset" or node["type"] == "strategy":
                 current_content = node["data"]["content"]
                 tasks.append(
                     cls._generate_asset_content(process_id, node["id"], f"{persona_prompt}\n\nOriginal Content: {current_content}", "")
                 )
        
        await asyncio.gather(*tasks)
        cls._update_status(process_id, "complete")
        
        return {"message": f"Tuned to {dialect}"}

    @classmethod
    def get_graph(cls, process_id: str) -> Dict[str, Any]:
        return cls._active_processes.get(process_id)

    # --- Helper methods for Graph Manipulation ---

    @classmethod
    def _add_node(cls, process_id: str, node_id: str, type: str, label: str, content: str, parent_id: str):
        graph = cls._active_processes[process_id]
        
        # Smart Layout Logic
        x, y = 0, 0
        
        if type == "source":
            # Root at center-left
            x, y = 0, 200
            
        elif type == "strategy":
            # Strategy to the right of Source
            x, y = 400, 200
            
        else:
            # Asset Nodes: Arrange in a vertical stack to the right of Strategy
            # We calculate index based on existing asset nodes to position them
            asset_nodes = [n for n in graph["nodes"] if n["type"] == "asset" or n["type"] == "asset-pending"]
            index = len(asset_nodes)
            
            # Start x at 900
            base_x = 900
            # Start y at 0 and stack down with spacing
            base_y = 0 
            spacing_y = 500 # Height + Gap
            
            x = base_x
            y = base_y + (index * spacing_y)
            
            # Use 'smart' stagger if needed, but grid is cleaner as requested
            # "Index 0" -> y=0. "Index 1" -> y=500. etc. Center is y=200 roughly.
            # Let's offset y so the middle asset is aligned with strategy (y=200)
            # If 5 assets, indices 0,1,2,3,4.
            # Total height = 5 * 500 = 2500. Mid point = 1250.
            # We want center of stack to be 200.
            # This is hard to do incrementally without knowing total count.
            # A simple vertical stack starting from top is fine for now, or fan out.
            
            # Alternating top-bottom fan out?
            # 0 -> 200
            # 1 -> -100 (up)
            # 2 -> 500 (down)
            # 3 -> -400
            # 4 -> 800
            
            if index == 0: y = 200
            elif index % 2 == 1: y = 200 - ( (index + 1) // 2 * 400 )
            else: y = 200 + ( index // 2 * 400 )

        new_node = {
            "id": node_id,
            "type": type,
            "data": {"label": label, "content": content},
            "position": {"x": x, "y": y},
            "draggable": True
        }
        
        graph["nodes"].append(new_node)
        
        if parent_id:
            edge = {
                "id": f"e-{parent_id}-{node_id}",
                "source": parent_id,
                "target": node_id,
                "animated": True
            }
            graph["edges"].append(edge)

    @classmethod
    def _update_node_content(cls, process_id: str, node_id: str, content: str):
        graph = cls._active_processes[process_id]
        for node in graph["nodes"]:
            if node["id"] == node_id:
                node["data"]["content"] = content
                break

    @classmethod
    def _update_status(cls, process_id: str, status: str):
        if process_id in cls._active_processes:
            cls._active_processes[process_id]["status"] = status
