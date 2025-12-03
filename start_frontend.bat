@echo off
REM Use UTF-8 code page for better compatibility
chcp 65001 >nul

echo ========================================
echo Start frontend service (Vite)
echo ========================================
cd frontend

echo Checking Node.js environment...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting frontend dev server...
echo Frontend dev server (Vite) listening on default port (see output below)
echo.
call npm run dev

pause