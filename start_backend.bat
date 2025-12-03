@echo off
REM Use UTF-8 code page for better compatibility
chcp 65001 >nul

echo ========================================
echo Start backend service (FastAPI)
echo ========================================
cd backend

echo Checking Python environment...
python --version
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo.
echo Checking virtualenv / dependencies...
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo Starting backend service (http://localhost:8000)...
echo API docs: http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause