from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_DEPLOYMENT_NAME: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2024-02-01"
    CORS_ORIGINS: list[str] = ["*"]
    SERPER_API_KEY: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
