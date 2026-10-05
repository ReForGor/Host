import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from project root first, then backend/.env with override
if (PROJECT_ROOT / ".env").exists():
    load_dotenv(PROJECT_ROOT / ".env", override=True)
if (BASE_DIR / ".env").exists():
    load_dotenv(BASE_DIR / ".env", override=True)

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "KPTM PRICE - ระบบเปรียบเทียบราคาอุปกรณ์ไอที")
    PROJECT_DESCRIPTION: str = "REST API for hardware price comparison across Thailand's top IT stores (JIB, Advice, BaNANA, iHaveCPU)"
    PROJECT_VERSION: str = "2.1.0"
    BASE_DIR: Path = BASE_DIR
    
    # Neon Serverless Postgres / PostgreSQL connection string
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://neondb_owner:npg_ExaMXrTcA5C3@ep-cool-firefly-b33d39wh.c-4.ap-southeast-1.aws.neon.tech/neondb"
    )
    
    # JWT Authentication settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "techprice-super-secure-secret-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "72"))
    
    # Scraper settings
    DEFAULT_USER_AGENT: str = os.getenv(
        "DEFAULT_USER_AGENT",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "15"))
    MAX_CONCURRENT_SCRAPES: int = int(os.getenv("MAX_CONCURRENT_SCRAPES", "5"))
    
    # Currency conversions (Base: THB ฿)
    DEFAULT_CURRENCY: str = "THB"
    CURRENCY_RATES: dict = {
        "THB": 1.0,
        "USD": 0.028,
        "EUR": 0.026,
        "GBP": 0.022,
        "SGD": 0.038,
        "JPY": 4.35,
    }
    
    # Categories of IT Equipment
    CATEGORIES: list = [
        "Graphics Cards (GPU)",
        "Processors (CPU)",
        "Laptops & Notebooks",
        "Memory (RAM)",
        "Storage (SSD & HDD)",
        "Monitors & Displays",
        "Motherboards",
        "Power Supplies (PSU)",
        "PC Cases & Cooling",
        "Gaming Peripherals"
    ]

    # Email Notification & SMTP Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "pjxmsx@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "bndgvdznqtjijecv")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "pjxmsx@gmail.com")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "IT PRICE Thailand")
    SMTP_REPLY_TO: str = os.getenv("SMTP_REPLY_TO", "itprice@noreply.com")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    EMAIL_DEV_MODE: bool = os.getenv("EMAIL_DEV_MODE", "false").lower() in ("true", "1", "yes")
    GOOGLE_APPS_SCRIPT_URL: str = os.getenv("GOOGLE_APPS_SCRIPT_URL", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")

settings = Settings()
