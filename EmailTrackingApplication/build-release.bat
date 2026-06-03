@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo  EmailTrackingApp — Production Build
echo ============================================================
echo.

set ROOT=%~dp0
set FRONTEND=%ROOT%Frontend\email-tracking-app
set BACKEND=%ROOT%Backend\EmailTrackingAPI
set WWWROOT=%BACKEND%\wwwroot
set PUBLISH=%BACKEND%\bin\Release\net8.0\publish

:: ── Step 1: Build frontend ────────────────────────────────────
echo [1/3] Building frontend (no dev proxy)...
cd /d "%FRONTEND%"

call npm ci
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: npm ci failed. Aborting.
    exit /b 1
)

call npm run build -- --config vite.config.prod.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Frontend build failed. Aborting.
    exit /b 1
)

echo    Frontend build complete ^(dist\^)
echo.

:: ── Step 2: Copy dist into backend wwwroot ────────────────────
echo [2/3] Copying frontend into backend wwwroot...

if exist "%WWWROOT%" (
    rmdir /s /q "%WWWROOT%"
)
mkdir "%WWWROOT%"

xcopy /E /I /Q "%FRONTEND%\dist\*" "%WWWROOT%\"
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to copy dist to wwwroot. Aborting.
    exit /b 1
)

echo    Copied to %WWWROOT%
echo.

:: ── Step 3: Publish backend ───────────────────────────────────
echo [3/3] Publishing backend (Release)...
cd /d "%BACKEND%"

dotnet publish -c Release
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: dotnet publish failed. Aborting.
    exit /b 1
)

echo.
echo ============================================================
echo  BUILD COMPLETE
echo ============================================================
echo.
echo  Artifacts : %PUBLISH%
echo.
echo  BEFORE starting the server on first deploy:
echo  1. Run SQL script against AlgoAPM:
echo     Backend\Database\pending-migrations.sql
echo.
echo  IIS deployment checklist:
echo  - Point IIS application to the publish\ folder above
echo  - App Pool ^> No Managed Code, 64-bit
echo  - ASP.NET Core Hosting Bundle must be installed on the server
echo  - IIS application path must be /EmailTrackingApp/
echo.
echo ============================================================
echo.
