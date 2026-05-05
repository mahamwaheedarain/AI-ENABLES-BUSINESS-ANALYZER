import React, { useState, useEffect } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, 
  BarChart, Bar, LineChart, Line, ComposedChart, ScatterChart, Scatter,
  CartesianGrid, Legend
} from "recharts";

// ---------- Elite Financial Terminal Theme ----------
const theme = {
  bg: "#050507", 
  glass: "rgba(15, 15, 25, 0.6)",
  border: "rgba(255, 255, 255, 0.08)",
  primary: "#4ac6ff", 
  secondary: "#b388ff", 
  accent: "#00e676",
  warning: "#ffab40",
  danger: "#ff5252",
  text: "#ffffff",
  subtext: "rgba(255, 255, 255, 0.4)",
  headingFont: "'Playfair Display', serif", 
  bodyFont: "'Inter', sans-serif", 
};

const styles = {
  app: { display: "flex", height: "100vh", background: theme.bg, color: theme.text, fontFamily: theme.bodyFont, overflow: "hidden" },
  sidebar: { width: 340, background: "rgba(8, 8, 12, 0.98)", backdropFilter: "blur(40px)", padding: "40px 25px", display: "flex", flexDirection: "column", borderRight: `1px solid ${theme.border}`, overflowY: "auto" },
  menuItem: { padding: "16px 20px", cursor: "pointer", borderRadius: "4px", transition: "0.3s ease", fontSize: "11px", fontWeight: "500", marginBottom: "6px", letterSpacing: "0.5px", borderLeft: "0px solid transparent" },
  activeItem: { background: "rgba(74, 198, 255, 0.05)", color: theme.primary, borderLeft: `3px solid ${theme.primary}`, fontWeight: "700" },
  main: { flex: 1, overflowY: "auto", background: "radial-gradient(circle at top right, rgba(74, 198, 255, 0.03), transparent)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px", padding: "40px" },
  card: { background: theme.glass, border: `1px solid ${theme.border}`, padding: "25px", borderRadius: "4px", backdropFilter: "blur(10px)" },
  uploadArea: { border: `1px dashed ${theme.border}`, padding: "60px", borderRadius: "8px", textAlign: "center", cursor: "pointer", transition: "0.3s" }
};

// Defined 10 Functions mapped to your specific CSV headers
const modules = [
  { id: 1, name: "Profitability Velocity", key: "NetProfit", type: "composed", color: theme.primary, insight: "Analyzes the spread between Revenue and Expenses to determine net margin growth." },
  { id: 2, name: "Liquidity Strength", key: "QuickRatio", type: "line", color: theme.accent, insight: "Monitors the ability to meet short-term obligations using the most liquid assets." },
  { id: 3, name: "Market Dominance", key: "MarketShare", type: "bar", color: theme.secondary, insight: "Visualizes company presence relative to sector volume over time." },
  { id: 4, name: "Efficiency Matrix", key: "EmployeeProductivity", type: "area", color: theme.warning, insight: "Tracks output optimization against operational scale." },
  { id: 5, name: "Solvency Risk", key: "DebtToEquity", type: "line", color: theme.danger, insight: "Measures financial leverage and long-term fiscal sustainability." },
  { id: 6, name: "Burn Rate Variance", key: "BurnRate", type: "bar", color: theme.danger, insight: "Critical monitoring of monthly negative cash flow vs revenue growth." },
  { id: 7, name: "Predictive LTV", key: "CustomerLTV", type: "composed", color: theme.primary, insight: "Customer Lifetime Value forecasting based on retention and spending trends." },
  { id: 8, name: "Capital Health", key: "WorkingCapital", type: "area", color: theme.accent, insight: "Difference between current assets and liabilities, indicating operational liquidity." },
  { id: 9, name: "Customer Acquisition", key: "CAC", type: "bar", color: theme.secondary, insight: "Analyzes the cost efficiency of acquiring new users relative to budget." },
  { id: 10, name: "Risk vs Volatility", key: "RiskScore", type: "scatter", color: theme.warning, insight: "Correlates internal risk scoring against external market volatility indices." }
];

