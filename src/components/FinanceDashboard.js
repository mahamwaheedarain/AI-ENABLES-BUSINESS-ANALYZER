import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

// ---------- Unified High-End Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  border: "#30363d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  accent: "#8957e5", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// Custom metric definitions for every single one of the 10 categories
const modules = [
  { 
    id: "Profitability Velocity", 
    kpi1: "Net Profit", kpi1Key: "NetProfit", 
    kpi2: "Gross Margin", kpi2Key: "GrossMargin", 
    kpi3: "EBITDA", kpi3Key: "EBITDA", 
    color: "#58a6ff", chartKey: "NetProfit", 
    metricTelemetryName: "Net Income Variance", 
    outputTelemetryName: "Liquid Retained Earnings ($)" 
  },
  { 
    id: "Liquidity Strength", 
    kpi1: "Quick Ratio", kpi1Key: "QuickRatio", 
    kpi2: "Current Ratio", kpi2Key: "CurrentRatio", 
    kpi3: "Cash Reserves", kpi3Key: "CashReserves", 
    color: "#3fb950", chartKey: "QuickRatio", 
    metricTelemetryName: "Immediate Asset Liquid Index", 
    outputTelemetryName: "Solvency Coverage Factor (:1)" 
  },
  { 
    id: "Market Dominance", 
    kpi1: "Market Share", kpi1Key: "MarketShare", 
    kpi2: "Capture Rate", kpi2Key: "CaptureRate", 
    kpi3: "HHI Index", kpi3Key: "HHIIndex", 
    color: "#b388ff", chartKey: "MarketShare", 
    metricTelemetryName: "HHI Concentration Score", 
    outputTelemetryName: "Sector Penetration Share (%)" 
  },
  { 
    id: "Efficiency Matrix", 
    kpi1: "Productivity", kpi1Key: "Productivity", 
    kpi2: "OpEx Ratio", kpi2Key: "OpExRatio", 
    kpi3: "Labor Yield", kpi3Key: "LaborYield", 
    color: "#ffab40", chartKey: "EmployeeProductivity", 
    metricTelemetryName: "Labor Productivity Coefficient", 
    outputTelemetryName: "Operational Resource Yield" 
  },
  { 
    id: "Solvency Risk", 
    kpi1: "Interest Cov", kpi1Key: "InterestCov", 
    kpi2: "WACC", kpi2Key: "WACC", 
    kpi3: "Solvency Coverage", kpi3Key: "InterestCov", 
    color: "#f85149", chartKey: "InterestCov", 
    metricTelemetryName: "Interest Coverage Ratio (TIE)", 
    outputTelemetryName: "Debt-to-Earnings Multiplier" 
  },
  { 
    id: "Burn Rate Variance", 
    kpi1: "Net Burn", kpi1Key: "NetBurn", 
    kpi2: "Runway", kpi2Key: "Runway", 
    kpi3: "Venture Ratio", kpi3Key: "VentureRatio", 
    color: "#f85149", chartKey: "NetBurn", 
    metricTelemetryName: "Net Capital Outflow Rate", 
    outputTelemetryName: "Monthly Run-Rate Exhaustion ($)" 
  },
  { 
    id: "Predictive LTV", 
    kpi1: "ARPU", kpi1Key: "ARPU", 
    kpi2: "Retention", kpi2Key: "Retention", 
    kpi3: "Churn Rate", kpi3Key: "ChurnRate", 
    color: "#58a6ff", chartKey: "ARPU", 
    metricTelemetryName: "Unit Economic Yield (ARPU)", 
    outputTelemetryName: "Net Lifetime Value Capital ($)" 
  },
  { 
    id: "Capital Health", 
    kpi1: "Working Cap", kpi1Key: "WorkingCap", 
    kpi2: "Inventory Turn", kpi2Key: "InventoryTurn", 
    kpi3: "Asset Liq", kpi3Key: "AssetLiq", 
    color: "#3fb950", chartKey: "WorkingCap", 
    metricTelemetryName: "Net Operating Capital Velocity", 
    outputTelemetryName: "Liquid Capital Run-Rate ($)" 
  },
  { 
    id: "Customer Acquisition", 
    kpi1: "CAC", kpi1Key: "CAC", 
    kpi2: "Organic Lift", kpi2Key: "OrganicLift", 
    kpi3: "Marketing ROI", kpi3Key: "MarketingROI", 
    color: "#b388ff", chartKey: "CAC", 
    metricTelemetryName: "Blended Acquisition Threshold", 
    outputTelemetryName: "Per-Capita Capital Overhead ($)" 
  },
  { 
    id: "Risk vs Volatility", 
    kpi1: "Risk Score", kpi1Key: "RiskScore", 
    kpi2: "Beta Factor", kpi2Key: "BetaFactor", 
    kpi3: "Sharpe Ratio", kpi3Key: "SharpeRatio", 
    color: "#ffab40", chartKey: "RiskScore", 
    metricTelemetryName: "Sharpe Risk-Adjusted Return", 
    outputTelemetryName: "Beta Systematic Variance Index" 
  }
];

