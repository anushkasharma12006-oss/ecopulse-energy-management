from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class BatteryReading(Base):
    __tablename__ = "battery_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    charge_level_kwh = Column(Float, nullable=False)
    state_of_charge_pct = Column(Float, nullable=False)  # 0 to 100%
    charge_rate_kw = Column(Float, nullable=False)      # >0 charging, <0 discharging, 0 idle
    health_pct = Column(Float, nullable=True)           # SOH (State of Health)
    temperature_c = Column(Float, nullable=True)
    status = Column(String(50), default="idle", nullable=True)  # charging, discharging, idle

    def __repr__(self):
        return f"<BatteryReading id={self.id} SoC={self.state_of_charge_pct}% Rate={self.charge_rate_kw}kW at {self.timestamp}>"
