import React from 'react';
import { Sun, Wind, BatteryCharging, Battery, Building2, UtilityPole, ArrowRight, ArrowDown, ArrowUp, Zap } from 'lucide-react';

export default function PowerFlowCard({ summary }) {
  if (!summary) return null;

  const solar = Number(summary.solar_generation_kw || 0);
  const wind = Number(summary.wind_generation_kw || 0);
  const totalGen = Number(summary.total_generation_kw || 0);
  const batteryRate = Number(summary.battery_charge_rate_kw || 0);
  const batterySoc = Number(summary.battery_soc_pct || 0);
  const load = Number(summary.total_consumption_kw || 0);
  const gridImport = Number(summary.grid_import_kw || 0);
  const gridExport = Number(summary.grid_export_kw || 0);

  const isCharging = batteryRate > 0.1;
  const isDischarging = batteryRate < -0.1;
  const isExporting = gridExport > 0.1;
  const isImporting = gridImport > 0.1;

  return (
    <div className="eco-card" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Central Energy Flow &amp; Microgrid Routing
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Dynamic energy transfer between renewable generation, storage, load demand, and utility grid
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`pill-badge ${isExporting ? 'pill-green' : isImporting ? 'pill-critical' : 'pill-green'}`}>
            {isExporting ? `Exporting +${gridExport} kW` : isImporting ? `Importing -${gridImport} kW` : 'Grid Neutral'}
          </span>
        </div>
      </div>

      {/* Central Flow Pipeline: Solar/Wind -> Battery -> Load <-> Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        alignItems: 'stretch',
        position: 'relative'
      }}>
        
        {/* Node 1: Solar Generation (with Wind) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-solar-border)',
          borderRadius: '12px',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-solar-subtle)',
                color: 'var(--accent-solar)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-solar-border)'
              }}>
                <Sun size={17} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-solar)', textTransform: 'uppercase' }}>
                Solar Generation
              </span>
            </div>
            <span className="pill-badge pill-solar">
              {solar > 0 ? 'Active' : 'Standby'}
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {solar}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>kW</span>
            </div>
            {wind > 0 && (
              <div style={{ fontSize: '0.74rem', color: 'var(--accent-wind)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wind size={12} />
                <span>+ {wind} kW Wind Support</span>
              </div>
            )}
          </div>

          <div style={{
            padding: '5px 10px',
            background: 'rgba(255, 200, 87, 0.08)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: 'var(--accent-solar)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Power Output</span>
            <ArrowRight size={13} className="flow-animated" />
          </div>
        </div>

        {/* Node 2: Battery Storage BESS */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-battery-border)',
          borderRadius: '12px',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-battery-subtle)',
                color: 'var(--accent-battery)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-battery-border)'
              }}>
                <Battery size={17} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-battery)', textTransform: 'uppercase' }}>
                Battery Storage
              </span>
            </div>
            <span className={`pill-badge ${isCharging ? 'pill-battery' : isDischarging ? 'pill-solar' : 'pill-green'}`}>
              {batterySoc}% SoC
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {batterySoc}%
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ({summary.battery_charge_level_kwh} kWh)
              </span>
            </div>
            
            {/* Battery bar */}
            <div style={{ height: '4px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ height: '100%', width: `${batterySoc}%`, background: 'var(--accent-battery)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div style={{
            padding: '5px 10px',
            background: isCharging ? 'rgba(114, 224, 106, 0.1)' : 'rgba(255, 255, 255, 0.04)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: isCharging ? 'var(--accent-battery)' : isDischarging ? 'var(--accent-solar)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{isCharging ? `Charging +${batteryRate} kW` : isDischarging ? `Discharging ${batteryRate} kW` : 'Buffer Standby'}</span>
            <ArrowRight size={13} className="flow-animated" />
          </div>
        </div>

        {/* Node 3: Energy Load (Demand) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-consumption-border)',
          borderRadius: '12px',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-consumption-subtle)',
                color: 'var(--accent-consumption)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--accent-consumption-border)'
              }}>
                <Building2 size={17} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-consumption)', textTransform: 'uppercase' }}>
                Energy Load
              </span>
            </div>
            <span className="pill-badge pill-consumption">
              Normal
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {load}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>kW</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Facility Baseload &amp; Operations
            </div>
          </div>

          <div style={{
            padding: '5px 10px',
            background: 'rgba(139, 156, 246, 0.08)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: 'var(--accent-consumption)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Active Consumption</span>
            <span style={{ fontWeight: 600 }}>{summary.self_sufficiency_pct}% Solar/Bat</span>
          </div>
        </div>

        {/* Node 4: Utility Grid Exchange */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${isExporting ? 'var(--accent-primary-border)' : isImporting ? 'rgba(255, 107, 107, 0.3)' : 'var(--border-hairline)'}`,
          borderRadius: '12px',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isExporting ? 'var(--accent-primary-subtle)' : isImporting ? 'var(--accent-critical-subtle)' : 'rgba(255, 255, 255, 0.04)',
                color: isExporting ? 'var(--accent-primary)' : isImporting ? 'var(--accent-critical)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isExporting ? 'var(--accent-primary-border)' : isImporting ? 'rgba(255, 107, 107, 0.3)' : 'var(--border-hairline)'}`
              }}>
                <UtilityPole size={17} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isExporting ? 'var(--accent-primary)' : isImporting ? 'var(--accent-critical)' : 'var(--text-main)', textTransform: 'uppercase' }}>
                Utility Grid
              </span>
            </div>
            <span className={`pill-badge ${isExporting ? 'pill-green' : isImporting ? 'pill-critical' : 'pill-green'}`}>
              {isExporting ? 'Feed-in' : isImporting ? 'Importing' : 'Balanced'}
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="num-tabular" style={{ fontSize: '1.6rem', fontWeight: 800, color: isExporting ? 'var(--accent-primary)' : isImporting ? 'var(--accent-critical)' : 'var(--text-main)' }}>
                {isExporting ? `+${gridExport}` : isImporting ? `-${gridImport}` : '0.0'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>kW</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Active Tariff: <strong style={{ color: 'var(--text-main)' }}>₹{(summary.current_tariff_usd_kwh * 83).toFixed(2)}/kWh</strong>
            </div>
          </div>

          <div style={{
            padding: '5px 10px',
            background: isExporting ? 'rgba(53, 208, 127, 0.08)' : isImporting ? 'rgba(255, 107, 107, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: isExporting ? 'var(--accent-primary)' : isImporting ? 'var(--accent-critical)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{isExporting ? 'Supplying Grid' : isImporting ? 'Supplemental Draw' : 'Zero Net Flow'}</span>
            {isExporting ? <ArrowRight size={13} className="flow-animated" /> : isImporting ? <ArrowDown size={13} className="flow-animated" /> : null}
          </div>
        </div>

      </div>

    </div>
  );
}
