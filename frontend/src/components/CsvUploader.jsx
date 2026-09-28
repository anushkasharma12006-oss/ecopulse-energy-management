import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download, Database, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';

export default function CsvUploader({ onImportSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setImportResult(null);

    try {
      const res = await api.uploadCsv(file);
      setImportResult(res);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setIsUploading(true);
    setErrorMsg(null);
    setImportResult(null);
    try {
      const res = await api.loadSampleCsv();
      setImportResult(res);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load sample dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const text = await api.getCsvTemplate();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'energy_telemetry_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setErrorMsg('Failed to download CSV template');
    }
  };

  return (
    <div className="surface-card" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} color="#0284c7" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Telemetry Data Ingestion Pipeline
            </h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Ingest external solar, wind, battery, and load telemetry via batch CSV import
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-secondary"
            title="Download CSV template format"
          >
            <Download size={13} />
            <span>CSV Template</span>
          </button>

          <button
            onClick={handleLoadSample}
            disabled={isUploading}
            className="btn btn-sky"
            title="Load sample 48-hour multi-sensor dataset"
          >
            <Database size={13} />
            <span>Load Sample 48h Data</span>
          </button>
        </div>
      </div>

      {/* Modern Compact Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1px dashed ${isDragging ? '#38bdf8' : 'var(--border-subtle)'}`,
          borderRadius: '10px',
          padding: '22px 16px',
          textAlign: 'center',
          background: isDragging ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface-1)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '14px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(2, 132, 199, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px auto',
          color: '#38bdf8'
        }}>
          <UploadCloud size={20} />
        </div>

        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
          {isUploading ? 'Parsing and ingesting records...' : 'Drop telemetry CSV or click to browse'}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
          Standard headers: timestamp, solar_kw, wind_kw, battery_soc, consumption_kw, grid_import_kw, electricity_price_per_kwh
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: '8px',
          color: '#fb7185',
          fontSize: '0.8rem',
          marginBottom: '12px'
        }}>
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Banner */}
      {importResult && importResult.success && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.22)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '6px' }}>
            <CheckCircle2 size={16} />
            <strong style={{ fontSize: '0.84rem' }}>{importResult.message}</strong>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span>Solar: <strong style={{ color: '#fbbf24' }}>{importResult.imported_counts?.solar || 0}</strong></span>
            <span>Wind: <strong style={{ color: '#38bdf8' }}>{importResult.imported_counts?.wind || 0}</strong></span>
            <span>Battery: <strong style={{ color: '#34d399' }}>{importResult.imported_counts?.battery || 0}</strong></span>
            <span>Consumption: <strong style={{ color: '#c084fc' }}>{importResult.imported_counts?.consumption || 0}</strong></span>
            <span>Grid: <strong style={{ color: '#fb7185' }}>{importResult.imported_counts?.grid || 0}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
}
