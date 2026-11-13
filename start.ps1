Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " FitCrowd: Smart Fitness Center Planner Starting Up" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$env:Path = "C:\Program Files\nodejs;" + $env:Path

if (!(Test-Path "$PSScriptRoot\backend\data\fitcrowd.db")) {
    Write-Host " Initializing database & 4-week synthetic telemetry..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\node.exe" "$PSScriptRoot\backend\scripts\initDb.js"
    & "C:\Program Files\nodejs\node.exe" "$PSScriptRoot\backend\scripts\seedData.js"
}

Write-Host " Starting Backend on Port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path='C:\Program Files\nodejs;' + `$env:Path; Set-Location '$PSScriptRoot\backend'; & 'C:\Program Files\nodejs\node.exe' src/app.js"

Start-Sleep -Seconds 2

Write-Host " Starting Frontend on Port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path='C:\Program Files\nodejs;' + `$env:Path; Set-Location '$PSScriptRoot\frontend'; & 'C:\Program Files\nodejs\node.exe' node_modules/vite/bin/vite.js --port 3000"

Write-Host "`n Both services launched!" -ForegroundColor Green
Write-Host " Frontend Web App:  http://localhost:3000" -ForegroundColor White
Write-Host " Backend REST API:  http://localhost:5000/api/health" -ForegroundColor White
Write-Host " Default Member:    alex@fitcrowd.com / MemberPass123!" -ForegroundColor White
Write-Host " Default Admin:     admin@fitcrowd.com / AdminPass123!" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
