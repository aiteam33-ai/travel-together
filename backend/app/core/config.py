"""All runtime configuration, read from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="ASTRO_")

    database_url: str = "postgresql+psycopg2://localhost/astro"
    secret_key: str = "change-me"

    # Astronomy
    ayanamsa_parashari: str = "lahiri"
    ayanamsa_kp: str = "krishnamurti"
    jaimini_karaka_scheme: str = "7"  # "7" or "8" (include Rahu)
    jaimini_chara_dasha_variant: str = "parashari"  # "parashari" | "jaimini_sutra"

    # Pipeline
    system_priority_order: list[str] = ["parashari", "kp", "jaimini"]
    swara_enabled: bool = False

    # LLM
    llm_provider: str = "anthropic"
    llm_model: str = "claude-sonnet-5-5"
    llm_temperature: float = 0.0

    # Places provider
    places_provider: str = "stub"


settings = Settings()
