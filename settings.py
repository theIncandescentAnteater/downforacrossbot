"""Application settings using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Discord bot settings
    discord_token: str

    # Web server settings
    webserver_host: str = "0.0.0.0"
    webserver_port: int = 8080

    # Logging settings
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Create a global settings instance
# Settings are loaded from environment variables via pydantic-settings
settings = Settings()  # type: ignore[call-arg]
