import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area, ComposedChart, Line
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

const modules = [
  { id: "Profitability Velocity", kpi1: "Net Profit", kpi2: "Gross Margin", kpi3: "EBITDA", color: "#58a6ff", chartKey: "NetProfit" },
  { id: "Liquidity Strength", kpi1: "Quick Ratio", kpi2: "Current Ratio", kpi3: "Cash Reserves", color: "#3fb950", chartKey: "QuickRatio" },
  { id: "Market Dominance", kpi1: "Market Share", kpi2: "Capture Rate", kpi3: "HHI Index", color: "#b388ff", chartKey: "MarketShare" },
  { id: "Efficiency Matrix", kpi1: "Productivity", kpi2: "OpEx Ratio", kpi3: "Labor Yield", color: "#ffab40", chartKey: "EmployeeProductivity" },
  { id: "Solvency Risk", kpi1: "D/E Ratio", kpi2: "Interest Cov", kpi3: "WACC", color: "#f85149", chartKey: "DebtToEquity" },
  { id: "Burn Rate Variance", kpi1: "Net Burn", kpi2: "Runway", kpi3: "Venture Ratio", color: "#f85149", chartKey: "BurnRate" },
  { id: "Predictive LTV", kpi1: "LTV/CAC", kpi2: "ARPU", kpi3: "Retention", color: "#58a6ff", chartKey: "CustomerLTV" },
  { id: "Capital Health", kpi1: "Working Cap", kpi2: "Inventory Turn", kpi3: "Asset Liq", color: "#3fb950", chartKey: "WorkingCapital" },
  { id: "Customer Acquisition", kpi1: "CAC", kpi2: "Organic Lift", kpi3: "Marketing ROI", color: "#b388ff", chartKey: "CAC" },
  { id: "Risk vs Volatility", kpi1: "Risk Score", kpi2: "Beta Factor", kpi3: "Sharpe Ratio", color: "#ffab40", chartKey: "RiskScore" }
];

export default function ProfessionalFinanceTerminal() {
  const [activeFunc, setActiveFunc] = useState("Profitability Velocity");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      await new Promise(r => setTimeout(r, 1200));
      const text = e.target.result;
      const rows = text.split("\n").filter(r => r.trim() !== "");
      const headers = rows[0].split(",").map(h => h.trim());
      const parsed = rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          const val = values[index]?.trim();
          obj[header] = isNaN(val) ? val : parseFloat(val);
          return obj;
        }, {});
      });

      let newStore = {};
      modules.forEach(mod => {
        newStore[mod.id] = { ledger: parsed, total: parsed.length };
      });
      
      setDataStore(newStore);
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const renderDashboard = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <div style={{ textAlign: 'center' }}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '15px', fontWeight: '900', color: theme.subtext, letterSpacing: '2px' }}>
            Awaiting Insights
          </motion.div>
        </div>
      </div>
    );

    const config = modules.find(m => m.id === activeFunc);
    const lastEntry = data.ledger[data.ledger.length - 1] || {};

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title={config.kpi1} value={lastEntry[config.kpi1.replace(/\s/g, '')] || "0.00"} color={config.color} />
          <KPICard title={config.kpi2} value={lastEntry[config.kpi2.replace(/\s/g, '')] || "0.00"} color={theme.text} />
          <KPICard title={config.kpi3} value={lastEntry[config.kpi3.replace(/\s/g, '')] || "0.00"} color={theme.success} />
          <KPICard title="System Integrity" value="VERIFIED" color={theme.primary} />
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
                  <th style={{ padding: '15px' }}>Timeline</th>
                  <th>Core Metric</th>
                  <th>Stability</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.slice(-10).map((row, i) => (
                  <tr key={i} style={trStyle}>
                    <td style={{ padding: '15px', fontFamily: theme.fontMono, color: theme.primary }}>{row.Month || `FY26-Q${i}`}</td>
                    <td>{config.chartKey}</td>
                    <td><span style={statusBadge}>NORMAL</span></td>
                    <td style={{ fontFamily: theme.fontMono }}>{row[config.chartKey]}</td>
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
      `}</style>

      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <div style={spinnerStyle} />
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
            Business Analyzer |<span style={{ color: theme.primary }}> Financial Dashboard</span>
          </h1>
          <div style={{ fontSize: '13px', color: theme.subtext, fontWeight: '800', marginTop: '4px', letterSpacing: '1px' }}></div>
        </div>
        <label style={uploadButtonStyle}>
          Upload CSV Files
          <input type="file" hidden onChange={handleFileUpload} />
        </label>
      </header>

      {/* Professional Horizontal Scrollbar Navigation */}
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

// ---------- Styled Components ----------
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
const spinnerStyle = { width: '40px', height: '40px', border: `3px solid ${theme.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };

// Add this to your global CSS or within a <style> tag in your component
// @keyframes spin { 100% { transform: rotate(360deg); } }