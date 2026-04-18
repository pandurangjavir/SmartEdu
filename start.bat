@echo off
title SmartEdu Main Runner

echo =========================================
echo        Starting SmartEdu Project         
echo =========================================

echo [1/2] Starting Flask Backend...
start "SmartEdu Backend" cmd /k "cd backend && (if exist ..\.venv\Scripts\activate.bat (call ..\.venv\Scripts\activate.bat) else if exist ..\venv\Scripts\activate.bat (call ..\venv\Scripts\activate.bat)) && python app.py"

echo [2/2] Starting React Frontend...
start "SmartEdu Frontend" cmd /k "cd frontend && npm run dev"

echo =========================================
echo  SmartEdu is running in separate windows!
echo =========================================
pause
