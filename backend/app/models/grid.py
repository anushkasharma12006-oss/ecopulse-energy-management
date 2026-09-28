from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class GridReading(Base):
    __tablename__ = "grid_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    grid_import_kw = Column(Float, default=0.0, nullable=False)  # Energy purchased from grid
    grid_export_kw = Column(Float, default=0.0, nullable=False)  # Surplus energy sent to grid
    electricity_price_per_kwh = Column(Float, default=0.15, nullable=False)  # Tariff ($/kWh)
    grid_carbon_intensity_g_co2_kwh = Column(Float, nullable=True)  # Carbon emissions (gCO2/kWh)
    grid_status = Column(String(50), default="normal", nullable=True)  # normal, peak, off-peak

    def __repr__(self):
        return f"<GridReading id={self.id} import={self.grid_import_kw}kW export={self.grid_export_kw}kW at {self.timestamp}>"
