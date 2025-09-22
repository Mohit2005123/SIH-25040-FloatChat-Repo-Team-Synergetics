#!/bin/bash

# FloatChat Startup Script
echo "🌊 Starting FloatChat - AI-Powered Ocean Data Discovery"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL and try again."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
fi

echo "📦 Installing frontend dependencies..."
cd /Users/mohitmongia/Documents/SIH-3
npm install

echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "🗄️  Setting up database..."
# Create database if it doesn't exist
createdb floatchat 2>/dev/null || echo "Database already exists"

echo "🚀 Starting backend server..."
cd /Users/mohitmongia/Documents/SIH-3/backend
python app.py &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🚀 Starting frontend server..."
cd /Users/mohitmongia/Documents/SIH-3
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ FloatChat is starting up!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping FloatChat services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
