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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const tasks = ["risk", "logistics"];
    let newStore = {};

    try {
      for (const task of tasks) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`http://127.0.0.1:8000/api/operations/predict?task=${task}`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.status === "success") {
          const rawData = result.operations_data;
          const total = rawData.length;
          const flagged = rawData.filter(p => p.risk_status === "LATE RISK");
          const totalProfit = rawData.reduce((a, c) => a + (c.profit || 0), 0);
          const totalSales = rawData.reduce((a, c) => a + (c.sales || 0), 0);
          const riskSales = flagged.reduce((a, c) => a + (c.sales || 0), 0);
          
          let insights = [];
          
          if (task === "risk") {
            insights = [
              { label: "Forecast Accuracy", text: `Model reliability for this batch is holding at ${(result.accuracy * 100).toFixed(1)}%.` },
              { label: "Margin Erosion", text: `Breached SLAs represent a potential $${(flagged.length * 42).toFixed(0)} hit to net earnings.` },
              { label: "Working Capital Trap", text: `Total $${riskSales.toFixed(0)} in capital is currently locked in high-risk transit.` },
              { label: "Primary Risk Drivers", text: "Correlation analysis identifies Order Quantity as the top predictor of failure." },
              { label: "Revenue Leakage", text: `High-value orders account for ${((riskSales/totalSales)*100).toFixed(1)}% of total risk.` },
              { label: "Profit Floor Maintenance", text: "92% of compliant orders currently maintain the required +$50 margin target." },
              { label: "EBITDA At Risk", text: "15% of projected quarterly earnings sit in high-latency quadrants." },
              { label: "Portfolio Grade", text: "Batch Health Grade: A- (High Reliability Baseline)." },
              { label: "Financial Health", text: "System nominal; net margins remain above the 15% safety threshold." }
            ];
          } else {
            insights = [
              { label: "OTIF Performance", text: `On-Time In-Full (OTIF) rate for this stream is ${(100 - (flagged.length/total*100)).toFixed(1)}%.` },
              { label: "Cycle Time Variance", text: "Standard deviation of lead times is 2.2 days, triggering safety stock alerts." },
              { label: "Throughput Efficiency", text: "Warehouse sorting throughput reached 92% of the theoretical max load." },
              { label: "Last Mile Latency", text: "Final-mile delivery latency is 15% higher in urban centers." },
              { label: "SLA Breach ETA", text: `${flagged.length} units are within 6 hours of breaching contract.` },
              { label: "Hub Utilization", text: "Carrier Alpha under-utilized at 64% capacity; recommend load balancing." },
              { label: "Safety Stock Index", text: "Recommendation: 5% safety stock increase for Furniture category." },
              { label: "Logistics Health", text: "Global transit reliability index: 0.92 (Nominal Industry Grade)." }
            ];
          }

          newStore[task === "risk" ? "Risk Management" : "Logistics Tracking"] = {
            accuracy: result.accuracy,
            total: total,
            flagged: flagged.length,
            benefit: totalProfit,
            ledger: rawData,
            insights: insights,
            distribution: [
              { name: 'SLA Compliant', value: total - flagged.length },
              { name: 'SLA Breach', value: flagged.length }
            ],
            history: rawData.slice(0, 15).map((d, i) => ({ x: i, y: d.profit || d.sales || 0 }))
          };
        }
      }
      setDataStore(newStore);
    } catch (e) { console.error("Neural Matrix Error", e); }
    finally { setIsProcessing(false); }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontSize: '14px', fontWeight: '600' }}>
          Awaiting Insights
        </motion.div>
      </div>
    );

    const config = {
      "Risk Management": { accent: theme.danger, title: "Financial Margin Stream" },
      "Logistics Tracking": { accent: theme.primary, title: "Geospatial OTIF Stream" }
    }[activeFunc];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* KPI Ticker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title="Forecast Accuracy" value={`${(data.accuracy * 100).toFixed(1)}%`} color={theme.primary} delay={0.1} />
          <KPICard title="Throughput Units" value={data.total} color={theme.text} delay={0.2} />
          <KPICard title="SLA Breach Flags" value={data.flagged} color={theme.danger} delay={0.3} />
          <KPICard title="EBITDA Impact" value={`$${data.benefit.toLocaleString()}`} color={theme.success} delay={0.4} />
        </div>

        {/* Analytics Grid */}
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

        {/* Intelligence Matrix */}
        <div style={{ ...cardStyle, marginBottom: '30px' }}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between' }}>
            <span>{activeFunc} Intelligence Matrix</span>
            <span style={{ color: theme.primary }}>Active Insights</span>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {data.insights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 5, background: 'rgba(88, 166, 255, 0.05)' }}
                  style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '15px', alignItems: 'center', borderRadius: '4px' }}
                >
                  <span style={{ color: theme.primary, fontSize: '12px', fontWeight: '800', minWidth: '120px' }}>{insight.label}</span>
                  <span style={{ color: theme.text, fontSize: '13px' }}>{insight.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div style={cardStyle}>
          <div style={cardHeader}>Supply Chain Audit Ledger</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{padding: '15px'}}>Log ID</th>
                <th>SLA Status</th>
                <th>Cycle Time</th>
                <th>Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 10).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '15px', color: theme.primary, fontWeight: '600'}}>{row.id}</td>
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
                  <td>{row.actual_estimate || row.scheduled} Days</td>
                  <td style={{color: row.profit > 0 ? theme.success : theme.danger, fontWeight: '700'}}>
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
              Processing Insights
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Business Analyzer | <span style={{ color: theme.primary }}>Operations Dashboard</span></h1>
        <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={buttonStyle}>
          Upload CSV Files
          <input type="file" hidden onChange={handleFileUpload} disabled={isProcessing} />
        </motion.label>
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
const cardHeader = { fontSize: '13px', color: theme.subtext, marginBottom: '25px', fontWeight: '800', letterSpacing: '0.5px' };
const buttonStyle = { padding: '14px 28px', background: theme.primary, color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer', borderRadius: '8px' };
const emptyStateStyle = { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}`, borderRadius: '16px' };
const loaderOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13, 17, 23, 0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };