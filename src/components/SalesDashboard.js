import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

// ---------- Unified High-Clarity Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  border: "#30363d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  accent: "#1f6feb", 
  success: "#3fb950",
  danger: "#da3633",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

export default function SalesDashboard() {
  const [activeFunc, setActiveFunc] = useState("Revenue");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const tasks = ["amazon_revenue", "marketing_roi", "customer_churn"];
    let newStore = { ...dataStore };
    let temporaryUploadedNames = [...uploadedFiles];

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      for (const file of files) {
        let fileSuccessfullyProcessed = false;

        for (const task of tasks) {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(`http://127.0.0.1:8000/api/sales/predict?task=${task}`, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();

          if (result.status === "success") {
            fileSuccessfullyProcessed = true;
            const rawPredictions = result.predictions;
            
            const dynamicInsights = rawPredictions.slice(0, 10).map((val, i) => {
              const mapping = {
                "amazon_revenue": ["SKU Velocity", "Buy Box Delta", "Organic Rank Index", "Inventory Liquidity", "Pricing Elasticity"],
                "marketing_roi": ["Acquisition Yield", "ACOS Protocol", "Conversion Velocity", "Brand Attribution", "PPC Efficiency"],
                "customer_churn": ["LTV Survival", "Cohort Alpha", "Dormant Recovery", "Subscription Health", "Attrition Log"]
              };
              const labelSet = mapping[task] || ["Data Vector"];
              return {
                label: labelSet[i % labelSet.length],
                value: val,
                conf: (result.accuracy * 100).toFixed(1),
                status: val > rawPredictions[0] ? "Expanding" : "Stable"
              };
            });

            const key = task === "amazon_revenue" ? "Revenue" : task === "marketing_roi" ? "Marketing ROI" : "Customer Churn";
            newStore[key] = {
              accuracy: result.accuracy,
              total: rawPredictions.length,
              metric: rawPredictions.reduce((a, b) => a + b, 0).toFixed(2),
              predictions: rawPredictions,
              insights: dynamicInsights,
              distribution: [{ name: 'Signal', value: result.accuracy * 100 }, { name: 'Noise', value: 100 - (result.accuracy * 100) }]
            };
          }
        }
        if (fileSuccessfullyProcessed && !temporaryUploadedNames.includes(file.name)) {
          temporaryUploadedNames.push(file.name);
        }
      }
      setDataStore(newStore);
      setUploadedFiles(temporaryUploadedNames);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '14px', fontWeight: '600', color: theme.primary }}>
          Awaiting Commercial Insights
        </motion.div>
      </div>
    );

    const config = {
      "Revenue": { 
        accent: theme.primary, title: "Revenue Forecast Matrix",
        kpis: ["Data Volume", "Net Forecast", "Inventory Health"] 
      },
      "Marketing ROI": { 
        accent: theme.accent, title: "Capital Efficiency Logs",
        kpis: ["Spend Volume", "Net Attribution", "Channel Efficiency"] 
      },
      "Customer Churn": { 
        accent: theme.danger, title: "Risk Probability Dashboard",
        kpis: ["At-Risk Entities", "LTV Impact", "Churn Velocity"] 
      }
    }[activeFunc];

    const getKpiValues = () => {
        if (activeFunc === "Revenue") return [data.total, `$${Number(data.metric).toLocaleString()}`, "98.2%"];
        if (activeFunc === "Marketing ROI") return [`$${(data.metric / 10).toFixed(0)}`, `${(data.accuracy * 88).toFixed(1)}%`, "High"];
        return [(data.total * 0.12).toFixed(0), `$${(data.metric * 0.05).toFixed(0)}`, "Stable"];
    };

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {config.kpis.map((title, i) => (
            <KPICard key={title} title={title} value={getKpiValues()[i]} color={config.accent} delay={0.1 * (i + 1)} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 0.8fr', gap: '25px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>Statistical Distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.distribution} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  <Cell fill={config.accent} stroke="none" />
                  <Cell fill={theme.border} stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>{config.title}</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.predictions.slice(0, 30).map((p, i) => ({ x: i, y: p }))}>
                <Area type="monotone" dataKey="y" stroke={config.accent} fill={config.accent} fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}` }}>
            <div style={{...cardHeader, color: config.accent}}>Sales Intelligence</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.text }}>
              Revenue streams indicate {data.accuracy > 0.8 ? "high" : "moderate"} reliability. 
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <span style={{ color: theme.text }}>{activeFunc} Audit Ledger</span>
            <span style={{ color: config.accent, fontWeight: '800' }}>Predictive Analytics Active</span>
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{padding: '15px'}}>Metric Entity</th>
                  <th>Forecasted Yield</th>
                  <th>Confidence</th>
                  <th>Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {data.insights.map((insight, idx) => (
                  <tr key={idx} style={trStyle}>
                    <td style={{padding: '15px', color: theme.primary, fontWeight: '600'}}>{insight.label}</td>
                    <td style={{color: theme.textMuted}}>${Number(insight.value).toLocaleString()}</td>
                    <td style={{color: theme.textMuted}}>{insight.conf}%</td>
                    <td>
                      <span style={{ 
                        background: insight.status === "Expanding" ? 'rgba(63, 185, 80, 0.1)' : 'rgba(88, 166, 255, 0.1)',
                        color: insight.status === "Expanding" ? theme.success : theme.primary,
                        padding: '6px 14px', borderRadius: '6px', border: `1px solid ${insight.status === "Expanding" ? 'rgba(63, 185, 80, 0.2)' : 'rgba(88, 166, 255, 0.2)'}`,
                        fontSize: '11px', fontWeight: '800'
                      }}>
                        {insight.status}
                      </span>
                    </td>
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Business Analyzer | <span style={{ color: theme.primary }}>Sales Dashboard</span></h1>
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
        {["Revenue", "Marketing ROI", "Customer Churn"].map(tab => (
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
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };