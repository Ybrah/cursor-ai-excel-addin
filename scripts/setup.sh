#!/bin/bash

# Cursor AI for Excel - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Cursor AI for Excel..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required but not installed."
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is required but not installed."
        echo "Please install Python 3.9+ from https://python.org/"
        exit 1
    fi
    
    if ! command -v poetry &> /dev/null; then
        echo "❌ Poetry is required but not installed."
        echo "Please install Poetry from https://python-poetry.org/"
        exit 1
    fi
    
    echo "✅ All requirements satisfied!"
}

# Setup backend
setup_backend() {
    echo "🐍 Setting up backend..."
    cd backend
    
    # Install Python dependencies
    echo "Installing Python dependencies..."
    poetry install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file..."
        cat > .env << EOF
# Cursor AI for Excel Backend - Environment Configuration
# Fill in your actual values

# AI/LLM Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.1
MAX_TOKENS=2000

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# CORS Configuration  
CORS_ORIGINS=http://localhost:3000,https://localhost:3000

# LangGraph Configuration
LANGGRAPH_STREAM=true
LANGGRAPH_RECURSION_LIMIT=25

# Excel Processing
MAX_FILE_SIZE_MB=50
MAX_ROWS_PROCESSED=10000
MAX_COLUMNS_PROCESSED=100

# Session Management
SESSION_TIMEOUT_MINUTES=60
MAX_CHAT_HISTORY=100

# Database (Future Use)
DATABASE_URL=sqlite:///./cursor_excel_ai.db

# File Storage
UPLOAD_DIR=/tmp/uploads
EXPORT_DIR=/tmp/exports
FILE_RETENTION_HOURS=24

# Security
SECRET_KEY=your-secret-key-change-in-production-use-long-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=1

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CACHING=true
ENABLE_WEBSOCKETS=false
EOF
        echo "⚠️  Please edit backend/.env and add your OpenAI API key!"
    fi
    
    cd ..
    echo "✅ Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    echo "⚛️  Setting up frontend..."
    cd frontend
    
    # Install Node.js dependencies
    echo "Installing Node.js dependencies..."
    npm install
    
    cd ..
    echo "✅ Frontend setup complete!"
}

# Main setup function
main() {
    check_requirements
    setup_backend
    setup_frontend
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit backend/.env and add your OpenAI API key"
    echo "2. Start the backend: cd backend && poetry run uvicorn app.main:app --reload"
    echo "3. Start the frontend: cd frontend && npm run dev"
    echo "4. Load the Excel add-in using frontend/public/manifest.xml"
    echo ""
    echo "📚 Check README.md for detailed instructions"
    echo "🚀 Happy coding!"
}

# Run main function
main 