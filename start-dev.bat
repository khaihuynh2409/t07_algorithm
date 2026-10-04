@echo off
title ALGO JUDGE - Dev Mode
color 0B

echo.
echo  =========================================
echo    ALGO JUDGE - Che do phat trien (Dev)
echo  =========================================
echo.

:: === 1. Backend ===
echo [1/2] Khoi dong Backend (port 5000)...
start "Backend API" cmd /k "cd /d "%~dp0server" && node server.js"
timeout /t 2 /nobreak >nul

:: === 2. Vite Dev Server (hot reload) ===
echo [2/2] Khoi dong Vite Dev Server (port 5173)...
start "Frontend Dev" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo  =========================================
echo   Dev mode dang chay!
echo   - Backend : http://localhost:5000
echo   - Frontend: http://localhost:5173  (hot reload)
echo   Code thay doi se tu dong cap nhat!
echo  =========================================
echo.
pause
