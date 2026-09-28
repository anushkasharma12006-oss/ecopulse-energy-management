from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.energy import EnergySummaryResponse, EnergyTimeseriesResponse
from app.services import energy_service
from app.models.solar import SolarReading
from app.models.wind import WindReading
from app.models.battery import BatteryReading
from app.models.consumption import ConsumptionReading
from app.models.grid import GridReading

router = APIRouter(prefix="/energy", tags=["Energy Analytics"])


@router.get("/summary", response_model=EnergySummaryResponse)
def get_energy_summary(db: Session = Depends(get_db)):
    """Get real-time operational summary and KPI metrics of the energy ecosystem."""
    return energy_service.get_energy_summary(db)


@router.get("/timeseries", response_model=EnergyTimeseriesResponse)
def get_energy_timeseries(
    hours: int = Query(default=24, ge=1, le=168, description="History window in hours"),
    db: Session = Depends(get_db)
):
    """Get multi-series synchronized energy metrics over the selected time range."""
    return energy_service.get_energy_timeseries(db, hours=hours)


@router.post("/seed")
def seed_energy_data(
    hours: int = Query(default=48, ge=6, le=168, description="Number of hours to generate"),
    db: Session = Depends(get_db)
):
    """Seed the database with realistic synthetic energy telemetry."""
    # Force new seed if requested
    count = energy_service.seed_default_data(db, hours=hours)
    return {
        "status": "success",
        "message": f"Energy database initialized with {count} time-steps.",
        "hours_seeded": hours
    }


@router.delete("/reset")
def reset_energy_database(db: Session = Depends(get_db)):
    """Clear all energy tables for testing."""
    db.query(SolarReading).delete()
    db.query(WindReading).delete()
    db.query(BatteryReading).delete()
    db.query(ConsumptionReading).delete()
    db.query(GridReading).delete()
    db.commit()
    return {"status": "success", "message": "All energy tables cleared."}
