---
title: CloudCraft Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---


# CloudCraft AI — Backend

> **Agentic Multi-Agent Orchestration Engine**  
> FastAPI-powered backend for autonomous content intelligence and generation

---

## 🎯 Overview

The CloudCraft AI backend is a **high-performance, asynchronous FastAPI server** that orchestrates a squad of specialized AI agents. Each agent is responsible for a specific part of the content lifecycle:

- 🔬 **Research** — Trend analysis and competitor intelligence
- ✍️ **Copywriting** — Hook and caption generation
- 🎨 **Design** — Visual concept creation
- ✅ **Compliance** — Brand guideline enforcement
- 🔄 **Transmutation** — Multi-platform content adaptation
- 🎬 **Video Generation** — Text-to-video synthesis
- 🔮 **Oracle** — Engagement prediction
- 📊 **Performance** — Analytics and insights

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip or pip-tools
- AWS Account (for Bedrock, DynamoDB, S3)
- API Keys (OpenAI, Google Gemini, Tavily)

### Installation

#### 1. Clone & Navigate
```bash
git clone https://github.com/kesavan272006/cloudcraft-ai.git
cd cloudcraft-ai/backend
```

#### 2. Create Virtual Environment
```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Set Environment Variables
Create a `.env` file in the `backend/` directory:

```env
# ─── AWS Configuration ───
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# ─── LLM Configuration ───
# Amazon Bedrock (Primary)
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Google Gemini
GOOGLE_API_KEY=your-google-api-key

# Tavily Search
TAVILY_API_KEY=your-tavily-api-key

# ─── Authentication ───
CLERK_SECRET_KEY=your_clerk_secret

# ─── Database ───
DYNAMODB_TABLE_PREFIX=CloudCraft

# ─── Server Configuration ───
PORT=8000
HOST=0.0.0.0
```

#### 5. Run Server
```bash
python src/main.py
```

Server runs at `http://localhost:8000`

