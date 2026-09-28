from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.api.deps import get_db
from app.models.consumption import ConsumptionReading
from app.schemas.energy import ConsumptionReadingCreate, ConsumptionReadingResponse

router = APIRouter(prefix="/consumption", tags=["Electricity Consumption"])


@router.get("/readings", response_model=List[ConsumptionReadingResponse])
def get_consumption_readings(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve historical electricity consumption data."""
    return db.query(ConsumptionReading).order_by(desc(ConsumptionReading.timestamp)).offset(offset).limit(limit).all()


@router.post("/readings", response_model=ConsumptionReadingResponse, status_code=201)
def create_consumption_reading(
    reading: ConsumptionReadingCreate,
    db: Session = Depends(get_db)
):
    """Record a new electricity consumption reading."""
    db_obj = ConsumptionReading(
        timestamp=reading.timestamp,
        consumption_kw=reading.consumption_kw,
        category=reading.category or "Total Facility",
        sub_meter_id=reading.sub_meter_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/latest", response_model=ConsumptionReadingResponse)
def get_latest_consumption_reading(db: Session = Depends(get_db)):
    """Retrieve the most recent consumption reading."""
    obj = db.query(ConsumptionReading).order_by(desc(ConsumptionReading.timestamp)).first()
    if not obj:
        raise HTTPException(status_code=404, detail="No consumption readings found")
    return obj
