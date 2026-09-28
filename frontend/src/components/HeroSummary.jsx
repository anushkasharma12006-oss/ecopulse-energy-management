import React from 'react';
import { ShieldCheck, Zap, Sun, Wind, Battery, UtilityPole, Server, CheckCircle2 } from 'lucide-react';

export default function HeroSummary({ summary, backendConnected }) {
  if (!summary) return null;

  const renewablePct = Number(summary.renewable_share_pct || 0);
  const genKw = Number(summary.total_generation_kw || 0);
  const conKw = Number(summary.total_consumption_kw || 0);
  const gridImport = Number(summary.grid_import_kw || 0);
  const gridExport = Number(summary.grid_export_kw || 0);
  
  // Calculate grid dependency %
  const gridDependency = conKw > 0 ? Math.min(100, Math.round((gridImport / conKw) * 100)) : 0;

  // Dynamic system headline
  let headline = "Your energy system is performing efficiently.";
  let subtext = "Renewable sources are meeting primary facility load while actively conditioning battery storage.";
  if (gridExport > 1.0) {
    headline = "Surplus renewable energy is being exported to the grid.";
    subtext = "High clean energy output is yielding tariff revenue while maintaining full battery reserve.";
  } else if (gridDependency > 50) {
    headline = "Grid support engaged during peak demand window.";
    subtext = "Smart dispatch is minimizing peak tariff impact and optimizing battery buffer.";
  }

  const isBatteryCharging = (summary.battery_charge_rate_kw || 0) > 0.1;
  const isBatteryDischarging = (summary.battery_charge_rate_kw || 0) < -0.1;

  return (
    <div className="eco-card" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Top Banner with dynamic headline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-hairline)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(53, 208, 127, 0.12)',
            border: '1px solid var(--accent-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            boxShadow: '0 0 15px rgba(53, 208, 127, 0.2)'
          }}>
            <ShieldCheck size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '2px'
            }}>
              {headline}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {subtext}
            </p>
          </div>
        </div>

        {/* Live system state badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(53, 208, 127, 0.08)',
          border: '1px solid var(--accent-primary-border)'
        }}>
          <span className="pulse-live" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            {summary.system_status || 'Autonomous Mode Active'}
          </span>
        </div>
      </div>

      {/* 4 Hero KPI Gauges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        padding: '20px 0',
        borderBottom: '1px solid var(--border-hairline)'
      }}>
        
        {/* Renewable % */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Renewable Share
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="num-tabular" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
              {renewablePct}%
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Clean Energy Penetration
          </div>
        </div>

        {/* Energy Generated */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Energy Generated
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="num-tabular" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-solar)', lineHeight: 1 }}>
              {genKw}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kW</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Solar ({summary.solar_generation_kw} kW) + Wind ({summary.wind_generation_kw} kW)
          </div>
        </div>

        {/* Energy Consumed */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Energy Consumed
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="num-tabular" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-consumption)', lineHeight: 1 }}>
              {conKw}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kW</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Facility Baseload &amp; Operations
          </div>
        </div>

        {/* Grid Dependency */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Grid Dependency
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span className="num-tabular" style={{ fontSize: '1.8rem', fontWeight: 800, color: gridDependency > 40 ? 'var(--accent-critical)' : 'var(--text-main)', lineHeight: 1 }}>
              {gridDependency}%
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {gridDependency === 0 ? '100% Self-Sustaining' : `${gridImport} kW Grid Inflow`}
          </div>
        </div>

      </div>

      {/* LIVE STATUS Area at bottom of Hero */}
      <div style={{
        paddingTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Subsystem Status
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Solar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
            <Sun size={14} color="var(--accent-solar)" />
            <span style={{ color: 'var(--text-secondary)' }}>Solar:</span>
            <span style={{ color: summary.solar_generation_kw > 0 ? 'var(--accent-solar)' : 'var(--text-muted)', fontWeight: 600 }}>
              {summary.solar_generation_kw > 0 ? 'Active' : 'Standby'}
            </span>
          </div>

          {/* Wind */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
            <Wind size={14} color="var(--accent-wind)" />
            <span style={{ color: 'var(--text-secondary)' }}>Wind:</span>
            <span style={{ color: summary.wind_generation_kw > 0 ? 'var(--accent-wind)' : 'var(--text-muted)', fontWeight: 600 }}>
              {summary.wind_generation_kw > 0 ? 'Active' : 'Idle'}
            </span>
          </div>

          {/* Battery */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
            <Battery size={14} color="var(--accent-battery)" />
            <span style={{ color: 'var(--text-secondary)' }}>Battery:</span>
            <span style={{ color: 'var(--accent-battery)', fontWeight: 600 }}>
              {isBatteryCharging ? 'Charging' : isBatteryDischarging ? 'Discharging' : 'Standby'}
            </span>
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
            <UtilityPole size={14} color="var(--accent-primary)" />
            <span style={{ color: 'var(--text-secondary)' }}>Grid:</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              Connected
            </span>
          </div>

          {/* Backend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
            <Server size={14} color={backendConnected ? 'var(--accent-primary)' : 'var(--accent-critical)'} />
            <span style={{ color: 'var(--text-secondary)' }}>Backend:</span>
            <span style={{ color: backendConnected ? 'var(--accent-primary)' : 'var(--accent-critical)', fontWeight: 600 }}>
              {backendConnected ? 'Online' : 'Offline'}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
