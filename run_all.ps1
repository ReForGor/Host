Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "⚡ Starting TechPrice Thailand (Fullstack Modern System)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
if (-not $ROOT_DIR) { $ROOT_DIR = (Get-Location).Path }

# Detect Python (venv or system)
$pythonExe = Join-Path $ROOT_DIR "venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

# Detect npm
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue)?.Source
if (-not $npmCmd) {
    $npmCmd = (Get-Command npm -ErrorAction SilentlyContinue)?.Source
    if (-not $npmCmd) { $npmCmd = "npm" }
}

$frontendDir = Join-Path $ROOT_DIR "frontend"

# Check if Backend is already running
$checkPort8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$backendProc = $null

if ($checkPort8000) {
    Write-Host "`n🚀 [1/2] FastAPI Backend is already running on http://localhost:8000" -ForegroundColor Yellow
} else {
    Write-Host "`n🚀 [1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
    $backendProc = Start-Process -FilePath $pythonExe -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -WorkingDirectory $ROOT_DIR -PassThru -NoNewWindow
    Start-Sleep -Seconds 2
}

# Check if Frontend is already running
$checkPort3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$frontendProc = $null

if ($checkPort3000) {
    Write-Host "🎨 [2/2] Frontend dev server is already running on http://localhost:3000" -ForegroundColor Yellow
} else {
    Write-Host "🎨 [2/2] Starting React + Vite Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
    $frontendProc = Start-Process -FilePath $npmCmd -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -PassThru -NoNewWindow
}

Write-Host "`n✅ System is LIVE:" -ForegroundColor Green
Write-Host "   • Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   • REST API:     http://localhost:8000" -ForegroundColor White
Write-Host "   • Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   • Neon DB:      Connected (Singapore Cloud)" -ForegroundColor White
Write-Host "`nPress Ctrl+C to terminate running servers..." -ForegroundColor Yellow

try {
    $procsToWait = @()
    if ($backendProc) { $procsToWait += $backendProc.Id }
    if ($frontendProc) { $procsToWait += $frontendProc.Id }
    if ($procsToWait.Count -gt 0) {
        Wait-Process -Id $procsToWait
    }
} finally {
    if ($backendProc) { Stop-Process -Id $backendProc.Id -ErrorAction SilentlyContinue }
    if ($frontendProc) { Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue }
}