export default function FinanceProjectTerminal() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [activeMod, setActiveMod] = useState(modules[0]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ totalRev: 0, avgRisk: 0, growth: 0 });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n");
      const headers = rows[0].split(",").map(h => h.trim());
      
      const parsedData = rows.slice(1).filter(row => row.trim() !== "").map(row => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          const val = values[index]?.trim();
          obj[header] = isNaN(val) ? val : parseFloat(val);
          return obj;
        }, {});
      });

      // Calculate simple summary stats for the UI
      const totalRev = parsedData.reduce((sum, item) => sum + (item.Revenue || 0), 0);
      const avgRisk = (parsedData.reduce((sum, item) => sum + (item.RiskScore || 0), 0) / parsedData.length).toFixed(2);
      
      setStats({ totalRev, avgRisk, growth: "+12.4%" });
      setChartData(parsedData);
      setIsUploaded(true);
    };
    reader.readAsText(file);
  };

  const renderChart = () => {
    const axisStyle = { stroke: "rgba(255,255,255,0.1)", fontSize: 10, tickLine: false, axisLine: false, tick: { fill: theme.subtext } };
    const toolStyle = { background: "#0a0a0f", border: `1px solid ${theme.border}`, borderRadius: "4px", fontSize: "12px" };

    switch (activeMod.type) {
      case "composed":
        return (
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="Month" {...axisStyle} />
              <YAxis {...axisStyle} hide />
              <Tooltip contentStyle={toolStyle} />
              <Area type="monotone" dataKey={activeMod.key} fill={activeMod.color} fillOpacity={0.1} stroke="none" />
              <Line type="monotone" dataKey={activeMod.key} stroke={activeMod.color} strokeWidth={3} dot={{ r: 4, fill: theme.bg, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Bar dataKey={activeMod.key} fill={activeMod.color} radius={[4, 4, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="85%">
            <ScatterChart>
              <XAxis type="number" dataKey="MarketVolatility" name="Volatility" {...axisStyle} hide={false} />
              <YAxis type="number" dataKey="RiskScore" name="Risk" {...axisStyle} hide={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={toolStyle} />
              <Scatter name="Risk Correlation" data={chartData} fill={activeMod.color} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Area type="step" dataKey={activeMod.key} stroke={activeMod.color} fill={activeMod.color} fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Line type="monotone" dataKey={activeMod.key} stroke={activeMod.color} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={styles.app}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;600&display=swap');
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-thumb { background: ${theme.primary}; }
        `}
      </style>

      {isUploaded && (
        <aside style={styles.sidebar}>
          <div style={{ marginBottom: "50px" }}>
            <h1 style={{ fontFamily: theme.headingFont, fontSize: "26px", fontWeight: "700", fontStyle: "italic" }}>
              Insight<span style={{ color: theme.primary }}>IQ</span>
            </h1>
            <div style={{ height: "1px", width: "40px", background: theme.primary, marginTop: "10px" }}></div>
          </div>
          {modules.map((m) => (
            <div key={m.id} onClick={() => setActiveMod(m)}
              style={{ ...styles.menuItem, ...(activeMod.id === m.id ? styles.activeItem : {}) }}>
              {m.name}
            </div>
          ))}
        </aside>
      )}

      <main style={styles.main}>
        {!isUploaded ? (
          <section style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", border: `1px solid ${theme.border}`, padding: "80px", background: theme.glass }}>
              <h1 style={{ fontFamily: theme.headingFont, fontSize: "42px", marginBottom: "20px" }}>Financial Insights</h1>
              <p style={{ color: theme.subtext, marginBottom: "40px", fontSize: "14px", letterSpacing: "1px" }}>Upload your csv files</p>
              <label style={styles.uploadArea}>
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} />
                <span style={{ color: theme.primary, fontWeight: "600", fontSize: "12px", letterSpacing: "2px" }}>UPLOAD CSV ENGINE</span>
              </label>
            </div>
          </section>
        ) : (
          <div style={{ padding: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <h2 style={{ fontFamily: theme.headingFont, fontSize: "32px" }}>{activeMod.name}</h2>
              <div style={{ display: "flex", gap: "30px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext, letterSpacing: "1px" }}>ANNUAL REVENUE</div>
                  <div style={{ fontSize: "18px", fontWeight: "600" }}>${stats.totalRev.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext, letterSpacing: "1px" }}>AVG RISK SCORE</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: theme.warning }}>{stats.avgRisk}</div>
                </div>
              </div>
            </div>

            <div style={styles.grid}>
              <div style={{ ...styles.card, gridColumn: "span 8", height: "480px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ fontSize: "10px", color: theme.subtext, fontWeight: "700" }}>TEMPORAL DATA VECTOR</span>
                  <span style={{ fontSize: "10px", color: theme.primary }}>TYPE: {activeMod.type.toUpperCase()}</span>
                </div>
                {renderChart()}
              </div>

              <div style={{ ...styles.card, gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ color: theme.primary, fontSize: "11px", letterSpacing: "2px", marginBottom: "20px", fontWeight: "700" }}>ANALYTICAL INSIGHT</h4>
                  <p style={{ fontSize: "15px", lineHeight: "1.8", color: theme.text, fontWeight: "300" }}>{activeMod.insight}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "4px" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext, marginBottom: "5px" }}>LATEST VALUE</div>
                  <div style={{ fontSize: "24px", fontFamily: theme.headingFont }}>{chartData[chartData.length - 1][activeMod.key]}</div>
                </div>
              </div>

              {/* Functional Matrix Row */}
              <div style={{ ...styles.card, gridColumn: "span 12" }}>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  {[ 
                    { l: 'BURN RATE', v: chartData[chartData.length-1].BurnRate, c: theme.danger },
                    { l: 'CASH FLOW', v: chartData[chartData.length-1].CashFlow, c: theme.accent },
                    { l: 'NET PROFIT', v: chartData[chartData.length-1].NetProfit, c: theme.primary },
                    { l: 'NPS SCORE', v: chartData[chartData.length-1].NPS, c: theme.secondary }
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "9px", color: theme.subtext, marginBottom: "8px", fontWeight: "700" }}>{item.l}</div>
                      <div style={{ fontSize: "22px", color: item.c, fontWeight: "400", fontFamily: theme.headingFont }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}