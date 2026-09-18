@echo off
echo ========================================================
echo Starting NCMRWF Coupled Forecasting Backend (Port 8000)...
echo ========================================================
cd /d "%~dp0backend"
call .\venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
