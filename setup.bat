@echo off
title SmartEdu Setup
echo =========================================
echo        SmartEdu Project Setup
echo =========================================

set VENV_DIR=venv

if not exist %VENV_DIR% (
    echo [1/4] Creating virtual environment...
    python -m venv %VENV_DIR%
) else (
    echo [1/4] Virtual environment already exists.
)

echo [2/4] Activating virtual environment...
call %VENV_DIR%\Scripts\activate

echo [3/4] Running setup script (Dependencies, Database, Model)...
python setup_project.py

echo [4/4] Setup Complete!
echo You can now run the project using start.bat
pause
