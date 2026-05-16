from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    database_url: str = "sqlite+aiosqlite:///./ziraia.db"
    use_mock_satellite: bool = True
    use_mock_weather: bool = True
    app_env: str = "development"


settings = Settings()
