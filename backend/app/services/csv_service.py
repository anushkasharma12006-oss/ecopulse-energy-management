import io
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.solar import SolarReading
from app.models.wind import WindReading
from app.models.battery import BatteryReading
from app.models.consumption import ConsumptionReading
from app.models.grid import GridReading
from app.schemas.imports import CsvImportResponse


def parse_and_import_csv(db: Session, file_content: bytes, filename: str) -> CsvImportResponse:
    """Parse a CSV file and store records in corresponding database tables."""
    try:
        df = pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        return CsvImportResponse(
            success=False,
            filename=filename,
            records_processed=0,
            imported_counts={},
            message=f"Failed to read CSV: {str(e)}",
            sample_records=None
        )

    # Normalize column names: lowercase, strip, replace spaces/dashes with underscores
    df.columns = [str(c).strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]

    if "timestamp" not in df.columns and "date" not in df.columns and "time" not in df.columns:
        # Default to synthetic current timestamps if missing
        df["timestamp"] = [datetime.utcnow()] * len(df)
    else:
        ts_col = "timestamp" if "timestamp" in df.columns else ("date" if "date" in df.columns else "time")
        df["timestamp"] = pd.to_datetime(df[ts_col], errors="coerce")
        df["timestamp"] = df["timestamp"].fillna(datetime.utcnow())

    counts = {
        "solar": 0,
        "wind": 0,
        "battery": 0,
        "consumption": 0,
        "grid": 0
    }

    sample_preview: List[Dict[str, Any]] = []

    for idx, row in df.iterrows():
        ts: datetime = row["timestamp"]
        if hasattr(ts, "to_pydatetime"):
            ts = ts.to_pydatetime()

        row_preview: Dict[str, Any] = {"timestamp": ts.isoformat()}

        # 1. Solar Reading
        solar_val = None
        for col in ["solar_kw", "solar_power_kw", "solar_generation_kw", "power_output_kw"]:
            if col in df.columns and pd.notna(row[col]):
                solar_val = float(row[col])
                break
        if solar_val is not None:
            irradiance = float(row["solar_irradiance_wm2"]) if "solar_irradiance_wm2" in df.columns and pd.notna(row["solar_irradiance_wm2"]) else None
            temp = float(row["panel_temperature_c"]) if "panel_temperature_c" in df.columns and pd.notna(row["panel_temperature_c"]) else None
            db.add(SolarReading(
                timestamp=ts,
                power_output_kw=solar_val,
                solar_irradiance_wm2=irradiance,
                panel_temperature_c=temp
            ))
            counts["solar"] += 1
            row_preview["solar_kw"] = solar_val

        # 2. Wind Reading
        wind_val = None
        for col in ["wind_kw", "wind_power_kw", "wind_generation_kw"]:
            if col in df.columns and pd.notna(row[col]):
                wind_val = float(row[col])
                break
        if wind_val is not None:
            speed = float(row["wind_speed_ms"]) if "wind_speed_ms" in df.columns and pd.notna(row["wind_speed_ms"]) else None
            rpm = float(row["turbine_rpm"]) if "turbine_rpm" in df.columns and pd.notna(row["turbine_rpm"]) else None
            db.add(WindReading(
                timestamp=ts,
                power_output_kw=wind_val,
                wind_speed_ms=speed,
                turbine_rpm=rpm
            ))
            counts["wind"] += 1
            row_preview["wind_kw"] = wind_val

        # 3. Battery Reading
        has_battery = False
        soc = float(row["battery_soc"]) if "battery_soc" in df.columns and pd.notna(row["battery_soc"]) else (
            float(row["state_of_charge_pct"]) if "state_of_charge_pct" in df.columns and pd.notna(row["state_of_charge_pct"]) else 50.0
        )
        kwh = float(row["battery_kwh"]) if "battery_kwh" in df.columns and pd.notna(row["battery_kwh"]) else (
            float(row["charge_level_kwh"]) if "charge_level_kwh" in df.columns and pd.notna(row["charge_level_kwh"]) else 50.0
        )
        rate = float(row["battery_rate_kw"]) if "battery_rate_kw" in df.columns and pd.notna(row["battery_rate_kw"]) else (
            float(row["charge_rate_kw"]) if "charge_rate_kw" in df.columns and pd.notna(row["charge_rate_kw"]) else 0.0
        )
        status = str(row["battery_status"]) if "battery_status" in df.columns and pd.notna(row["battery_status"]) else (
            "charging" if rate > 0.1 else ("discharging" if rate < -0.1 else "idle")
        )

        if any(c in df.columns for c in ["battery_soc", "battery_kwh", "state_of_charge_pct", "battery_rate_kw", "charge_rate_kw"]):
            has_battery = True
            db.add(BatteryReading(
                timestamp=ts,
                charge_level_kwh=kwh,
                state_of_charge_pct=soc,
                charge_rate_kw=rate,
                status=status
            ))
            counts["battery"] += 1
            row_preview["battery_soc"] = soc
            row_preview["battery_rate"] = rate

        # 4. Consumption Reading
        con_val = None
        for col in ["consumption_kw", "load_kw", "power_demand_kw", "electricity_consumption_kw"]:
            if col in df.columns and pd.notna(row[col]):
                con_val = float(row[col])
                break
        if con_val is not None:
            category = str(row["category"]) if "category" in df.columns and pd.notna(row["category"]) else "Facility Load"
            db.add(ConsumptionReading(
                timestamp=ts,
                consumption_kw=con_val,
                category=category
            ))
            counts["consumption"] += 1
            row_preview["consumption_kw"] = con_val

        # 5. Grid Reading
        has_grid = False
        g_imp = float(row["grid_import_kw"]) if "grid_import_kw" in df.columns and pd.notna(row["grid_import_kw"]) else 0.0
        g_exp = float(row["grid_export_kw"]) if "grid_export_kw" in df.columns and pd.notna(row["grid_export_kw"]) else 0.0
        tariff = float(row["electricity_price_per_kwh"]) if "electricity_price_per_kwh" in df.columns and pd.notna(row["electricity_price_per_kwh"]) else (
            float(row["price_kwh"]) if "price_kwh" in df.columns and pd.notna(row["price_kwh"]) else 0.15
        )
        carbon = float(row["grid_carbon_intensity_g_co2_kwh"]) if "grid_carbon_intensity_g_co2_kwh" in df.columns and pd.notna(row["grid_carbon_intensity_g_co2_kwh"]) else 300.0

        if any(c in df.columns for c in ["grid_import_kw", "grid_export_kw", "electricity_price_per_kwh", "price_kwh"]):
            has_grid = True
            db.add(GridReading(
                timestamp=ts,
                grid_import_kw=g_imp,
                grid_export_kw=g_exp,
                electricity_price_per_kwh=tariff,
                grid_carbon_intensity_g_co2_kwh=carbon
            ))
            counts["grid"] += 1
            row_preview["grid_import_kw"] = g_imp
            row_preview["grid_export_kw"] = g_exp

        if idx < 5:
            sample_preview.append(row_preview)

    db.commit()

    total_records = len(df)
    imported_sum = sum(counts.values())

    return CsvImportResponse(
        success=True,
        filename=filename,
        records_processed=total_records,
        imported_counts=counts,
        message=f"Successfully processed {total_records} rows. Generated {imported_sum} subsystem readings.",
        sample_records=sample_preview
    )


def generate_sample_csv_text() -> str:
    """Generate a clean CSV template string for energy telemetry."""
    header = "timestamp,solar_kw,wind_kw,battery_soc,battery_kwh,battery_rate_kw,consumption_kw,grid_import_kw,grid_export_kw,electricity_price_per_kwh\n"
    rows = [
        "2026-09-28T00:00:00,0.0,18.4,62.0,62.0,0.0,15.2,0.0,3.2,0.09",
        "2026-09-28T04:00:00,0.0,15.1,58.0,58.0,0.0,14.8,0.0,0.3,0.09",
        "2026-09-28T08:00:00,18.5,12.0,55.0,55.0,2.5,28.4,0.0,0.0,0.16",
        "2026-09-28T12:00:00,46.8,16.2,85.0,85.0,15.0,32.1,0.0,15.9,0.16",
        "2026-09-28T16:00:00,24.1,19.5,95.0,95.0,5.0,35.0,0.0,3.6,0.28",
        "2026-09-28T18:00:00,6.2,14.0,90.0,90.0,-12.0,42.5,10.3,0.0,0.28",
        "2026-09-28T21:00:00,0.0,11.5,75.0,75.0,-15.0,38.0,11.5,0.0,0.22",
    ]
    return header + "\n".join(rows)
