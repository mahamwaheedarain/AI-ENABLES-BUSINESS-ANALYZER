import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ScatterChart, Scatter, Cell
} from 'recharts';

// ---------- Unified High-Clarity Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  border: "#30363d",
  accent: "#8957e5", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

// Modules referenced by the upload/merge logic — mirrors the four dashboard tabs
const modules = [
  { id: "Market Trends" },
  { id: "Lead Prioritization" },
  { id: "Retention & Churn" },
  { id: "Campaign Analysis" },
];

export default function MarketingDashboard() {
  const [activeFunc, setActiveFunc] = useState("Market Trends");
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

  // Normalizes a raw parsed CSV row into the fields the dashboard renders,
  // tolerant of different header spellings/casing from uploaded CSVs.
  const normalizeRow = (row, i) => {
    const findValue = (possibleKeys, fallbackIndex) => {
      for (let k of possibleKeys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
        const normalizedKey = k.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');
        if (row[normalizedKey] !== undefined && row[normalizedKey] !== null && row[normalizedKey] !== "") return row[normalizedKey];
      }
      const fallback = Object.values(row)[fallbackIndex];
      return fallback !== undefined ? fallback : 0;
    };

    const spent = parseFloat(findValue(["Total_Spent", "Spent", "ad_spend", "budget", "total_spent"], 1)) || 0;
    const eng = parseFloat(findValue(["Engagement_Score", "Engagement", "engagement_score", "clicks"], 2)) || 0;
    const sessions = parseFloat(findValue(["Web_Sessions", "Sessions", "web_sessions", "traffic"], 3)) || 0;
    const conv = parseFloat(findValue(["Conversion_Rate", "Conversion", "conversion_rate", "conversions"], 4)) || 0;

    return {
      id: findValue(["Customer_ID", "ID", "id", "customer_id", "lead_id"], 0) || `CUST-${500 + i}`,
      spent,
      engagement: eng,
      sessions,
      conversion: conv,
      roi: spent > 0 ? ((sessions * conv * 100) / spent).toFixed(2) : "0.00",
      status: (row.predicted_churn === 1 || row.status === "CRITICAL" || eng < 30) ? "CRITICAL" : "STABLE"
    };
  };

  // Generates the same static insight copy the original task-based pipeline produced,
  // keyed off the active tab rather than a backend task label.
  const getInsightsFor = (tab, flaggedCount) => {
    if (tab === "Market Trends") {
      return [
        { label: "Market Reach", text: "Organic growth trend suggests a 12% expansion in target demographics." },
        { label: "Segment Velocity", text: "High-engagement clusters are forming around the mid-tier spending bracket." }
      ];
    }
    if (tab === "Retention & Churn") {
      return [
        { label: "Churn Velocity", text: `${flaggedCount} profiles show signs of engagement decay.` },
        { label: "Retention Strategy", text: "Re-engagement campaigns recommended for segments with high risk drop-offs." }
      ];
    }
    if (tab === "Lead Prioritization") {
      return [
        { label: "Hot Leads Identified", text: "Targeted conversions score highly across returning web sessions." },
        { label: "Pipeline Velocity", text: "Accelerating routing mechanisms for immediate stable profile captures." }
      ];
    }
    return [
      { label: "ROI Optimization", text: "Multi-channel advertising campaigns verified steady scale multipliers." },
      { label: "Capital Efficiency", text: "Budget distribution matrix validates lower customer acquisition costs." }
    ];
  };

  const renderContent = () => {
    const raw = dataStore[activeFunc];
    if (!raw || !raw.ledger || raw.ledger.length === 0) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontSize: '14px', fontWeight: '600' }}>
          Awaiting Marketing Insights
        </motion.div>
      </div>
    );

    const ledger = raw.ledger.map((row, i) => normalizeRow(row, i));
    const flagged = ledger.filter(l => l.status === "CRITICAL").length;
    const timeSeries = ledger.slice(0, 15).map((d, index) => ({ x: index, val: d.engagement, reach: d.sessions || d.spent }));
    const insights = getInsightsFor(activeFunc, flagged);
    const data = { ...raw, ledger, flagged, timeSeries, insights };

    const config = {
      "Market Trends": { kpi1: "Total Audience", kpi2: "Avg Engagement", kpi3: "Market Cap", accent: theme.primary },
      "Lead Prioritization": { kpi1: "High Value Leads", kpi2: "Conv Index", kpi3: "Total Sessions", accent: theme.success },
      "Retention & Churn": { kpi1: "Churn Detected", kpi2: "Loyalty Score", kpi3: "Revenue At Risk", accent: theme.danger },
      "Campaign Analysis": { kpi1: "Campaign ROI", kpi2: "Total Ad Spend", kpi3: "Active Channels", accent: theme.accent }
    }[activeFunc];

    const getKpiValues = () => {
      const total = data.total || 1;
      if (activeFunc === "Market Trends") {
        const avgEng = data.ledger.reduce((a, c) => a + c.engagement, 0) / total;
        const totalSpent = data.ledger.reduce((a, c) => a + c.spent, 0);
        return [data.total, `${avgEng.toFixed(1)}%`, `$${totalSpent.toLocaleString()}`];
      }
      if (activeFunc === "Retention & Churn") {
        const avgLoyalty = (data.ledger.filter(x => x.status === 'STABLE').length / total) * 100;
        const riskRevenue = data.ledger.filter(x => x.status === 'CRITICAL').reduce((a, c) => a + c.spent, 0);
        return [data.flagged, `${avgLoyalty.toFixed(1)}%`, `$${riskRevenue.toLocaleString()}`];
      }
      if (activeFunc === "Lead Prioritization") {
        const highValueCount = data.ledger.filter(x => x.conversion > 0.05 || x.engagement > 70).length;
        const avgConv = data.ledger.reduce((a, c) => a + c.conversion, 0) / total;
        const totalSessions = data.ledger.reduce((a, c) => a + c.sessions, 0);
        return [highValueCount, `${(avgConv * 100).toFixed(1)}%`, totalSessions.toLocaleString()];
      }
      const avgRoi = data.ledger.reduce((a, c) => a + parseFloat(c.roi), 0) / total;
      const totalAdSpend = data.ledger.reduce((a, c) => a + c.spent, 0);
      return [`${avgRoi.toFixed(2)}x`, `$${totalAdSpend.toLocaleString()}`, "4 Live Nodes"];
    };

    const getDynamicMetricConfig = () => {
      switch (activeFunc) {
        case "Market Trends":
          return { label: "Engagement Score", valueKey: "engagement", format: (v) => `${v}%` };
        case "Lead Prioritization":
          return { label: "Conversion Rate", valueKey: "conversion", format: (v) => `${(v * 100).toFixed(1)}%` };
        case "Retention & Churn":
          return { label: "Risk Vulnerability", valueKey: "engagement", format: (v) => `${(100 - v).toFixed(0)}% Risk` };
        case "Campaign Analysis":
          return { label: "Campaign ROI Multiplier", valueKey: "roi", format: (v) => `${v}x` };
        default:
          return { label: "Primary Metric", valueKey: "spent", format: (v) => `$${v}` };
      }
    };

    const metricConfig = getDynamicMetricConfig();
    const kpiVals = getKpiValues();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* KPI Row - Clean 3-Column Balanced Flow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title={config.kpi1} value={kpiVals[0]} color={config.accent} delay={0.1} />
          <KPICard title={config.kpi2} value={kpiVals[1]} color={theme.text} delay={0.2} />
          <KPICard title={config.kpi3} value={kpiVals[2]} color={theme.success} delay={0.3} />
        </div>

        {/* Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '25px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>Metric Correlation Matrix</div>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <XAxis type="number" dataKey="spent" name="Spend" stroke={theme.subtext} fontSize={10} hide />
                <YAxis type="number" dataKey="engagement" name="Engagement" stroke={theme.subtext} fontSize={10} hide />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '6px' }} />
                <Scatter data={data.ledger} fill={theme.primary}>
                  {data.ledger.map((e, i) => (
                    <Cell key={i} fill={e.status === 'CRITICAL' ? theme.danger : theme.success} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>{activeFunc} Reach Timeline</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.timeSeries}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="reach" stroke={config.accent} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}` }}>
            <div style={{...cardHeader, color: config.accent}}>Marketing Intelligence</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.text, margin: 0 }}>
              Analyzed {data.total} consumer profiles. 
              Engagement patterns indicate a highly unified architecture across primary acquisition and verification channels.
            </p>
          </div>
        </div>

        {/* Intelligence Matrix */}
        <div style={{ ...cardStyle, marginBottom: '30px' }}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between' }}>
            <span>{activeFunc} Intelligence Matrix</span>
            <span style={{ color: theme.primary }}>Predictive Points Active</span>
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
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
          <div style={thStyle}>
            <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>{activeFunc} Operational Ledger</span>
              <span style={{ color: theme.success }}>System Stream Restructured</span>
            </div>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{padding: '15px'}}>ID Identifier</th>
                <th>Capital Investment</th>
                <th>{metricConfig.label}</th>
                <th>Status Flags</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 15).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '15px', color: theme.primary, fontWeight: '600'}}>{row.id}</td>
                  <td style={{color: theme.textMuted}}>${row.spent.toLocaleString()}</td>
                  <td style={{color: theme.text, fontWeight: '500'}}>
                    {metricConfig.format(row[metricConfig.valueKey])}
                  </td>
                  <td>
                    <span style={{ 
                      background: row.status === 'CRITICAL' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(63, 185, 80, 0.1)',
                      color: row.status === 'CRITICAL' ? theme.danger : theme.success,
                      padding: '5px 12px', borderRadius: '6px', border: `1px solid ${row.status === 'CRITICAL' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(63, 185, 80, 0.2)'}`,
                      fontSize: '11px', fontWeight: '800'
                    }}>
                      {row.status}
                    </span>
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

        {notification && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={notificationStyle}>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Business Analyzer | <span style={{ color: theme.primary }}>Marketing Dashboard</span></h1>
        
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
        {["Market Trends", "Lead Prioritization", "Retention & Churn", "Campaign Analysis"].map(tab => (
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
const loaderOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(13, 17, 23, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const notificationStyle = { position: 'fixed', bottom: '30px', right: '30px', background: theme.success, color: '#fff', padding: '15px 25px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };
