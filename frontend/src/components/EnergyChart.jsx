import React, { useState } from 'react';
import { TrendingUp, Layers } from 'lucide-react';

export default function EnergyChart({ timeseries, selectedRange, onRangeChange }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [visibleSeries, setVisibleSeries] = useState({
    renewables: true,
    solar: true,
    wind: true,
    consumption: true,
  });

  const points = timeseries?.points || [];

  const toggleSeries = (key) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Dimensions
  const width = 900;
  const height = 280;
  const padding = { top: 20, right: 24, bottom: 36, left: 54 };

  const maxKw = Math.max(
    ...points.map(p => Math.max(p.total_renewables_kw || 0, p.consumption_kw || 0, p.solar_kw || 0)),
    55
  );

  const getX = (i) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (i / (points.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val) => {
    const clamped = Math.max(0, val || 0);
    return height - padding.bottom - (clamped / maxKw) * (height - padding.top - padding.bottom);
  };

  const createPath = (key) => {
    if (!points.length) return '';
    return points.reduce((acc, p, i) => {
      const x = getX(i);
      const y = getY(p[key]);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  };

  const createAreaPath = () => {
    if (!points.length) return '';
    const linePath = points.reduce((acc, p, i) => {
      const x = getX(i);
      const y = getY(p.total_renewables_kw);
      return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const baseY = height - padding.bottom;
    return `${linePath} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`;
  };

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="surface-card" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Chart Title & Range Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10b981" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Generation vs. Load Telemetry
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Multi-series historical trajectory tracking renewables output against facility demand
          </p>
        </div>

        {/* Segmented Time Interval Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-2)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-hairline)'
        }}>
          {[6, 12, 24, 48].map((hrs) => {
            const isSelected = selectedRange === hrs;
            return (
              <button
                key={hrs}
                onClick={() => onRangeChange(hrs)}
                style={{
                  padding: '4px 11px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {hrs}H
              </button>
            );
          })}
        </div>
      </div>

      {/* Series Filter Badges */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[
          { key: 'renewables', label: 'Renewables (Total)', color: '#10b981' },
          { key: 'solar', label: 'Solar Output', color: '#f59e0b' },
          { key: 'wind', label: 'Wind Power', color: '#0284c7' },
          { key: 'consumption', label: 'Building Load', color: '#8b5cf6' },
        ].map(item => {
          const active = visibleSeries[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleSeries(item.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: active ? 'var(--text-primary)' : 'var(--text-dim)',
                background: active ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-subtle)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color,
                opacity: active ? 1 : 0.3
              }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart SVG */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="renGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - padding.bottom - pct * (height - padding.top - padding.bottom);
            const val = Math.round(pct * maxKw);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray={pct === 0 ? "none" : "3 3"}
                />
                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-dim)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {val}kW
                </text>
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 6)) === 0).map((p, idx) => {
            const i = points.indexOf(p);
            const x = getX(i);
            const dateObj = new Date(p.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <text
                key={idx}
                x={x}
                y={height - 12}
                textAnchor="middle"
                fill="var(--text-dim)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {timeStr}
              </text>
            );
          })}

          {/* Area Fill for Renewables */}
          {visibleSeries.renewables && (
            <path d={createAreaPath()} fill="url(#renGradient)" />
          )}

          {/* Lines */}
          {visibleSeries.renewables && (
            <path
              d={createPath('total_renewables_kw')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
            />
          )}

          {visibleSeries.solar && (
            <path
              d={createPath('solar_kw')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
          )}

          {visibleSeries.wind && (
            <path
              d={createPath('wind_kw')}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
          )}

          {visibleSeries.consumption && (
            <path
              d={createPath('consumption_kw')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
            />
          )}

          {/* Transparent Hover Hitbox Columns */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const stepW = (width - padding.left - padding.right) / Math.max(1, points.length);
            return (
              <rect
                key={idx}
                x={x - stepW / 2}
                y={padding.top}
                width={stepW}
                height={height - padding.top - padding.bottom}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* Active Hover Crosshair Line & Marker Dots */}
          {hoverIndex !== null && hoveredPoint && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={height - padding.bottom}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeDasharray="2 2"
              />
              {visibleSeries.renewables && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(hoveredPoint.total_renewables_kw)}
                  r="4"
                  fill="#10b981"
                  stroke="#080b11"
                  strokeWidth="2"
                />
              )}
              {visibleSeries.consumption && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(hoveredPoint.consumption_kw)}
                  r="4"
                  fill="#8b5cf6"
                  stroke="#080b11"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

        </svg>

        {/* Refined Floating Tooltip Card */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '16px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-card-elevated)',
            fontSize: '0.78rem',
            pointerEvents: 'none',
            minWidth: '200px'
          }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '6px', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '4px' }}>
              {new Date(hoveredPoint.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '3px' }}>
              <span>Renewables:</span>
              <strong className="num-tabular">{hoveredPoint.total_renewables_kw} kW</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', marginBottom: '3px' }}>
              <span>Solar:</span>
              <strong className="num-tabular">{hoveredPoint.solar_kw} kW</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', marginBottom: '3px' }}>
              <span>Wind:</span>
              <strong className="num-tabular">{hoveredPoint.wind_kw} kW</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc', marginBottom: '3px' }}>
              <span>Demand:</span>
              <strong className="num-tabular">{hoveredPoint.consumption_kw} kW</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: hoveredPoint.net_balance_kw >= 0 ? '#34d399' : '#fb7185',
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px solid var(--border-hairline)'
            }}>
              <span>Net Difference:</span>
              <strong className="num-tabular">
                {hoveredPoint.net_balance_kw >= 0 ? `+${hoveredPoint.net_balance_kw}` : hoveredPoint.net_balance_kw} kW
              </strong>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
