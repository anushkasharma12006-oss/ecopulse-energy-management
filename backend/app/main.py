from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.services.energy_service import seed_default_data
from app.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    init_db()
    # Check if empty, seed clean realistic telemetry
    db = SessionLocal()
    try:
        seed_default_data(db, hours=48)
    finally:
        db.close()
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI Energy Management & Optimization System - Phase 1 Foundation",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "phase": "Phase 1 - Project Foundation",
        "status": "operational",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "subsystems": [
            "solar_energy",
            "wind_energy",
            "battery_storage",
            "electricity_consumption",
            "grid_electricity",
            "csv_import_foundation"
        ]
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "api_version": "v1"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
