# Database Migrations (Alembic)

All commands assume you are in the `backend/` directory and `DATABASE_URL` is set (via `.env` or shell).

## Prerequisites

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL
```

## Common commands

```bash
# Apply all pending migrations
alembic upgrade head

# Roll back one revision
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history --verbose

# Create a new migration after model changes
alembic revision --autogenerate -m "describe change"

# Stamp DB without running migrations (existing DB)
alembic stamp head
```

## Docker Compose

Migrations run automatically when the backend container starts:

```bash
# From repo root
docker compose up --build
```

The backend `Dockerfile` CMD runs `alembic upgrade head` before starting Uvicorn.

## Fresh local PostgreSQL

```bash
# Start only the database
docker compose up -d db

# Run migrations from host
cd backend
alembic upgrade head
```

## Initial schema

Migration file: `backend/alembic/versions/001_initial_schema.py`

Creates tables:

- `customers` — unique email
- `products` — unique SKU, non-negative stock CHECK
- `orders` — customer FK, computed total
- `order_items` — line items with price snapshot (`unit_price`)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Target database is not up to date` | Run `alembic upgrade head` |
| `Can't locate revision` | Check `alembic/versions/` and `alembic current` |
| Connection refused | Ensure PostgreSQL is running and `DATABASE_URL` host/port match |
| `postgres://` URI on Render/Railway | Handled automatically in `database.py` (converted to `postgresql://`) |
