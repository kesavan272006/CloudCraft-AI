# CloudCraft AI: System Design Document
**Architecture:** Highly Decoupled Multi-Agent System (MAS)  
**Philosophy:** Content is a Mission, not a static block of text.

---

## 1. Architectural Overview
CloudCraft AI is built on a **Modern Agentic Architecture**. Instead of a single LLM call, we use a "Chain of Intelligence" where localized agents handle specific portions of the content lifecycle.

### High-Level Data Flow:
1. **The Forge:** Raw user prompt enters the multi-agent supervisor.
2. **Bedrock Orchestration:** Supervisor delegates tasks to **Researcher**, **Copywriter**, and **Compliance** agents.
3. **The Oracle:** Content is evaluated against a 1-100 performance model.
4. **The Nexus:** A scheduling mission is submitted to **AWS EventBridge**.
5. **The Dispatcher:** At the scheduled triggert, AWS wakes up the Dispatcher Agent to perform a final audit and push to the **Execution Bridge (Webhook)**.

---

## 2. Component Design

### A. Agentic Intelligence (Amazon Bedrock)
*   **Engine:** We utilize the Bedrock Converse API to maintain stateful conversations between agents.
*   **Resilience:** The system implements "Model-Switching" logic; if one model is throttled, it automatically switches to another (e.g., Nova-Lite to Llama 3) to ensure 100% availability.

### B. Autonomous Timing (AWS EventBridge Scheduler)
*   **Mechanism:** We use "One-time Schedules" in EventBridge.
*   **Why AWS:** Traditional cron jobs require an always-on server. By using EventBridge, CloudCraft AI becomes a truly **Serverless** platform, only consuming compute resources at the exact second a post is scheduled to fire.

### C. Persona Engine
*   **Vector Logic:** Each persona (Gen-Z, Professional, etc.) has a unique prompt modifier that adjusts the linguistic parameters (Hinglish/formal/casual) and platform-specific formatting rules.

---

## 3. Tech Stack Selection

*   **Intelligence:** **Amazon Bedrock** (Nova-Lite, Llama 3) for its speed and regional language understanding.
*   **Automation:** **AWS EventBridge Scheduler** for scalable, decoupled mission execution.
*   **Backend:** **FastAPI (Python)** for its high-performance asynchronous support.
*   **Frontend:** **React + Vite** with a high-fidelity "Glassmorphism" design to demonstrate a "Winning" UI/UX.

---

## 4. Competitive Moat: Why We Win
CloudCraft AI goes beyond simple generation by solving three critical "Media & Content" gaps:
1. **The Autonomy Moat:** While others "schedule," we "dispatch." Using **AWS EventBridge**, our system remains active even when the user is offline.
2. **The Predictive Moat:** Our **Performance Oracle** creates a feedback loop, ensuring creators don't post blindly.
3. **The Cultural Moat:** Deep linguistic mapping for **Bharat locales** (Hinglish/Tamil) ensures local relevance, a key requirement for the "AI for Bharat" track.

## 5. Security & Scalability
*   **IAM-First Design:** All AWS interactions are governed by granular IAM policies, ensuring that the "Nexus" can only access the specific scheduling resources it needs.
*   **Stateless Scaling:** The entire backend is designed to be hosted on **AWS Lambda** or **AWS App Runner**, allowing for infinite horizontal scaling as the Indian creator userbase grows.

---

## 5. Future Roadmap
*   **The Synapse:** Integrating **Amazon OpenSearch** for vector-based "Brand Memory," allowing the AI to learn from the user's past successes.
*   **V-Lab:** Expanding the Vision capabilities to include autonomous **Amazon Nova Reel** video generations.
