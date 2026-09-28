import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Database,
  RotateCcw,
  Building,
  Calendar,
  Clock,
  Menu,
  ChevronDown
} from 'lucide-react';

export default function Header({
  isLive,
  setIsLive,
  isRefreshing,
  onRefresh,
  onSeed,
  onReset,
  backendConnected,
  lastUpdated,
  onToggleSidebar
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSite, setSelectedSite] = useState('Main Campus Microgrid');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sites = [
    'Main Campus Microgrid',
    'Substation Alpha - Sector 4',
    'Solar Farm North Facility'
  ];

  return (
    <header style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 22px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-card)',
        borderRadius: '14px',
        boxShadow: 'var(--shadow-card)'
      }}>
        
        {/* Left: Section Title & Site Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="btn-eco btn-eco-secondary"
              style={{ padding: '8px', display: 'none' }}
              id="mobile-menu-toggle"
              title="Toggle Navigation Menu"
            >
              <Menu size={18} />
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}>
                Energy Overview
              </h1>
              <span className="pill-badge pill-green">
                <span className="pulse-live" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                Live Command
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              flexWrap: 'wrap'
            }}>
              {/* Site selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="var(--accent-primary)" />
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {sites.map((s) => (
                    <option key={s} value={s} style={{ background: '#0B2420', color: '#F1F8F4' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <span style={{ color: 'var(--border-hairline)' }}>&bull;</span>

              {/* Date & Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}>
                <Calendar size={13} color="var(--text-muted)" />
                <span>{currentTime.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <Clock size={13} color="var(--text-muted)" style={{ marginLeft: '4px' }} />
                <span>{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Backend Status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-hairline)',
            fontSize: '0.76rem'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? 'var(--accent-primary)' : 'var(--accent-critical)',
              boxShadow: backendConnected ? '0 0 8px var(--accent-primary)' : '0 0 8px var(--accent-critical)'
            }} />
            <span style={{ color: backendConnected ? 'var(--text-main)' : 'var(--accent-critical)' }}>
              {backendConnected ? 'FastAPI Online' : 'Backend Disconnected'}
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`btn-eco ${isLive ? 'btn-eco-primary' : 'btn-eco-secondary'}`}
            title="Toggle automated 10-second polling"
          >
            <Activity size={13} strokeWidth={2.4} />
            <span>{isLive ? 'Live Sync ON' : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn-eco btn-eco-secondary"
            title="Refresh latest telemetry"
          >
            <RefreshCw
              size={13}
              style={{
                animation: isRefreshing ? 'flowDash 0.8s linear infinite' : 'none'
              }}
            />
            <span>Refresh</span>
          </button>

          {/* Seed Dataset */}
          <button
            onClick={onSeed}
            className="btn-eco btn-eco-subtle"
            title="Generate 48h realistic simulation data"
          >
            <Database size={13} />
            <span>Seed 48h</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="btn-eco btn-eco-danger"
            title="Clear all energy readings"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

        </div>

      </div>
    </header>
  );
}
