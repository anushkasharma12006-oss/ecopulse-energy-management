from datetime import datetime, timedelta
import math
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.solar import SolarReading
from app.models.wind import WindReading
from app.models.battery import BatteryReading
from app.models.consumption import ConsumptionReading
from app.models.grid import GridReading
from app.schemas.energy import EnergySummaryResponse, EnergyTimeseriesPoint, EnergyTimeseriesResponse


def get_energy_summary(db: Session) -> EnergySummaryResponse:
    """Retrieve the latest snapshot across all energy subsystems and compute key KPIs."""
    latest_solar = db.query(SolarReading).order_by(desc(SolarReading.timestamp)).first()
    latest_wind = db.query(WindReading).order_by(desc(WindReading.timestamp)).first()
    latest_battery = db.query(BatteryReading).order_by(desc(BatteryReading.timestamp)).first()
    latest_consumption = db.query(ConsumptionReading).order_by(desc(ConsumptionReading.timestamp)).first()
    latest_grid = db.query(GridReading).order_by(desc(GridReading.timestamp)).first()

    solar_kw = round(latest_solar.power_output_kw, 2) if latest_solar else 0.0
    wind_kw = round(latest_wind.power_output_kw, 2) if latest_wind else 0.0
    total_gen_kw = round(solar_kw + wind_kw, 2)

    battery_soc = round(latest_battery.state_of_charge_pct, 1) if latest_battery else 50.0
    battery_kwh = round(latest_battery.charge_level_kwh, 2) if latest_battery else 50.0
    battery_rate = round(latest_battery.charge_rate_kw, 2) if latest_battery else 0.0
    battery_status = latest_battery.status if latest_battery else "idle"

    consumption_kw = round(latest_consumption.consumption_kw, 2) if latest_consumption else 25.0
    grid_import_kw = round(latest_grid.grid_import_kw, 2) if latest_grid else 0.0
    grid_export_kw = round(latest_grid.grid_export_kw, 2) if latest_grid else 0.0
    net_grid_flow = round(grid_import_kw - grid_export_kw, 2)
    tariff = round(latest_grid.electricity_price_per_kwh, 3) if latest_grid else 0.165
    carbon_intensity = round(latest_grid.grid_carbon_intensity_g_co2_kwh, 1) if (latest_grid and latest_grid.grid_carbon_intensity_g_co2_kwh is not None) else 310.0

    # Self sufficiency & renewable penetration
    if consumption_kw > 0:
        renewable_share = min(100.0, round((total_gen_kw / consumption_kw) * 100, 1))
        # Direct generation + battery discharge
        usable_power = total_gen_kw + max(0.0, -battery_rate)
        self_sufficiency = min(100.0, round((usable_power / consumption_kw) * 100, 1))
    else:
        renewable_share = 100.0
        self_sufficiency = 100.0

    if grid_export_kw > 0.5:
        sys_status = "Exporting Surplus"
    elif grid_import_kw < 0.5:
        sys_status = "100% Self-Sustaining"
    else:
        sys_status = "Grid Supplemented"

    timestamp = (
        latest_solar.timestamp if latest_solar
        else latest_consumption.timestamp if latest_consumption
        else datetime.utcnow()
    )

    return EnergySummaryResponse(
        timestamp=timestamp,
        solar_generation_kw=solar_kw,
        wind_generation_kw=wind_kw,
        total_generation_kw=total_gen_kw,
        battery_soc_pct=battery_soc,
        battery_charge_level_kwh=battery_kwh,
        battery_charge_rate_kw=battery_rate,
        battery_status=battery_status,
        total_consumption_kw=consumption_kw,
        grid_import_kw=grid_import_kw,
        grid_export_kw=grid_export_kw,
        net_grid_flow_kw=net_grid_flow,
        current_tariff_usd_kwh=tariff,
        carbon_intensity_g_co2=carbon_intensity,
        self_sufficiency_pct=self_sufficiency,
        renewable_share_pct=renewable_share,
        system_status=sys_status,
    )


