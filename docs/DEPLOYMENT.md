# Deployment Guide

Step-by-step instructions to deploy the Inventory & Order Management System for assessment submission.

## Prerequisites

- GitHub account
- [Docker Hub](https://hub.docker.com) account (for backend image)
- [Render](https://render.com) or [Railway](https://railway.app) account (backend)
- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account (frontend)

---

## 1. Push to GitHub

```bash
cd inventory-management
git init
git add .
git commit -m "Initial commit: inventory & order management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-management.git
git push -u origin main
```

---

## 2. Deploy Backend (Render — recommended)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo. Render reads `render.yaml` automatically.
3. After deploy, note your backend URL: `https://inventory-backend-xxxx.onrender.com`
4. Verify:
   ```bash
   curl https://YOUR-BACKEND.onrender.com/health
   curl https://YOUR-BACKEND.onrender.com/api/v1/dashboard/stats
   ```

### Backend (Railway alternative)

1. Create project from GitHub repo.
2. Add **PostgreSQL** plugin.
3. Set service root to `backend`, Dockerfile path `backend/Dockerfile`.
4. Environment variables:
   - `DATABASE_URL` — from PostgreSQL plugin
   - `ALLOWED_ORIGINS` — your Vercel frontend URL
   - `DEBUG=false`

---

## 3. Push Backend Docker Image to Docker Hub

```bash
docker login
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest .
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Image URL for submission: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-backend`

---

## 4. Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → **Add New Project** → import GitHub repo.
2. Settings:
   - **Root Directory**: leave as repo root (uses `vercel.json`)
   - **Framework**: Vite
3. Environment variable (required):
   ```
   VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
   ```
4. Deploy. Note URL: `https://your-app.vercel.app`

### Update backend CORS

In Render/Railway, set `ALLOWED_ORIGINS` to include your Vercel URL:

```
https://your-app.vercel.app,http://localhost:5173,http://localhost:3000
```

Redeploy backend after updating CORS.

---

## 5. Verify End-to-End

| Check | URL / Action |
|-------|----------------|
| Backend health | `GET /health` → `{"status":"ok"}` |
| API docs | `/api/docs` |
| Frontend loads | Open Vercel URL |
| Dashboard stats | Shows product/customer/order counts |
| Create product | Products page → Add Product |
| Create customer | Customers page → Add Customer |
| Create order | Orders page → New Order |
| Docker local | `docker compose up --build` → http://localhost:3000 |

---

## 6. Submission Checklist

| Deliverable | Your URL |
|-------------|----------|
| GitHub repository | `https://github.com/YOUR_USERNAME/inventory-management` |
| Docker Hub backend image | `https://hub.docker.com/r/YOUR_USERNAME/inventory-backend` |
| Live frontend | `https://your-app.vercel.app` |
| Live backend API | `https://your-backend.onrender.com` |

---

## Local Docker (PostgreSQL)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/api/docs
- PostgreSQL: localhost:5432 (persistent volume `postgres_data`)