**API Docs:** http://localhost:8000/docs (Swagger UI)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.py                           # FastAPI app entry point
│   ├── agents/                           # Multi-agent orchestration
│   │   ├── __init__.py
│   │   ├── base_agent.py                 # Abstract base class for all agents
│   │   ├── researcher_agent.py           # Trend & competitor research
│   │   ├── copywriter_agent.py           # Hook & caption generation
│   │   ├── designer_agent.py             # Visual concept generation
│   │   ├── compliance_agent.py           # Brand guideline checking
│   │   ├── transmuter_agent.py           # Multi-format adaptation
│   │   ├── content_creator_agent.py      # Content assembly
│   │   ├── marketing_strategist_agent.py # Strategy & analytics
│   │   ├── performance_agent.py          # Performance analysis
│   │   ├── persona_agent.py              # Persona management
│   │   ├── competitor_analyst_agent.py   # Competitor analysis
│   │   ├── dispatcher_agent.py           # Task distribution
│   │   └── supervisor.py                 # Agent orchestration & coordination
│   │
│   ├── api/                              # REST API endpoints
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── forge.py              # /api/v1/forge/* multi-agent endpoints
│   │           ├── vision.py             # /api/v1/vision/* image/video endpoints
│   │           ├── genesis.py            # /api/v1/genesis/* campaign gen
│   │           ├── competitor.py         # /api/v1/competitor/* competitor analysis
│   │           ├── oracle.py             # /api/v1/oracle/* engagement prediction
│   │           ├── scout.py              # /api/v1/scout/* trend discovery
│   │           ├── brand.py              # /api/v1/brand/* brand management
│   │           ├── campaign.py           # /api/v1/campaign/* campaign ops
│   │           ├── persona.py            # /api/v1/persona/* persona management
│   │           ├── performance.py        # /api/v1/performance/* analytics
│   │           ├── calendar.py           # /api/v1/calendar/* scheduling
│   │           ├── dashboard.py          # /api/v1/dashboard/* dashboard data
│   │           └── nexus.py              # /api/v1/nexus/* platform integration
│   │
│   ├── services/                         # Business logic & integrations
│   │   ├── __init__.py
│   │   ├── aws_service.py                # AWS services (EventBridge, Lambda, etc.)
│   │   ├── brand_service.py              # Brand profile management
│   │   ├── campaign_service.py           # Campaign management
│   │   ├── competitor_service.py         # Competitor research service
│   │   ├── genesis_service.py            # Campaign generation orchestration
│   │   ├── media_services.py             # Image/video generation
│   │   ├── oracle_service.py             # Engagement prediction
│   │   ├── performance_service.py        # Performance analytics
│   │   ├── persona_service.py            # Persona management
│   │   ├── calendar_service.py           # Content calendar
│   │   ├── scout_service.py              # Trend discovery
│   │   └── videoService.py               # Video generation wrapper
│   │
│   ├── models/                           # Data models & schemas
│   │   ├── __init__.py
│   │   └── schemas.py                    # Pydantic models for requests/responses
│   │
│   ├── core/                             # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py                     # Settings & environment variables
│   │   ├── llm_factory.py                # LLM provider factory pattern
│   │   └── personas.py                   # Predefined personas
│   │
│   └── utils/                            # Utilities
│       ├── __init__.py
│       └── logger.py                     # Logging configuration
│
├── data/                                 # Data files
│   └── oracle_history.json               # Historical engagement data
│
├── .env.example                          # Example environment configuration
├── .gitignore                            # Git ignore rules
├── Dockerfile                            # Docker container image
├── requirements.txt                      # Python dependencies (THIS FILE)
├── README.md                             # Backend documentation (THIS FILE)
└── test_env_vars.py                      # Environment variable validation script
```

---

## 🛠️ Tech Stack

### Core Framework
- **FastAPI** `>=0.104.0` — Async web framework
- **Uvicorn** `>=0.24.0` — ASGI server
- **Pydantic** `>=2.0.0` — Data validation

### AI/ML & LLMs
- **LangChain** `>=0.1.0` — LLM framework & orchestration
- **LangChain-OpenAI** — OpenAI integration
- **LangChain-Google-GenAI** — Google Gemini integration
- **LangChain-AWS** — AWS Bedrock integration
- **LangChain-HuggingFace** — HuggingFace models

### Cloud & Infrastructure
- **Boto3** `>=1.28.0` — AWS SDK
- **AWS Services:**
  - Bedrock (Foundation Models)
  - Lambda (Serverless compute)
  - DynamoDB (NoSQL database)
  - S3 (Object storage)
  - EventBridge (Event scheduling)

### Vector Database
- **ChromaDB** `>=0.4.0` — Vector storage for embeddings
- **Sentence-Transformers** `>=2.2.0` — Embedding generation

### Tools & Utilities
- **Tavily** — Web search integration
- **Requests/httpx** — HTTP client
- **PyPDF** — PDF processing
- **Pillow** — Image processing
- **Jinja2** — Template rendering
- **PyJWT** — Token handling

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Core Endpoints

#### **The Forge** (Multi-Agent Orchestration)
```
POST   /forge/generate          # Generate campaign with all agents
POST   /forge/research          # Researcher agent only
POST   /forge/copywrite         # Copywriter agent only
POST   /forge/visualize         # Designer agent only
GET    /forge/status/{task_id}  # Check task status
```

#### **Vision** (Image/Video)
```
POST   /vision/generate-image   # Generate images with prompts
POST   /vision/generate-video   # Generate videos from scripts
POST   /vision/analyze-image    # Analyze image aesthetics
```

#### **Genesis** (Campaign Generation)
```
POST   /genesis/create-campaign # Full campaign generation
POST   /genesis/batch-create    # Batch campaign creation
GET    /genesis/campaigns       # List campaigns
GET    /genesis/campaigns/{id}  # Get campaign details
```

#### **Oracle** (Engagement Prediction)
```
POST   /oracle/predict          # Predict engagement score
POST   /oracle/batch-predict    # Batch prediction
GET    /oracle/history          # Historical predictions
```

#### **Scout** (Trend Discovery)
```
POST   /scout/discover-trends   # Find trending topics
POST   /scout/competitor-watch  # Monitor competitors
GET    /scout/trends            # View discovered trends
```

#### **Brand** (Brand Management)
```
POST   /brand/create            # Create brand profile
POST   /brand/update            # Update brand guidelines
GET    /brand/profile           # Get brand profile
POST   /brand/guidelines        # Update brand guidelines
```

#### **Campaign** (Campaign Management)
```
POST   /campaign/schedule       # Schedule content
POST   /campaign/publish        # Publish to platforms
GET    /campaign/calendar       # Content calendar
GET    /campaign/analytics      # Campaign analytics
```

#### **Persona** (Persona Management)
```
GET    /persona/list            # List all personas
GET    /persona/{persona_id}    # Get persona details
POST   /persona/apply           # Apply persona to content
```

#### **Performance** (Analytics)
```
GET    /performance/dashboard   # Performance metrics
GET    /performance/trends      # Performance trends
POST   /performance/analyze     # Analyze performance
```

---

## 🔐 Authentication

### Clerk Integration
The backend uses Clerk for authentication:

```python
# Extract token from request
token = request.headers.get("Authorization").replace("Bearer ", "")

# Verify with Clerk (implement in middleware)
from clerk_sdk import decode_token
verified_user = decode_token(token)
```

### Environment Setup
```env
CLERK_SECRET_KEY=your_clerk_secret_key
```

---

## 📡 Agent Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Supervisor Agent                         │
│            (Orchestration & Coordination)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │Researcher│     │Copywriter│    │Designer │
    │ Agent   │     │ Agent   │    │ Agent   │
    └────┬────┘      └────┬────┘     └────┬────┘
         │                │               │
         └────────────────┼───────────────┘
                          │
                  ┌───────▼────────┐
                  │ Transmuter     │
                  │ Agent          │
                  │ (Format Conv.) │
                  └───────┬────────┘
                          │
                    ┌─────▼─────┐
                    │ Compliance │
                    │ Agent      │
                    └─────┬──────┘
                          │
                  ┌───────▼────────┐
                  │ Output Ready   │
                  │ for Publishing │
                  └────────────────┘
```