def get_energy_timeseries(db: Session, hours: int = 24) -> EnergyTimeseriesResponse:
    """Retrieve synchronized time-series data for the dashboard charts."""
    since = datetime.utcnow() - timedelta(hours=hours)

    solars = {s.timestamp.replace(second=0, microsecond=0): s.power_output_kw
              for s in db.query(SolarReading).filter(SolarReading.timestamp >= since).all()}
    winds = {w.timestamp.replace(second=0, microsecond=0): w.power_output_kw
             for w in db.query(WindReading).filter(WindReading.timestamp >= since).all()}
    batteries = {b.timestamp.replace(second=0, microsecond=0): (b.state_of_charge_pct, b.charge_rate_kw)
                 for b in db.query(BatteryReading).filter(BatteryReading.timestamp >= since).all()}
    consumptions = {c.timestamp.replace(second=0, microsecond=0): c.consumption_kw
                    for c in db.query(ConsumptionReading).filter(ConsumptionReading.timestamp >= since).all()}
    grids = {g.timestamp.replace(second=0, microsecond=0): (g.grid_import_kw, g.grid_export_kw)
             for g in db.query(GridReading).filter(GridReading.timestamp >= since).all()}

    # Gather all unique timestamps
    all_timestamps = sorted(set(list(solars.keys()) + list(winds.keys()) + list(consumptions.keys())))

    points = []
    for ts in all_timestamps:
        sol = round(solars.get(ts, 0.0), 2)
        wnd = round(winds.get(ts, 0.0), 2)
        total_ren = round(sol + wnd, 2)
        bat_soc, bat_rate = batteries.get(ts, (50.0, 0.0))
        con = round(consumptions.get(ts, 20.0), 2)
        g_imp, g_exp = grids.get(ts, (0.0, 0.0))
        net_bal = round(total_ren - con, 2)

        points.append(
            EnergyTimeseriesPoint(
                timestamp=ts,
                solar_kw=sol,
                wind_kw=wnd,
                total_renewables_kw=total_ren,
                battery_soc_pct=round(bat_soc, 1),
                battery_rate_kw=round(bat_rate, 2),
                consumption_kw=con,
                grid_import_kw=round(g_imp, 2),
                grid_export_kw=round(g_exp, 2),
                net_balance_kw=net_bal,
            )
        )

    return EnergyTimeseriesResponse(
        range=f"{hours}h",
        count=len(points),
        points=points,
    )


