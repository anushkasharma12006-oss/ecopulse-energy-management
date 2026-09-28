# AI Energy Management & Optimization System (EcoPulse AI)

An intelligent, autonomous energy management system foundation built to monitor, analyze, and optimize multi-source renewable generation, battery storage systems (BESS), facility electricity demand, and utility grid exchanges.

---

## 📁 Project Architecture & Clean Folder Structure

```text
ecosystem/
├── backend/
│   ├── .venv/                      # Python virtual environment
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application & lifecycle startup
│   │   ├── core/
│   │   │   ├── config.py           # Application settings & environment vars
│   │   │   └── database.py         # SQLAlchemy engine, session & init
│   │   ├── models/                 # SQLAlchemy ORM database models
│   │   │   ├── solar.py            # Solar energy readings
│   │   │   ├── wind.py             # Wind energy readings
│   │   │   ├── battery.py          # Battery storage & state of charge (SoC)
│   │   │   ├── consumption.py      # Facility electricity consumption
│   │   │   └── grid.py             # Utility grid import/export & tariffs
│   │   ├── schemas/                # Pydantic schemas for validation & responses
│   │   │   ├── energy.py           # Energy domain & aggregation schemas
│   │   │   └── imports.py          # CSV import response schemas
│   │   ├── api/
│   │   │   ├── deps.py             # Dependency injection (e.g. get_db)
│   │   │   └── v1/                 # Versioned REST API endpoints
│   │   │       ├── energy.py       # Live summary, time-series, seed & reset
│   │   │       ├── solar.py        # Solar CRUD & latest telemetry
│   │   │       ├── wind.py         # Wind CRUD & latest telemetry
│   │   │       ├── battery.py      # Battery CRUD & latest telemetry
│   │   │       ├── consumption.py  # Consumption CRUD & latest telemetry
│   │   │       ├── grid.py         # Grid exchange CRUD & latest telemetry
│   │   │       └── csv_import.py   # CSV upload, template & sample loader
│   │   └── services/               # Business logic & data processing
│   │       ├── energy_service.py   # KPI aggregations & synthetic seeding
│   │       └── csv_service.py      # Flexible CSV parser & validator
│   ├── sample_data/
│   │   └── sample_energy_data.csv  # 48-hour realistic energy dataset
│   ├── energy_ecosystem.db         # SQLite database file
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Backend runner script
│   └── test_phase1.py              # Automated verification test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Live sync, refresh & database controls
│   │   │   ├── MetricCard.jsx      # Glassmorphic KPI cards with glows & progress
│   │   │   ├── PowerFlowCard.jsx   # Microgrid power flow visualizer
│   │   │   ├── EnergyChart.jsx     # Interactive multi-series SVG chart
│   │   │   ├── CsvUploader.jsx     # Drag-and-drop CSV ingestion & template
│   │   │   └── ReadingsTable.jsx   # Subsystem database records browser
│   │   ├── services/
│   │   │   └── api.js              # Fetch client wrapper with proxy support
│   │   ├── styles/
│   │   ├── App.jsx                 # Main responsive energy dashboard
│   │   ├── main.jsx                # React entrypoint
│   │   └── index.css               # Vanilla CSS design system & cyber dark theme
│   ├── package.json
│   └── vite.config.js              # Vite config with API proxy
└── README.md
```

---

## 🗄️ Database Schema (SQLAlchemy Models)

The SQLite database (`energy_ecosystem.db`) is structured with normalized tables indexed by timestamp:

### 1. `solar_readings`
| Column | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique reading identifier |
| `timestamp` | DateTime | Timestamp of observation |
| `power_output_kw` | Float | Solar photovoltaic generation in kW |
| `panel_temperature_c` | Float | Solar panel surface temperature in °C |
| `solar_irradiance_wm2` | Float | Solar irradiance in W/m² |
| `efficiency_pct` | Float | Panel conversion efficiency (%) |
| `notes` | String | Optional operational notes |

### 2. `wind_readings`
| Column | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique reading identifier |
| `timestamp` | DateTime | Timestamp of observation |
| `power_output_kw` | Float | Wind turbine active generation in kW |
| `wind_speed_ms` | Float | Anemometer wind speed in m/s |
| `turbine_rpm` | Float | Rotor rotation speed in RPM |
| `notes` | String | Optional operational notes |

