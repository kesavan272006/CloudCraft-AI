from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.agents.supervisor import run_forge_workflow

router = APIRouter(prefix="/forge", tags=["forge"])

class ForgeRequest(BaseModel):
    prompt: str

class ForgeResponse(BaseModel):
    final_content: str
    thoughts: list[dict[str, str]]
    status: str

@router.post("/", response_model=ForgeResponse)
async def generate_content(request: ForgeRequest):
    try:
        result = await run_forge_workflow(user_prompt=request.prompt)
        return ForgeResponse(
            final_content=result["final_content"],
            thoughts=result["thoughts"],
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))