import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

if env_path.exists():
    load_dotenv(env_path)

class Config:
    ENV = os.getenv("FLASK_ENV", "development")

    SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_in_prod")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_jwt_secret_in_prod")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'blocknet.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAX_CONTENT_LENGTH = 50 * 1024 * 1024

    DEBUG = ENV == "development"
    TESTING = ENV == "testing"
