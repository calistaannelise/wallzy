#!/bin/bash

# Development Quick Start Script
# This script helps you start all development servers

echo "🚀 Starting Development Environment..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the dubhacksv3 directory"
    exit 1
fi

# Set Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "✅ Java 17 configured"

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Start Backend Server
echo ""
echo "📦 Starting Backend Server..."
if check_port 8000; then
    echo "⚠️  Backend already running on port 8000"
else
    cd backend
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
    cd ..
fi

# Wait a moment for backend to start
sleep 2

# Start Metro Bundler
echo ""
echo "📱 Starting Metro Bundler..."
if check_port 8081; then
    echo "⚠️  Metro already running on port 8081"
else
    cd frontend
    npx react-native start &
    METRO_PID=$!
    echo "✅ Metro started (PID: $METRO_PID)"
    cd ..
fi

echo ""
echo "✨ Development servers are starting!"
echo ""
echo "📋 Next Steps:"
echo "   1. Wait for Metro bundler to finish loading (~10 seconds)"
echo "   2. Open Android emulator (or it will auto-start)"
echo "   3. Run: cd frontend && npx react-native run-android"
echo ""
echo "💡 Tips:"
echo "   - Press 'R' twice in emulator to reload JavaScript"
echo "   - Press 'M' in emulator to open dev menu"
echo "   - Backend auto-reloads on Python file changes"
echo "   - Metro auto-reloads on JavaScript file changes"
echo ""
echo "🛑 To stop servers:"
echo "   - Press Ctrl+C in this terminal"
echo "   - Or run: lsof -ti :8000 | xargs kill && lsof -ti :8081 | xargs kill"
echo ""

# Keep script running
wait
