# CloudCraft AI — Frontend

The agentic command center UI for content intelligence. Built with **React, TypeScript, Vite, and Shadcn/UI**.

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`

---

## 🛠️ Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **TanStack Router** — Modern routing
- **Tailwind CSS** — Styling
- **Shadcn/UI** — Component library
- **Clerk** — Authentication
- **React Query** — Data fetching
- **Zustand** — State management
- **React Hook Form** — Form handling
- **Zod** — Validation

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── layout/         # Layout components (Sidebar, Header, Footer)
│   ├── data-table/     # Data table components
│   ├── performance/    # Performance-related components
│   └── persona/        # Persona-related components
├── features/           # Feature modules
│   ├── auth/           # Authentication screens
│   ├── settings/       # Settings module
│   ├── dashboard/      # Dashboard features
│   └── ...
├── routes/             # TanStack Router routes
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── context/            # React context providers
├── lib/                # Utility functions & helpers
├── types/              # TypeScript type definitions
├── styles/             # Global CSS
├── assets/             # Images, logos, icons
├── config/             # Configuration files
└── main.tsx            # Entry point
```

---

## 🚀 Available Commands

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format:check` | Check code formatting |
| `pnpm format` | Auto-format code with Prettier |
| `pnpm knip` | Find unused files/imports |

---

## 🔐 Authentication

CloudCraft AI uses **Clerk** for authentication. Configuration:
- Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`
- OAuth flows (Google, GitHub, etc.)
- MFA support
- User profile management

---

## 🎨 Component Customization

Many Shadcn UI components have been customized for RTL support and specific workflows:

**Modified Components:**
- `scroll-area` — Optimized for data tables
- `sonner` — Toast notifications
- `separator` — Visual hierarchy

**RTL Updated Components:**
- `alert-dialog`, `calendar`, `command`, `dialog`, `dropdown-menu`, `select`, `table`, `sheet`, `sidebar`, `switch`

---

## 📦 Deployment

### Netlify
```bash
pnpm build
```
Deploy the `dist/` folder to Netlify.

### Vercel
Connect your GitHub repository to Vercel for automatic deployments.

### Run Locally
```bash
pnpm preview
```

---

## 🔗 API Integration

The frontend connects to the backend FastAPI server. Ensure environment variables are configured:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

---

## 📝 License

MIT License

---

**Built with ❤️ for content creators.**