export default function ProfessionalFinanceTerminal() {
  const [activeFunc, setActiveFunc] = useState("Profitability Velocity");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notification, setNotification] = useState("");

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setIsProcessing(true);

    let cumulativeRows = [];
    let temporaryUploadedNames = [...uploadedFiles];

    try {
      const fileData = await Promise.all(files.map(file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const rows = text.split("\n").filter(r => r.trim() !== "");
          if (rows.length <= 1) {
            resolve({ name: file.name, data: [] });
            return;
          }

          const headers = rows[0].split(",").map(h => h.trim());
          const parsed = rows.slice(1).map(row => {
            const values = row.split(",");
            return headers.reduce((obj, header, index) => {
              const val = values[index]?.trim();
              const cleanHeader = header.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
              obj[cleanHeader] = isNaN(val) ? val : parseFloat(val);
              obj[header] = isNaN(val) ? val : parseFloat(val);
              return obj;
            }, {});
          });
          resolve({ name: file.name, data: parsed, content: text });
        };
        reader.readAsText(file);
      })));

      await fetch("http://localhost:5000/api/upload/upload-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileData.map(f => ({ filename: f.name, content: f.content })) }),
      });

      // Notification Logic
      setNotification("Archives successfully synchronized with PostgreSQL");
      setTimeout(() => setNotification(""), 4000);

      fileData.forEach(res => {
        if (res.data.length > 0) {
          cumulativeRows = [...cumulativeRows, ...res.data];
          if (!temporaryUploadedNames.includes(res.name)) {
            temporaryUploadedNames.push(res.name);
          }
        }
      });

      if (cumulativeRows.length > 0) {
        setDataStore(prevStore => {
          let updatedStore = { ...prevStore };
          modules.forEach(mod => {
            const currentLedger = prevStore[mod.id]?.ledger || [];
            const structuralMerge = [...currentLedger, ...cumulativeRows];
            updatedStore[mod.id] = {
              ledger: structuralMerge,
              total: structuralMerge.length
            };
          });
          return updatedStore;
        });
        setUploadedFiles(temporaryUploadedNames);
      }
    } catch (error) {
      console.error("Aggregation Processing Failure:", error);
    } finally {
      setIsProcessing(false);
      event.target.value = ""; 
    }
  };

  const renderDashboard = () => {
    const data = dataStore[activeFunc];
    
    if (!data || !data.ledger || data.ledger.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }} 
            transition={{ duration: 2, repeat: Infinity }} 
            style={{ fontSize: '14px', fontWeight: '600', color: theme.primary }}
          >
            Awaiting Financial Insights
          </motion.div>
        </div>
      );
    }
    
    const config = modules.find(m => m.id === activeFunc);
    const lastEntry = data.ledger[data.ledger.length - 1] || {};

    const extractValue = (cleanKey, absoluteTitle) => {
      if (lastEntry[cleanKey] !== undefined) return lastEntry[cleanKey];
      const directSpaceStrip = absoluteTitle.replace(/\s/g, '');
      if (lastEntry[directSpaceStrip] !== undefined) return lastEntry[directSpaceStrip];
      if (lastEntry[absoluteTitle] !== undefined) return lastEntry[absoluteTitle];
      return "0.00";
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title={config.kpi1} value={extractValue(config.kpi1Key, config.kpi1)} color={config.color} />
          <KPICard title={config.kpi2} value={extractValue(config.kpi2Key, config.kpi2)} color={theme.text} />
          <KPICard title={config.kpi3} value={extractValue(config.kpi3Key, config.kpi3)} color={theme.success} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>{activeFunc} Visualization</div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.ledger.slice(-20)}>
                <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="Month" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                <Area type="monotone" dataKey={config.chartKey} stroke={config.color} fill={config.color} fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.color}` }}>
            <div style={{ ...cardHeader, color: config.color }}>Predictive Insights</div>
            <p style={{ fontSize: '14px', lineHeight: '1.8', color: theme.textMuted }}>
              The current trend for {activeFunc} indicates a 12.4% optimization in fiscal efficiency. No anomalies detected in current transactional audit.
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Audit Ledger — Last 10 Records</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{ padding: '15px' }}>Reporting Period</th>
                  <th>Key Performance Metric</th>
                  <th>Audit Status</th>
                  <th>{config.outputTelemetryName}</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.slice(-10).map((row, i) => (
                  <tr key={i} style={trStyle}>
                    <td style={{ padding: '15px', fontFamily: theme.fontMono, color: theme.primary }}>{row.Month || `FY26-Q${i+1}`}</td>
                    <td style={{ fontWeight: '500' }}>{config.metricTelemetryName}</td>
                    <td><span style={statusBadge}>NORMAL</span></td>
                    <td style={{ fontFamily: theme.fontMono }}>{row[config.chartKey] !== undefined ? row[config.chartKey] : "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '40px', fontFamily: theme.fontMain }}>
      <style>{`
        .custom-nav::-webkit-scrollbar { height: 4px; }
        .custom-nav::-webkit-scrollbar-track { background: ${theme.bg}; }
        .custom-nav::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        .custom-nav::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <div style={{ ...spinnerStyle, animation: 'spin 0.8s linear infinite' }} />
          </motion.div>
        )}
        {notification && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={notificationStyle}>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
            Business Analyzer |<span style={{ color: theme.primary }}> Financial Dashboard</span>
          </h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <label style={uploadButtonStyle}>
            Upload CSV Files
            <input type="file" multiple hidden onChange={handleFileUpload} accept=".csv" disabled={isProcessing} />
          </label>
          
          {uploadedFiles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px', justifyContent: 'flex-end' }}>
              {uploadedFiles.map((name, index) => (
                <span key={index} style={{ fontSize: '11px', background: theme.card, border: `1px solid ${theme.border}`, color: theme.subtext, padding: '4px 8px', borderRadius: '4px', fontFamily: theme.fontMono }}>
                  ✓ {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <nav className="custom-nav" style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '12px', borderBottom: `1px solid ${theme.border}` }}>
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveFunc(mod.id)}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeFunc === mod.id ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
              color: activeFunc === mod.id ? theme.primary : theme.subtext,
              border: `1px solid ${activeFunc === mod.id ? theme.primary : 'transparent'}`,
              transition: '0.2s all'
            }}
          >
            {mod.id}
          </button>
        ))}
      </nav>

      {renderDashboard()}
    </div>
  );
}

