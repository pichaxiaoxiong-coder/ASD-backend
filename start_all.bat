@echo off
REM Use UTF-8 code page for better compatibility
chcp 65001 >nul

echo ========================================
echo Start full project (backend + frontend)
echo ========================================
echo.
echo Backend and frontend services will be started in new windows...
echo.

REM Start backend
start "backend-service" cmd /k "cd /d %~dp0 && start_backend.bat"
timeout /t 3 /nobreak >nul
REM Start frontend
start "frontend-service" cmd /k "cd /d %~dp0 && start_frontend.bat"

echo.
echo Backend: http://localhost:8000
echo API docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (services keep running)...
pause >nul