Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ Starting TechPrice Thailand (Fullstack Modern System)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$env:Path = "C:\Users\pjxms\AppData\Local\Programs\NodeJS;" + $env:Path

# Start Backend Server
Write-Host "`n🚀 [1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$backendProc = Start-Process -FilePath "d:\Jumprojn\venv\Scripts\python.exe" -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -PassThru -NoNewWindow

Start-Sleep -Seconds 3

# Start Frontend Dev Server
Write-Host "🎨 [2/2] Starting React + Vite Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$npmCmd = "C:\Users\pjxms\AppData\Local\Programs\NodeJS\npm.cmd"
$frontendProc = Start-Process -FilePath $npmCmd -ArgumentList "run", "dev" -WorkingDirectory "d:\Jumprojn\frontend" -PassThru -NoNewWindow

Write-Host "`n✅ System is LIVE:" -ForegroundColor Green
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
