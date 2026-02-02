# Implementation Plan - The "Bharat-Tuner" 🌏

The **Bharat-Tuner** is a hyper-localization value-add for the Genesis Engine. It allows users to instantly rewrite generated content into specific Indian cultural dialects, making it distinguishable from generic "ChatGPT English".

## Proposed Changes

### Backend
#### [MODIFY] [genesis.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/api/v1/endpoints/genesis.py)
- **New Endpoint**: `POST /genesis/tune`
    - Payload: `{ "process_id": str, "dialect": str, "node_id": optional[str] }`
    - Trigger: Rewrites content using the `MarketingStrategist` with a specific "Cultural Persona" prompt.

#### [MODIFY] [genesis_service.py](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/backend/src/services/genesis_service.py)
- **Method**: `tune_campaign(process_id, dialect)`
- **Logic**:
    - Iterate through all text assets.
    - Apply a "Dialect Layer" prompt:
        - *Hinglish*: "Mix Hindi words (yaar, boss, jugaad) naturally. Use Roman script."
        - *Tanglish*: "Mix Tamil slang (Macha, Gethu, Semma). Use Roman script."
        - *Bengaluru Tech*: "Use startup jargon (pivot, synergy, bandwidth) + casual tone."
        - *Corporate*: "Standard Professional English."

### Frontend
#### [MODIFY] [GenesisCanvas.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/features/genesis/GenesisCanvas.tsx)
- **UI Element**: "Regional Tuner" Dropdown in the top controls (next to the input).
- **Options**:
    - 🇮🇳 Global English (Default)
    - 🏙️ Hinglish (North India)
    - 🌴 Tanglish (Tamil Nadu)
    - 💻 Bengaluru Start-up (Tech)
    - 🕴️ Formal Corporate
- **Action**: Selecting a dialect triggers a toast "Applying Cultural Layer..." and calls the `/tune` endpoint.

#### [MODIFY] [AssetNode.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/features/genesis/nodes/AssetNode.tsx)
- **Visual Cue**: Add a small badge showing the active dialect (e.g., "🇮🇳 Hinglish") if tuned.

## Verification Plan
1.  **Input**: "Selling a used MacBook Pro."
2.  **Generate**: Standard English output.
3.  **Tune**: Select "Hinglish".
4.  **Verify**: Output changes to *"Bhai, selling my MacBook Pro. Condition ekdum mint hai. Price negotiable."*
5.  **Tune**: Select "Bengaluru Tech".
6.  **Verify**: Output changes to *"Sunseting my MacBook Pro. It's fully optimized. DM for synergy."*
