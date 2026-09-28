from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Energy Management & Optimization System"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./energy_ecosystem.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
