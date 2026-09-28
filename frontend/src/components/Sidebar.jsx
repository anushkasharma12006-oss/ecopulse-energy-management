import React from 'react';
import {
  LayoutDashboard,
  Sun,
  Wind,
  BatteryCharging,
  Zap,
  UtilityPole,
  TrendingUp,
  Brain,
  Lightbulb,
  Bell,
  LineChart,
  FileSpreadsheet,
  Building,
  UploadCloud,
  Settings,
  ShieldCheck,
  Radio,
  X
} from 'lucide-react';

export default function Sidebar({ activeNav, onSelectNav, isOpen, onClose }) {
  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'ENERGY',
      items: [
        { id: 'solar', label: 'Solar Energy', icon: Sun },
        { id: 'wind', label: 'Wind Energy', icon: Wind },
        { id: 'battery', label: 'Battery BESS', icon: BatteryCharging },
        { id: 'consumption', label: 'Consumption', icon: Zap },
        { id: 'grid', label: 'Grid Electricity', icon: UtilityPole }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, badge: '3' },
        { id: 'predictions', label: 'Predictions', icon: TrendingUp },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
        { id: 'alerts', label: 'Alerts', icon: Bell }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: LineChart },
        { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'sites', label: 'Sites', icon: Building },
        { id: 'import', label: 'Data Import', icon: UploadCloud },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 26, 23, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
            display: 'block'
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-hairline)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
          transition: 'transform 0.25s ease',
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '22px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-hairline)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #35D07F 0%, #0B2420 100%)',
              border: '1px solid rgba(53, 208, 127, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(53, 208, 127, 0.25)'
            }}>
              <Zap size={20} color="#F1F8F4" strokeWidth={2.4} />
            </div>

            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}>
                EcoPulse
              </div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Command Center
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="btn-eco-secondary"
              style={{ padding: '6px', borderRadius: '6px', display: 'none' }}
              id="sidebar-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {sections.map((sec) => (
            <div key={sec.title}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                letterSpacing: '0.08em',
                padding: '0 10px 8px 10px',
                textTransform: 'uppercase'
              }}>
                {sec.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectNav(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--bg-card)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--border-card-hover)' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(16, 47, 41, 0.4)';
                          e.currentTarget.style.color = 'var(--text-main)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon
                          size={16}
                          color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: 'rgba(53, 208, 127, 0.15)',
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--accent-primary-border)'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom System Status Bar */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-hairline)',
          background: 'rgba(7, 26, 23, 0.7)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '9px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-live" style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-primary)'
              }} />
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-main)' }}>
                System Status
              </div>
            </div>

            <span className="pill-badge pill-green" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
              Online
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}
