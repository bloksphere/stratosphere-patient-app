from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    app_name: str = "Stratosphere Patient API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/stratosphere_patient"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # Encryption
    encryption_key: str = "your-32-byte-encryption-key-here"
    
    # AWS (optional)
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = "eu-west-2"
    s3_bucket: str | None = None
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8081"]
    
    # Clinic EMR Integration
    clinic_api_url: str | None = None
    clinic_api_key: str | None = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
