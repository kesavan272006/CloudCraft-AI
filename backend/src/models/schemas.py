from pydantic import BaseModel
from typing import List, Dict, Optional

class AgentThought(BaseModel):
    agent: str
    thought: str
    output: str

class ForgeResponse(BaseModel):
    final_content: str
    thoughts: List[AgentThought]
    status: str