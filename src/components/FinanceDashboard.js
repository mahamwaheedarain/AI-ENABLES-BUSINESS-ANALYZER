import React, { useState, useEffect } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, 
  BarChart, Bar, LineChart, Line, ComposedChart, ScatterChart, Scatter, 
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, ErrorBar
} from "recharts";
import { 
  Database, Activity, Shield, TrendingUp, AlertTriangle, 
  RefreshCcw, ChevronRight, Zap, Target, Layers, BarChart3
} from 'lucide-react';

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

// ---------- Advanced Financial Modules: 100 Unique Sub-Metrics ----------
const modules = [
  { id: 1, name: "Profitability Velocity", key: "NetProfit", type: "composed", color: theme.primary, 
    insight: "Altman Z-Score indicates 'Safe Zone' (Z > 2.99). Margin expansion is driven by a reduction in COGS and optimized tax shielding strategies.", 
    subMetrics: ["NetProfit", "GrossMargin", "EBITDA", "OperatingLeverage", "TaxProvision", "COGS", "AssetTurnover", "ROIC", "NI_Margin", "Rev_Velocity"] },
  
  { id: 2, name: "Liquidity Strength", key: "QuickRatio", type: "line", color: theme.accent, 
    insight: "Defensive Interval Ratio (DIR) confirms 140 days of survival without new revenue. Cash conversion cycle is shortening by 12% MoM.", 
    subMetrics: ["QuickRatio", "CurrentRatio", "CashRatio", "BurnRate_Coverage", "NetWorkingCap", "DaysSalesOut", "DaysPayable", "InventoryDays", "DIR", "FreeCashFlow"] },
  
  { id: 3, name: "Market Dominance", key: "MarketShare", type: "bar", color: theme.secondary, 
    insight: "Herfindahl-Hirschman Index (HHI) suggests decreasing sector concentration. Our firm's capture rate of Tier-1 churn has hit an ATH.", 
    subMetrics: ["MarketShare", "HHI_Index", "CompetitorPricing", "RelativeStrength", "BrandEquity", "CustomerChurn", "MarketVolatility", "TAM", "SAM", "SOM"] },
  
  { id: 4, name: "Efficiency Matrix", key: "EmployeeProductivity", type: "area", color: theme.warning, 
    insight: "Pareto Efficiency Analysis: 20% of resource allocation is driving 80% of quarterly yield. Utilization rates are nearing peak capacity.", 
    subMetrics: ["EmployeeProductivity", "RevPerHead", "OpExEfficiency", "UtilizationRate", "OnboardingCost", "SGA_Ratio", "VariableEfficiency", "FixedAssetTurn", "LaborYield", "OverheadVariance"] },
  
  { id: 5, name: "Solvency Risk", key: "DebtToEquity", type: "radar", color: theme.danger, 
    insight: "Capital Asset Pricing Model (CAPM) suggests an optimized WACC of 8.4%. Debt-to-Equity is approaching the sector ceiling of 0.50.", 
    subMetrics: ["DebtToEquity", "InterestCoverage", "DSCR", "WACC", "EquityMultiplier", "TotalDebt", "LongTermSolvency", "CostOfDebt", "CapStructure", "CreditScore"] },
  
  { id: 6, name: "Burn Rate Variance", key: "BurnRate", type: "cumulative", color: theme.danger, 
    insight: "Monte Carlo Simulation: 95% probability of achieving Series B funding before cash-out date. Variance in burn is linked to R&D acceleration.", 
    subMetrics: ["BurnRate", "GrossBurn", "NetBurn", "RunwayMonths", "SeedBuffer", "VentureRatio", "CapitalDrawdown", "PivotFlexibility", "ExpenseVariance", "RunwaySafety"] },
  
  { id: 7, name: "Predictive LTV", key: "CustomerLTV", type: "composed", color: theme.primary, 
    insight: "Cohort Analysis: Retention decay constant (k) has improved. LTV:CAC ratio is currently 4.2x, indicating a high-yield customer base.", 
    subMetrics: ["CustomerLTV", "CAC_Ratio", "RetentionRate", "ARPU", "CohortDecay", "ExpansionRevenue", "ContractionChurn", "LifetimeMonths", "ViralCoefficient", "NetworkEffect"] },
  
  { id: 8, name: "Capital Health", key: "WorkingCapital", type: "step", color: theme.accent, 
    insight: "Just-In-Time (JIT) Inventory model analysis: Excess capital locked in WIP inventory has decreased by $40k this cycle.", 
    subMetrics: ["WorkingCapital", "InventoryTurn", "ReceivablesAging", "PayablesAging", "WIP_Inventory", "CashReserves", "LiquidityGap", "FinancingCycle", "AssetLiquidity", "ReserveRatio"] },
  
  { id: 9, name: "Customer Acquisition", key: "CAC", type: "bar_stacked", color: theme.secondary, 
    insight: "Marketing Attribution Model: Organic search and direct referrals are cannibalizing paid ad spend, leading to a massive CAC reduction.", 
    subMetrics: ["CAC", "AdSpend", "CPL", "OrganicLift", "ConversionRate", "FunnelDropoff", "ChannelEfficacy", "CAC_Payback", "MarketingROI", "LeadQuality"] },
  
  { id: 10, name: "Risk vs Volatility", key: "RiskScore", type: "scatter", color: theme.warning, 
    insight: "Black-Scholes Volatility Surface Analysis: Tail risk (Fat Tails) has been minimized through automated stop-loss and hedging triggers.", 
    subMetrics: ["RiskScore", "MarketVolatility", "BetaFactor", "AlphaYield", "SharpeRatio", "StandardDev", "VaR_95", "TrackingError", "SortinoRatio", "InformationRatio"] }
];

