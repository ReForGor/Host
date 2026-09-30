Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ Starting TechPrice Thailand (Fullstack Modern System)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$env:Path = "C:\Users\pjxms\AppData\Local\Programs\NodeJS;" + $env:Path

# Start Backend Server
Write-Host "`n🚀 [1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$pyExe = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
if (-not (Test-Path $pyExe)) { $pyExe = "python" }
$backendProc = Start-Process -FilePath $pyExe -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" -WorkingDirectory $PSScriptRoot -PassThru -NoNewWindow

Start-Sleep -Seconds 3

# Start Frontend Dev Server
Write-Host "`n🎨 [2/2] Starting React + Vite Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
$frontendDir = Join-Path $PSScriptRoot "frontend"
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory $frontendDir -PassThru -NoNewWindow

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
