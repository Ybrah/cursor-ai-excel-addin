"""
Main FastAPI application for Cursor AI Excel Assistant Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api.v1.chat import router as chat_router
from app.api.v1.data import router as data_router
from app.api.v1.analysis import router as analysis_router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Cursor AI for Excel - Backend",
    description="AI-powered Excel assistant backend",
    version="1.0.0",
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/v1", tags=["chat"])
app.include_router(data_router, prefix="/api/v1", tags=["data"])
app.include_router(analysis_router, prefix="/api/v1", tags=["analysis"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Cursor AI for Excel Backend is running!"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Backend is operational"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 