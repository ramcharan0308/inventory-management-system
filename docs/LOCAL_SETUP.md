# Local Setup Guide

Step-by-step instructions to run the Inventory & Order Management System on your machine.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker Desktop | Latest | Recommended all-in-one setup |
| Python | 3.12+ | Backend development |
| Node.js | 20+ | Frontend development |
| PostgreSQL | 16+ | Database (if not using Docker) |

---

## Quick Start (Docker Compose)

```bash
git clone <your-repo-url>
cd inventory-management
cp .env.example .env
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8000 | Backend API |
| http://localhost:8000/api/docs | Swagger UI |
| localhost:5432 | PostgreSQL |

Stop containers:

```bash
docker compose down
```

Reset database (deletes all data):

```bash
docker compose down -v
```

---

## Manual Setup

### 1. PostgreSQL

**Option A — Docker only for DB:**

```bash
docker compose up -d db
```

**Option B — Local PostgreSQL install:**

Create database and user matching `.env.example` values.

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL in .env

alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: `curl http://localhost:8000/health`

### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps

# Create frontend/.env
echo VITE_API_URL=http://localhost:8000/api/v1 > .env

npm run dev
```

Open http://localhost:5173

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

Tests use an in-memory SQLite database — no PostgreSQL required.

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Frontend cannot reach API | Set `VITE_API_URL=http://localhost:8000/api/v1` and rebuild/restart |
| CORS errors | Add your frontend origin to `ALLOWED_ORIGINS` in backend `.env` |
| `connection refused` on port 5432 | Start the database: `docker compose up -d db` |
| Alembic migration fails | Confirm `DATABASE_URL` is correct and DB is running |
| Docker frontend build fails | Run `npm install --legacy-peer-deps` in `frontend/` first to generate `package-lock.json` |

---

## Next Steps

- API examples: [API_EXAMPLES.md](./API_EXAMPLES.md)
- Migrations: [MIGRATIONS.md](./MIGRATIONS.md)
- Deployment: [../README.md](../README.md#deployment)
