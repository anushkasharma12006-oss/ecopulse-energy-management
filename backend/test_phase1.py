"""Comprehensive Verification Suite for Phase 1 Foundation"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== STARTING PHASE 1 VERIFICATION TESTS ===\n")
    
    # 1. Health check
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: [GET /api/v1/health] ->", res.json())

    # 2. Root endpoint
    res = client.get("/")
    assert res.status_code == 200, f"Root endpoint failed: {res.text}"
    print("PASS: [GET /] -> System operational")

    # 3. Energy summary
    res = client.get("/api/v1/energy/summary")
    assert res.status_code == 200, f"Summary failed: {res.text}"
    summary = res.json()
    assert "solar_generation_kw" in summary
    assert "wind_generation_kw" in summary
    assert "battery_soc_pct" in summary
    assert "total_consumption_kw" in summary
    assert "grid_import_kw" in summary
    print(f"PASS: [GET /api/v1/energy/summary] -> Solar: {summary['solar_generation_kw']}kW, Wind: {summary['wind_generation_kw']}kW, Battery: {summary['battery_soc_pct']}%, Demand: {summary['total_consumption_kw']}kW")

    # 4. Energy timeseries
    res = client.get("/api/v1/energy/timeseries?hours=24")
    assert res.status_code == 200, f"Timeseries failed: {res.text}"
    ts = res.json()
    assert "points" in ts
    print(f"PASS: [GET /api/v1/energy/timeseries] -> Retrieved {len(ts['points'])} synchronized telemetry data points")

    # 5. Solar POST and GET
    res = client.post("/api/v1/solar/readings", json={
        "power_output_kw": 35.5,
        "solar_irradiance_wm2": 720.0,
        "panel_temperature_c": 32.0,
        "efficiency_pct": 19.2
    })
    assert res.status_code == 201, f"Solar POST failed: {res.text}"
    solar_id = res.json()["id"]
    res = client.get("/api/v1/solar/readings?limit=5")
    assert res.status_code == 200
    print(f"PASS: [POST/GET /api/v1/solar/readings] -> Created SolarReading #{solar_id}")

    # 6. Wind POST and GET
    res = client.post("/api/v1/wind/readings", json={
        "power_output_kw": 18.2,
        "wind_speed_ms": 7.4,
        "turbine_rpm": 21.0
    })
    assert res.status_code == 201, f"Wind POST failed: {res.text}"
    wind_id = res.json()["id"]
    res = client.get("/api/v1/wind/readings?limit=5")
    assert res.status_code == 200
    print(f"PASS: [POST/GET /api/v1/wind/readings] -> Created WindReading #{wind_id}")

    # 7. Battery POST and GET
    res = client.post("/api/v1/battery/readings", json={
        "charge_level_kwh": 75.0,
        "state_of_charge_pct": 75.0,
        "charge_rate_kw": 12.0,
        "health_pct": 99.0,
        "temperature_c": 26.5
    })
    assert res.status_code == 201, f"Battery POST failed: {res.text}"
    battery_id = res.json()["id"]
    res = client.get("/api/v1/battery/readings?limit=5")
    assert res.status_code == 200
    print(f"PASS: [POST/GET /api/v1/battery/readings] -> Created BatteryReading #{battery_id}")

    # 8. Consumption POST and GET
    res = client.post("/api/v1/consumption/readings", json={
        "consumption_kw": 28.4,
        "category": "HVAC System",
        "sub_meter_id": "MTR-01"
    })
    assert res.status_code == 201, f"Consumption POST failed: {res.text}"
    con_id = res.json()["id"]
    res = client.get("/api/v1/consumption/readings?limit=5")
    assert res.status_code == 200
    print(f"PASS: [POST/GET /api/v1/consumption/readings] -> Created ConsumptionReading #{con_id}")

    # 9. Grid POST and GET
    res = client.post("/api/v1/grid/readings", json={
        "grid_import_kw": 0.0,
        "grid_export_kw": 14.5,
        "electricity_price_per_kwh": 0.18,
        "grid_carbon_intensity_g_co2_kwh": 260.0
    })
    assert res.status_code == 201, f"Grid POST failed: {res.text}"
    grid_id = res.json()["id"]
    res = client.get("/api/v1/grid/readings?limit=5")
    assert res.status_code == 200
    print(f"PASS: [POST/GET /api/v1/grid/readings] -> Created GridReading #{grid_id}")

    # 10. CSV Template Download
    res = client.get("/api/v1/import/template")
    assert res.status_code == 200
    assert "solar_kw" in res.text
    print("PASS: [GET /api/v1/import/template] -> Valid CSV header and rows returned")

    # 11. CSV Ingest from file
    sample_path = os.path.join(os.path.dirname(__file__), "sample_data", "sample_energy_data.csv")
    with open(sample_path, "rb") as f:
        res = client.post("/api/v1/import/csv", files={"file": ("sample_energy_data.csv", f, "text/csv")})
    assert res.status_code == 200, f"CSV upload failed: {res.text}"
    import_json = res.json()
    assert import_json["success"] is True
    print(f"PASS: [POST /api/v1/import/csv] -> Successfully ingested CSV: {import_json['records_processed']} rows processed")

    print("\nALL PHASE 1 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
