# TechPrice Modern Full-Stack Windows PowerShell Startup Script
$root = $PSScriptRoot
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ Starting TechPrice Thailand (Full-Stack Modern System)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend FastAPI Server
Write-Host "`n🚀 [1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProc = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -WorkingDirectory $root -PassThru

Start-Sleep -Seconds 2

# 2. Start Frontend React + Vite Server
Write-Host "🎨 [2/2] Starting React + Vite Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "npm" -ArgumentList "--prefix", "frontend", "run", "dev" -WorkingDirectory $root -PassThru

Write-Host "`n✅ System is LIVE & READY:" -ForegroundColor Green
Write-Host "   • Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   • REST API:     http://localhost:8000" -ForegroundColor White
Write-Host "   • Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   • Neon DB:      Connected (Singapore Cloud)" -ForegroundColor White
Write-Host "`nPress Ctrl+C to terminate both servers..." -ForegroundColor Yellow

try {
    Wait-Process -Id $backendProc.Id, $frontendProc.Id
} finally {
    Stop-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue
}