### 3. `battery_readings`
| Column | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique reading identifier |
| `timestamp` | DateTime | Timestamp of observation |
| `charge_level_kwh` | Float | Current stored energy in kWh |
| `state_of_charge_pct` | Float | Battery SoC percentage (0 - 100%) |
| `charge_rate_kw` | Float | Rate (+ charging, - discharging, 0 idle) |
| `health_pct` | Float | Battery State of Health (SOH %) |
| `temperature_c` | Float | Battery cell temperature in °C |
| `status` | String | `charging`, `discharging`, `idle` |

### 4. `consumption_readings`
| Column | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique reading identifier |
| `timestamp` | DateTime | Timestamp of observation |
| `consumption_kw` | Float | Active facility electrical load in kW |
| `category` | String | Load sector (e.g., `HVAC`, `Lighting`, `Facility`) |
| `sub_meter_id` | String | Sub-panel or sub-meter ID |

### 5. `grid_readings`
| Column | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique reading identifier |
| `timestamp` | DateTime | Timestamp of observation |
| `grid_import_kw` | Float | Power drawn from utility grid in kW |
| `grid_export_kw` | Float | Surplus renewable fed back to grid in kW |
| `electricity_price_per_kwh` | Float | Real-time tariff ($/kWh) |
| `grid_carbon_intensity_g_co2_kwh` | Float | Grid carbon footprint (gCO2/kWh) |
| `grid_status` | String | `normal`, `peak`, `off-peak` |

---

## 🔌 API Endpoints (`/api/v1`)

### System & Health
* `GET /` — API root, status, version, and subsystem directory
* `GET /api/v1/health` — Service health and database connection status

### Energy Aggregations & Dashboard
* `GET /api/v1/energy/summary` — Real-time live generation, battery SoC, net flow, and sufficiency %
* `GET /api/v1/energy/timeseries?hours=24` — Synchronized multi-series time-series telemetry
* `POST /api/v1/energy/seed?hours=48` — Seeds database with clean, realistic simulated data
* `DELETE /api/v1/energy/reset` — Clears all readings from database

### Subsystem Telemetry
* `GET /api/v1/solar/readings` & `POST /api/v1/solar/readings` — Solar records
* `GET /api/v1/wind/readings` & `POST /api/v1/wind/readings` — Wind turbine records
* `GET /api/v1/battery/readings` & `POST /api/v1/battery/readings` — Battery BESS records
* `GET /api/v1/consumption/readings` & `POST /api/v1/consumption/readings` — Demand records
* `GET /api/v1/grid/readings` & `POST /api/v1/grid/readings` — Utility grid exchange records

### CSV Ingestion Foundation
* `POST /api/v1/import/csv` — Upload multipart CSV file for ingestion
* `GET /api/v1/import/template` — Download standard CSV template structure
* `POST /api/v1/import/sample` — Ingest built-in sample dataset

---

## 📦 Required Dependencies

### Backend (`requirements.txt`)
- `fastapi>=0.115.0`
- `uvicorn[standard]>=0.30.0`
- `sqlalchemy>=2.0.30`
- `pydantic>=2.8.0`
- `pydantic-settings>=2.4.0`
- `python-multipart>=0.0.9`
- `pandas>=2.2.0`
- `httpx>=0.28.0`

### Frontend (`package.json`)
- `react: ^19.0.0`
- `react-dom: ^19.0.0`
- `lucide-react: ^1.16.0`
- `vite: ^8.3.1`

---

## 🚀 Commands to Run the Project

### 1. Run the Backend (FastAPI)
```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# or
source .venv/bin/activate      # Linux / macOS

# Start FastAPI dev server
python run.py
# Server runs on http://127.0.0.1:8000 (Swagger docs at http://127.0.0.1:8000/docs)
```

### 2. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Dashboard opens on http://localhost:5173/
```

### 3. Run Automated Tests
```bash
cd backend
.\.venv\Scripts\python.exe test_phase1.py
```
