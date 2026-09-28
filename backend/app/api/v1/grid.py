from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db
from app.models.grid import GridReading
from app.schemas.energy import GridReadingCreate, GridReadingResponse

router = APIRouter(prefix="/grid", tags=["Grid Electricity"])


@router.get("/readings", response_model=List[GridReadingResponse])
def get_grid_readings(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve historical grid electricity exchange data."""
    return db.query(GridReading).order_by(desc(GridReading.timestamp)).offset(offset).limit(limit).all()


@router.post("/readings", response_model=GridReadingResponse, status_code=201)
def create_grid_reading(
    reading: GridReadingCreate,
    db: Session = Depends(get_db)
):
    """Record a new grid import/export exchange event."""
    db_obj = GridReading(
        timestamp=reading.timestamp,
        grid_import_kw=reading.grid_import_kw,
        grid_export_kw=reading.grid_export_kw,
        electricity_price_per_kwh=reading.electricity_price_per_kwh,
        grid_carbon_intensity_g_co2_kwh=reading.grid_carbon_intensity_g_co2_kwh,
        grid_status=reading.grid_status
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/latest", response_model=GridReadingResponse)
def get_latest_grid_reading(db: Session = Depends(get_db)):
    """Retrieve the most recent grid exchange reading."""
    obj = db.query(GridReading).order_by(desc(GridReading.timestamp)).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No grid readings found")
    return obj
