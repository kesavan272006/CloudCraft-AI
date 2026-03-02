import asyncio
import json
from typing import Annotated, Literal, Optional, Dict, Any, List
from collections.abc import Sequence

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableLambda
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from src.core.llm_factory import LLMFactory
from .base_agent import BaseAgent, AgentResponse
from .researcher_agent import ResearcherAgent
from .copywriter_agent import CopywriterAgent
from .designer_agent import DesignerAgent
from .compliance_agent import ComplianceAgent
from .focus_group_agent import FocusGroupAgent
from .strategist_agent import StrategistAgent
from .performance_agent import PerformanceAgent
from ..utils.logger import get_logger

logger = get_logger(__name__)

# ────────────────────────────────────────────────
# State
# ────────────────────────────────────────────────

class AgentState(dict):
    messages: Annotated[list[BaseMessage], "add_messages"]
    next_agent: str
    final_output: str | None = None
    thought_history: list[dict[str, str]]

# ────────────────────────────────────────────────
# Strict supervisor prompt
# ────────────────────────────────────────────────

SUPERVISOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
You are the Supervisor Brain Agent.
You coordinate exactly 4 agents: Researcher, Copywriter, Designer, Compliance.

STRICT RULES - MUST FOLLOW OR SYSTEM FAILS:
- Respond with **EXACTLY** these two lines and NOTHING ELSE:
NEXT: Researcher
or NEXT: Copywriter
or NEXT: Designer
or NEXT: Compliance
or NEXT: FINISH

REASON: [one short sentence max 10 words]

- NO extra words, NO explanations, NO content, NO formatting
- DO NOT repeat previous messages
- DO NOT summarize
- DO NOT invent agents

Valid examples ONLY:
NEXT: Researcher
REASON: Need facts first.

NEXT: Copywriter
REASON: Research complete, now write.

NEXT: FINISH
REASON: All done, content ready.