def seed_default_data(db: Session, hours: int = 48) -> int:
    """Seed clean, realistic synthetic historical energy data if the database is empty."""
    existing_count = db.query(ConsumptionReading).count()
    if existing_count > 0:
        return existing_count

    start_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0) - timedelta(hours=hours)
    battery_capacity_kwh = 100.0
    current_battery_kwh = 55.0

    for i in range(hours + 1):
        ts = start_time + timedelta(hours=i)
        hour_of_day = ts.hour

        # Solar output: bell-curve between 06:00 and 19:00
        if 6 <= hour_of_day <= 18:
            sun_factor = math.sin((hour_of_day - 6) / 12 * math.pi)
            solar_kw = max(0.0, round(sun_factor * 48.0 + (math.sin(i * 1.5) * 4.0), 2))
            irradiance = round(sun_factor * 950.0, 1)
            temp = round(20.0 + sun_factor * 18.0, 1)
        else:
            solar_kw = 0.0
            irradiance = 0.0
            temp = 16.0

        # Wind output: sinusoidal fluctuations with gust factor
        wind_base = 12.0 + 8.0 * math.sin(i * 0.35)
        wind_speed = round(max(2.0, 6.5 + 3.0 * math.cos(i * 0.2)), 1)
        wind_kw = max(0.0, round(wind_base + (math.sin(i * 0.7) * 3.5), 2))

        # Consumption: morning wake-up peak, midday dip/moderate, evening peak
        if 0 <= hour_of_day < 6:
            con_kw = round(14.0 + math.sin(i) * 2.0, 2)
        elif 6 <= hour_of_day < 9:
            con_kw = round(28.0 + (hour_of_day - 6) * 4.0 + math.cos(i) * 3.0, 2)
        elif 9 <= hour_of_day < 17:
            con_kw = round(34.0 + math.sin(i * 0.8) * 5.0, 2)
        elif 17 <= hour_of_day < 22:
            con_kw = round(42.0 + math.cos(i) * 4.0, 2)
        else:
            con_kw = round(22.0 + math.sin(i) * 2.0, 2)

        total_ren = solar_kw + wind_kw
        diff = total_ren - con_kw

        # Battery dispatch simulation
        if diff > 0:  # Surplus renewable energy -> charge battery
            charge_rate = min(25.0, diff)  # Max 25kW charge rate
            room = battery_capacity_kwh - current_battery_kwh
            actual_charge = min(charge_rate, room)
            current_battery_kwh += actual_charge * 1.0  # 1 hour step
            battery_rate = actual_charge
            bat_status = "charging" if actual_charge > 0.5 else "standby"
            grid_import = 0.0
            grid_export = max(0.0, round(diff - actual_charge, 2))
        else:  # Deficit -> discharge battery first
            deficit = abs(diff)
            discharge_rate = min(25.0, deficit)
            available = current_battery_kwh - 10.0  # Keep 10% reserve
            actual_discharge = max(0.0, min(discharge_rate, available))
            current_battery_kwh -= actual_discharge * 1.0
            battery_rate = -actual_discharge
            bat_status = "discharging" if actual_discharge > 0.5 else "standby"
            unmet = deficit - actual_discharge
            grid_import = max(0.0, round(unmet, 2))
            grid_export = 0.0

        current_battery_kwh = max(10.0, min(battery_capacity_kwh, current_battery_kwh))
        soc_pct = round((current_battery_kwh / battery_capacity_kwh) * 100.0, 1)

        # Dynamic tariff ($/kWh)
        if 16 <= hour_of_day <= 21:
            tariff = 0.28  # Peak rate
            grid_status = "peak"
        elif 0 <= hour_of_day <= 6:
            tariff = 0.09  # Off-peak night rate
            grid_status = "off-peak"
        else:
            tariff = 0.16  # Standard rate
            grid_status = "normal"

        # Insert records into DB
        db.add(SolarReading(
            timestamp=ts,
            power_output_kw=solar_kw,
            solar_irradiance_wm2=irradiance,
            panel_temperature_c=temp,
            efficiency_pct=round(18.5 + (temp - 25.0) * -0.04, 2)
        ))
        db.add(WindReading(
            timestamp=ts,
            power_output_kw=wind_kw,
            wind_speed_ms=wind_speed,
            turbine_rpm=round(wind_speed * 2.8, 1)
        ))
        db.add(BatteryReading(
            timestamp=ts,
            charge_level_kwh=round(current_battery_kwh, 2),
            state_of_charge_pct=soc_pct,
            charge_rate_kw=round(battery_rate, 2),
            health_pct=98.8,
            temperature_c=round(24.0 + abs(battery_rate) * 0.2, 1),
            status=bat_status
        ))
        db.add(ConsumptionReading(
            timestamp=ts,
            consumption_kw=con_kw,
            category="Total Facility"
        ))
        db.add(GridReading(
            timestamp=ts,
            grid_import_kw=grid_import,
            grid_export_kw=grid_export,
            electricity_price_per_kwh=tariff,
            grid_carbon_intensity_g_co2_kwh=round(280.0 + (grid_import * 2.5), 1),
            grid_status=grid_status
        ))

    db.commit()
    return hours + 1
