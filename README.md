---
title: CloudCraft AI Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# CloudCraft-AI

CloudCraft-AI is a powerful multi-agent AI system designed for content creation, marketing strategy, and brand management.

## 🚀 Deployment Status
This repository is configured to automatically sync with **Hugging Face Spaces**.

### Backend Configuration
- **Framework:** FastAPI
- **Agents:** LangChain + Multi-Agent Orchestration
- **Deployment:** Docker
- **Port:** 7860 (Hugging Face Default)

## 🛠️ Tech Stack
- **Python 3.11**
- **FastAPI** for the REST API
- **LangChain & LangGraph** for agent orchestration
- **ChromaDB** for vector storage
- **Docker** for containerization

## 📂 Project Structure
- `/backend`: Contains the FastAPI application and AI agent logic.
- `/frontend`: Contains the user interface (if applicable).
- `.github/workflows`: Contains the sync script for Hugging Face.

## 🔑 Environment Variables
To run this project, you must set the following secrets in your Hugging Face Space Settings:
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- (Add any other keys your .env.example requires)

---
*Maintained by Kesavan2006*
