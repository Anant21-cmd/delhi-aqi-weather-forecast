@echo off
echo ========================================================
echo Starting NCMRWF Coupled Forecasting Frontend (Port 3000)...
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
