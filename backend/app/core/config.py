"""
Configuration settings for the Cursor AI Excel Backend
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Cursor AI for Excel Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered Excel assistant backend"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://localhost:3000"]
    
    # AI/LLM Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_TEMPERATURE: float = 0.1
    MAX_TOKENS: int = 2000
    
    # LangGraph Configuration
    LANGGRAPH_STREAM: bool = True
    LANGGRAPH_RECURSION_LIMIT: int = 25
    
    # Excel Processing Configuration
    MAX_FILE_SIZE_MB: int = 50
    MAX_ROWS_PROCESSED: int = 10000
    MAX_COLUMNS_PROCESSED: int = 100
    
    # Session Configuration
    SESSION_TIMEOUT_MINUTES: int = 60
    MAX_CHAT_HISTORY: int = 100
    
    # Database Configuration (for future use)
    DATABASE_URL: str = "sqlite:///./cursor_excel_ai.db"
    
    # File Storage Configuration
    UPLOAD_DIR: str = "/tmp/uploads"
    EXPORT_DIR: str = "/tmp/exports"
    FILE_RETENTION_HOURS: int = 24
    
    # Security Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_MINUTES: int = 1
    
    # Feature Flags
    ENABLE_ANALYTICS: bool = True
    ENABLE_CACHING: bool = True
    ENABLE_WEBSOCKETS: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings 