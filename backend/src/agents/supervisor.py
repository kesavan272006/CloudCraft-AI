import asyncio
from typing import Annotated, Literal
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
    thread_id: str = "default_thread"
) -> dict:
    # CRITICAL DEBUG: Log the exact user prompt received
    logger.info(f"=" * 80)
    logger.info(f"[FORGE WORKFLOW START] User prompt received:")
    logger.info(f"{user_prompt}")
    logger.info(f"=" * 80)
    
    config = {"configurable": {"thread_id": thread_id}}

    initial_state: AgentState = {
        "messages": [HumanMessage(content=user_prompt)],
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


# Full test
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