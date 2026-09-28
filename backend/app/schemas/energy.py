from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List


# Solar Schemas
class SolarReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    power_output_kw: float
    panel_temperature_c: Optional[float] = None
    solar_irradiance_wm2: Optional[float] = None
    efficiency_pct: Optional[float] = None
    notes: Optional[str] = None


class SolarReadingCreate(SolarReadingBase):
    pass


class SolarReadingResponse(SolarReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


# Wind Schemas
class WindReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    power_output_kw: float
    wind_speed_ms: Optional[float] = None
    turbine_rpm: Optional[float] = None
    notes: Optional[str] = None


class WindReadingCreate(WindReadingBase):
    pass


class WindReadingResponse(WindReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


# Battery Schemas
class BatteryReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    charge_level_kwh: float
    state_of_charge_pct: float
    charge_rate_kw: float
    health_pct: Optional[float] = 100.0
    temperature_c: Optional[float] = 25.0
    status: Optional[str] = "idle"


class BatteryReadingCreate(BatteryReadingBase):
    pass


class BatteryReadingResponse(BatteryReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


# Electricity Consumption Schemas
class ConsumptionReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    consumption_kw: float
    category: Optional[str] = "Total Facility"
    sub_meter_id: Optional[str] = None


class ConsumptionReadingCreate(ConsumptionReadingBase):
    pass


class ConsumptionReadingResponse(ConsumptionReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


# Grid Electricity Schemas
class GridReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    grid_import_kw: float = 0.0
    grid_export_kw: float = 0.0
    electricity_price_per_kwh: float = 0.15
    grid_carbon_intensity_g_co2_kwh: Optional[float] = 320.0
    grid_status: Optional[str] = "normal"


class GridReadingCreate(GridReadingBase):
    pass


class GridReadingResponse(GridReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)


# Dashboard Aggregations & Telemetry
class EnergySummaryResponse(BaseModel):
    timestamp: datetime
    solar_generation_kw: float
    wind_generation_kw: float
    total_generation_kw: float
    battery_soc_pct: float
    battery_charge_level_kwh: float
    battery_charge_rate_kw: float
    battery_status: str
    total_consumption_kw: float
    grid_import_kw: float
    grid_export_kw: float
    net_grid_flow_kw: float
    current_tariff_usd_kwh: float
    carbon_intensity_g_co2: Optional[float]
    self_sufficiency_pct: float
    renewable_share_pct: float
    system_status: str


class EnergyTimeseriesPoint(BaseModel):
    timestamp: datetime
    solar_kw: float
    wind_kw: float
    total_renewables_kw: float
    battery_soc_pct: float
    battery_rate_kw: float
    consumption_kw: float
    grid_import_kw: float
    grid_export_kw: float
    net_balance_kw: float


class EnergyTimeseriesResponse(BaseModel):
    range: str
    count: int
    points: List[EnergyTimeseriesPoint]
