from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # Database — PostgreSQL is required for production; tests override via env
    DATABASE_URL: str = (
        "postgresql://inventory_user:inventory_pass@localhost:5432/inventory_db"
    )

    # Application
    APP_NAME: str = "Inventory & Order Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS — comma-separated string so it parses from a single env var
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:80"

    # Low-stock threshold used by dashboard
    LOW_STOCK_THRESHOLD: int = 10

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
