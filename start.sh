#!/bin/bash

# Start script for AI Shopping Visibility Dashboard
# This script starts both the backend and frontend

echo "🚀 Starting AI Shopping Visibility Dashboard..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your credentials."
    else
        echo "❌ Error: .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Start backend in background
echo "📦 Starting FastAPI backend..."
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

