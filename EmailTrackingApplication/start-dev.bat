@echo off
echo ============================================================
echo  Email Tracking App - DEV MODE
echo ============================================================
echo  WARNING: Vite proxy is active (dev only).
echo  Before production build, remove the "server.proxy" block
echo  from Frontend\email-tracking-app\vite.config.js
echo ============================================================
echo.

echo [1/2] Starting Backend (ASP.NET Core on :5000)...
start "EmailTracker - Backend" cmd /k "cd /d "%~dp0Backend\EmailTrackingAPI" && dotnet run"

timeout /t 4 /nobreak > nul

echo [2/2] Starting Frontend (Vite on :5173)...
start "EmailTracker - Frontend" cmd /k "cd /d "%~dp0Frontend\email-tracking-app" && npm run dev"

echo.
echo  Backend  : http://localhost:5000
echo  Frontend : http://localhost:5173/EmailTrackingApp/
echo.
