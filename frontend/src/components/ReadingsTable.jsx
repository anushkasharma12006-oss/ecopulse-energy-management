import React, { useState, useEffect } from 'react';
import { Database, Sun, Wind, Battery, Building2, UtilityPole } from 'lucide-react';
import { api } from '../services/api';

export default function ReadingsTable({ refreshTrigger }) {
  const [activeTab, setActiveTab] = useState('solar');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTabReadings(activeTab);
  }, [activeTab, refreshTrigger]);

  const loadTabReadings = async (tab) => {
    setLoading(true);
    try {
      let data = [];
      if (tab === 'solar') data = await api.getSolarReadings(20);
      else if (tab === 'wind') data = await api.getWindReadings(20);
      else if (tab === 'battery') data = await api.getBatteryReadings(20);
      else if (tab === 'consumption') data = await api.getConsumptionReadings(20);
      else if (tab === 'grid') data = await api.getGridReadings(20);
      setReadings(data || []);
    } catch (err) {
      console.error('Failed to load readings table:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'solar', label: 'Solar Telemetry', icon: Sun, color: '#f59e0b' },
    { id: 'wind', label: 'Wind Telemetry', icon: Wind, color: '#0284c7' },
    { id: 'battery', label: 'BESS Battery', icon: Battery, color: '#10b981' },
    { id: 'consumption', label: 'Load / Demand', icon: Building2, color: '#8b5cf6' },
    { id: 'grid', label: 'Grid Exchange', icon: UtilityPole, color: '#f43f5e' },
  ];

  return (
    <div className="surface-card" style={{ padding: '24px' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#10b981" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Subsystem Telemetry Logs
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Direct inspection of verified sensor observations stored in SQLite database
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-surface-2)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-hairline)',
          flexWrap: 'wrap'
        }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13} color={isSelected ? t.color : 'currentColor'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-hairline)', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-tertiary)' }}>
              <th style={{ padding: '9px 14px', fontWeight: 600, width: '70px' }}>Index</th>
              <th style={{ padding: '9px 14px', fontWeight: 600 }}>Observation Time</th>
              
              {activeTab === 'solar' && (
                <>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Active Power</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Solar Irradiance</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Cell Temp</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Efficiency</th>
                </>
              )}

              {activeTab === 'wind' && (
                <>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Active Power</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Wind Speed</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Turbine Rotor</th>
                </>
              )}

              {activeTab === 'battery' && (
                <>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>State of Charge</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Stored Energy</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Charge / Discharge Rate</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Operational Status</th>
                </>
              )}

              {activeTab === 'consumption' && (
                <>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Active Demand</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Sector / Category</th>
                </>
              )}

              {activeTab === 'grid' && (
                <>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Grid Import</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Grid Export</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Active Tariff</th>
                  <th style={{ padding: '9px 14px', fontWeight: 600 }}>Carbon Intensity</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                  Loading database records...
                </td>
              </tr>
            ) : readings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No records stored yet. Click "Seed 48h Data" or upload a CSV to populate.
                </td>
              </tr>
            ) : (
              readings.map((r, i) => (
                <tr
                  key={r.id || i}
                  style={{
                    borderBottom: '1px solid var(--border-hairline)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    #{r.id}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>

                  {activeTab === 'solar' && (
                    <>
                      <td style={{ padding: '10px 14px', color: '#fbbf24', fontWeight: 600 }} className="num-tabular">
                        {r.power_output_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.solar_irradiance_wm2 ? `${r.solar_irradiance_wm2} W/m²` : '--'}
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.panel_temperature_c ? `${r.panel_temperature_c}°C` : '--'}
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.efficiency_pct ? `${r.efficiency_pct}%` : '--'}
                      </td>
                    </>
                  )}

                  {activeTab === 'wind' && (
                    <>
                      <td style={{ padding: '10px 14px', color: '#38bdf8', fontWeight: 600 }} className="num-tabular">
                        {r.power_output_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.wind_speed_ms ? `${r.wind_speed_ms} m/s` : '--'}
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.turbine_rpm ? `${r.turbine_rpm} RPM` : '--'}
                      </td>
                    </>
                  )}

                  {activeTab === 'battery' && (
                    <>
                      <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: 600 }} className="num-tabular">
                        {r.state_of_charge_pct}%
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        {r.charge_level_kwh} kWh
                      </td>
                      <td style={{ padding: '10px 14px', color: r.charge_rate_kw > 0 ? '#34d399' : r.charge_rate_kw < 0 ? '#fbbf24' : 'var(--text-tertiary)' }} className="num-tabular">
                        {r.charge_rate_kw > 0 ? `+${r.charge_rate_kw}` : r.charge_rate_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`status-pill ${r.status === 'charging' ? 'status-pill-emerald' : r.status === 'discharging' ? 'status-pill-amber' : 'status-pill-neutral'}`}>
                          {r.status || 'standby'}
                        </span>
                      </td>
                    </>
                  )}

                  {activeTab === 'consumption' && (
                    <>
                      <td style={{ padding: '10px 14px', color: '#c084fc', fontWeight: 600 }} className="num-tabular">
                        {r.consumption_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {r.category || 'General Facility'}
                      </td>
                    </>
                  )}

                  {activeTab === 'grid' && (
                    <>
                      <td style={{ padding: '10px 14px', color: '#fb7185' }} className="num-tabular">
                        {r.grid_import_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px', color: '#34d399' }} className="num-tabular">
                        {r.grid_export_kw} kW
                      </td>
                      <td style={{ padding: '10px 14px' }} className="num-tabular">
                        ${r.electricity_price_per_kwh}/kWh
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-dim)' }} className="num-tabular">
                        {r.grid_carbon_intensity_g_co2_kwh ? `${r.grid_carbon_intensity_g_co2_kwh} g` : '--'}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
