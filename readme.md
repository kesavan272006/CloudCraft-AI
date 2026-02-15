# CloudCraft AI

> **The Agentic Command Center for Content Intelligence**  
> *Transforming digital storytelling from trial-and-error into a data-driven, high-impact autonomous workflow.*


---

## 🎯 Vision

In the creator economy, success is measured by engagement and impact. CloudCraft AI reimagines content creation by deploying a **collaborative squad of specialized AI agents** that understand your brand, audience, and local trends. From research to final delivery, every piece of content is optimized for maximum resonance.

**Built for creators in Bharat** — with deep understanding of local cultural nuances, viral trends, and brand voice consistency.

---

## 🚀 What is CloudCraft AI?

CloudCraft AI is an **Autonomous AI-Powered Content Intelligence Platform** that manages the entire content lifecycle through a unified, agentic workflow. It moves beyond simple automation into **Autonomous Content Intelligence**, creating a closed-loop ecosystem that learns from performance data.

### The Problem We Solve
- ❌ Content creation is time-consuming and inconsistent
- ❌ Trial-and-error approach wastes resources
- ❌ Lack of data-driven insights for optimization
- ❌ Difficulty maintaining brand consistency across platforms

### The Solution
A **multi-agent system** that orchestrates research, creation, design, compliance, and distribution—all working in perfect harmony to deliver high-impact content.

---

## ⚙️ Core Features: The Agentic Ecosystem

### **🔬 The Forge (Multi-Agent Orchestration)**
A collaborative squad of specialized agents working in tandem:

- **Researcher Agent** 🔍  
  Dives deep into trending topics, competitor strategies, and audience sentiment

- **Copywriter Agent** ✍️  
  Crafts compelling hooks, headlines, and body copy that drive engagement

- **Designer Agent** 🎨  
  Generates visual concepts optimized for platform-specific requirements

- **Compliance Agent** ✅  
  Ensures all content adheres to brand guidelines and regulatory standards

- **Transmuter Agent** 🔄  
  Converts single-source content into multi-platform formats (post → reel → script)

### **🎬 Cinematic Video Studio**
High-fidelity **Text-to-Video** and **Image-to-Video** generation using cutting-edge models like Veo and Wan. Transform scripts and static images into cinematic content that stops the scroll.

### **🔮 Predictive Performance Oracle**
An engagement prediction engine that scores content impact **before publishing**. Get real-time insights on which posts, reels, and videos will resonate most with your audience.

### **🎭 Aesthetic Intelligence Report**
Deep visual analysis and optimization of media assets:
- Color psychology assessment
- Composition and layout recommendations
- Brand consistency validation
- Platform-specific optimization (Instagram vs. LinkedIn vs. TikTok)

### **💡 Smart Content Optimization**
AI-driven suggestions powered by real-time trend data:
- Dynamic hook generation
- Hashtag strategy optimization
- Caption refinement
- Call-to-action testing
- Timing recommendations for maximum reach

### **🧠 Brand Brain (RAG-Powered Memory)**
Persistent AI memory that learns and remembers your brand:
- Brand guidelines enforcement
- Voice and tone consistency
- Customer persona alignment
- Historical performance learnings
- Audience preference patterns

---

## 📁 Project Structure

