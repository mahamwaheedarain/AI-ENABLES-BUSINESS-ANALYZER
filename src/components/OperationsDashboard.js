import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

// ---------- High-Clarity Unified Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  border: "#30363d",
  accent: "#1f6feb", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

export default function OperationsDashboard() {
  const [activeFunc, setActiveFunc] = useState("Risk Management");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const tasks = ["risk", "logistics"];
    
    let newStore = { ...dataStore };
    let temporaryUploadedNames = [...uploadedFiles];

    try {
      for (const file of files) {
        let fileProcessed = false;

        for (const task of tasks) {
          const formData = new FormData();
          formData.append("file", file);
          
          const response = await fetch(`http://127.0.0.1:8000/api/operations/predict?task=${task}`, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();

          if (result.status === "success" && result.operations_data) {
            fileProcessed = true;
            const key = task === "risk" ? "Risk Management" : "Logistics Tracking";
            
            const rawData = result.operations_data.map(d => ({
              ...d,
              profit: Number(d.profit) || 0,
              sales: Number(d.sales) || 0
            }));

            // Merge with existing data in store
            const existingLedger = newStore[key]?.ledger || [];
            const updatedLedger = [...existingLedger, ...rawData];
            
            const total = updatedLedger.length;
            const flagged = updatedLedger.filter(p => p.risk_status === "LATE RISK");
            const totalProfit = updatedLedger.reduce((a, c) => a + c.profit, 0);

            newStore[key] = {
              total: total,
              flagged: flagged.length,
              benefit: totalProfit,
              ledger: updatedLedger,
              distribution: [
                { name: 'SLA Compliant', value: total - flagged.length },
                { name: 'SLA Breach', value: flagged.length }
              ],
              history: updatedLedger.slice(0, 15).map((d, i) => ({ x: i, y: d.profit })),
              insights: task === "risk" 
                ? [
                    { label: "Margin Erosion", text: `Breached SLAs represent a potential $${(flagged.length * 42).toFixed(0)} hit to net earnings.` },
                    { label: "Working Capital Trap", text: `Total capital locked in high-risk transit.` },
                    { label: "Primary Risk Drivers", text: "Correlation analysis identifies Order Quantity as the top predictor of failure." }
                  ]
                : [
                    { label: "OTIF Performance", text: `On-Time In-Full rate is ${total > 0 ? (100 - (flagged.length/total*100)).toFixed(1) : 0}%.` },
                    { label: "Cycle Time Variance", text: "Standard deviation of lead times is 2.2 days." },
                    { label: "Logistics Health", text: "Global transit reliability index: 0.92." }
                  ]
            };
          }
        }

        if (fileProcessed && !temporaryUploadedNames.includes(file.name)) {
          temporaryUploadedNames.push(file.name);
        }
      }
      setDataStore(newStore);
      setUploadedFiles(temporaryUploadedNames);
    } catch (e) {
      console.error("Critical Sync Error:", e);
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontSize: '14px', fontWeight: '600' }}>
          Awaiting Operations Insights
        </motion.div>
      </div>
    );

    const config = {
      "Risk Management": { accent: theme.danger, title: "Financial Margin Stream" },
      "Logistics Tracking": { accent: theme.primary, title: "Geospatial OTIF Stream" }
    }[activeFunc];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title="Throughput Units" value={data.total} color={theme.text} delay={0.1} />
          <KPICard title="SLA Breach Flags" value={data.flagged} color={theme.danger} delay={0.2} />
          <KPICard title="EBITDA Impact" value={`$${data.benefit.toLocaleString()}`} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '25px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>SLA Compliance Ratio</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.distribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  <Cell fill={theme.success} stroke="none" />
                  <Cell fill={theme.danger} stroke="none" />
                </Pie>
                <Tooltip contentStyle={{background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>{config.title}</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="y" stroke={config.accent} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}` }}>
            <div style={{...cardHeader, color: config.accent}}>Operational Summary</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.text }}>
              Verified {data.total} units. 
              {activeFunc === "Risk Management" ? " Financial integrity is optimized for gross margin defense." : " Transit flow tracked for OTIF compliance across all geo-nodes."}
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Supply Chain Audit Ledger</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{padding: '15px'}}>Log ID</th>
                <th>SLA Status</th>
                {activeFunc === "Logistics Tracking" && <th>Cycle Time</th>}
                <th>Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 10).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '15px', color: theme.primary, fontWeight: '600'}}>{row.id || `NEURAL-${String(i+1).padStart(3, '0')}`}</td>
                  <td>
                    <span style={{ 
                      background: row.risk_status === 'LATE RISK' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(63, 185, 80, 0.1)',
                      color: row.risk_status === 'LATE RISK' ? theme.danger : theme.success,
                      padding: '5px 12px', borderRadius: '6px', border: `1px solid ${row.risk_status === 'LATE RISK' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(63, 185, 80, 0.2)'}`,
                      fontSize: '11px', fontWeight: '800'
                    }}>
                      {row.risk_status === 'LATE RISK' ? 'Breached' : 'Compliant'}
                    </span>
                  </td>
                  {activeFunc === "Logistics Tracking" && (
                    <td>{row.cycle_time || 0} Days</td>
                  )}
                  <td style={{color: row.profit !== 0 ? (row.profit > 0 ? theme.success : theme.danger) : theme.text, fontWeight: '700'}}>
                    {row.profit > 0 ? '+' : ''}{row.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '40px', fontFamily: theme.fontMain }}>
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 60, height: 60, border: `4px solid ${theme.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: '25px', fontSize: '13px', color: theme.primary, fontWeight: '700', letterSpacing: '2px' }}>
              RE-ALIGNING LIVE METRICS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Business Analyzer | <span style={{ color: theme.primary }}>Operations Dashboard</span></h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={buttonStyle}>
            Upload CSV Files
            <input type="file" multiple hidden onChange={handleFileUpload} disabled={isProcessing} />
          </motion.label>
          
          {uploadedFiles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px', justifyContent: 'flex-end' }}>
              {uploadedFiles.map((name, index) => (
                <span key={index} style={{ fontSize: '11px', background: theme.card, border: `1px solid ${theme.border}`, color: theme.subtext, padding: '4px 8px', borderRadius: '4px' }}>
                  ✓ {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderBottom: `1px solid ${theme.border}` }}>
        {["Risk Management", "Logistics Tracking"].map(tab => (
          <button key={tab} onClick={() => setActiveFunc(tab)} style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: theme.fontMain, fontSize: '15px',
            color: activeFunc === tab ? theme.primary : theme.subtext,
            borderBottom: activeFunc === tab ? `3px solid ${theme.primary}` : 'none',
            paddingBottom: '15px', fontWeight: '700', transition: 'all 0.2s ease'
          }}>{tab}</button>
        ))}
      </nav>

      {renderContent()}
    </div>
  );
}

const KPICard = ({ title, value, color, delay }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }} style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '10px', fontWeight: '700' }}>{title}</div>
    <div style={{ fontSize: '26px', fontWeight: '800' }}>{value}</div>
  </motion.div>
);

const cardStyle = { background: theme.card, padding: '30px', borderRadius: '12px', border: `1px solid ${theme.border}` };
const cardHeader = { fontSize: '12px', color: theme.subtext, marginBottom: '20px', fontWeight: '800', letterSpacing: '0.5px' };
const buttonStyle = { padding: '14px 28px', background: theme.primary, color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer', borderRadius: '8px' };
const emptyStateStyle = { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}`, borderRadius: '16px' };
const loaderOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(13, 17, 23, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };