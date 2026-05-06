import React, { useState } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Line, ScatterChart, Scatter, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, ComposedChart, LineChart, ReferenceLine, Brush
} from 'recharts';

const theme = {
  primary: "#4ac6ff", bg: "#050608", card: "#0d0f14", surface: "#161b22",
  text: "#e6edf3", textMuted: "#7d8590", border: "#30363d",
  accent: "#8957e5", success: "#3fb950", danger: "#f85149", warning: "#d29922",
  fontMono: "'JetBrains Mono', monospace"
};

export default function MarketingDashboard() {
  const [activeFunc, setActiveFunc] = useState("Market Trends");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const tasks = ["trends", "lead_scoring", "churn"];
    let newStore = { ...dataStore }; // Keep existing state while updating

    try {
      // DB Sync Logic - Node.js Backend
      const reader = new FileReader();
      reader.onload = async (e) => {
        await fetch("http://localhost:5000/api/upload/upload-multiple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ filename: file.name, content: e.target.result }] })
        });
      };
      reader.readAsText(file);

      // AI Prediction Logic - FastAPI Backend
      for (const task of tasks) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`http://127.0.0.1:8000/api/marketing/predict?task=${task}`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.status === "success") {
          const key = task === "trends" ? "Market Trends" : 
                      task === "lead_scoring" ? "Lead Prioritization" : "Retention & Churn";

          const ledger = result.data_rows.map((row, i) => ({
            id: row.Customer_ID || `CUST-${500 + i}`,
            revenue: row.Total_Spent || 0,
            engagement: row.Engagement_Score || (Math.random() * 100).toFixed(0),
            sessions: row.Web_Sessions || 0,
            discount: row.Discount_Applied || 0,
            probability: (Math.random() * 100).toFixed(1), 
            clv: (row.Total_Spent * 3.5).toFixed(0),
            status: result.predictions[i] === 1 ? "CRITICAL" : "STABLE"
          }));

          newStore[key] = {
            total: result.predictions.length,
            flagged: result.predictions.filter(p => p === 1).length,
            ledger: ledger,
            metrics: {
              roi: "284%", cac: "$31.20", arpu: "$142", 
              sentiment: "Positive", reach: "1.2M", 
              velocity: "4.2 days", bounce: "22%", 
              referral: "12%", repeat: "64%", quality: "8.9/10"
            }
          };
          setDataStore({ ...newStore }); // Update state as each task finishes
        }
      }
    } catch (e) { console.error("Marketing Sync Error", e); }
    finally { setIsProcessing(false); }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    
    // Safety Check for Undefined Data
    if (!data) return (
      <div style={emptyStateStyle}>
        <p style={{ color: theme.primary, fontFamily: theme.fontMono }}>[ AWAITING ANALYTICS]</p>
        <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '10px' }}>UPLOAD CSV FILES TO INITIALIZE ANALYTICS</p>
      </div>
    );

    // Optional Chaining to prevent "Cannot read properties of undefined"
    const m = data?.metrics || {};
    const kpis = [
      { label: "TOTAL_VOL", val: data?.total || 0 },
      { label: "FLAGGED_INST", val: data?.flagged || 0 },
      { label: "ROI_EST", val: m?.roi || "N/A" },
      { label: "CAC_INDEX", val: m?.cac || "N/A" },
      { label: "ARPU_CORE", val: m?.arpu || "N/A" },
      { label: "SENTIMENT", val: m?.sentiment || "N/A" },
      { label: "REACH_CAP", val: m?.reach || "N/A" },
      { label: "CONV_VEL", val: m?.velocity || "N/A" },
      { label: "BOUNCE_RT", val: m?.bounce || "N/A" },
      { label: "LOYALTY_RT", val: m?.repeat || "N/A" }
    ];

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={miniCardStyle}>
              <span style={{ fontSize: '9px', color: theme.textMuted, fontFamily: theme.fontMono }}>{k.label}</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: i % 2 === 0 ? theme.primary : theme.accent }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>MODEL_CONFIDENCE_VARIANCE_SCATTER</div>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis type="number" dataKey="engagement" name="Engagement" stroke={theme.textMuted} fontSize={10}/>
                <YAxis type="number" dataKey="probability" name="Probability" stroke={theme.textMuted} fontSize={10}/>
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={data?.ledger || []} fill={theme.primary}>
                  {data?.ledger?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'CRITICAL' ? theme.danger : theme.success} />
                  ))}
                </Scatter>
                <ReferenceLine y={70} label={{ value: "Risk", fill: theme.danger, fontSize: 10 }} stroke={theme.danger} strokeDasharray="3 3" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>CUSTOMER_LIFECYCLE_VALUE_DENSITY</div>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={data?.ledger?.slice(0, 15) || []}>
                <XAxis dataKey="id" hide />
                <YAxis stroke={theme.textMuted} fontSize={10} />
                <Tooltip contentStyle={{background: theme.card, border: `1px solid ${theme.border}`}} />
                <Bar dataKey="revenue" fill={theme.accent} radius={[4, 4, 0, 0]} barSize={15} />
                <Line type="stepAfter" dataKey="clv" stroke={theme.primary} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <div style={cardHeader}>TEMPORAL_ENGAGEMENT_SEQUENCING (ZOOM_ENABLED)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.ledger || []}>
              <XAxis dataKey="id" hide />
              <Tooltip />
              <Area type="monotone" dataKey="engagement" stroke={theme.success} fill={theme.success} fillOpacity={0.1} />
              <Brush dataKey="id" height={30} stroke={theme.border} fill={theme.bg} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <div style={cardHeader}>AI_ANALYTICS_LEDGER</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th>CUST_ID</th><th>REVENUE</th><th>ENG%</th><th>SESS</th><th>DISC%</th><th>CLV</th><th>PROB%</th><th>RANK</th><th>SENSITIVITY</th><th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data?.ledger?.slice(0, 6).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td>{row.id}</td>
                  <td>${row.revenue}</td>
                  <td>{row.engagement}%</td>
                  <td>{row.sessions}</td>
                  <td>{row.discount}%</td>
                  <td>${row.clv}</td>
                  <td>{row.probability}%</td>
                  <td>#{i+1}</td>
                  <td style={{color: theme.warning}}>High</td>
                  <td><span style={{ color: row.status === 'CRITICAL' ? theme.danger : theme.success }}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '30px', fontFamily: theme.fontMono }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '18px', letterSpacing: '2px' }}>BUSINESS ANALYZER |  <span style={{ color: theme.accent }}>MARKETING DASHBOARD</span></h1>
          <p style={{ fontSize: '9px', color: theme.textMuted }}></p>
        </div>
        <label style={buttonStyle}>
          {isProcessing ? "SYNCING_MODELS..." : "UPLOAD_DATASET"}
          <input type="file" hidden onChange={handleFileUpload} disabled={isProcessing} />
        </label>
      </header>

      <nav style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        {["Market Trends", "Lead Prioritization", "Retention & Churn"].map(tab => (
          <button key={tab} onClick={() => setActiveFunc(tab)} style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: theme.fontMono,
            color: activeFunc === tab ? theme.accent : theme.textMuted, 
            borderBottom: activeFunc === tab ? `2px solid ${theme.accent}` : 'none',
            paddingBottom: '10px'
          }}>{tab.toUpperCase()}</button>
        ))}
      </nav>
      {renderContent()}
    </div>
  );
}

const miniCardStyle = { background: theme.card, padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border}`, textAlign: 'center' };
const cardStyle = { background: theme.card, padding: '20px', borderRadius: '4px', border: `1px solid ${theme.border}` };
const cardHeader = { fontSize: '10px', color: theme.textMuted, marginBottom: '15px', fontFamily: theme.fontMono };
const buttonStyle = { padding: '10px 20px', background: theme.accent, color: '#fff', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: 'none', borderRadius: '2px', fontFamily: theme.fontMono };
const emptyStateStyle = { textAlign: 'center', padding: '100px', background: theme.card, border: `1px dashed ${theme.border}`, borderRadius: '4px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'left', fontFamily: theme.fontMono };
const thStyle = { color: theme.textMuted, borderBottom: `1px solid ${theme.border}`, height: '30px' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '35px' };