```
CloudCraft AI/
├── frontend/                    # React + TypeScript UI
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature modules (Auth, Settings, etc.)
│   │   ├── routes/             # TanStack Router definitions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state management
│   │   ├── lib/                # Utility functions
│   │   ├── types/              # TypeScript definitions
│   │   ├── styles/             # Global CSS
│   │   ├── assets/             # Images, logos, icons
│   │   └── main.tsx            # Entry point
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md              # Frontend-specific docs
│
├── backend/                     # Python FastAPI server
│   ├── src/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── agents/            # Multi-agent orchestration
│   │   │   ├── base_agent.py
│   │   │   ├── researcher_agent.py
│   │   │   ├── copywriter_agent.py
│   │   │   ├── designer_agent.py
│   │   │   ├── compliance_agent.py
│   │   │   ├── transmuter_agent.py
│   │   │   ├── dispatcher_agent.py
│   │   │   ├── supervisor.py
│   │   │   └── ... (other agents)
│   │   ├── api/                # API routes
│   │   │   └── v1/
│   │   ├── services/           # Business logic
│   │   │   ├── aws_service.py
│   │   │   ├── brand_service.py
│   │   │   ├── campaign_service.py
│   │   │   ├── media_services.py
│   │   │   ├── oracle_service.py
│   │   │   ├── performance_service.py
│   │   │   └── ... (other services)
│   │   ├── models/             # Data models & schemas
│   │   │   └── schemas.py
│   │   ├── core/               # Core configuration
│   │   │   ├── config.py
│   │   │   ├── llm_factory.py
│   │   │   └── personas.py
│   │   ├── utils/              # Utilities
│   │   │   └── logger.py
│   ├── data/                   # Data files (oracle history, etc.)
│   ├── requirements.txt
│   └── README.md              # Backend-specific docs
│
├── docs/                        # Documentation
├── README.md                   # This file
└── package.json               # Root dependencies
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Lightning-fast build tool
- **TanStack Router** — Modern client-side routing
- **Tailwind CSS** — Utility-first styling
- **Shadcn/UI** — Accessible component library
- **Clerk** — Authentication & user management
- **React Query** — Data fetching & caching
- **Zustand** — Lightweight state management
- **React Hook Form + Zod** — Form handling & validation

### **Backend**
- **Python 3.10+** — Language
- **FastAPI** — High-performance web framework
- **Uvicorn** — ASGI server
- **Pydantic** — Data validation
- **SQLAlchemy** — (optional) ORM

### **Cloud & Infrastructure**
- **AWS Lambda** — Serverless compute
- **AWS API Gateway** — API management
- **AWS DynamoDB** — NoSQL database
- **AWS S3** — Object storage
- **AWS Bedrock** — Foundation models
- **AWS IAM** — Access management

### **AI/ML & Content Generation**
- **Amazon Bedrock** — Access to Claude, Llama, and other FMs
- **OpenAI GPT API** — Language models
- **Google Gemini API** — Multimodal AI
- **Pollinations.ai** — Image/Video generation
- **Veo / Wan** — Video synthesis models

### **Monitoring & Observability**
- **CloudWatch** — AWS logging & monitoring
- **Custom logging** — Application-level logging

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **pnpm** (recommended for frontend)
- **AWS Account** (with Bedrock access)

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

Application runs at `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python src/main.py
```

Backend runs at `http://localhost:8000`

### Environment Variables

