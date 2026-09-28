import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Wind, BatteryCharging, Building2, UtilityPole, Gauge, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PowerFlowCard from './components/PowerFlowCard';
import EnergyChart from './components/EnergyChart';
import CsvUploader from './components/CsvUploader';
import ReadingsTable from './components/ReadingsTable';
import { api } from './services/api';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState(null);
  const [selectedRange, setSelectedRange] = useState(24);
  const [isLive, setIsLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch telemetry
  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await api.getHealth();
      setBackendConnected(true);

      const [sumData, tsData] = await Promise.all([
        api.getEnergySummary(),
        api.getEnergyTimeseries(selectedRange),
      ]);

      setSummary(sumData);
      setTimeseries(tsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Backend connection error:', err);
      setBackendConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [isLive, loadDashboardData]);

  const handleManualRefresh = () => {
    loadDashboardData();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSeedData = async () => {
    try {
      await api.seedData(48);
      handleManualRefresh();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Confirm reset: clear all energy readings from database?")) {
      try {
        await api.resetData();
        handleManualRefresh();
      } catch (err) {
        alert(`Reset failed: ${err.message}`);
      }
    }
  };

  const handleImportSuccess = () => {
    handleManualRefresh();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 60px 24px' }}>
      
      {/* Top Navigation Bar */}
      <Header
        isLive={isLive}
        setIsLive={setIsLive}
        isRefreshing={isRefreshing}
        onRefresh={handleManualRefresh}
        onSeed={handleSeedData}
        onReset={handleResetData}
        backendConnected={backendConnected}
        lastUpdated={lastUpdated}
      />

      {/* Connection Notice if Backend is Offline */}
      {!backendConnected && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '10px',
          color: '#fb7185',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem'
        }}>
          <strong>Backend Service Unreachable:</strong>
          <span>Ensure the FastAPI server is running on port 8000 (<code>python run.py</code>).</span>
        </div>
      )}

      {/* 6 Responsive Real-Time KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        
        {/* 1. Solar Energy */}
        <MetricCard
          title="Solar PV"
          value={summary?.solar_generation_kw}
          unit="kW"
          subtitle="Photovoltaic Array"
          secondaryMetric={summary?.solar_generation_kw > 0 ? "Active Generation" : "Offline (Night)"}
          icon={Sun}
          accentColor="#f59e0b"
          subtleBg="rgba(245, 158, 11, 0.1)"
          badgeText={summary?.solar_generation_kw > 0 ? "Online" : "Standby"}
          badgeType={summary?.solar_generation_kw > 0 ? "amber" : "neutral"}
        />

        {/* 2. Wind Energy */}
        <MetricCard
          title="Wind Turbine"
          value={summary?.wind_generation_kw}
          unit="kW"
          subtitle="Kinetic Rotor Power"
          secondaryMetric={summary?.wind_generation_kw > 0 ? "Turbine Spinning" : "Calm"}
          icon={Wind}
          accentColor="#0284c7"
          subtleBg="rgba(2, 132, 199, 0.1)"
          badgeText={summary?.wind_generation_kw > 0 ? "Online" : "Idle"}
          badgeType="sky"
        />

        {/* 3. Renewable Share */}
        <MetricCard
          title="Clean Share"
          value={summary?.renewable_share_pct}
          unit="%"
          subtitle={`${summary?.total_generation_kw || 0} kW Generated`}
          secondaryMetric={`${summary?.self_sufficiency_pct || 0}% Sufficiency`}
          icon={Gauge}
          accentColor="#10b981"
          subtleBg="rgba(16, 185, 129, 0.1)"
          progressPct={summary?.renewable_share_pct}
          badgeText={summary?.renewable_share_pct >= 100 ? "100% Green" : "Mixed"}
          badgeType="emerald"
        />

        {/* 4. Battery Storage */}
        <MetricCard
          title="BESS Storage"
          value={summary?.battery_soc_pct}
          unit="% SoC"
          subtitle={`${summary?.battery_charge_level_kwh || 0} kWh Capacity`}
          secondaryMetric={summary?.battery_charge_rate_kw > 0 ? `+${summary.battery_charge_rate_kw} kW (Chg)` : (summary?.battery_charge_rate_kw < 0 ? `${summary.battery_charge_rate_kw} kW (Dis)` : "0.0 kW (Idle)")}
          icon={BatteryCharging}
          accentColor="#10b981"
          subtleBg="rgba(16, 185, 129, 0.1)"
          progressPct={summary?.battery_soc_pct}
          badgeText={summary?.battery_status || 'standby'}
          badgeType={summary?.battery_charge_rate_kw > 0 ? "emerald" : (summary?.battery_charge_rate_kw < 0 ? "amber" : "neutral")}
        />

        {/* 5. Electricity Consumption */}
        <MetricCard
          title="Facility Load"
          value={summary?.total_consumption_kw}
          unit="kW"
          subtitle="Active Power Demand"
          secondaryMetric="Facility HVAC & Ops"
          icon={Building2}
          accentColor="#8b5cf6"
          subtleBg="rgba(139, 92, 246, 0.1)"
          progressPct={summary?.self_sufficiency_pct}
          badgeText="Active"
          badgeType="purple"
        />

        {/* 6. Grid Exchange */}
        <MetricCard
          title="Grid Exchange"
          value={summary?.grid_export_kw > 0 ? `+${summary.grid_export_kw}` : (summary?.grid_import_kw > 0 ? `-${summary.grid_import_kw}` : "0.0")}
          unit="kW"
          subtitle={`Tariff: $${summary?.current_tariff_usd_kwh || 0.16}/kWh`}
          secondaryMetric={summary?.grid_export_kw > 0 ? "Feed-in Surplus" : "Utility Draw"}
          icon={UtilityPole}
          accentColor="#f43f5e"
          subtleBg="rgba(244, 63, 94, 0.1)"
          badgeText={summary?.grid_export_kw > 0 ? "Exporting" : (summary?.grid_import_kw > 0 ? "Importing" : "Balanced")}
          badgeType={summary?.grid_export_kw > 0 ? "emerald" : (summary?.grid_import_kw > 0 ? "rose" : "neutral")}
        />

      </div>

      {/* Microgrid Power Flow Diagram */}
      <PowerFlowCard summary={summary} />

      {/* Multi-Series Time-Series Telemetry Chart */}
      <EnergyChart
        timeseries={timeseries}
        selectedRange={selectedRange}
        onRangeChange={(range) => setSelectedRange(range)}
      />

      {/* CSV Telemetry Ingestion Pipeline */}
      <CsvUploader onImportSuccess={handleImportSuccess} />

      {/* Subsystem Telemetry Logs */}
      <ReadingsTable refreshTrigger={refreshTrigger} />

      {/* Clean Corporate Footer */}
      <footer style={{
        marginTop: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>EcoPulse Autonomous Energy Optimization Platform &mdash; Phase 1 Core</span>
        </div>
        <div>
          <span>FastAPI Engine &bull; SQLite Persistence &bull; React 19 Client</span>
        </div>
      </footer>

    </div>
  );
}
