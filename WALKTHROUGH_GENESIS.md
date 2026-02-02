# Walkthrough - The Genesis Engine

I have implemented **The Genesis Engine**, a recursive campaign generation system that creates a complete marketing ecosystem from a single input.

## Features Implemented

### 1. The Infinity Canvas (`/genesis`)
- **Visual Node Graph**: Integrating `reactflow` to visualize the campaign strategy and assets.
- **Input Source**: A search bar to input a URL, PDF link, or product description.
- **Asset Nodes**: Dynamic cards showing the status (Generating/Ready) and platform (Twitter, LinkedIn, etc.).

### 2. Recursive Generation (`GenesisService`)
- **Marketing Strategist Agent**: Analyzes the input and creates a high-level `Campaign Strategy`.
- **Parallel Asset Spawning**: Automatically triggers generation for 5 key channels:
    - Twitter Thread
    - LinkedIn Post
    - Email Sequence
    - Instagram Visual Brief
    - TikTok Script

### 3. The "Trend-Jack" Button
- **Real-Time Adaptation**: A floating dock detects a "Live Trend" (Mocked as 'Barbie Movie' for the demo).
- **One-Click Refactor**: Clicking "Inject Trend" rewrites the potentially boring corporate content into something viral and on-trend.

## How to Verify

1.  **Navigate to Genesis**: Click **"Campaign Architect"** in the sidebar (or go to `/campaign-architect`).
2.  **Start a Campaign**:
    - Enter a text like: *"New AI Coffee Machine that predicts what you want to drink."*
    - Click **Ignite Genesis**.
3.  **Watch the Explosion**:
    - See the "Sources" node spawn a "Strategy" node.
    - See the "Strategy" node fan out into 5 Asset nodes.
    - Watch them turn from "Generating..." to "Ready" with real content.
4.  **Trend Jack It**:
    - Wait for the "Trend Dock" to appear in the bottom right.
    - Click **"Inject Trend 'Barbie'"**.
    - Watch the nodes update their content to be pink, plastic, and fantastic.
5.  **Bharat Tuner 🌏**:
    - Click the **"Tune Dialect"** button (next to Ignite).
    - Select **"Hinglish"** or **"Tanglish"**.
    - Watch the content rewrite with local slang!

## Technical Details
- **Backend**: `FastAPI` + `AsyncUtils` for non-blocking generation.
- **Frontend**: `React Flow` for the interactive graph.
- **AI**: Uses `MarketingStrategistAgent` (mocked with BaseAgent for speed) to generate text.