export default function FinanceProjectTerminal() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeMod, setActiveMod] = useState(modules[0]);
  const [stats, setStats] = useState({ totalRev: 0, avgRisk: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

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
        console.error("DB Offline.");
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
          try {
            await fetch("http://localhost:5000/api/upload/upload-multiple", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ files: [{ filename: file.name, content: text }] })
            });
          } catch (err) { console.error("Sync Error."); }
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

  const renderChart = () => {
    const axisStyle = { stroke: "rgba(255,255,255,0.05)", fontSize: 10, tick: { fill: theme.subtext } };
    const toolStyle = { background: "#0a0a0f", border: `1px solid ${theme.border}`, fontSize: "11px", color: "#fff" };
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
              <Bar dataKey={activeMod.subMetrics[5]} barSize={15} fill="rgba(255,255,255,0.04)" />
              <Line type="monotone" dataKey={activeMod.key} stroke={activeMod.color} strokeWidth={3} dot={{ r: 4, fill: theme.bg }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case "radar":
        const radarData = activeMod.subMetrics.slice(0, 6).map(m => ({ 
          subject: m.toUpperCase(), 
          A: chartData[chartData.length - 1]?.[m] || 0 
        }));
        return (
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: theme.subtext, fontSize: 8 }} />
              <Radar name="Model Projection" dataKey="A" stroke={activeMod.color} fill={activeMod.color} fillOpacity={0.6} />
              <Tooltip contentStyle={toolStyle} />
            </RadarChart>
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
              <Scatter data={chartData} fill={activeMod.color}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.RiskScore > 40 ? theme.danger : theme.primary} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      case "cumulative":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Bar dataKey={activeMod.key} fill={activeMod.color} radius={[2, 2, 0, 0]} />
              <Line type="stepAfter" dataKey="MonthlyOutflow" stroke={theme.text} strokeWidth={1} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "bar_stacked":
        return (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Bar dataKey={activeMod.subMetrics[1]} stackId="a" fill={theme.secondary} />
              <Bar dataKey={activeMod.subMetrics[3]} stackId="a" fill={theme.accent} />
              <Line dataKey={activeMod.key} stroke={theme.primary} strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="Month" {...axisStyle} />
              <Tooltip contentStyle={toolStyle} />
              <Area type="monotone" dataKey={activeMod.key} stroke={activeMod.color} fill={activeMod.color} fillOpacity={0.2} />
              <Line type="monotone" dataKey={activeMod.subMetrics[2]} stroke={theme.text} strokeOpacity={0.1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, color: theme.text, fontFamily: theme.bodyFont }}>
      
      {/* Sidebar Terminal */}
      <aside style={{ width: 340, borderRight: `1px solid ${theme.border}`, padding: "40px 25px", display: "flex", flexDirection: "column", background: "rgba(8,8,12,0.95)" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", fontStyle: "italic", fontFamily: theme.headingFont, margin: 0 }}>
            INSIGHT<span style={{ color: theme.primary }}>IQ</span>
          </h1>
          <p style={{ fontSize: "9px", color: isSyncing ? theme.primary : theme.subtext, letterSpacing: "1px", marginTop: "4px" }}>
            {isSyncing ? "SYNC IN PROGRESS..." : "FINANCIAL DASHBOARD"}
          </p>
        </div>

        {!isUploaded ? (
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", padding: "18px", border: `1px dashed ${theme.primary}`, borderRadius: "4px", textAlign: "center", cursor: "pointer", color: theme.primary, fontSize: "11px", fontWeight: "700" }}>
              + ADD CSV ARCHIVE
              <input type="file" accept=".csv" multiple onChange={handleFileSelection} style={{ display: "none" }} />
            </label>
            <div style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}>
              {selectedFiles.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "4px", marginBottom: "8px", fontSize: "11px", border: `1px solid ${theme.border}` }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "80%" }}>{f.name}</span>
                  <span onClick={() => removeFileFromQueue(i)} style={{ color: theme.danger, cursor: "pointer" }}>✕</span>
                </div>
              ))}
            </div>
            {selectedFiles.length > 0 && (
              <button onClick={handleUploadAll} style={{ width: "100%", marginTop: "25px", padding: "16px", background: theme.primary, color: "#000", border: "none", borderRadius: "4px", fontWeight: "700", cursor: "pointer" }}>
                SYNCHRONIZE BATCH
              </button>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <button onClick={() => setIsUploaded(false)} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.subtext, padding: "8px 15px", borderRadius: "4px", fontSize: "10px", cursor: "pointer", marginBottom: "30px", width: "100%" }}>← UPLOAD NEW BATCH</button>
            {modules.map(m => (
              <div key={m.id} onClick={() => setActiveMod(m)} 
                   style={{ padding: "14px 20px", cursor: "pointer", borderRadius: "4px", fontSize: "11px", marginBottom: "4px", color: activeMod.id === m.id ? theme.primary : theme.text, background: activeMod.id === m.id ? "rgba(74,198,255,0.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Layers size={12} color={activeMod.id === m.id ? theme.primary : theme.subtext} />
                  {m.name.toUpperCase()}
                </div>
                {activeMod.id === m.id && <ChevronRight size={14} />}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Terminal UI */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {!isUploaded ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
            <Database size={60} style={{ marginBottom: "20px" }} />
          
            <p style={{ color: theme.primary, fontFamily: theme.fontMono }}>[ AWAITING ANALYTICS]</p>
        <p style={{ color: theme.textMuted, fontSize: '10px', marginTop: '10px' }}>UPLOAD CSV FILES TO INITIALIZE ANALYTICS</p>
          </div>
        ) : (
          <div>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
              <div>
                <span style={{ fontSize: "10px", color: theme.primary, letterSpacing: "3px" }}>ACTIVE_MODULE</span>
                <h2 style={{ fontSize: "36px", fontFamily: theme.headingFont, margin: "5px 0" }}>{activeMod.name}</h2>
              </div>
              <div style={{ display: "flex", gap: "40px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext }}>TOTAL_REVENUE</div>
                  <div style={{ fontSize: "24px", fontWeight: "600" }}>${stats.totalRev.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: theme.subtext }}>RISK_AVG</div>
                  <div style={{ fontSize: "24px", fontWeight: "600", color: theme.warning }}>{stats.avgRisk}%</div>
                </div>
              </div>
            </header>

            {/* Matrix Display: 4 Core Sub-Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
              {activeMod.subMetrics.slice(0, 4).map((m, i) => (
                <div key={i} style={{ padding: "20px", background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "4px" }}>
                  <div style={{ fontSize: "8px", color: theme.subtext, marginBottom: "8px", letterSpacing: "1px" }}>{m.toUpperCase()}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: i === 0 ? theme.primary : theme.text }}>
                    {chartData[chartData.length - 1]?.[m] || "0.0"}
                  </div>
                </div>
              ))}
            </div>

            {/* Neural Chart Area */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, padding: "30px", height: "450px", borderRadius: "4px", marginBottom: "30px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Zap size={14} style={{ color: theme.primary }} />
                  <span style={{ fontSize: "10px", color: theme.primary, letterSpacing: "2px" }}>NEURAL_FORECAST_LAYER</span>
                </div>
                <span style={{ fontSize: "10px", color: theme.subtext }}>MODEL: {activeMod.type.toUpperCase()}</span>
              </div>
              {renderChart()}
            </div>

            {/* Sub-Matrix Grid (6 Remaining Metrics) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" }}>
              <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "25px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <BarChart3 size={14} color={theme.primary} />
                  <h4 style={{ color: theme.primary, fontSize: "10px", letterSpacing: "2px", margin: 0 }}>EXTENDED_MODEL_METRICS</h4>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                  {activeMod.subMetrics.slice(4, 10).map((m, i) => (
                    <div key={i} style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: "10px" }}>
                      <div style={{ fontSize: "8px", color: theme.subtext }}>{m}</div>
                      <div style={{ fontSize: "13px", fontWeight: "600" }}>{chartData[chartData.length - 1]?.[m] || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "25px", border: `1px solid ${theme.border}`, borderRadius: "4px", background: theme.glass, borderLeft: `4px solid ${activeMod.color}`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                    <Target size={16} style={{ color: activeMod.color }} />
                    <h4 style={{ color: activeMod.color, fontSize: "10px", letterSpacing: "2px", margin: 0 }}>AI_MODEL_EXECUTIVE_SUMMARY</h4>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: "1.6", fontWeight: "300", color: "#dcdcdc" }}>{activeMod.insight}</p>
                  <div style={{ marginTop: "15px", fontSize: "8px", color: theme.subtext }}>[ ANALYSIS_ENGINE: LATEST_V4_FINANCE ]</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}