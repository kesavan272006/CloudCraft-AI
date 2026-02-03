from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.endpoints import forge, vision, genesis, competitor, oracle, scout

app = FastAPI(
    title="CloudCraft AI Backend",
    description="Agentic content creation API for AI for Bharat Hackathon",
    version="0.1.0",
)

# Allow frontend (Vite on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(forge.router, prefix="/api/v1")
app.include_router(vision.router, prefix="/api/v1")
app.include_router(genesis.router, prefix="/api/v1")
app.include_router(competitor.router, prefix="/api/v1/competitor", tags=["Competitor Pulse"])
app.include_router(oracle.router, prefix="/api/v1/oracle", tags=["Performance Oracle"])
app.include_router(scout.router, prefix="/api/v1/scout", tags=["Local Scout"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": ["Researcher", "Copywriter", "Designer", "Compliance"]}