@echo off
title DairyOS Enterprise Dairy ERP
echo ===============================================================
echo            DAIRYOS ENTERPRISE DAIRY ERP - v2.1.0
echo ===============================================================
echo Starting DairyOS API Server (port 5000) and Web App (port 3000)...
echo.

cd /d "%~dp0"
call npm run dev:all
pause
