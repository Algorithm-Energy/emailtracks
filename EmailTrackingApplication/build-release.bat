@echo off
set ROOT=%~dp0
set FRONTEND=%ROOT%Frontend\email-tracking-app
set BACKEND=%ROOT%Backend\EmailTrackingAPI

echo [1/2] Building frontend...
cd /d "%FRONTEND%"
if exist dist rmdir /s /q dist
call npm run build -- --config vite.config.prod.js
if %ERRORLEVEL% neq 0 ( echo Frontend build failed. & exit /b 1 )

echo [2/2] Publishing backend...
cd /d "%BACKEND%"
if exist bin\Release\net8.0\publish rmdir /s /q bin\Release\net8.0\publish
dotnet publish -c Release
if %ERRORLEVEL% neq 0 ( echo Backend publish failed. & exit /b 1 )

echo.
echo Done.
echo   Frontend : %FRONTEND%\dist\
echo   Backend  : %BACKEND%\bin\Release\net8.0\publish\
