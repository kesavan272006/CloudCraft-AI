# Implementation Plan - The Genesis Engine

The Genesis Engine is a feature that allows users to input a single URL/PDF and automatically generate a complete, multi-platform content marketing ecosystem in a visual node graph.

## Proposed Changes

### Backend
#### [NEW] [genesis.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/api/v1/endpoints/genesis.py)
- New API Routes:
    - `POST /genesis/start`: Accepts source URL/Content which triggers the graph generation.
    - `POST /genesis/trend-jack`: Accepts `process_id` and `trend`, triggers re-generation.
    - `GET /genesis/{process_id}`: Polling endpoint for graph updates (nodes adding/updating).

#### [NEW] [genesis_service.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/services/genesis_service.py)
- `GenesisService` class:
    - Orchestrates the creation of the node graph.
    - Mock "TrendScraper" logic (returns random trending topics/styles).
    - Logic to spawn `MarketingStrategist` and downstream `Copywriter`/`Designer` agents.

#### [NEW] [marketing_strategist_agent.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/agents/marketing_strategist_agent.py)
- Extends `BaseAgent`.
- Role: Analyzes raw input (URL/Text) and outputs a *Campaign Strategy* (Target Audience, USPs, Key Messages).
- This strategy guides the other agents.

#### [MODIFY] [main.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/main.py)
- Register `genesis` router.

### Frontend
#### [NEW] [GenesisCanvas.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/features/genesis/GenesisCanvas.tsx)
- Main Component.
- Uses `reactflow` to render the interactive graph.
- Handles WebSocket/Polling updates from backend.
- "Trend Jack" button and "Source Input" modal.

#### [NEW] [AssetNode.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/features/genesis/nodes/AssetNode.tsx)
- Custom Node component for React Flow.
- Displays Status (Loading/Complete), Platform Icon (Twitter/Insta), and a mini-preview.

#### [NEW] [GenesisPage.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/routes/_authenticated/genesis/index.tsx)
- Route wrapper for the canvas.

#### [MODIFY] [routeTree.gen.ts](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/routeTree.gen.ts)
- (Auto-generated usually, but making sure the route is added).

## Verification Plan

### Automated Tests
- N/A for this hackathon speed-run.

### Manual Verification
1.  **Navigate to `/genesis`**.
2.  **Input a test URL** (e.g., a dummy product page).
3.  **Verify Graph Expansion**: Confirm nodes appear dynamically (Strategy -> Tweets/Reels).
4.  **Verify Content**: Click nodes to see if real text/image prompts are generated.
5.  **Test Trend Jack**: Click "Trend Jack", select a trend, and verify nodes update with new content style (e.g., "Barbie" style).
