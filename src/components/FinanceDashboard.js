import React, { useState, useEffect } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, 
  BarChart, Bar, LineChart, Line, ComposedChart, ScatterChart, Scatter, CartesianGrid
} from "recharts";
import { Upload, Database, Activity, Shield, TrendingUp, AlertTriangle, RefreshCcw, ChevronRight } from 'lucide-react';

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
  cardBg: "#0f0f1a",
  headingFont: "'Playfair Display', serif", 
  bodyFont: "'Inter', sans-serif", 
};

// ---------- Analytical Modules Definition ----------
const modules = [
  { id: 1, name: "Profitability Velocity", key: "NetProfit", type: "composed", color: theme.primary, insight: "Analyzes the spread between Revenue and Expenses to determine net margin growth.", subMetrics: ["Revenue", "NetProfit", "GrossMargin", "OperatingExpense"] },
  { id: 2, name: "Liquidity Strength", key: "QuickRatio", type: "line", color: theme.accent, insight: "Monitors the ability to meet short-term obligations using liquid assets.", subMetrics: ["QuickRatio", "CashReserves", "CurrentRatio", "NetCashFlow"] },
  { id: 3, name: "Market Dominance", key: "MarketShare", type: "bar", color: theme.secondary, insight: "Visualizes company presence relative to sector volume over time.", subMetrics: ["MarketShare", "TAM_Penetration", "CompetitorIndex", "GrowthRate"] },
  { id: 4, name: "Efficiency Matrix", key: "EmployeeProductivity", type: "area", color: theme.warning, insight: "Tracks output optimization against operational scale.", subMetrics: ["EmployeeProductivity", "RevenuePerHead", "ChurnRate", "Utilization"] },
  { id: 5, name: "Solvency Risk", key: "DebtToEquity", type: "line", color: theme.danger, insight: "Measures financial leverage and long-term fiscal sustainability.", subMetrics: ["DebtToEquity", "InterestCoverage", "TotalLiabilities", "EquityBuffer"] },
  { id: 6, name: "Burn Rate Variance", key: "BurnRate", type: "bar", color: theme.danger, insight: "Critical monitoring of monthly negative cash flow vs revenue growth.", subMetrics: ["BurnRate", "MonthlyOutflow", "RunwayMonths", "VariableCosts"] },
  { id: 7, name: "Predictive LTV", key: "CustomerLTV", type: "composed", color: theme.primary, insight: "Customer Lifetime Value forecasting based on retention trends.", subMetrics: ["CustomerLTV", "AvgOrderValue", "RetentionCost", "ReferralScore"] },
  { id: 8, name: "Capital Health", key: "WorkingCapital", type: "area", color: theme.accent, insight: "Difference between current assets and liabilities for liquidity.", subMetrics: ["WorkingCapital", "InventoryTurn", "ReceivablesAging", "PayablesCycle"] },
  { id: 9, name: "Customer Acquisition", key: "CAC", type: "bar", color: theme.secondary, insight: "Analyzes the cost efficiency of acquiring new users relative to budget.", subMetrics: ["CAC", "AdSpend", "OrganicLift", "ConversionRate"] },
  { id: 10, name: "Risk vs Volatility", key: "RiskScore", type: "scatter", color: theme.warning, insight: "Correlates internal risk scoring against external market volatility.", subMetrics: ["RiskScore", "MarketVolatility", "BetaFactor", "AlphaYield"] }
];