---

## 🧪 Development & Testing

### Install Development Dependencies
```bash
pip install -r requirements-dev.txt  # Optional, for dev tools
```

### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_agents.py

# Run with verbose output
pytest -v
```

### Code Quality
```bash
# Format code
black src/

# Check linting
flake8 src/

# Type checking
mypy src/

# Sort imports
isort src/
```

### Environment Validation
```bash
python test_env_vars.py
```

---

## 📊 Database Schema

### DynamoDB Tables

#### `CloudCraft-Brand-Identity`
Stores brand profiles and guidelines
```
PK: brand_id (String)
SK: version (Number)
- brand_name (String)
- guidelines (JSON)
- voice_tone (String)
- target_audience (JSON)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### `CloudCraft-Campaigns`
Stores generated campaigns
```
PK: campaign_id (String)
SK: created_at (Timestamp)
- content (JSON)
- status (String)
- metrics (JSON)
- published_at (Timestamp)
```

#### `CloudCraft-Oracle-History`
Stores engagement predictions
```
PK: prediction_id (String)
SK: timestamp (Timestamp)
- predicted_engagement (Number)
- actual_engagement (Number)
- accuracy (Number)
```

---

## 🔧 Configuration

### Settings Management
Configuration is handled through `src/core/config.py` using Pydantic Settings:

```python
from src.core.config import settings

# Access settings
bedrock_model = settings.BEDROCK_MODEL_ID
aws_region = settings.AWS_REGION
```

### LLM Factory
Choose LLM providers dynamically:

```python
from src.core.llm_factory import LLMFactory

# Get Claude from Bedrock
llm = LLMFactory.get_llm("bedrock", model_id="claude-3-sonnet")

# Get GPT-4 from OpenAI
llm = LLMFactory.get_llm("openai", model="gpt-4")

# Get Gemini
llm = LLMFactory.get_llm("gemini", model="gemini-pro")
```

---

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t cloudcraft-ai-backend .

# Run container
docker run -p 8000:8000 \
  -e AWS_ACCESS_KEY_ID=xxx \
  -e AWS_SECRET_ACCESS_KEY=xxx \
  cloudcraft-ai-backend
```

### AWS Lambda
```bash
# Package for Lambda
pip install -t ./package -r requirements.txt
cd package && zip -r ../lambda.zip . && cd ..
zip lambda.zip -r src/

# Deploy with AWS CLI
aws lambda create-function \
  --function-name cloudcraft-ai \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-role \
  --handler src.main.handler \
  --zip-file fileb://lambda.zip
```

### AWS ECS/Fargate
See `.env.example` and `Dockerfile` for containerization setup.

---

## 🔍 Logging

Logging is configured in `src/utils/logger.py`:

```python
from src.utils.logger import get_logger

logger = get_logger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical error")
```

Logs can be sent to CloudWatch for centralized monitoring.

---

## 📝 Contributing

### Code Style
- **Formatter:** Black
- **Linter:** Flake8
- **Type Checker:** mypy
- **Import Sorter:** isort

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/agent-optimization

# Commit with conventional commits
git commit -m "feat(agents): optimize supervisor dispatch"

# Push and create PR
git push origin feature/agent-optimization
```

---

## 🐛 Troubleshooting

### Issue: AWS Credentials Not Found
**Solution:**
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

### Issue: Bedrock Model Not Available
**Solution:** Ensure your AWS region supports Bedrock and you have access to the model.

### Issue: Import Errors
**Solution:**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Issue: Async Task Timeout
**Increase timeout in agent configuration**

---

## 📚 API Documentation

Interactive API docs available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🎯 Performance Tips

1. **Use ChromaDB for caching** — Reduces redundant LLM calls
2. **Enable batch processing** — Process multiple items at once
3. **Monitor Lambda cold starts** — Use provisioned concurrency
4. **Optimize prompts** — Shorter prompts = faster responses
5. **Cache brand guidelines** — Reduce database queries

---

## 📄 License

MIT License — See [LICENSE](../LICENSE) for details

---

## 💬 Support

- 📧 **Email:** support@cloudcraft-ai.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/kesavan272006/cloudcraft-ai/issues)
- 📖 **Docs:** [API Documentation](../docs/API.md)

---

## 🙏 Credits

Built with ❤️ by Kesavan & team using:
- [FastAPI](https://fastapi.tiangolo.com)
- [LangChain](https://langchain.com)
- [AWS](https://aws.amazon.com)

---

<div align="center">

**Powering AI agents. Enabling creators. Building the future.**

[⬆ Back to Top](#cloudcraft-ai--backend)

</div>
