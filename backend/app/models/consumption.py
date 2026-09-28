from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class ConsumptionReading(Base):
    __tablename__ = "consumption_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    consumption_kw = Column(Float, nullable=False)
    category = Column(String(100), default="Total Facility", nullable=True)  # HVAC, Lighting, Industrial, etc.
    sub_meter_id = Column(String(50), nullable=True)

    def __repr__(self):
        return f"<ConsumptionReading id={self.id} load={self.consumption_kw}kW category={self.category} at {self.timestamp}>"