Create `.env.local` in the frontend and ``.env` in the backend:

**Frontend (.env.local):**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

**Backend (.env):**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
OPENAI_API_KEY=your_openai_key
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 📚 Documentation

- **[Frontend Documentation](./frontend/README.md)** — React UI, components, and Local development
- **[Backend Documentation](./backend/README.md)** — FastAPI, agents, services, and APIs
- **[API Documentation](./docs/API.md)** — REST API endpoints and schemas
- **[Agent Orchestration](./docs/AGENTS.md)** — Multi-agent workflow and coordination
- **[Deployment Guide](./docs/DEPLOYMENT.md)** — AWS deployment instructions

---

## 🎯 Features Overview

### ✨ Platform Features
- 🌓 **Light/Dark Mode** — Seamless theme switching
- 📱 **Fully Responsive** — Desktop, tablet, mobile optimized
- ♿ **Accessible** — WCAG 2.1 compliant
- 🧭 **Intelligent Navigation** — Context-aware sidebar
- 🔍 **Global Search** — Lightning-fast content discovery
- 📊 **10+ Specialized Pages** — Dashboard, Library, Analytics, Settings
- 🎨 **Custom Components** — Purpose-built for creators
- 🌐 **RTL Support** — Full right-to-left language support

### 🤖 AI Capabilities
- ✅ Multi-agent orchestration with real-time coordination
- ✅ RAG-powered brand memory
- ✅ Predictive engagement scoring
- ✅ Automated content generation across formats
- ✅ Real-time performance analytics
- ✅ Compliance checking & policy enforcement

---

## 🚀 Deployment

### Frontend
- **Netlify** — Automatic deployments from Git
- **Vercel** — Zero-config deployment
- **AWS Amplify** — Integrated AWS deployment

### Backend
- **AWS Lambda** — Serverless functions
- **AWS ECS/Fargate** — Containerized deployment
- **AWS EC2** — Traditional VMs

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 🔐 Security

- OAuth/OIDC with Clerk
- JWT token-based API authentication
- AWS IAM roles for service-to-service auth
- Environment variable management
- Encrypted secrets storage
- CORS configuration for API safety

---

## 📊 Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Image optimization
- CSS minification
- Bundle analysis

### Backend
- Async/await for concurrency
- Database query optimization
- Caching with Redis
- Connection pooling
- Rate limiting

---

## 🔄 Development Workflow

### Git Strategy
```
main (production)
├── staging (pre-release)
└── feature/* (development branches)
```

### Commit Convention
```
type(scope): description

feat(agents): add researcher agent
fix(oracle): correct engagement prediction
docs(setup): update installation guide
style(frontend): format components
refactor(api): optimize agent dispatch
perf(backend): cache brand guidelines
test(agents): add unit tests
```

### Code Quality
- **Linting:** ESLint (frontend), Pylint (backend)
- **Formatting:** Prettier (frontend), Black (backend)
- **Type Checking:** TypeScript (frontend), Pydantic (backend)
- **Testing:** Jest (frontend), Pytest (backend)

---

## 🧪 Testing

### Frontend
```bash
cd frontend
pnpm test           # Run tests
pnpm test:watch    # Watch mode
pnpm test:coverage # Coverage report
```

### Backend
```bash
cd backend
pytest              # Run tests
pytest -v           # Verbose
pytest --cov        # Coverage
```

---

## 📈 Roadmap

### Phase 1: Foundation ✅
- [x] Multi-agent orchestration
- [x] Frontend UI/UX
- [x] Authentication system
- [x] Core services

### Phase 2: Intelligence 🚧
- [ ] Advanced analytics & insights
- [ ] Performance prediction refinement
- [ ] Brand memory expansion
- [ ] Real-time collaboration features

### Phase 3: Scale 📅
- [ ] Custom model fine-tuning
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Autonomous optimization loops

### Phase 4: Growth 🎯
- [ ] Multi-language support
- [ ] Localization for regional markets
- [ ] WhatsApp/Telegram integration
- [ ] Creator economy partnerships

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Fork & clone
git clone https://github.com/yourusername/cloudcraft-ai.git
cd cloudcraft-ai

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes, commit, push
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 💬 Support & Community

- 📧 **Email:** support@cloudcraft-ai.com
- 💬 **Discord:** [Join Community](https://discord.gg/cloudcraft)
- 🐦 **Twitter:** [@CloudCraftAI](https://twitter.com/CloudCraftAI)
- 📖 **Docs:** [docs.cloudcraft-ai.com](https://docs.cloudcraft-ai.com)

---

## 🙏 Credits

Built with ❤️ by **Kesavan & team**.

### Special Thanks To
- [React](https://react.dev) — UI framework
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [Shadcn/UI](https://ui.shadcn.com) — Component library
- [Clerk](https://clerk.com) — Authentication
- [AWS](https://aws.amazon.com) — Cloud infrastructure
- [TanStack](https://tanstack.com) — Router & Query tools

---

## 📞 Contact

**Founder:** Kesavan G
**Github:** https://github.com/kesavan272006  
**Website:** https://cloudcraft-ai.com  
**Location:** Bharat 🇮🇳

---

<div align="center">

**Crafted for creators. Powered by AI. Built for impact.**

[⬆ Back to Top](#cloudcraft-ai)

</div>
