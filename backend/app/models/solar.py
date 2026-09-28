from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class SolarReading(Base):
    __tablename__ = "solar_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    power_output_kw = Column(Float, nullable=False)
    panel_temperature_c = Column(Float, nullable=True)
    solar_irradiance_wm2 = Column(Float, nullable=True)
    efficiency_pct = Column(Float, nullable=True)
    notes = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<SolarReading id={self.id} power={self.power_output_kw}kW at {self.timestamp}>"
