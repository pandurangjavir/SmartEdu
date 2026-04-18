#!/bin/bash

echo "========================================="
echo "       Starting SmartEdu Project         "
echo "========================================="

# Helper function to clean up processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap Ctrl+C (SIGINT) to run the cleanup function
trap cleanup SIGINT

# 1. Start the Python Flask Backend
echo "[1/2] Starting Flask Backend..."
cd backend

# Try to activate virtual environment based on common OS configurations
if [ -f "../.venv/Scripts/activate" ]; then
    source ../.venv/Scripts/activate
elif [ -f "../venv/Scripts/activate" ]; then
    source ../venv/Scripts/activate
elif [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
elif [ -f "../venv/bin/activate" ]; then
    source ../venv/bin/activate
else
    echo "Warning: No virtual environment found. Running with global python."
fi

python app.py &
BACKEND_PID=$!
cd ..

# 2. Start the React Frontend
echo "[2/2] Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "========================================="
echo "  SmartEdu is running! Press Ctrl+C to stop"
echo "========================================="

# Keep the script running to catch Ctrl+C
wait
