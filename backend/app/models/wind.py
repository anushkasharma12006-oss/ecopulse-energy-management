from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class WindReading(Base):
    __tablename__ = "wind_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    power_output_kw = Column(Float, nullable=False)
    wind_speed_ms = Column(Float, nullable=True)
    turbine_rpm = Column(Float, nullable=True)
    notes = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<WindReading id={self.id} power={self.power_output_kw}kW at {self.timestamp}>"
