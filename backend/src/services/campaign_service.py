"""
Campaign Architect Service — 4-Step Intelligence Pipeline
==========================================================
STEP 1: MARKET RECON      — 3 targeted Tavily searches (competitors, audience, trends)
STEP 2: COMPREHEND PASS   — AWS: detect competitors (ORGANIZATION entities), market sentiment, opportunity phrases
STEP 3: BEDROCK SYNTHESIS — Nova generates a data-grounded strategy enriched with Comprehend output
STEP 4: CAMPAIGN MEMORY   — DynamoDB: save intelligence run + compute delta vs similar past campaigns
                          — SNS autonomous alert if market sentiment POSITIVE + few competitors detected
"""
import json
import re
import uuid
import os
from datetime import datetime
from typing import AsyncGenerator
from fastapi.concurrency import run_in_threadpool
import boto3

from src.core.llm_factory import LLMFactory
from src.services.brand_service import BrandService
from src.services.aws_service import (
    CampaignComprehendService,
    CampaignMemoryService,
    AWSSNSService,
)
from src.models.schemas import Campaign, CampaignCreate, CampaignStrategy
from src.utils.logger import get_logger
from botocore.exceptions import ClientError
from tavily import TavilyClient

logger = get_logger(__name__)
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY", ""))

# Opportunity threshold: low competition + positive market = autonomous SNS alert
OPPORTUNITY_THRESHOLD_COMPETITORS = 3
OPPORTUNITY_THRESHOLD_CONFIDENCE = 80.0


def _sse(event: str, data: dict) -> str:
    return f"data: {json.dumps({'event': event, 'data': data})}\n\n"


def _safe_json(text: str) -> dict | None:
    try:
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            return json.loads(m.group())
    except Exception:
        pass
    return None


