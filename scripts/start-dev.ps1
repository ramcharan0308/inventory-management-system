# Start Inventory Management System (Windows)
# Usage: .\scripts\start-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
Set-Location $Root
docker compose up db -d

Write-Host "Waiting for database..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 5

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host ""
Write-Host "Ready!" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  Backend:   http://localhost:8000"
Write-Host "  API Docs:  http://localhost:8000/api/docs"
Write-Host ""
Write-Host "Or use Docker for everything: docker compose up --build"
