from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite+aiosqlite:///./backtest.db"

    # Alpha Vantage API
    alpha_vantage_api_key: str = ""

    # Polygon API (optional, for future use)
    polygon_api_key: str = ""

    # API Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Security
    secret_key: str = "your-secret-key-change-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
