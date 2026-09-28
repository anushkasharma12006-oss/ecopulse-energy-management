from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db
from app.models.wind import WindReading
from app.schemas.energy import WindReadingCreate, WindReadingResponse

router = APIRouter(prefix="/wind", tags=["Wind Energy"])


@router.get("/readings", response_model=List[WindReadingResponse])
def get_wind_readings(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve historical wind power generation readings."""
    return db.query(WindReading).order_by(desc(WindReading.timestamp)).offset(offset).limit(limit).all()


@router.post("/readings", response_model=WindReadingResponse, status_code=201)
def create_wind_reading(
    reading: WindReadingCreate,
    db: Session = Depends(get_db)
):
    """Record a new wind turbine output reading."""
    db_obj = WindReading(
        timestamp=reading.timestamp,
        power_output_kw=reading.power_output_kw,
        wind_speed_ms=reading.wind_speed_ms,
        turbine_rpm=reading.turbine_rpm,
        notes=reading.notes
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/latest", response_model=WindReadingResponse)
def get_latest_wind_reading(db: Session = Depends(get_db)):
    """Retrieve the most recent wind turbine reading."""
    obj = db.query(WindReading).order_by(desc(WindReading.timestamp)).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No wind readings found")
    return obj
