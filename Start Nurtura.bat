@echo off
setlocal
title Nurtura - Menstrual Health Companion
cd /d "%~dp0"

echo.
echo ==============================================================
echo       Nurtura - Menstrual Health Companion for Girls
echo ==============================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo.
    echo Nurtura requires Node.js (version 18 or newer) to run.
    echo Please download and install Node.js from:
    echo.
    echo     https://nodejs.org/
    echo.
    echo After installing, restart your computer or command prompt,
    echo and double-click "Start Nurtura.bat" again.
    echo ==============================================================
    echo.
    pause
    exit /b 1
)

:: 2. Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in your system PATH!
    echo Please ensure Node.js and npm are properly installed.
    echo.
    pause
    exit /b 1
)

:: 3. Check if required dependencies are installed
if not exist "node_modules\" (
    echo [ERROR] Project dependencies are missing!
    echo.
    echo The "node_modules" folder was not found.
    echo Required libraries are not installed yet.
    echo.
    echo To install them, please open Command Prompt in this folder and run:
    echo.
    echo     npm install
    echo.
    echo ==============================================================
    echo.
    pause
    exit /b 1
)

:: 4. Ensure backend environment file exists
if not exist "backend\.env" (
    if exist ".env.example" (
        copy ".env.example" "backend\.env" >nul
    )
)

:: 5. Launch the website
echo [OK] Node.js and project dependencies verified.
echo.
echo Starting Nurtura local servers...
echo   * Backend API : http://localhost:5000
echo   * Frontend Web: http://localhost:5173
echo.
echo Opening Nurtura in your default browser in 3 seconds...
echo.
echo NOTE: Keep this window open while using the website.
echo       Press Ctrl+C to stop the servers when finished.
echo ==============================================================
echo.

:: Open browser after a brief delay to allow Vite and Express to bind ports
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start both backend and frontend using existing concurrently script
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [NOTE] Server process ended.
    pause
)
