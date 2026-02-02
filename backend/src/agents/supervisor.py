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

# State
class AgentState(dict):
    messages: Annotated[list[BaseMessage], "add_messages"]
    next_agent: str
    final_output: str | None = None
    thought_history: list[dict[str, str]]

# Strict supervisor prompt
SUPERVISOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
You are the Supervisor Brain Agent in CloudCraft AI.
You coordinate exactly 4 agents: Researcher, Copywriter, Designer, Compliance.

STRICT RULES - MUST FOLLOW OR SYSTEM FAILS:
- Respond with **EXACTLY** these two lines and NOTHING ELSE:
NEXT: Researcher
or NEXT: Copywriter
or NEXT: Designer
or NEXT: Compliance
or NEXT: FINISH

REASON: [one short sentence]

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
You are ONLY allowed to reply with EXACTLY these two lines and NOTHING ELSE:
NEXT: Researcher
or NEXT: Copywriter
or NEXT: Designer
or NEXT: Compliance
or NEXT: FINISH
REASON: [one short sentence max 10 words]
NO other text allowed. NO explanations. NO content. NO repeating messages.
Violating this destroys the system.
User prompt: {task}
    """),
    MessagesPlaceholder(variable_name="messages"),
])

# Robust router
def supervisor_router(state: AgentState) -> Literal["researcher", "copywriter", "designer", "compliance", "__end__"]:
    if not state["messages"]:
        return "__end__"

    last = state["messages"][-1].content.strip().upper()

    if "FINISH" in last or "END" in last or "DONE" in last:
        return "__end__"

    if "RESEARCHER" in last:
        return "researcher"
    if "COPYWRITER" in last:
        return "copywriter"
    if "DESIGNER" in last:
        return "designer"
    if "COMPLIANCE" in last:
        return "compliance"

    # Fallback for first step
    if len(state["messages"]) <= 2:
        return "researcher"
    # Force final compliance if we have enough steps (prevents early end)
    if len(state["messages"]) >= 6:  # after ~3 agents
        logger.info("Forcing final compliance check")
        return "compliance"
    logger.warning(f"Router failed to parse: {last[:100]}... → ending")
    return "__end__"

# Supervisor Agent
class SupervisorAgent(BaseAgent):
    name = "Supervisor"
    description = "Brain Agent that coordinates all other agents"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.llm = LLMFactory.get_default_llm()  # Bedrock

    async def decide_next(self, state: AgentState) -> AgentState:
        chain = SUPERVISOR_PROMPT | self.llm

        response = await chain.ainvoke({
            "task": state["messages"][0].content,
            "messages": state["messages"],
        })

        state["messages"].append(AIMessage(content=response.content))
        logger.info(f"Supervisor decided: {response.content.strip()}")
        return state

# Build graph
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
        state["messages"].append(AIMessage(content=f"Researcher: {result.output}"))
        return state

    async def run_copywriter(state: AgentState) -> AgentState:
        context = "\n".join([m.content for m in state["messages"] if "Researcher" in m.content])
        result = await copywriter.async_run(state["messages"][0].content, context=context)
        state["thought_history"].append({"agent": "Copywriter", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Copywriter: {result.output}"))
        return state

    async def run_designer(state: AgentState) -> AgentState:
        context = "\n".join([m.content for m in state["messages"] if "Researcher" in m.content or "Copywriter" in m.content])
        result = await designer.async_run(state["messages"][0].content, context=context)
        state["thought_history"].append({"agent": "Designer", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Designer: {result.output}"))
        return state

    async def run_compliance(state: AgentState) -> AgentState:
        content = "\n".join([m.content for m in state["messages"] if "Researcher" in m.content or "Copywriter" in m.content or "Designer" in m.content])
        result = await compliance.async_run(state["messages"][0].content, content=content)
        state["thought_history"].append({"agent": "Compliance", "thought": result.thought, "output": result.output})
        state["messages"].append(AIMessage(content=f"Compliance: {result.output}"))
        state["final_output"] = result.output
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


# Run full workflow
async def run_forge_workflow(
    user_prompt: str,
    thread_id: str = "default_thread"
) -> dict:
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

    return {
        "final_content": (
            current_state.get("final_output") or
            current_state["messages"][-1].content if current_state["messages"] else
            "Workflow completed. No final content generated due to early termination."
        ),
        "thoughts": current_state.get("thought_history", []),
        "status": "success" if current_state.get("final_output") else "partial"
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