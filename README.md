# 🔍 RepoSage — GitHub Repo Explainer

> Paste any GitHub URL → get an instant breakdown of what the project does, how it's structured, and how to contribute.

![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![Powered by Claude](https://img.shields.io/badge/AI-Claude%20Sonnet-orange)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

## ✨ What it does

RepoSage takes any public GitHub repository URL and generates:

- **Purpose summary** — what the project does, who it's for, and why it exists
- **Architecture overview** — folder structure, design patterns, data flow
- **Key file map** — the 5–10 most important files and what they do
- **Dependency analysis** — tech stack breakdown in plain English
- **Contributor onboarding guide** — how to set up, run, and contribute
- **Chat interface** — ask follow-up questions about the repo

---

## 🚀 Quick start

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- A GitHub personal access token ([create one here](https://github.com/settings/tokens))
- An Anthropic API key ([get one here](https://console.anthropic.com))
- PostgreSQL (or a free [Supabase](https://supabase.com) project)
- Redis (or use in-memory for local dev)

### 1. Clone the repo

```bash
git clone https://github.com/Dantechdevs/reposage
cd reposage
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# GitHub API
GITHUB_TOKEN=ghp_your_token_here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Database (Supabase or local Postgres)
DATABASE_URL=postgresql://user:password@localhost:5432/reposage

# Redis (for job queue — optional for dev)
REDIS_URL=redis://localhost:6379

# App
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
API_URL=http://localhost:8000
```

### 5. Initialize the database

```bash
cd backend
alembic upgrade head
```

### 6. Start both servers

In one terminal (Python backend):

```bash
cd backend
uvicorn main:app --reload --port 8000
```

In another terminal (Next.js frontend):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any GitHub URL.

---

## 📁 Project structure

```
reposage/
├── frontend/                       # Next.js 14 (TypeScript)
│   ├── app/
│   │   ├── page.tsx                # Landing page + URL input
│   │   ├── explain/[owner]/[repo]/
│   │   │   └── page.tsx            # Explanation page (streamed)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ExplainResult.tsx       # Main results view
│   │   ├── ChatInterface.tsx       # Q&A chat panel
│   │   ├── FileTree.tsx            # Interactive file tree
│   │   ├── StreamingText.tsx       # Typewriter-style stream
│   │   └── ShareButton.tsx
│   ├── lib/
│   │   └── api.ts                  # HTTP client for Python backend
│   ├── next.config.ts
│   └── package.json
│
├── backend/                        # FastAPI (Python)
│   ├── main.py                     # App entrypoint + route registration
│   ├── routers/
│   │   ├── explain.py              # POST /explain — main AI endpoint
│   │   ├── chat.py                 # POST /chat — follow-up Q&A
│   │   └── share.py                # GET/POST /share — shareable links
│   ├── services/
│   │   ├── github.py               # GitHub REST + GraphQL client
│   │   ├── claude.py               # Anthropic SDK wrapper + streaming
│   │   └── prompts.py              # All prompt templates
│   ├── db/
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── database.py             # DB session + engine setup
│   │   └── migrations/             # Alembic migrations
│   ├── workers/
│   │   └── tasks.py                # Celery tasks (background jobs)
│   ├── requirements.txt
│   └── alembic.ini
│
├── .env.example
└── docker-compose.yml              # Spin up Postgres + Redis locally
```

---

## 🏗️ Architecture

```
User → Next.js Frontend (TypeScript)
           ↓ HTTP / SSE stream
      FastAPI Backend (Python)
           ↓                    ↓
  GitHub fetcher          Claude API
  (httpx + PyGithub)      (anthropic-sdk, streaming)
           ↓                    ↓
      PostgreSQL            Response → SSE → UI
  (SQLAlchemy + Alembic)
           +
        Redis
  (Celery background jobs)
```

---

## 🤝 Contributing

We'd love your help! RepoSage is intentionally built to be easy to contribute to.

### Good first issues

Look for issues tagged [`good first issue`](https://github.com/Dantechdevs/reposage/labels/good%20first%20issue) — these are scoped, well-documented, and won't require understanding the whole codebase.

### How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Add tests if relevant: `pytest` (backend) or `npm test` (frontend)
5. Submit a PR with a clear description of what you changed and why

### Areas that need help

- 🌐 **Language support** — better context extraction for Python/Rust/Go repos
- 🎨 **UI improvements** — the results page could use love
- ⚡ **Performance** — caching, rate limiting, background pre-fetching
- 📊 **Analytics** — understanding what users search for most
- 🔒 **Private repos** — OAuth flow so users can analyze their own private repos
- 🌍 **i18n** — internationalization of the UI

---

## 🛣️ Roadmap

- [x] Public repo explanation (MVP)
- [ ] Shareable explanation links
- [ ] Chat with the repo (Q&A)
- [ ] GitHub OAuth for private repos
- [ ] VS Code extension
- [ ] Chrome extension (adds "Explain" button on GitHub)
- [ ] Batch explain (entire GitHub organization)
- [ ] Diff explainer ("what changed in this PR?")

---

## 📄 License

MIT — use it, fork it, build on it. Just keep the attribution.

---

## 🙏 Acknowledgements

Built with [Claude](https://anthropic.com), [Next.js](https://nextjs.org), [FastAPI](https://fastapi.tiangolo.com), and the [GitHub API](https://docs.github.com/en/rest).

---

<p align="center">
  <strong>If RepoSage saves you time, please ⭐ star the repo. It helps a lot.</strong>
</p>