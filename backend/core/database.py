from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from backend.core.config import settings

# Engine configuration for Neon Serverless PostgreSQL with asyncpg
connect_args = {}
if "neon.tech" in settings.DATABASE_URL:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=20,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    pass

# Ensure all relationship mappers are registered cleanly
import backend.features.auth.models
import backend.features.products.models
import backend.features.alerts.models
import backend.features.analytics.models

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
