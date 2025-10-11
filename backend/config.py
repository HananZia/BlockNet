import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(env_path)

class Config:
    # Flask environment
    ENV = os.getenv("FLASK_ENV", "development")

    # Security keys
    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_in_prod")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_jwt_secret_in_prod")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'blocknet.db'}"  # Default: local SQLite
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File upload limits
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB

    # Optional: useful debugging flags
    DEBUG = ENV == "development"
    TESTING = ENV == "testing"
