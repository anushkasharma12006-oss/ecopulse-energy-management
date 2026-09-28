from fastapi import APIRouter
from app.api.v1.energy import router as energy_router
from app.api.v1.solar import router as solar_router
from app.api.v1.wind import router as wind_router
from app.api.v1.battery import router as battery_router
from app.api.v1.consumption import router as consumption_router
from app.api.v1.grid import router as grid_router
from app.api.v1.csv_import import router as import_router

api_v1_router = APIRouter()

api_v1_router.include_router(energy_router)
api_v1_router.include_router(solar_router)
api_v1_router.include_router(wind_router)
api_v1_router.include_router(battery_router)
api_v1_router.include_router(consumption_router)
api_v1_router.include_router(grid_router)
api_v1_router.include_router(import_router)
