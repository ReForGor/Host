from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.core.database import init_db
from backend.features.products.router import router as products_router
from backend.features.scrapers.router import router as scrapers_router
from backend.features.compare.router import router as compare_router
from backend.features.alerts.router import router as alerts_router
from backend.features.auth.router import router as auth_router
from backend.features.admin.router import router as admin_router
from backend.features.analytics.router import router as analytics_router
from backend.features.analytics.models import VisitorRecord, SystemMetric

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on start
    try:
        await init_db()
    except Exception as e:
        print(f"Warning: init_db connection notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Frontend SPA (Vite / Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"]
)

# Register Feature Routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(compare_router)
app.include_router(alerts_router)
app.include_router(scrapers_router)
app.include_router(admin_router)
app.include_router(analytics_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
