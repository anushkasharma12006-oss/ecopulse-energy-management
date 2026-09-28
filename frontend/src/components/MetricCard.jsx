import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accentColor = '#35D07F',
  subtleBg = 'rgba(53, 208, 127, 0.12)',
  badgeText,
  badgeType = 'green',
  progressPct = null,
  secondaryDetail = null
}) {
  return (
    <div
      className="eco-card eco-card-interactive"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '148px'
      }}
    >
      {/* Top Row: Subsystem Label & Icon Bubble */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="icon-bubble"
            style={{
              background: subtleBg,
              color: accentColor,
              border: `1px solid ${accentColor}33`
            }}
          >
            {Icon && <Icon size={16} strokeWidth={2.2} />}
          </div>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)'
          }}>
            {title}
          </span>
        </div>

        {badgeText && (
          <span className={`pill-badge pill-${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span
            className="num-tabular"
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-main)',
              lineHeight: 1
            }}
          >
            {value !== undefined && value !== null ? value : '--'}
          </span>
          {unit && (
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Optional Progress meter */}
      {progressPct !== null && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            height: '4px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPct))}%`,
              background: accentColor,
              borderRadius: '2px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <span>{subtitle}</span>
        {secondaryDetail && (
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {secondaryDetail}
          </span>
        )}
      </div>

    </div>
  );
}
