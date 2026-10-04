@echo off
title ALGO JUDGE - Khoi dong he thong
color 0A

echo.
echo  =========================================
echo    ALGO JUDGE - He thong khoi dong tu dong
echo  =========================================
echo.

:: === 1. Khoi dong Backend (Node.js server) ===
echo [1/3] Dang khoi dong Backend (port 5000)...
start "Backend API" cmd /k "cd /d "%~dp0server" && node server.js"
timeout /t 3 /nobreak >nul

:: === 2. Build Frontend va Serve ===
echo [2/3] Dang build frontend...
cd /d "%~dp0"
call npm run build
echo     Build hoan tat!

echo [3/3] Dang khoi dong Vite Preview (port 4173)...
start "Frontend Preview" cmd /k "cd /d "%~dp0" && npm run preview -- --port 4173 --host"
timeout /t 3 /nobreak >nul

:: === 3. Mo Ngrok Tunnel ===
echo.
echo  Dang mo Ngrok tunnel...
echo  Vui long doi URL xuat hien trong cua so moi...
echo.
start "Ngrok Tunnel" cmd /k "ngrok http 4173"

echo.
echo  =========================================
echo   Tat ca dang chay!
echo   - Backend : http://localhost:5000
echo   - Frontend: http://localhost:4173
echo   - Ngrok   : Xem cua so "Ngrok Tunnel"
echo  =========================================
echo.
pause