class CampaignService:
    """Handles CRUD for campaigns in DynamoDB with local fallback."""
    TABLE_NAME = "CloudCraft-Campaigns"
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
        try:
            table = dynamodb.Table(cls.TABLE_NAME)
            table.load()
            logger.info(f"Connected to DynamoDB table: {cls.TABLE_NAME}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                logger.info(f"Table {cls.TABLE_NAME} not found. Creating...")
                try:
                    table = dynamodb.create_table(
                        TableName=cls.TABLE_NAME,
                        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
                        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
                        BillingMode="PAY_PER_REQUEST",
                    )
                except ClientError as e2:
                    if e2.response["Error"]["Code"] != "ResourceInUseException":
                        raise e2
            else:
                logger.error(f"Failed to connect to DynamoDB: {e}")
                raise e
        cls._table = table
        return cls._table

    @classmethod
    def _save_fallback(cls, campaigns_list):
        try:
            os.makedirs("data", exist_ok=True)
            with open("data/campaigns.json", "w") as f:
                json.dump([c.dict() for c in campaigns_list], f, default=str)
        except Exception as e:
            logger.error(f"Failed to save to local campaign file: {e}")

    @classmethod
    def _load_fallback(cls):
        try:
            if os.path.exists("data/campaigns.json"):
                with open("data/campaigns.json", "r") as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Failed to load from local campaign file: {e}")
            return []

    @classmethod
    def create_campaign(cls, campaign_in: CampaignCreate) -> Campaign:
        new_campaign = Campaign(
            id=str(uuid.uuid4()),
            name=campaign_in.name,
            goal=campaign_in.goal,
            duration=campaign_in.duration,
            budget=campaign_in.budget,
            status="draft",
            created_at=datetime.utcnow().isoformat(),
            strategy=None
        )
        try:
            cls._get_table().put_item(Item=new_campaign.dict())
            return new_campaign
        except Exception as e:
            logger.warning(f"DynamoDB save failed: {e}. Using fallback.")
            current = cls._load_fallback()
            current.append(new_campaign.dict())
            cls._save_fallback([Campaign(**c) for c in current])
            return new_campaign

    @classmethod
    def get_all_campaigns(cls):
        try:
            response = cls._get_table().scan()
            return [Campaign(**item) for item in response.get("Items", [])]
        except Exception as e:
            logger.warning(f"DynamoDB scan failed: {e}. Using fallback.")
            return [Campaign(**c) for c in cls._load_fallback()]

    @classmethod
    def update_campaign_strategy(cls, campaign_id: str, strategy: CampaignStrategy):
        try:
            cls._get_table().update_item(
                Key={"id": campaign_id},
                UpdateExpression="set strategy = :s, #st = :active",
                ExpressionAttributeNames={"#st": "status"},
                ExpressionAttributeValues={":s": strategy.dict(), ":active": "active"}
            )
        except Exception as e:
            logger.warning(f"DynamoDB update failed: {e}. Using fallback.")
            raw = cls._load_fallback()
            updated = []
            for c in raw:
                if c["id"] == campaign_id:
                    c["strategy"] = strategy.dict()
                    c["status"] = "active"
                updated.append(Campaign(**c))
            cls._save_fallback(updated)
        return True


class CampaignIntelligenceService:
    """
    Orchestrates the 4-step Campaign Architect intelligence pipeline.
    Returns an async SSE generator consumed by the frontend EventSource.
    """

    @staticmethod
    async def run_intelligence_stream(
        campaign_id: str,
        campaign_name: str,
        goal: str,
        duration: str,
        budget: str,
    ) -> AsyncGenerator[str, None]:

        llm = LLMFactory.get_llm()
        comprehend_svc = CampaignComprehendService()
        memory_svc = CampaignMemoryService()
        sns_svc = AWSSNSService()
        brand_context = BrandService.get_brand_context()

        # ── PIPELINE START ────────────────────────────────────────────────
        yield _sse("pipeline_start", {
            "campaign_id": campaign_id,
            "campaign_name": campaign_name,
            "goal": goal,
            "steps": ["RECON", "COMPREHEND", "SYNTHESIS", "MEMORY"],
            "message": f"Intelligence pipeline initialised for '{campaign_name}'"
        })

        # ══════════════════════════════════════════════════════════════════
        # STEP 1: MARKET RECON (Tavily — 3 targeted queries)
        # ══════════════════════════════════════════════════════════════════
        yield _sse("step_start", {"step": "RECON", "step_num": 1,
            "message": f"Market Recon Agent scanning competitive landscape for: {goal[:80]}"})

        queries = [
            f"top competitors {goal} market 2026",
            f"{goal} target audience pain points trends",
            f"{goal} market opportunities emerging signals 2026",
        ]
        raw_parts = []
        total_hits = 0
        for i, q in enumerate(queries):
            yield _sse("recon_query", {"query_num": i + 1, "query": q,
                "message": f"Searching: {q[:70]}"})
            try:
                res = await run_in_threadpool(
                    tavily_client.search, query=q, search_depth="basic", max_results=4
                )
                hits = res.get("results", [])
                total_hits += len(hits)
                raw_parts.append(" ".join(r.get("content", "")[:400] for r in hits))
                yield _sse("recon_hit", {"query_num": i + 1, "hits": len(hits),
                    "message": f"Found {len(hits)} results"})
            except Exception as e:
                logger.warning(f"Tavily query {i+1} failed: {e}")
                yield _sse("recon_hit", {"query_num": i + 1, "hits": 0,
                    "message": f"Query failed: {str(e)[:60]}"})

        raw_data = " ".join(raw_parts)[:8000]
        yield _sse("step_complete", {"step": "RECON", "step_num": 1,
            "message": f"Market Recon complete — {total_hits} sources gathered across 3 queries",
            "meta": f"{total_hits} hits"})

        # ══════════════════════════════════════════════════════════════════
        # STEP 2: AWS COMPREHEND (market NLP)
        # ══════════════════════════════════════════════════════════════════
        yield _sse("step_start", {"step": "COMPREHEND", "step_num": 2,
            "message": "Routing market intelligence to AWS Comprehend for NLP extraction"})
        yield _sse("aws_call", {"service": "comprehend",
            "message": "detect_sentiment + detect_key_phrases + detect_entities running on market data"})

        try:
            comprehend_data = await comprehend_svc.analyze_market_intelligence(raw_data)
        except Exception as e:
            logger.error(f"Comprehend failed: {e}")
            comprehend_data = {
                "sentiment": "NEUTRAL", "market_confidence": 70.0,
                "key_phrases": [], "entities": [], "competitor_names": []
            }

        yield _sse("comprehend_result", {
            "sentiment": comprehend_data["sentiment"],
            "market_confidence": comprehend_data["market_confidence"],
            "key_phrases": comprehend_data["key_phrases"],
            "entities": comprehend_data["entities"],
            "competitor_names": comprehend_data["competitor_names"],
            "message": (
                f"Market NLP complete — {comprehend_data['sentiment']} sentiment "
                f"({comprehend_data['market_confidence']}%) | "
                f"{len(comprehend_data['competitor_names'])} competitors detected | "
                f"{len(comprehend_data['key_phrases'])} market signals"
            )
        })
        yield _sse("step_complete", {"step": "COMPREHEND", "step_num": 2,
            "message": "AWS Comprehend analysis complete",
            "meta": f"{len(comprehend_data['competitor_names'])} competitors | {comprehend_data['sentiment']}"})

        # ══════════════════════════════════════════════════════════════════
        # STEP 3: BEDROCK NOVA SYNTHESIS (Comprehend-enriched strategy)
        # ══════════════════════════════════════════════════════════════════
        yield _sse("step_start", {"step": "SYNTHESIS", "step_num": 3,
            "message": "Amazon Nova synthesising data-grounded campaign strategy"})

        competitor_list = ", ".join(comprehend_data["competitor_names"]) or "none detected"
        signals_list = ", ".join(comprehend_data["key_phrases"][:8]) or "none detected"

        synthesis_prompt = f"""You are 'CloudCraft Architect', an elite, highly agentic, ruthless growth-hacking AI.
You do not give generic advice. You design hyper-specific, technically actionable, and devastatingly effective marketing warfare strategies.

== CAMPAIGN OBJECTIVE ==
Name: {campaign_name}
Goal: {goal}
Duration: {duration}
Budget: {budget}

== AWS COMPREHEND MARKET INTELLIGENCE ==
Market Sentiment: {comprehend_data['sentiment']} ({comprehend_data['market_confidence']}% confidence)
Detected Competitors: {competitor_list}
Opportunity Signals: {signals_list}

== RAW MARKET RECON ==
{raw_data[:2500]}

== TASK ==
Forge an ultra-premium, highly differentiated strategy that dominates the detected competitors ({competitor_list}).
The output must feel advanced, technical, and "agentic" (using terms like "Attack Vectors", "Defensive Moats", "Signal Intercepts").
DO NOT return generic business advice. Give specific, tactical, and aggressive marketing maneuvers grounded in the AWS data.

Return ONLY valid JSON (no markdown block, just the raw json):
{{
    "core_concept": "A massive, paradigm-shifting thesis statement for this campaign.",
    "agentic_directive": "A one-sentence, highly directive command to the execution team on the most critical path to victory.",
    "market_insight": "The critical vulnerability detected in the current market landscape based on the Comprehend data.",
    "attack_vectors": [
        "Vector 1: High-impact technical or guerrilla growth tactic targeting {competitor_list[:20]}",
        "Vector 2: Unconventional acquisition channel based on signals",
        "Vector 3: Aggressive wedge strategy to breach the market"
    ],
    "target_audience": [
        {{"segment_name": "Ultra-specific Niche 1", "pain_point": "Deep psychological or technical pipeline bottleneck"}},
        {{"segment_name": "Ultra-specific Niche 2", "pain_point": "Another deeply researched vulnerability"}}
    ],
    "defensive_moats": [
        "How we protect our flanks from retaliation by existing players",
        "Technical or brand moat we are building"
    ]
}}
"""
        strategy = None
        try:
            resp = await llm.ainvoke(synthesis_prompt)
            content = resp.content if hasattr(resp, 'content') else str(resp)
            strategy = _safe_json(content)
            if not strategy:
                raise ValueError("No valid JSON in LLM response")
            yield _sse("synthesis_result", {"strategy": strategy,
                "message": "Strategy synthesis complete"})
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            strategy = {
                "core_concept": f"Aggressive Wedge Entry into {goal} space",
                "agentic_directive": f"Execute zero-day marketing pivot against {competitor_list[:20]}",
                "market_insight": f"AWS Comprehend detected {comprehend_data['sentiment']} market sentiment.",
                "attack_vectors": comprehend_data["key_phrases"][:3] or ["Seize organic SEO", "Deploy autonomous outbound", "Hijack competitor PR"],
                "target_audience": [{"segment_name": "Primary", "pain_point": p}
                    for p in comprehend_data["key_phrases"][:2]] or [{"segment_name": "Default Niche", "pain_point": "Inefficiency"}],
                "defensive_moats": ["Proprietary dataset advantage", "First-mover AI integration"]
            }
            yield _sse("synthesis_fallback", {"strategy": strategy,
                "message": "Used Comprehend-direct strategy (LLM parse issue)"})

        yield _sse("step_complete", {"step": "SYNTHESIS", "step_num": 3,
            "message": "Intelligence strategy generated",
            "meta": f"{len(strategy.get('usps', []))} USPs · {len(strategy.get('target_audience', []))} segments"})

        # Save strategy to DynamoDB campaigns table
        try:
            campaign_strategy = CampaignStrategy(**{k: v for k, v in strategy.items()
                if k in CampaignStrategy.__fields__})
            await run_in_threadpool(
                CampaignService.update_campaign_strategy, campaign_id, campaign_strategy
            )
        except Exception as e:
            logger.warning(f"Strategy save failed: {e}")

        # ══════════════════════════════════════════════════════════════════
        # STEP 4: CAMPAIGN MEMORY (DynamoDB)
        # ══════════════════════════════════════════════════════════════════
        yield _sse("step_start", {"step": "MEMORY", "step_num": 4,
            "message": f"Writing intelligence run to DynamoDB. Querying similar past campaigns..."})
        yield _sse("aws_call", {"service": "dynamodb",
            "message": "Scanning cloudcraft-campaign-intelligence for similar goal patterns"})

        past_runs = await memory_svc.get_similar_campaigns(goal, limit=10)
        delta = memory_svc.compute_campaign_delta(comprehend_data, past_runs)

        run_id = await memory_svc.save_campaign_intelligence(
            campaign_id=campaign_id,
            campaign_name=campaign_name,
            goal=goal,
            comprehend_data=comprehend_data,
            strategy=strategy,
            market_confidence=comprehend_data["market_confidence"],
        )

        yield _sse("memory_update", {
            "run_id": run_id,
            "delta": delta,
            "message": (
                f"Intelligence run #{run_id} saved | "
                f"{delta.get('similar_count', 0)} similar past campaigns found | "
                f"Market trend: {delta.get('market_trend', 'BASELINE')}"
            )
        })
        yield _sse("step_complete", {"step": "MEMORY", "step_num": 4,
            "message": "Campaign intelligence persisted to DynamoDB",
            "meta": f"{delta.get('similar_count', 0)} similar · {delta.get('market_trend', 'BASELINE')}"})

        # ── OPPORTUNITY ALERT (SNS autonomous) ────────────────────────────
        competitor_count = len(comprehend_data.get("competitor_names", []))
        market_confidence = comprehend_data.get("market_confidence", 0)
        opportunity_detected = (
            comprehend_data.get("sentiment") == "POSITIVE"
            and competitor_count < OPPORTUNITY_THRESHOLD_COMPETITORS
            and market_confidence >= OPPORTUNITY_THRESHOLD_CONFIDENCE
        )

        if opportunity_detected:
            yield _sse("aws_call", {"service": "sns",
                "message": f"LOW-COMPETITION WINDOW DETECTED — {competitor_count} competitors, {market_confidence}% positive. Firing SNS opportunity alert..."})
            try:
                alert_message = (
                    f"OPPORTUNITY ALERT: Campaign '{campaign_name}'\n\n"
                    f"Goal: {goal}\n"
                    f"Market Sentiment: POSITIVE ({market_confidence}%)\n"
                    f"Competitors detected by AWS Comprehend: {competitor_count} ({competitor_list})\n\n"
                    f"LOW COMPETITION WINDOW IDENTIFIED — Recommend immediate campaign launch.\n\n"
                    f"Strategy core concept: {strategy.get('core_concept', '')}"
                )
                await run_in_threadpool(
                    sns_svc.sns.publish,
                    TopicArn=sns_svc.topic_arn or os.getenv("AWS_SNS_TOPIC_ARN", ""),
                    Subject=f"[CloudCraft] Opportunity Alert: {campaign_name}",
                    Message=alert_message
                )
                yield _sse("opportunity_alert", {"fired": True,
                    "competitor_count": competitor_count,
                    "market_confidence": market_confidence,
                    "message": f"SNS opportunity alert dispatched — {competitor_count} competitors, {market_confidence}% positive market"})
            except Exception as e:
                logger.error(f"SNS alert failed: {e}")
                yield _sse("opportunity_alert", {"fired": False, "error": str(e),
                    "message": f"SNS alert failed: {str(e)[:80]}"})
        else:
            yield _sse("opportunity_alert", {"fired": False,
                "reason": f"competitors={competitor_count}, confidence={market_confidence}%, sentiment={comprehend_data.get('sentiment')}",
                "message": f"No opportunity alert — {competitor_count} competitors detected, market {comprehend_data.get('sentiment')}"})

        # ── PIPELINE COMPLETE ─────────────────────────────────────────────
        yield _sse("intelligence_complete", {
            "campaign_id": campaign_id,
            "strategy": strategy,
            "comprehend_data": {
                "sentiment": comprehend_data["sentiment"],
                "market_confidence": comprehend_data["market_confidence"],
                "key_phrases": comprehend_data["key_phrases"],
                "entities": comprehend_data["entities"],
                "competitor_names": comprehend_data["competitor_names"],
            },
            "delta": delta,
            "opportunity_alert": opportunity_detected,
            "run_id": run_id,
            "message": "Campaign intelligence pipeline complete. All 4 steps executed."
        })

    @staticmethod
    async def run_radar_scan(campaign_id: str, campaign_name: str, goal: str) -> dict:
        """
        Rival Radar: Autonomous watchdog scan.
        Runs Tavily search -> AWS Comprehend -> DynamoDB memory delta.
        Fires SNS if new competitors emerge or sentiment drops.
        """
        comprehend_svc = CampaignComprehendService()
        memory_svc = CampaignMemoryService()
        sns_svc = AWSSNSService()

        # 1. Market Scan
        logger.info(f"[RADAR] Scanning competitive landscape for {campaign_name}...")
        try:
            res = await run_in_threadpool(
                tavily_client.search,
                query=f"top competitors {goal} market shift news risks 2026",
                search_depth="advanced",
                max_results=5
            )
            raw_data = " ".join([r.get("content", "") for r in res.get("results", [])])[:8000]
        except Exception as e:
            logger.error(f"[RADAR] Tavily failed: {e}")
            raw_data = ""

        # 2. Comprehend NLP
        comprehend_data = await comprehend_svc.analyze_market_intelligence(raw_data)

        # 3. Memory & Delta
        past_runs = await memory_svc.get_similar_campaigns(goal, limit=5)
        delta = memory_svc.compute_campaign_delta(comprehend_data, past_runs)

        # 4. Save Radar Blip
        run_id = await memory_svc.save_campaign_intelligence(
            campaign_id=campaign_id,
            campaign_name=campaign_name,
            goal=goal,
            comprehend_data=comprehend_data,
            strategy={"core_concept": "Radar Update", "tagline": "Autonomous Watchdog", "usps": []},
            market_confidence=comprehend_data["market_confidence"],
        )

        # 5. SNS Alert Logic
        alert_fired = False
        new_comps = delta.get("new_competitors", [])
        trend = delta.get("market_trend", "STABLE")

        # Alert if new competitors detected OR market sentiment is dropping
        if new_comps or trend == "FALLING":
            alert_fired = True
            msg = (
                f"🚨 CLOUDCRAFT RIVAL RADAR: '{campaign_name}' 🚨\n\n"
                f"Market Shift Detected!\n"
                f"Trend: {trend}\n"
                f"New Competitors: {', '.join(new_comps) if new_comps else 'None'}\n"
                f"Total Tracked: {len(comprehend_data.get('competitor_names', []))}\n\n"
                f"Current Market Sentiment: {comprehend_data.get('sentiment')} ({comprehend_data.get('market_confidence')}%)\n\n"
                f"Required Action: Check your CloudCraft Campaign Architect dashboard to recalibrate your strategy.\n\n"
                f"Autonomously generated by CloudCraft Rival Radar Engine."
            )
            try:
                await run_in_threadpool(
                    sns_svc.sns.publish,
                    TopicArn=sns_svc.topic_arn or os.getenv("AWS_SNS_TOPIC_ARN", ""),
                    Subject=f"[Rival Radar] Market Shift: {campaign_name}",
                    Message=msg
                )
                logger.info("[RADAR] SNS Alert Fired.")
            except Exception as e:
                logger.error(f"[RADAR] SNS failed: {e}")

        return {
            "run_id": run_id,
            "timestamp": datetime.utcnow().isoformat(),
            "comprehend_data": comprehend_data,
            "delta": delta,
            "alert_fired": alert_fired
        }