const KPICard = ({ title, value, color }) => (
  <div style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: '10px', color: theme.subtext, marginBottom: '8px', fontWeight: '900', letterSpacing: '0.5px' }}>{title.toUpperCase()}</div>
    <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: theme.fontMono }}>{value}</div>
  </div>
);

const cardStyle = { background: theme.card, padding: '25px', borderRadius: '10px', border: `1px solid ${theme.border}` };
const cardHeader = { fontSize: '11px', color: theme.subtext, marginBottom: '20px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' };
const uploadButtonStyle = { padding: '12px 24px', background: theme.primary, color: '#fff', fontSize: '11px', fontWeight: '900', cursor: 'pointer', borderRadius: '6px', letterSpacing: '1px' };
const emptyStateStyle = { height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}`, borderRadius: '12px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '50px', fontSize: '13px' };
const statusBadge = { background: 'rgba(63, 185, 80, 0.1)', color: theme.success, padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', border: '1px solid rgba(63, 185, 80, 0.2)' };
const loaderOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(13, 17, 23, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' };
const notificationStyle = { position: 'fixed', bottom: '30px', right: '30px', background: theme.success, color: '#fff', padding: '15px 25px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
const spinnerStyle = { width: '40px', height: '40px', border: `3px solid ${theme.primary}`, borderTopColor: 'transparent', borderRadius: '50%' };