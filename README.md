# Inventory & Order Management System

Production-ready, containerized full-stack application for managing products, customers, orders, and inventory.

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, React Query, React Router |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 |
| Containers | Docker, Docker Compose |

## Live Deployment Links

### GitHub Repository
https://github.com/ramcharan0308/inventory-management-system

### Frontend (Vercel)
https://inventory-management-system-wxud.vercel.app

### Backend API (Render)
https://inventory-backend-3k1n.onrender.com

### API Documentation
https://inventory-backend-3k1n.onrender.com/api/docs

### Docker Hub Image
https://hub.docker.com/r/ramcharan0308/inventory-backend

## Architecture

Monorepo layout:

```
inventory-management/
├── backend/          # FastAPI API + Alembic + tests
├── frontend/         # React SPA (Vite → nginx)
├── docker-compose.yml
├── render.yaml       # Render deployment
├── railway.toml      # Railway deployment
└── vercel.json       # Vercel deployment (frontend)
```

API base path: `/api/v1`  
Health check: `GET /health`  
OpenAPI docs: `/api/docs`

---

## Quick Start

**One command (recommended — starts PostgreSQL + backend + frontend):**

```bash
cd inventory-management
cp .env.example .env
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend (Docker) |
| http://localhost:8000 | Backend API |
| http://localhost:8000/api/docs | Swagger UI |

**Windows dev mode (frontend hot-reload on port 5173):**

```powershell
.\scripts\start-dev.ps1
```

This starts PostgreSQL in Docker, then the backend and Vite dev server locally.

---

## Local Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended), **or**
- Python 3.12+, Node.js 20+, PostgreSQL 16+

### Option A — Docker Compose (recommended)

Uses **PostgreSQL 16** (required). The backend runs Alembic migrations on startup.

```bash
# 1. Clone and enter the repo
git clone <your-repo-url>
cd inventory-management

# 2. Configure environment
cp .env.example .env
# Default VITE_API_URL=/api/v1 works via nginx proxy in the frontend container

# 3. Start all services (requires Docker Desktop)
docker compose up --build

# 4. Open the app
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API docs:  http://localhost:8000/api/docs
# Database:  localhost:5432 (PostgreSQL, persistent volume)
```

Services:

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3000 | React SPA (nginx) |
| `backend` | 8000 | FastAPI API |
| `db` | 5432 | PostgreSQL (persistent volume) |

Stop: `docker compose down`  
Reset DB volume: `docker compose down -v`

### Option B — Run services individually

**Database**

```bash
docker compose up -d db
```

**Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # set DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:8000/api/v1
npm run dev
# Open http://localhost:5173
```

### Run tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

---

## Database Migrations

See [docs/MIGRATIONS.md](docs/MIGRATIONS.md) for full Alembic reference.

Quick start:

```bash
cd backend
alembic upgrade head      # apply migrations
alembic current           # show current revision
alembic history           # list all revisions
```

---

## API Testing

Sample requests: [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md)

Quick smoke test after startup:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/dashboard/stats
```

---

## Deployment

### Backend — Render

1. Push repo to GitHub.
2. Create a **Blueprint** from `render.yaml` or manually:
   - **Web Service** → Docker → `backend/Dockerfile`
   - Add **PostgreSQL** database
   - Set `DATABASE_URL` from the database connection string
   - Set `ALLOWED_ORIGINS` to your frontend URL
3. Note the public URL: `https://<service>.onrender.com`

### Backend — Railway

1. Create a new project from GitHub repo.
2. Add a **PostgreSQL** plugin.
3. Configure service using `railway.toml` (Dockerfile at `backend/Dockerfile`).
4. Set environment variables:
   - `DATABASE_URL` (from PostgreSQL plugin)
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
5. Deploy and note the public URL.

### Backend — Docker Hub

```bash
cd backend
docker build -t <dockerhub-username>/inventory-backend:latest .
docker push <dockerhub-username>/inventory-backend:latest
```

### Frontend — Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Environment variable:
   ```
   VITE_API_URL=https://<your-backend-host>/api/v1
   ```
5. Deploy. Note the public URL and add it to backend `ALLOWED_ORIGINS`.

Alternatively, use the included `vercel.json` at the repo root (builds from `frontend/`).

### Frontend — Netlify

1. Connect repo, set base directory to `frontend`.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_URL` to your backend URL + `/api/v1`.

---

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `ALLOWED_ORIGINS` | Backend | Comma-separated CORS origins |
| `DEBUG` | Backend | `true` / `false` |
| `LOW_STOCK_THRESHOLD` | Backend | Dashboard low-stock cutoff (default: 10) |
| `VITE_API_URL` | Frontend | Backend API base URL (build-time) |
| `POSTGRES_*` | Docker db | Database credentials for compose |

Templates: `.env.example` (root) and `backend/.env.example`.

---

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Stock quantity cannot go negative
- Orders rejected when inventory is insufficient
- Order creation atomically decrements stock
- Order total calculated server-side from line items
- `order_items.unit_price` snapshots price at purchase time

---

## Submission Checklist

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment steps.

| Deliverable | Status |
|-------------|--------|
| GitHub repository | Push using steps in DEPLOYMENT.md |
| Docker Hub backend image | `docker build` + `docker push` (see DEPLOYMENT.md) |
| Live frontend URL | Deploy to Vercel/Netlify |
| Live backend API URL | Deploy to Render/Railway |

### Requirement coverage

| Requirement | Status |
|-------------|--------|
| FastAPI backend | ✅ |
| React frontend | ✅ |
| PostgreSQL database | ✅ (Docker Compose + production deploy) |
| Product CRUD (API + UI) | ✅ |
| Customer CRUD (API + UI) | ✅ |
| Order CRUD (API + UI) | ✅ |
| Dashboard | ✅ |
| Business rules | ✅ |
| Docker + Compose | ✅ |
| Responsive UI | ✅ |

---

## License

MIT
