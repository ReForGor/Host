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
from backend.features.analytics.router import router as analytics_router, analysis_router
from backend.features.analytics.models import VisitorRecord, SystemMetric
from backend.features.scrapers.scheduler import scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on start
    try:
        await init_db()
    except Exception as e:
        print(f"Warning: init_db connection notice: {e}")
    
    # Start automated daily price scraper scheduler (04:30 AM Bangkok time)
    scheduler.start()
    yield
    scheduler.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Frontend SPA (Vite dev server & production)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*", # Allow any HTTPS origin for Vercel/Render compatibility
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
app.include_router(analysis_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION
    }


# -------------------------------------------------------------
# Mount Frontend Static Assets & SPA Catch-all
# Enables running BOTH Backend and Frontend together in ONE server!
# -------------------------------------------------------------
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    async def serve_root():
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend built dist found, but index.html is missing."}

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Do not catch /api, /docs, /openapi.json, /redoc, /health
        if full_path.startswith(("api", "docs", "redoc", "openapi.json", "health")):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Frontend dist not built. Run 'npm run build' in frontend directory."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