export default function FinanceProjectTerminal() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeMod, setActiveMod] = useState(modules[0]);
  const [stats, setStats] = useState({ totalRev: 0, avgRisk: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  // --- 1. PERSISTENCE: FETCH FROM DB ON MOUNT ---
  useEffect(() => {
    const fetchStoredData = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch("http://localhost:5000/api/upload/get-stored-data");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setChartData(data);
            calculateDashboardStats(data);
            setIsUploaded(true);
          }
        }
      } catch (err) {
        console.error("DB Connection Offline. Using Local Session Storage.");
      } finally {
        setIsSyncing(false);
      }
    };
    fetchStoredData();
  }, []);

  const calculateDashboardStats = (data) => {
    const totalRev = data.reduce((sum, item) => sum + (Number(item.Revenue) || 0), 0);
    const avgRisk = (data.reduce((sum, item) => sum + (Number(item.RiskScore) || 0), 0) / (data.length || 1)).toFixed(2);
    setStats({ totalRev, avgRisk });
  };

  // --- 2. FILE HANDLING & DB SYNC ---
  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = null; 
  };

  const removeFileFromQueue = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setIsSyncing(true);

    const filePromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
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

          // Sync individual file to DB
          try {
            await fetch("http://localhost:5000/api/upload/upload-multiple", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ files: [{ filename: file.name, content: text }] })
            });
          } catch (err) { console.error("Sync Error:", file.name); }
          
          resolve(parsed);
        };
        reader.readAsText(file);
      });
    });

    const results = await Promise.all(filePromises);
    const combinedData = results.flat();

    calculateDashboardStats(combinedData);
    setChartData(combinedData);
    setIsUploaded(true);
    setSelectedFiles([]); 
    setIsSyncing(false);
  };

  // --- 3. CHART RENDERING ENGINE ---
  const renderChart = () => {
    const axisStyle = { stroke: "rgba(255,255,255,0.05)", fontSize: 10, tick: { fill: theme.subtext } };
    const toolStyle = { background: "#0a0a0f", border: `1px solid ${theme.border}`, fontSize: "12px", color: "#fff" };

    if (!chartData.length) return null;

    switch (activeMod.type) {
      case "composed":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <YAxis {...axisStyle} hide />
              <Tooltip contentStyle={toolStyle} />
              <Area type="monotone" dataKey={activeMod.key} fill={activeMod.color} fillOpacity={0.1} stroke="none" />
              <Line type="monotone" dataKey={activeMod.key} stroke={activeMod.color} strokeWidth={3} dot={{ r: 4, fill: theme.bg }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Bar dataKey={activeMod.key} fill={activeMod.color} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "scatter":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
              <XAxis type="number" dataKey="MarketVolatility" {...axisStyle} hide={false} name="Volatility" />
              <YAxis type="number" dataKey="RiskScore" {...axisStyle} hide={false} name="Risk" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={toolStyle} />
              <Scatter data={chartData} fill={activeMod.color} />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Area type="step" dataKey={activeMod.key} stroke={activeMod.color} fill={activeMod.color} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Line type="monotone" dataKey={activeMod.key} stroke={activeMod.color} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, color: theme.text, fontFamily: theme.bodyFont }}>
      
      {/* Sidebar */}
      <aside style={{ width: 340, borderRight: `1px solid ${theme.border}`, padding: "40px 25px", display: "flex", flexDirection: "column", background: "rgba(8,8,12,0.95)" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", fontStyle: "italic", fontFamily: theme.headingFont, margin: 0 }}>
            INSIGHT<span style={{ color: theme.primary }}>IQ</span>
          </h1>
          <p style={{ fontSize: "9px", color: isSyncing ? theme.primary : theme.subtext, letterSpacing: "1px", marginTop: "4px" }}>
            {isSyncing ? "SYNC_IN_PROGRESS..." : "SYSTEM_ENCRYPTED_READY"}
          </p>
        </div>

        {!isUploaded ? (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "10px", color: theme.subtext, letterSpacing: "2px", marginBottom: "20px" }}>ARCHIVE QUEUE</p>
            <label style={{ display: "block", padding: "18px", border: `1px dashed ${theme.primary}`, borderRadius: "4px", textAlign: "center", cursor: "pointer", color: theme.primary, fontSize: "11px", fontWeight: "700" }}>
              + ADD CSV ARCHIVE
              <input type="file" accept=".csv" multiple onChange={handleFileSelection} style={{ display: "none" }} />
            </label>

            <div style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}>
              {selectedFiles.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "4px", marginBottom: "8px", fontSize: "12px", border: `1px solid ${theme.border}` }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "80%" }}>{f.name}</span>
                  <span onClick={() => removeFileFromQueue(i)} style={{ color: theme.danger, cursor: "pointer", fontWeight: "bold" }}>✕</span>
                </div>
              ))}
            </div>

            {selectedFiles.length > 0 && (
              <button onClick={handleUploadAll} style={{ width: "100%", marginTop: "25px", padding: "16px", background: theme.primary, color: "#000", border: "none", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}>
                SYNCHRONIZE BATCH ({selectedFiles.length})
              </button>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <button onClick={() => setIsUploaded(false)} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.subtext, padding: "8px 15px", borderRadius: "4px", fontSize: "10px", cursor: "pointer", marginBottom: "30px", width: "100%" }}>← UPLOAD NEW BATCH</button>
            {modules.map(m => (
              <div key={m.id} onClick={() => setActiveMod(m)} 
                   style={{ padding: "14px 20px", cursor: "pointer", borderRadius: "4px", fontSize: "12px", marginBottom: "4px", color: activeMod.id === m.id ? theme.primary : theme.text, background: activeMod.id === m.id ? "rgba(74,198,255,0.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {m.name}
                {activeMod.id === m.id && <ChevronRight size={14} />}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {!isUploaded ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
            <Database size={60} style={{ marginBottom: "20px" }} />
            <h2 style={{ letterSpacing: "8px", fontWeight: "200", fontSize: "30px" }}>AWAITING DATA</h2>
            <p style={{ marginTop: "10px", fontSize: "12px" }}>Synchronize CSV archives to initiate neural temporal analysis.</p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
              <h2 style={{ fontSize: "36px", fontFamily: theme.headingFont }}>{activeMod.name}</h2>
              <div style={{ display: "flex", gap: "40px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: "24px", fontWeight: "600" }}>${stats.totalRev.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext }}>AVG RISK INDEX</div>
                  <div style={{ fontSize: "24px", fontWeight: "600", color: theme.warning }}>{stats.avgRisk}%</div>
                </div>
              </div>
            </div>

            {/* Matrix Display for Sub-Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
              {activeMod.subMetrics.map((m, i) => (
                <div key={i} style={{ padding: "20px", background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "4px" }}>
                  <div style={{ fontSize: "9px", color: theme.subtext, marginBottom: "8px", letterSpacing: "1px" }}>{m.replace(/([A-Z])/g, ' $1').toUpperCase()}</div>
                  <div style={{ fontSize: "20px", fontWeight: "600", color: activeMod.color }}>
                    {chartData[chartData.length - 1]?.[m] || "---"}
                  </div>
                </div>
              ))}
            </div>

            {/* Primary Chart Area */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "30px", height: "450px", borderRadius: "4px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontSize: "10px", color: theme.primary, letterSpacing: "2px" }}>LIVE ANALYTICAL FEED</span>
                <span style={{ fontSize: "10px", color: theme.subtext }}>CORE_METRIC: {activeMod.key.toUpperCase()}</span>
              </div>
              {renderChart()}
            </div>

            {/* Detailed Data Table */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "25px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h4 style={{ color: theme.primary, fontSize: "11px", letterSpacing: "2px", margin: 0 }}>TEMPORAL DATA SET (RECENT_5)</h4>
                <RefreshCcw size={14} style={{ color: theme.subtext }} />
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.subtext }}>
                      <th style={{ padding: "12px" }}>MONTH</th>
                      <th style={{ padding: "12px" }}>{activeMod.key.toUpperCase()} (CORE)</th>
                      {activeMod.subMetrics.slice(0, 3).map(sm => <th key={sm} style={{ padding: "12px" }}>{sm.toUpperCase()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(-5).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid rgba(255,255,255,0.02)` }}>
                        <td style={{ padding: "12px", color: theme.primary }}>{row.Month}</td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>{row[activeMod.key]}</td>
                        {activeMod.subMetrics.slice(0, 3).map(sm => <td key={sm} style={{ padding: "12px" }}>{row[sm] || "N/A"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insight Card */}
            <div style={{ padding: "25px", border: `1px solid ${theme.border}`, borderRadius: "4px", background: theme.glass, borderLeft: `4px solid ${activeMod.color}` }}>
                <h4 style={{ color: activeMod.color, fontSize: "11px", letterSpacing: "2px", marginBottom: "10px" }}>EXECUTIVE_SUMMARY_AI</h4>
                <p style={{ fontSize: "15px", lineHeight: "1.7", fontWeight: "300" }}>{activeMod.insight}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}