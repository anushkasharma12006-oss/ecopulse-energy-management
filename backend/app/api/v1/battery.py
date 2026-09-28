from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db
from app.models.battery import BatteryReading
from app.schemas.energy import BatteryReadingCreate, BatteryReadingResponse

router = APIRouter(prefix="/battery", tags=["Battery Storage"])


@router.get("/readings", response_model=List[BatteryReadingResponse])
def get_battery_readings(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve historical battery storage telemetry."""
    return db.query(BatteryReading).order_by(desc(BatteryReading.timestamp)).offset(offset).limit(limit).all()


@router.post("/readings", response_model=BatteryReadingResponse, status_code=201)
def create_battery_reading(
    reading: BatteryReadingCreate,
    db: Session = Depends(get_db)
):
    """Record a new battery status reading."""
    status = reading.status
    if not status:
        if reading.charge_rate_kw > 0.1:
            status = "charging"
        elif reading.charge_rate_kw < -0.1:
            status = "discharging"
        else:
            status = "idle"

    db_obj = BatteryReading(
        timestamp=reading.timestamp,
        charge_level_kwh=reading.charge_level_kwh,
        state_of_charge_pct=reading.state_of_charge_pct,
        charge_rate_kw=reading.charge_rate_kw,
        health_pct=reading.health_pct,
        temperature_c=reading.temperature_c,
        status=status
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/latest", response_model=BatteryReadingResponse)
def get_latest_battery_reading(db: Session = Depends(get_db)):
    """Retrieve the most recent battery telemetry."""
    obj = db.query(BatteryReading).order_by(desc(BatteryReading.timestamp)).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No battery readings found")
    return obj