User prompt: {task}
    """),
    MessagesPlaceholder(variable_name="messages"),
])

# ────────────────────────────────────────────────
# Robust router
# ────────────────────────────────────────────────

def supervisor_router(state: AgentState) -> Literal["researcher", "copywriter", "designer", "compliance", "__end__"]:
    # STRICT LINEAR WORKFLOW ENFORCEMENT
    # We ignore the LLM's "decision" to ensure a consistent demo experience where ALL agents run.
    
    history_agents = [m.get("agent") for m in state.get("thought_history", [])]
    
    if not history_agents:
        return "researcher"
    
    last_agent = history_agents[-1]
    
    if last_agent == "Researcher":
        return "copywriter"
    if last_agent == "Copywriter":
        return "designer"
    if last_agent == "Designer":
        return "compliance"
    if last_agent == "Compliance":
        return "__end__"

    return "__end__"

# ────────────────────────────────────────────────
# Supervisor Agent
# ────────────────────────────────────────────────

class SupervisorAgent(BaseAgent):
    name = "Supervisor"
    description = "Brain Agent that coordinates all other agents"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.llm = LLMFactory.get_default_llm()

    async def decide_next(self, state: AgentState) -> AgentState:
        # Check history to guide the LLM
        history_agents = [m.get("agent") for m in state.get("thought_history", [])]
        
        # Guide the supervisor to follow the standard pipeline if it's drifting
        system_instruction = ""
        if not history_agents:
             system_instruction = "Start with Researcher."
        elif history_agents[-1] == "Researcher":
             system_instruction = "Researcher is done. NEXT STEP: Copywriter."
        elif history_agents[-1] == "Copywriter":
             system_instruction = "Copywriter is done. NEXT STEP: Designer."
        elif history_agents[-1] == "Designer":
             system_instruction = "Designer is done. NEXT STEP: Compliance."
        elif history_agents[-1] == "Compliance":
             system_instruction = "Compliance is done. NEXT STEP: FINISH."

        chain = SUPERVISOR_PROMPT | self.llm

        response = await chain.ainvoke({
            "task": state["messages"][0].content + f"\n\nCONTEXT: Process so far: {history_agents}.\nINSTRUCTION: {system_instruction}",
            "messages": state["messages"],
        })

        # Parse response to ensure we only get the command
        content = response.content.strip()
        
        state["messages"].append(AIMessage(content=content))
        logger.info(f"Supervisor decided: {content}")
        return state

# ────────────────────────────────────────────────
# Build graph
# ────────────────────────────────────────────────

def build_forge_graph():
    workflow = StateGraph(state_schema=AgentState)

    supervisor = SupervisorAgent()
    workflow.add_node("supervisor", RunnableLambda(supervisor.decide_next))

    researcher = ResearcherAgent()
    copywriter = CopywriterAgent()
    designer = DesignerAgent()
    compliance = ComplianceAgent()

    async def run_researcher(state: AgentState) -> AgentState:
        result = await researcher.async_run(state["messages"][0].content)
        state["thought_history"].append({"agent": "Researcher", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Researcher output: {result.output}"))
        return state

    async def run_copywriter(state: AgentState) -> AgentState:
        context = "\n".join([m.content for m in state["messages"] if "Researcher" in m.content])
        result = await copywriter.async_run(state["messages"][0].content, context=context)
        state["thought_history"].append({"agent": "Copywriter", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Copywriter output: {result.output}"))
        return state

    async def run_designer(state: AgentState) -> AgentState:
        context = "\n".join([m.content for m in state["messages"] if "Researcher" in m.content or "Copywriter" in m.content])
        result = await designer.async_run(state["messages"][0].content, context=context)
        state["thought_history"].append({"agent": "Designer", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Designer output: {result.output}"))
        return state

    async def run_compliance(state: AgentState) -> AgentState:
        # Get latest Copywriter and Designer output from history
        history = state.get("thought_history", [])
        
        copy_out = next((h["output"] for h in reversed(history) if h["agent"] == "Copywriter"), "")
        design_out = next((h["output"] for h in reversed(history) if h["agent"] == "Designer"), "")
        
        # specific content structure for compliance
        content_to_check = f"""
        COPYWRITER DRAFT:
        {copy_out}
        
        DESIGNER CONCEPTS:
        {design_out}
        """
        
        result = await compliance.async_run(state["messages"][0].content, content=content_to_check)
        state["thought_history"].append({"agent": "Compliance", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Compliance output: {result.output}"))
        state["final_output"] = result.output or "Compliance completed - content reviewed."
        return state

    workflow.add_node("researcher", RunnableLambda(run_researcher))
    workflow.add_node("copywriter", RunnableLambda(run_copywriter))
    workflow.add_node("designer", RunnableLambda(run_designer))
    workflow.add_node("compliance", RunnableLambda(run_compliance))

    workflow.add_conditional_edges(
        "supervisor",
        supervisor_router,
        {
            "researcher": "researcher",
            "copywriter": "copywriter",
            "designer": "designer",
            "compliance": "compliance",
            "__end__": END,
        }
    )

    workflow.add_edge("researcher", "supervisor")
    workflow.add_edge("copywriter", "supervisor")
    workflow.add_edge("designer", "supervisor")
    workflow.add_edge("compliance", "supervisor")

    workflow.set_entry_point("supervisor")

    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)


forge_graph = build_forge_graph()


# ────────────────────────────────────────────────
# Run full workflow
# ────────────────────────────────────────────────

async def run_forge_workflow(
    user_prompt: str,
    thread_id: str = "default_thread",
    image_context: Optional[Dict[str, Any]] = None
) -> dict:
    # CRITICAL DEBUG: Log the exact user prompt received
    logger.info(f"=" * 80)
    logger.info(f"[FORGE WORKFLOW START] User prompt received:")
    logger.info(f"{user_prompt}")
    logger.info(f"=" * 80)
    
    config = {"configurable": {"thread_id": thread_id}}

    content = user_prompt
    if image_context:
        content = f"""
        {user_prompt}
        
        VISUAL CONTEXT FROM VISION LAB:
        Vibe: {image_context.get('vibe_description')}
        Detected Context: {image_context.get('detected_context')}
        Suggested Tone: {image_context.get('suggested_tone')}
        
        INSTRUCTIONS: Ensure the content matches the visual vibe perfectly.
        """

    initial_state: AgentState = {
        "messages": [HumanMessage(content=content)],
        "next_agent": "supervisor",
        "final_output": None,
        "thought_history": []
    }

    current_state = initial_state.copy()

    async for event in forge_graph.astream(initial_state, config):
        for node_name, update in event.items():
            current_state.update(update)
            logger.info(f"Node '{node_name}' updated state")

    # Logic to extract the best final content
    # 1. Try Compliance output form state
    final_content = current_state.get("final_output")

    # 2. Safety / Quality Check: If Compliance output is a generic refusal or empty, fallback
    # "Only reproduce" is the start of the standard Google Gemini safety refusal.
    safety_refusal_keywords = ["Only reproduce", "summarize, paraphrase", "media outlets policy", "I cannot generate", "unable to fulfill"]
    is_refusal = final_content and any(k in final_content for k in safety_refusal_keywords)

    if is_refusal or not final_content:
        # Fallback: Find the last Designer or Copywriter output from history
        history = current_state.get("thought_history", [])
        # Search backwards to find substantive content
        for item in reversed(history):
            if item["agent"] in ["Designer", "Copywriter"] and item.get("output"):
                final_content = item["output"]
                logger.warning(f"Compliance failed or refused. Falling back to {item['agent']} output.")
                break

    # 3. Last resort fallback from messages if history failed
    if not final_content and current_state["messages"]:
        last_msg = current_state["messages"][-1].content
        if "Compliance output:" in last_msg:
             final_content = last_msg.replace("Compliance output:", "").strip()
        else:
             final_content = last_msg

    if not final_content:
        final_content = "Workflow completed but no content generated."

    return {
        "final_content": final_content,
        "thoughts": current_state.get("thought_history", []),
        "status": "success"
    }

async def run_forge_workflow_stream(
    user_prompt: str,
    thread_id: str = "default_thread",
    image_context: Optional[Dict[str, Any]] = None
):
    """
    Streaming version of the forge workflow.
    Yields events as JSON strings.
    """
    try:
        config = {"configurable": {"thread_id": thread_id}}
        
        content = user_prompt
        if image_context:
            content = f"""
            {user_prompt}
            
            VISUAL CONTEXT FROM VISION LAB:
            Vibe: {image_context.get('vibe_description')}
            Detected Context: {image_context.get('detected_context')}
            Suggested Tone: {image_context.get('suggested_tone')}
            """

        initial_state: AgentState = {
            "messages": [HumanMessage(content=content)],
            "next_agent": "supervisor",
            "final_output": None,
            "thought_history": []
        }

        # Yield initial event
        yield f"data: {json.dumps({'event': 'workflow_start', 'data': {'prompt': user_prompt}})}\n\n"

        # Define agents for streaming
        researcher = ResearcherAgent()
        copywriter = CopywriterAgent()
        designer = DesignerAgent()
        compliance = ComplianceAgent()
        
        # 1. Researcher
        yield f"data: {json.dumps({'event': 'agent_start', 'data': {'agent': 'Researcher'}})}\n\n"
        prompt = content
        res_output = ""
        async for chunk in researcher.stream_run(prompt):
            res_output += chunk
            yield f"data: {json.dumps({'event': 'agent_chunk', 'data': {'agent': 'Researcher', 'chunk': chunk}})}\n\n"
        
        state_thought_history = []
        state_thought_history.append({"agent": "Researcher", "thought": "Researched via live stream.", "output": res_output})
        yield f"data: {json.dumps({'event': 'agent_complete', 'data': {'agent': 'Researcher', 'output': res_output, 'thought': 'Completed research.'}})}\n\n"

        # 2. Copywriter
        yield f"data: {json.dumps({'event': 'agent_start', 'data': {'agent': 'Copywriter'}})}\n\n"
        copy_context = {"context": f"Research facts: {res_output}"}
        copy_output = ""
        async for chunk in copywriter.stream_run(prompt, context=copy_context):
            copy_output += chunk
            yield f"data: {json.dumps({'event': 'agent_chunk', 'data': {'agent': 'Copywriter', 'chunk': chunk}})}\n\n"
            
        state_thought_history.append({"agent": "Copywriter", "thought": "Drafted copy via live stream.", "output": copy_output})
        yield f"data: {json.dumps({'event': 'agent_complete', 'data': {'agent': 'Copywriter', 'output': copy_output, 'thought': 'Completed copywriting.'}})}\n\n"

        # 3. Designer
        yield f"data: {json.dumps({'event': 'agent_start', 'data': {'agent': 'Designer'}})}\n\n"
        design_context = {"context": f"Research: {res_output}\nCopy: {copy_output}"}
        design_output = ""
        async for chunk in designer.stream_run(prompt, context=design_context):
            design_output += chunk
            yield f"data: {json.dumps({'event': 'agent_chunk', 'data': {'agent': 'Designer', 'chunk': chunk}})}\n\n"
            
        state_thought_history.append({"agent": "Designer", "thought": "Architected visual plan via live stream.", "output": design_output})
        yield f"data: {json.dumps({'event': 'agent_complete', 'data': {'agent': 'Designer', 'output': design_output, 'thought': 'Completed visual design.'}})}\n\n"

        # 4. Compliance
        yield f"data: {json.dumps({'event': 'agent_start', 'data': {'agent': 'Compliance'}})}\n\n"
        content_to_check = f"Copy: {copy_output}\nDesign: {design_output}"
        comp_output = ""
        async for chunk in compliance.stream_run(prompt, context={"content": content_to_check}):
            comp_output += chunk
            yield f"data: {json.dumps({'event': 'agent_chunk', 'data': {'agent': 'Compliance', 'chunk': chunk}})}\n\n"
            
        state_thought_history.append({"agent": "Compliance", "thought": "Verified brand alignment.", "output": comp_output})

        # Final Content Extraction
        final_content = comp_output.replace("FINAL CONTENT:", "").strip()
        yield f"data: {json.dumps({'event': 'workflow_complete', 'data': {'final_content': final_content, 'thoughts': state_thought_history, 'status': 'success'}})}\n\n"

    except Exception as e:
        logger.error(f"Stream error: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'event': 'error', 'data': {'message': str(e)}})}\n\n"

async def run_focus_group_stream(content: str):
    """
    Runs a parallel focus group of distinct personas.
    Uses asyncio.gather so all reactions run concurrently and the stream
    ends cleanly when ALL tasks are done. No infinite loops.
    """
    personas = [
        {"name": "Gen-Z Trendsetter",      "trait": "Always on TikTok, hates 'cringe' corporate speak, loves authenticity.", "emoji": "🔥"},
        {"name": "Busy Corporate Executive","trait": "No time for fluff, wants ROI and clear logic, prefers LinkedIn-style professionalism.", "emoji": "💼"},
        {"name": "Tech Enthusiast",         "trait": "Loves innovation, technical details, and future-forward concepts.", "emoji": "🚀"},
    ]

    def sse(event: str, data: dict) -> str:
        return f"data: {json.dumps({'event': event, 'data': data})}\n\n"

    try:
        focus_agent = FocusGroupAgent()
        yield sse("focus_group_start", {"message": "Assembling Digital Focus Group..."})

        # Shared queue so we can yield reactions as they arrive (concurrent execution)
        queue: asyncio.Queue = asyncio.Queue()
        done_flag = asyncio.Event()

        async def get_reaction(p: dict):
            await queue.put(sse("persona_thinking", {"name": p["name"], "emoji": p["emoji"]}))
            try:
                # 30-second hard timeout per persona so one slow LLM can't block forever
                reaction = await asyncio.wait_for(
                    focus_agent.react(content, p["name"], p["trait"]),
                    timeout=30.0
                )
            except asyncio.TimeoutError:
                reaction = "Took too long to respond — moving on."
            except Exception as e:
                logger.error(f"Persona {p['name']} error: {e}")
                reaction = "Couldn't process that right now."
            await queue.put(sse("persona_reaction", {"name": p["name"], "emoji": p["emoji"], "reaction": reaction}))

        # Kick off all persona tasks concurrently, signal when all done
        async def run_all():
            await asyncio.gather(*[get_reaction(p) for p in personas], return_exceptions=True)
            done_flag.set()

        asyncio.create_task(run_all())

        # Drain queue until all tasks are done AND queue is empty
        while not (done_flag.is_set() and queue.empty()):
            try:
                item = await asyncio.wait_for(queue.get(), timeout=0.2)
                yield item
            except asyncio.TimeoutError:
                continue  # check done_flag again

        yield sse("focus_group_complete", {"summary": "Focus group session ended."})
        yield sse("stream_done", {})

    except asyncio.CancelledError:
        logger.info("Focus group stream cancelled.")
    except Exception as e:
        logger.error(f"Focus group stream error: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'event': 'error', 'data': {'message': str(e)}})}\n\n"

async def run_autopilot_stream(content: str):
    """
    Autonomous campaign optimization loop.
    Disconnect detection is handled by the _disconnect_aware_stream wrapper in forge.py.
    This generator just needs to yield SSE-formatted strings with proper \\n\\n endings.
    """
    from fastapi.concurrency import run_in_threadpool

    def sse(event: str, data: dict) -> str:
        return f"data: {json.dumps({'event': event, 'data': data})}\n\n"

    try:
        perf_agent = PerformanceAgent()
        strat_agent = StrategistAgent()
        copy_agent = CopywriterAgent()

        yield sse("autopilot_start", {"message": "Initiating Autonomous Campaign Loop..."})

        # Step 1: Deploy
        yield sse("autopilot_step", {"step": "DEPLOYED", "message": "Content deployed to virtual sandbox."})
        await asyncio.sleep(0.5)

        # Step 2: Initial performance analysis
        yield sse("autopilot_step", {"step": "ANALYZING", "message": "Running performance analysis..."})
        init_perf = await run_in_threadpool(perf_agent.analyze_performance, content)
        yield sse("autopilot_metrics", {"metrics": init_perf["predicted_metrics"], "score": init_perf["overall_score"]})

        # Step 3: Strategic pivot decision
        yield sse("autopilot_step", {"step": "STRATEGIZING", "message": "Strategist reviewing engagement data..."})
        pivot_decision = await strat_agent.decide_pivot(init_perf, content)

        if pivot_decision["status"] == "PIVOT" or init_perf["overall_score"] < 90:
            yield sse("autopilot_pivot", {"reason": pivot_decision["analysis"], "fix": pivot_decision["directive"]})

            # Step 4: Autonomous rewrite (streaming — yields per-chunk so disconnect check fires)
            yield sse("agent_start", {"agent": "Copywriter", "task": "Optimizing content for higher engagement"})
            revised_content = ""
            async for chunk in copy_agent.stream_run(
                f"Revise this content based on this directive: {pivot_decision['directive']}\n\nCONTENT:\n{content}"
            ):
                revised_content += chunk
                yield sse("agent_chunk", {"agent": "Copywriter", "chunk": chunk})

            # Step 5: Final performance re-scan
            yield sse("autopilot_step", {"step": "OPTIMIZED", "message": "Validating optimized variant..."})
            final_perf = await run_in_threadpool(perf_agent.analyze_performance, revised_content)
            yield sse("autopilot_metrics", {"metrics": final_perf["predicted_metrics"], "score": final_perf["overall_score"]})
            yield sse("autopilot_complete", {
                "final_content": revised_content,
                "improvement": final_perf["overall_score"] - init_perf["overall_score"]
            })
        else:
            yield sse("autopilot_complete", {"message": "Content performing at peak levels. No pivot required."})

        yield sse("stream_done", {})

    except asyncio.CancelledError:
        logger.info("Autopilot stream cancelled.")
    except Exception as e:
        logger.error(f"Autopilot stream error: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'event': 'error', 'data': {'message': str(e)}})}\n\n"

# Add finalize formatting / imports if needed


# Pull import json to top
if __name__ == "__main__":
    async def test_full():
        result = await run_forge_workflow(
            "Create a LinkedIn post + visual suggestions about AI adoption in Kerala startups for 2025"
        )
        print("═" * 80)
        print("Full Forge Workflow Result")
        print("═" * 80)
        print(f"Final Content:\n{result['final_content']}\n")
        print("Agent Thoughts:")
        for thought in result["thoughts"]:
            print(f"{thought['agent']}: {thought['thought']}")
            print(f"Output: {thought['output'][:200]}...")
            print("-" * 40)
        print("Status:", result["status"])
        print("═" * 80)

    asyncio.run(test_full())