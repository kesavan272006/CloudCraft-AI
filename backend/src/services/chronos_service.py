import json
import os
import uuid
import re
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from fastapi.concurrency import run_in_threadpool

import boto3
from botocore.exceptions import ClientError

from src.core.llm_factory import LLMFactory
from src.services.brand_service import BrandService
from src.utils.logger import get_logger

logger = get_logger(__name__)

TABLE_NAME = "cloudcraft-chronos-brief"

class ChronosService:
    """
    The Chronos Brief service: a multi-agent autonomous 90-day growth playbook generator.
    Stores living plans in DynamoDB, triggers daily rerewites via EventBridge (scheduled Lambda).
    """

    _table = None

    @classmethod
    def _get_table(cls):
        if cls._table:
            return cls._table
        dynamodb = boto3.resource(
            "dynamodb",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        cls._table = dynamodb.Table(TABLE_NAME)
        return cls._table

    @classmethod
    def _ensure_table(cls):
        """Creates DynamoDB table if it doesn't exist."""
        client = boto3.client(
            "dynamodb",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        try:
            client.describe_table(TableName=TABLE_NAME)
        except client.exceptions.ResourceNotFoundException:
            logger.info(f"Creating DynamoDB table: {TABLE_NAME}")
            client.create_table(
                TableName=TABLE_NAME,
                KeySchema=[{"AttributeName": "mission_id", "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": "mission_id", "AttributeType": "S"}],
                BillingMode="PAY_PER_REQUEST",
            )
            boto3.resource(
                "dynamodb",
                region_name=os.getenv("AWS_REGION", "us-east-1"),
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            ).Table(TABLE_NAME).wait_until_exists()
            logger.info(f"Table {TABLE_NAME} created.")

    @classmethod
    async def create_mission(cls, goal: str, duration_days: int, budget_tier: str, automation_level: str = "suggest") -> dict:
        """
        Spawns 5 specialist agents + 1 supervisor to generate the full playbook.
        """
        print(f"DEBUG: STARTING MISSION CREATION FOR GOAL: {goal}")
        await run_in_threadpool(cls._ensure_table)
        print("DEBUG: TABLE ENSURED")

        llm = LLMFactory.get_default_llm()
        tools = LLMFactory.get_tools()
        search_tool = next((t for t in tools if t.name == "web_search"), None)
        print(f"DEBUG: SEARCH TOOL FOUND: {search_tool is not None}")
        
        brand_ctx = await run_in_threadpool(BrandService.get_brand_context)
        print("DEBUG: BRAND CONTEXT RETRIEVED")

        # ── Agent 1: RECON — Market landscape scan ─────────────────────────
        market_signals_raw = []
        market_signals_text = "Standard market conditions detected."
        if search_tool:
            try:
                q = f"current market trends and consumer behavior for: {goal} India 2026"
                print(f"DEBUG: RUNNING RECON SEARCH FOR: {q}")
                results = await run_in_threadpool(search_tool.func, q)
                market_signals_raw = results if isinstance(results, list) else []
                print("DEBUG: RECON SEARCH COMPLETE")
                
                # Create a concise summary of results for the feed
                recon_prompt = f"Summarize these market signals into a 1-sentence high-impact insight: {str(market_signals_raw)[:2000]}"
                recon_summary_resp = await llm.ainvoke(recon_prompt)
                market_signals_text = recon_summary_resp.content.strip()
            except Exception as e:
                print(f"DEBUG: RECON FAILED: {e}")
                logger.warning(f"Recon agent search failed: {e}")
                market_signals_text = "Focus on digital-first growth opportunities in Tier 1/2 Indian cities."

        market_signals_prompt_ctx = str(market_signals_raw)[:2000]

        # ── Agent 2: PERSONA — Generate 3 hyper-specific personas ──────────
        try:
            persona_prompt = f"""
You are the PERSONA AGENT for a growth strategy system.
Mission Goal: {goal}
Budget Tier: {budget_tier}
Brand Context: {brand_ctx}
Market Signals: {market_signals_prompt_ctx}

Generate exactly 3 hyper-specific customer personas. Return ONLY valid JSON.
{{
  "personas": [
    {{
      "archetype": "The Pragmatic Founder",
      "psychological_trigger": "Fear of losing market share",
      "dream_outcome": "Automated workflow and high ROI",
      "top_content": ["LinkedIn Posts", "Case Studies"],
      "resonance_score": 85,
      "is_primary": true
    }}
  ]
}}
"""
            persona_resp = await llm.ainvoke(persona_prompt)
            personas = cls._parse_json(persona_resp.content, "personas", [])
            print(f"DEBUG: PERSONA AGENT COMPLETE. FOUND {len(personas)} PERSONAS")
        except Exception as e:
            print(f"DEBUG: PERSONA AGENT FAILED: {e}")
            logger.error(f"Persona Agent failed: {e}", exc_info=True)
            personas = []

        # ── Agent 3: COMPETITOR — Moat map analysis ──────────────────────
        try:
            print("DEBUG: RUNNING COMPETITOR AGENT")
            competitor_prompt = f"""
You are the COMPETITOR INTELLIGENCE AGENT.
Mission Goal: {goal}
Market Signals: {market_signals_prompt_ctx}

Identify strategic competitive positioning. Return ONLY valid JSON.
{{
  "competitors": [
    {{"name": "Competitor X", "market_penetration": 40, "differentiation": 20, "weakness": "Slow feature velocity"}}
  ],
  "your_positioning": {{"market_penetration": 10, "differentiation": 80}},
  "win_rationale": "Focus on differentiation and velocity."
}}
"""
            competitor_resp = await llm.ainvoke(competitor_prompt)
            competitive_intel = cls._parse_json(competitor_resp.content, "competitors", [])
            position_data = cls._parse_first(competitor_resp.content) or {}
            print(f"DEBUG: COMPETITOR AGENT COMPLETE. FOUND {len(competitive_intel)} COMPETITORS")
        except Exception as e:
            print(f"DEBUG: COMPETITOR AGENT FAILED: {e}")
            logger.error(f"Competitor Agent failed: {e}", exc_info=True)
            competitive_intel = []
            position_data = {}

        # ── Agent 4: STRATEGY — 90-day phased content architecture ──────
        try:
            strategy_prompt = f"""
You are the STRATEGY ARCHITECT AGENT. Your task is to design a high-density, hyper-tactical 90-day growth plan.
Mission Goal: {goal}
Duration: {duration_days} days | Budget: {budget_tier}
Target Personas: {json.dumps(personas[:2]) if personas else "General business audience"}
Market Signals: {market_signals_prompt_ctx}

Design 3 strategic phases in theory, but ONLY return the specific details for Phase 1. For Phase 1, provide a daily breakdown for exactly the first 7 days. Each day must have 1-2 specific content or outreach tasks.
Tasks should include 'description', 'platform' (LinkedIn/Twitter/Cold Email/Internal), and 'content_type'.
Return ONLY valid JSON.
{{
  "phases": [
    {{
      "name": "Phase 1: Market Infiltration",
      "start_day": 1,
      "end_day": 30,
      "objective": "Clear strategic objective",
      "days": [
        {{
          "day": 1,
          "theme": "Launch Sequence",
          "tasks": [
            {{
              "content_type": "LinkedIn Post/Reel/Ad/Email",
              "platform": "LinkedIn",
              "description": "Specific tactical instruction for the human to execute",
              "expected_reach": "1000",
              "priority": "high"
            }}
          ]
        }}
      ]
    }}
  ]
}}
"""
            strategy_resp = await llm.ainvoke(strategy_prompt)
            phases = cls._parse_json(strategy_resp.content, "phases", [])
            print(f"DEBUG: PHASES PARSED: {len(phases)}")
        except Exception as e:
            print(f"DEBUG: STRATEGY AGENT ERR: {e}")
            logger.error(f"Strategy Agent failed: {e}", exc_info=True)
            phases = []

        # ── Agent 5: RISK — Risk register with contingencies ─────────────
        try:
            risk_prompt = f"""
You are the RISK & CONTINGENCY AGENT.
Mission Goal: {goal}
Duration: {duration_days} days
Market Signals: {market_signals_prompt_ctx}

Identify top 3 predicted failure points with contingencies. Return ONLY valid JSON.
{{
  "risks": [
    {{
      "title": "Ad Fatigue Strategy",
      "predicted_day": 45,
      "probability_pct": 60,
      "impact": "high",
      "contingency": "Switch creative assets to video format."
    }}
  ]
}}
"""
            risk_resp = await llm.ainvoke(risk_prompt)
            risks = cls._parse_json(risk_resp.content, "risks", [])
        except Exception as e:
            logger.error(f"Risk Agent failed: {e}", exc_info=True)
            risks = []

        # ── Supervisor Agent: Synthesize everything into Executive Summary ─
        supervisor_prompt = f"""
You are the SUPERVISOR AGENT synthesizing a multi-agent strategy report.
Goal: {goal}
Duration: {duration_days} days | Budget: {budget_tier}

Agent outputs:
- Personas identified: {len(personas)}
- Competitive gaps found: {len(competitive_intel)}
- Strategic phases: {len(phases)}
- Risk factors: {len(risks)}

You are the SUPERVISOR AGENT synthesizing a multi-agent strategy report for a C-suite executive.
Goal: {goal}
Duration: {duration_days} days | Budget: {budget_tier}

Write a high-impact, professional Strategic Consensus Thesis (4-5 lines). 
It must sound authoritative, analytical, and visionary. Avoid fluff. Focus on the 'Why' behind the strategy.
Return plain text only — no JSON, no markdown bullets.
"""
        supervisor_resp = await llm.ainvoke(supervisor_prompt)
        executive_summary = supervisor_resp.content.strip()

        # ── Budget allocation ─────────────────────────────────────────────
        budget_allocations = cls._generate_budget_allocation(budget_tier)

        # ── Assemble mission ─────────────────────────────────────────────
        mission = {
            "mission_id": str(uuid.uuid4()),
            "goal": goal,
            "duration_days": duration_days,
            "budget_tier": budget_tier,
            "automation_level": automation_level,
            "status": "active",
            "current_day": 1,
            "rewrite_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "executive_summary": executive_summary,
            "personas": personas,
            "competitive_intel": {
                "competitors": competitive_intel,
                "your_position": position_data.get("your_positioning", {"market_penetration": 20, "differentiation": 75}),
                "win_rationale": position_data.get("win_rationale", "Focus on differentiation over market share in early phases."),
            },
            "phases": phases,
            "risks": risks,
            "budget_allocations": budget_allocations,
            "market_signals": market_signals_text,
            "latest_brief": None,
        }

        # Persist to DynamoDB
        print(f"DEBUG: SAVING MISSION {mission['mission_id']} TO DYNAMODB")
        await run_in_threadpool(cls._save_mission, mission)
        print("DEBUG: MISSION SAVED SUCCESSFULLY")
        return mission

    @classmethod
    def _save_mission(cls, mission: dict):
        try:
            # Convert any floats to Decimal for DynamoDB compatibility
            mission = cls._float_to_decimal(mission)
            
            table = cls._get_table()
            table.put_item(Item=mission)
            logger.info(f"Mission saved: {mission['mission_id']}")
        except Exception as e:
            print(f"DEBUG: DYNAMODB SAVE FAILED: {e}")
            logger.error(f"DynamoDB save failed: {e}", exc_info=True)
            raise e

    @staticmethod
    def _float_to_decimal(data):
        if isinstance(data, list):
            return [ChronosService._float_to_decimal(v) for v in data]
        elif isinstance(data, dict):
            return {k: ChronosService._float_to_decimal(v) for k, v in data.items()}
        elif isinstance(data, float):
            return Decimal(str(data))
        return data

    @classmethod
    async def get_missions(cls) -> list:
        await run_in_threadpool(cls._ensure_table)
        try:
            table = cls._get_table()
            resp = table.scan(Limit=20)
            items = resp.get("Items", [])
            items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return items
        except Exception as e:
            logger.error(f"Failed to list missions: {e}")
            return []

    @classmethod
    async def get_mission(cls, mission_id: str) -> Optional[dict]:
        await run_in_threadpool(cls._ensure_table)
        try:
            table = cls._get_table()
            resp = table.get_item(Key={"mission_id": mission_id})
            return resp.get("Item")
        except Exception as e:
            logger.error(f"Failed to get mission {mission_id}: {e}")
            return None

    @classmethod
    async def authorize_pivot(cls, mission_id: str, pivot_context: str) -> dict:
        """Supervisor re-runs strategy rewrite with new market context."""
        mission = await cls.get_mission(mission_id)
        if not mission:
            raise ValueError(f"Mission {mission_id} not found")

        llm = LLMFactory.get_default_llm()
        prompt = f"""
You are the SUPERVISOR AGENT executing an emergency pivot.
Original Goal: {mission['goal']}
Pivot Context: {pivot_context}
Current Day: {mission['current_day']} of {mission['duration_days']}

Rewrite the "executive_summary" and generate a short "pivot_directive" (2 sentences).
Return ONLY valid JSON:
{{
  "executive_summary": "string",
  "pivot_directive": "string"
}}
"""
        resp = await llm.ainvoke(prompt)
        data = cls._parse_first(resp.content) or {}

        mission["executive_summary"] = data.get("executive_summary", mission["executive_summary"])
        mission["latest_brief"] = {
            "type": "PIVOT",
            "directive": data.get("pivot_directive", pivot_context),
            "issued_at": datetime.utcnow().isoformat(),
        }
        mission["rewrite_count"] = mission.get("rewrite_count", 0) + 1
        mission["updated_at"] = datetime.utcnow().isoformat()

        await run_in_threadpool(cls._save_mission, mission)
        return mission

    # ── Utilities ──────────────────────────────────────────────────────────
    @staticmethod
    def _parse_json(text: str, key: str, default):
        try:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                data = json.loads(match.group())
                return data.get(key, default)
        except Exception as e:
            print(f"DEBUG_PARSE_JSON ERROR for key '{key}': {e} | Text: {text}")
            pass
        return default

    @staticmethod
    def _parse_first(text: str) -> Optional[dict]:
        try:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return None

    @staticmethod
    def _generate_budget_allocation(budget_tier: str) -> list:
        if budget_tier == "scale":
            return [
                {"channel": "LinkedIn Ads", "pct": 30, "cpl": "₹110/lead", "reach": "12,000"},
                {"channel": "Instagram Reels", "pct": 20, "cpl": "₹40/lead", "reach": "25,000"},
                {"channel": "Google Display", "pct": 20, "cpl": "₹90/lead", "reach": "40,000"},
                {"channel": "Content Creation", "pct": 20, "cpl": "—", "reach": "Organic"},
                {"channel": "Tools & Automation", "pct": 10, "cpl": "—", "reach": "—"},
            ]
        elif budget_tier == "growth":
            return [
                {"channel": "LinkedIn Ads", "pct": 35, "cpl": "₹120/lead", "reach": "8,400"},
                {"channel": "Instagram Reels", "pct": 25, "cpl": "₹45/lead", "reach": "18,000"},
                {"channel": "Content Creation", "pct": 30, "cpl": "—", "reach": "Organic"},
                {"channel": "Tools & Automation", "pct": 10, "cpl": "—", "reach": "—"},
            ]
        else:  # bootstrap
            return [
                {"channel": "Organic LinkedIn", "pct": 40, "cpl": "₹0", "reach": "1,200"},
                {"channel": "Instagram Organic", "pct": 30, "cpl": "₹0", "reach": "2,800"},
                {"channel": "Content Creation", "pct": 20, "cpl": "—", "reach": "Organic"},
                {"channel": "Community Outreach", "pct": 10, "cpl": "—", "reach": "500"},
            ]
