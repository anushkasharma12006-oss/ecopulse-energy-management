from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db
from app.models.solar import SolarReading
from app.schemas.energy import SolarReadingCreate, SolarReadingResponse

router = APIRouter(prefix="/solar", tags=["Solar Energy"])


@router.get("/readings", response_model=List[SolarReadingResponse])
def get_solar_readings(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve historical solar power generation readings."""
    return db.query(SolarReading).order_by(desc(SolarReading.timestamp)).offset(offset).limit(limit).all()


@router.post("/readings", response_model=SolarReadingResponse, status_code=201)
def create_solar_reading(
    reading: SolarReadingCreate,
    db: Session = Depends(get_db)
):
    """Record a new solar power output reading."""
    db_obj = SolarReading(
        timestamp=reading.timestamp,
        power_output_kw=reading.power_output_kw,
        panel_temperature_c=reading.panel_temperature_c,
        solar_irradiance_wm2=reading.solar_irradiance_wm2,
        efficiency_pct=reading.efficiency_pct,
        notes=reading.notes
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/latest", response_model=SolarReadingResponse)
def get_latest_solar_reading(db: Session = Depends(get_db)):
    """Retrieve the most recent solar reading."""
    obj = db.query(SolarReading).order_by(desc(SolarReading.timestamp)).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No solar readings found")
    return obj
