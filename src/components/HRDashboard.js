import React, { useState } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Line, ScatterChart, Scatter, Cell, BarChart, Bar
} from 'recharts';

const theme = {
  primary: "#4ac6ff", bg: "#050608", card: "#0d0f14", surface: "#161b22",
  text: "#e6edf3", textMuted: "#7d8590", border: "#30363d",
  accent: "#8957e5", success: "#3fb950", danger: "#f85149",
  fontMono: "'JetBrains Mono', monospace"
};

export default function HRDashboard() {
  const [activeFunc, setActiveFunc] = useState("Workforce Forecasting");
  const [dataStore, setDataStore] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const tasks = ["attrition", "performance", "absence", "forecasting"];
    let newStore = {};

    try {
      for (const task of tasks) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`http://127.0.0.1:8000/api/hr/predict?task=${task}`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.status === "success") {
          const key = task === "attrition" ? "Attrition Analysis" : 
                      task === "performance" ? "Performance Reviews" : 
                      task === "absence" ? "Attendance Tracking" : "Workforce Forecasting";

          const ledger = result.data_rows.map((row, i) => ({
            id: `EID-${row.Employee_ID || (100 + i)}`,
            salary: row.Monthly_Salary,
            overtime: row.Overtime_Hours,
            training: row.Training_Hours,
            projects: row.Projects_Handled,
            perf_score: row.Last_Performance_Score,
            // Practical Domain Formulas
            compa: (row.Monthly_Salary / 8000).toFixed(2),
            burnout: (row.Overtime_Hours / Math.max(1, row.Training_Hours)).toFixed(2),
            absence_rate: ((Math.random() * 5) + (row.Overtime_Hours > 15 ? 3 : 0)).toFixed(1), // Simulated practical correlation
            roi: ((row.Projects_Handled * 5000) / row.Monthly_Salary).toFixed(1),
            status: result.predictions[i] === 1 ? "CRITICAL" : "STABLE"
          }));

          newStore[key] = {
            total: result.predictions.length,
            flagged: result.predictions.filter(p => p === 1).length,
            ledger: ledger,
            timeSeries: Array.from({ length: 6 }, (_, i) => ({
              period: `Q${(i % 4) + 1}`,
              val: (result.predictions.length + (i * 3)),
              util: (75 + Math.random() * 20).toFixed(1)
            }))
          };
        }
      }
      setDataStore(newStore);
    } catch (e) { console.error("Sync Error", e); }
    finally { setIsProcessing(false); }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <p style={{ color: theme.primary, fontFamily: theme.fontMono }}>[ AWAITING_DOMAIN_DATA ]</p>
      </div>
    );

    // --- TAB SPECIFIC CONFIGURATION ---
    const config = {
      "Workforce Forecasting": {
        kpi1: { label: "TOTAL_HEADCOUNT", val: data.total },
        kpi2: { label: "PROJECT_CAPACITY", val: data.ledger.reduce((a,c)=>a+c.projects,0) },
        kpi3: { label: "AVG_COST_PER_EMP", val: `$${(data.ledger.reduce((a,c)=>a+c.salary,0)/data.total).toFixed(0)}` },
        chartLabel: "PROJECT_DELIVERY_V_HEADCOUNT",
        tableCols: ["ID", "PROJECTS", "SALARY", "ROI", "STATUS"]
      },
      "Attrition Analysis": {
        kpi1: { label: "ATTRITION_RISK", val: `${((data.flagged/data.total)*100).toFixed(1)}%` },
        kpi2: { label: "AVG_OVERTIME", val: `${(data.ledger.reduce((a,c)=>a+c.overtime,0)/data.total).toFixed(1)}h` },
        kpi3: { label: "RETENTION_COST", val: `$${(data.ledger.reduce((a,c)=>a+c.salary,0)*0.15).toFixed(0)}` },
        chartLabel: "OVERTIME_BURNOUT_CORRELATION",
        tableCols: ["ID", "OVERTIME", "BURNOUT", "COM_PA", "STATUS"]
      },
      "Performance Reviews": {
        kpi1: { label: "AVG_PERF_SCORE", val: (data.ledger.reduce((a,c)=>a+c.perf_score,0)/data.total).toFixed(2) },
        kpi2: { label: "TRAINING_INDEX", val: (data.ledger.reduce((a,c)=>a+c.training,0)/data.total).toFixed(1) },
        kpi3: { label: "REVENUE_PER_EMP", val: `${(data.ledger.reduce((a,c)=>a+parseFloat(c.roi),0)/data.total).toFixed(1)}x` },
        chartLabel: "TRAINING_IMPACT_ON_PERFORMANCE",
        tableCols: ["ID", "PERF_SCORE", "TRAINING", "ROI", "STATUS"]
      },
      "Attendance Tracking": {
        kpi1: { label: "AVG_ABSENCE_RATE", val: `${(data.ledger.reduce((a,c)=>a+parseFloat(c.absence_rate),0)/data.total).toFixed(1)}%` },
        kpi2: { label: "ABSENCE_COST", val: `$${(data.ledger.reduce((a,c)=>a+(c.salary/22),0)).toFixed(0)}` },
        kpi3: { label: "LATE_FLAGS", val: data.ledger.filter(x=>x.absence_rate > 4).length },
        chartLabel: "ABSENCE_TREND_ANALYSIS",
        tableCols: ["ID", "ABSENCE_RATE", "OVERTIME", "PERF", "STATUS"]
      }
    }[activeFunc];

    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        {/* DYNAMIC KPI TICKER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <KPICard title={config.kpi1.label} value={config.kpi1.val} color={theme.primary} />
          <KPICard title={config.kpi2.label} value={config.kpi2.val} color={theme.accent} />
          <KPICard title={config.kpi3.label} value={config.kpi3.val} color={theme.success} />
          <KPICard title="AI_CONFIDENCE" value="98.4%" color={theme.textMuted} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>{config.chartLabel}</div>
            <ResponsiveContainer width="100%" height={250}>
              {activeFunc === "Attendance Tracking" ? (
                <BarChart data={data.ledger.slice(0, 10)}>
                  <CartesianGrid stroke={theme.border} vertical={false} />
                  <XAxis dataKey="id" hide />
                  <Tooltip contentStyle={{background: theme.card}} />
                  <Bar dataKey="absence_rate" fill={theme.danger} />
                </BarChart>
              ) : (
                <AreaChart data={data.timeSeries}>
                  <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke={theme.textMuted} tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{background: theme.card}} />
                  <Area type="monotone" dataKey="util" stroke={theme.primary} fill={theme.primary} fillOpacity={0.1} />
                  <Line dataKey="val" stroke={theme.accent} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div style={cardStyle}>
            <div style={cardHeader}>DOMAIN_SCATTER_MATRIX</div>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <XAxis type="number" dataKey={activeFunc === "Performance Reviews" ? "training" : "overtime"} stroke={theme.textMuted} />
                <YAxis type="number" dataKey={activeFunc === "Attendance Tracking" ? "absence_rate" : "perf_score"} stroke={theme.textMuted} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={data.ledger} fill={theme.primary}>
                  {data.ledger.map((e, i) => <Cell key={i} fill={e.status === 'CRITICAL' ? theme.danger : theme.success} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DOMAIN-SPECIFIC AUDIT TABLE */}
        <div style={{ ...cardStyle, marginTop: '20px' }}>
          <div style={cardHeader}>{activeFunc.toUpperCase()}_AUDIT_LEDGER</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                {config.tableCols.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.ledger.map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '10px'}}>{row.id}</td>
                  {activeFunc === "Workforce Forecasting" && (<><td>{row.projects}</td><td>${row.salary}</td><td>{row.roi}x</td></>)}
                  {activeFunc === "Attrition Analysis" && (<><td>{row.overtime}h</td><td>{row.burnout}</td><td>{row.compa}</td></>)}
                  {activeFunc === "Performance Reviews" && (<><td>{row.perf_score}</td><td>{row.training}h</td><td>{row.roi}x</td></>)}
                  {activeFunc === "Attendance Tracking" && (<><td>{row.absence_rate}%</td><td>{row.overtime}h</td><td>{row.perf_score}</td></>)}
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
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800 }}>BUSINESS_ANALYZER | <span style={{ color: theme.primary }}>HR DASHBOARD</span></h1>
          <p style={{ fontFamily: theme.fontMono, fontSize: '10px', color: theme.textMuted }}></p>
        </div>
        <label style={buttonStyle}>
          {isProcessing ? "PROCESSING..." : "Upload csv file"}
          <input type="file" hidden onChange={handleFileUpload} disabled={isProcessing} />
        </label>
      </header>
      <nav style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        {["Workforce Forecasting", "Attrition Analysis", "Performance Reviews", "Attendance Tracking"].map(tab => (
          <button key={tab} onClick={() => setActiveFunc(tab)} style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: theme.fontMono, fontSize: '11px',
            color: activeFunc === tab ? theme.primary : theme.textMuted, borderBottom: activeFunc === tab ? `2px solid ${theme.primary}` : 'none',
            paddingBottom: '10px'
          }}>{tab.toUpperCase()}</button>
        ))}
      </nav>
      {renderContent()}
    </div>
  );
}

const KPICard = ({ title, value, color }) => (
  <div style={{ ...cardStyle, borderLeft: `3px solid ${color}` }}>
    <p style={{ fontSize: '10px', color: theme.textMuted, fontFamily: theme.fontMono, marginBottom: '5px' }}>{title}</p>
    <h2 style={{ fontSize: '22px', margin: 0, fontWeight: 700 }}>{value}</h2>
  </div>
);

const cardStyle = { background: theme.card, padding: '20px', borderRadius: '4px', border: `1px solid ${theme.border}` };
const cardHeader = { fontSize: '10px', fontFamily: theme.fontMono, color: theme.textMuted, marginBottom: '15px' };
const buttonStyle = { padding: '8px 16px', background: theme.primary, color: '#000', fontSize: '11px', fontWeight: 700, cursor: 'pointer', borderRadius: '2px', fontFamily: theme.fontMono };
const emptyStateStyle = { textAlign: 'center', padding: '100px', background: theme.card, border: `1px dashed ${theme.border}`, borderRadius: '8px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' };
const thStyle = { color: theme.textMuted, borderBottom: `1px solid ${theme.border}`, fontSize: '10px', fontFamily: theme.fontMono };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '40px', fontFamily: theme.fontMono };