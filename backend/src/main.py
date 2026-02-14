import os
try:
    from dotenv import load_dotenv
    load_dotenv()
    print(f"Environment variables loaded. AWS Key present: {'AWS_ACCESS_KEY_ID' in os.environ}")
except ImportError:
    print("Warning: python-dotenv not installed. Environment variables might be missing.")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.endpoints import forge, vision, genesis, competitor, oracle, scout, brand, campaign, persona, performance, calendar, nexus

app = FastAPI(
    title="CloudCraft AI Backend",
    description="Agentic content creation API for AI for Bharat Hackathon",
    version="0.1.0",
)

# Allow frontend (Vite on port 5173, 5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(forge.router, prefix="/api/v1", tags=["Forge"])
app.include_router(vision.router, prefix="/api/v1/vision", tags=["Vision Lab"])
app.include_router(genesis.router, prefix="/api/v1/genesis", tags=["Genesis Engine"])
app.include_router(competitor.router, prefix="/api/v1/competitor", tags=["Competitor Pulse"])
app.include_router(oracle.router, prefix="/api/v1/oracle", tags=["Performance Oracle"])
app.include_router(scout.router, prefix="/api/v1/scout", tags=["Local Scout"])
app.include_router(brand.router, prefix="/api/v1/brand", tags=["Brand Brain"])
app.include_router(campaign.router, prefix="/api/v1/campaigns", tags=["Campaign Architect"])
app.include_router(persona.router, tags=["Persona Engine"])
app.include_router(performance.router, prefix="/api/v1/performance", tags=["Performance Prediction"])
app.include_router(calendar.router, prefix="/api/v1/calendar", tags=["Content Calendar"])
app.include_router(nexus.router, prefix="/api/v1/nexus", tags=["Nexus Alpha"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": ["Researcher", "Copywriter", "Designer", "Compliance"]}