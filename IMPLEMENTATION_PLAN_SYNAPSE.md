# Implementation Plan - The Synapse (Brand Memory) 🧠

**The Diagnosis**: The app has powerful tools (Genesis) but no memory. You have to re-type who you are every time. The "Brand Brain" page is currently a static mockup.
**The Solution**: Implement "The Synapse" — a persistent Brand Memory layer that connects the **Brand Brain** to the **Genesis Engine**.

## Proposed Changes

### 1. State Management (The Memory)
#### [NEW] [brand-store.ts](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/stores/brand-store.ts)
- Create a persistent Zstand store (`useBrandStore`).
- **Fields**:
    - `brandName`: string
    - `brandDescription`: string (The "Core Truth" of the brand)
    - `brandVoice`: string (e.g., "Professional", "Witty", "Empathetic")
    - `targetAudience`: string

### 2. Brand Brain (The Input)
#### [MODIFY] [brand_brain/index.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/routes/_authenticated/brand_brain/index.tsx)
- **Make it Real**: Replace the dummy "Upload" section with a **"Brand Identity Form"**.
- **Fields**: Input fields for Name, Description, Voice.
- **Action**: "Save to Memory" button that writes to `brand-store`.

### 3. Genesis Engine (The Connection)
#### [MODIFY] [GenesisCanvas.tsx](file:///c:/Users/tharu/hackathons/CloudCraft%20AI/CloudCraft-AI-1/frontend/src/features/genesis/GenesisCanvas.tsx)
- **Auto-Fill**: On load, check `useBrandStore`.
- **UI Update**: If a brand is set, show a badge: *"⚡ Generating for [Brand Name]"*.
- **Prompt Injection**:
    - When sending `/start` request, append the Brand Context to the `input_source`.
    - *Example Input*: `[User Input URL] + "\n\nCONTEXT: Brand is [Name]. Voice is [Voice]. Desc: [Desc]"`

## Verification Plan
1.  **Set Identity**:
    - Go to **Brand Brain**.
    - Enter:
        - **Name**: "CloudCraft AI"
        - **Voice**: "Visionary & Tech-Forward"
        - **Desc**: "An AI tool for indian hackathons."
    - Click **Save**.
2.  **Verify Memory**: Refresh the page. Data should persist.
3.  **Test Genesis**:
    - Go to **Campaign Architect**.
    - See badge: *"⚡ Active Identity: CloudCraft AI"*.
    - Input: "Launch post".
    - **Expectation**: The generated content should mention "CloudCraft AI" and use "Visionary" tone *automatically*, without me typing it in the prompt.
