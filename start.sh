#!/bin/bash

echo "🧠 SmartCard MVP - Starting up..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Python and Node.js found"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if database exists
if [ ! -f "smartcard.db" ]; then
    echo "🌱 Seeding database with sample data..."
    python seed_data.py
else
    echo "✅ Database already exists"
fi

echo ""
echo "🚀 Starting FastAPI backend on http://localhost:8000"
echo ""

# Start backend in background
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
else
    echo "✅ Node modules already installed"
fi

echo ""
echo "🚀 Starting React frontend on http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SmartCard MVP is running!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start frontend (this will block)
npm start

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
