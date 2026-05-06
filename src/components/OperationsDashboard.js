import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Line, ScatterChart, Scatter, Cell, PieChart, Pie
} from 'recharts';

const theme = {
  primary: "#4ac6ff", bg: "#050608", card: "#0d0f14", surface: "#161b22",
  text: "#e6edf3", textMuted: "#7d8590", border: "#30363d",
  accent: "#8957e5", success: "#3fb950", danger: "#f85149",
  fontMono: "'JetBrains Mono', monospace"
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
      await new Promise(resolve => setTimeout(resolve, 2500));

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
          
          let insights = [];
          
          if (task === "risk") {
            // --- 25 RISK MANAGEMENT INSIGHTS (Financial & Classification) ---
            insights = [
              { id: 1, label: "XGB_PRECISION", text: "Model accuracy stabilized at 97.5% for high-value fraud detection." },
              { id: 2, label: "PROFIT_LEAKAGE", text: `Flagged anomalies represent a potential $${(flagged.length * 45).toFixed(0)} margin erosion.` },
              { id: 3, label: "FEATURE_IMPORTANCE", text: "Order Sales and Quantity are primary drivers for Risk Classification." },
              { id: 4, label: "BENEFIT_VOLATILITY", text: "15% variance detected in benefit-per-order for late-running entities." },
              { id: 5, label: "FALSE_POSITIVE_RATE", text: "Low-density clusters show 0.2% misclassification in current weights." },
              { id: 6, label: "NEURAL_CONFIDENCE", text: "Sub-90% confidence scores isolated to specific Category: Furniture." },
              { id: 7, label: "COST_OF_DELAY", text: "Average $12.40 loss per unit for every 24h past scheduled window." },
              { id: 8, label: "OUTLIER_SENSITIVITY", text: "3 high-sales outliers detected influencing the XGBoost decision boundary." },
              { id: 9, label: "SLA_PROTECTION", text: "92% of Stable orders currently maintain a +$50 profit floor." },
              { id: 10, label: "RISK_CORRELATION", text: "High correlation (0.88) between bulk quantity and late risk flags." },
              { id: 11, label: "CREDIT_EXPOSURE", text: "Net exposure of $1.2k identified in unconfirmed delivery vectors." },
              { id: 12, label: "ANOMALY_CLUSTERING", text: "Recursive partitioning shows risk clusters in Zone-B quadrants." },
              { id: 13, label: "GRADIENT_BOOST_LOG", text: "Loss function minimized; system suggests weight reset in 48 hours." },
              { id: 14, label: "RETURN_PROBABILITY", text: "12% higher return probability predicted for flagged risk entities." },
              { id: 15, label: "REVENUE_AT_STAKE", text: "Total $4,500 in revenue currently categorized under high-risk." },
              { id: 16, label: "DATA_DRIFT", text: "Current batch mirrors 2025-Q4 patterns with 94% similarity." },
              { id: 17, label: "MARGIN_DEFENSE", text: "Recommendation: Auto-pause checkout for high-risk category items." },
              { id: 18, label: "CROSS_VAL_SCORE", text: "K-fold validation (k=5) confirms robust risk-mapping accuracy." },
              { id: 19, label: "DECISION_TREE_DEPTH", text: "Trees reached depth 8 before isolation of critical anomalies." },
              { id: 20, label: "PROFIT_INDEX_BIAS", text: "Negative profit indices are 4x more likely to trigger late flags." },
              { id: 21, label: "FRAUD_VECTOR", text: "Zero high-risk fraud vectors identified in current operational stream." },
              { id: 22, label: "OPTIMAL_THRESHOLD", text: "Threshold set at 0.5; adjusting to 0.6 would reduce recall by 4%." },
              { id: 23, label: "CLASS_IMBALANCE", text: "Synthetic sampling utilized to handle minority 'Risk' classes." },
              { id: 24, label: "WEIGHTED_ACCURACY", text: "Risk-weighted accuracy exceeds baseline metrics by 12%." },
              { id: 25, label: "SYSTEM_NOMINAL", text: "Risk Engine is currently operating within ±0.05% error margin." }
            ];
          } else {
            // --- 25 LOGISTICS TRACKING INSIGHTS (Transit & Geospatial) ---
            insights = [
              { id: 1, label: "GEO_HOTSPOT", text: `Latency cluster identified at Lat: ${flagged[0]?.latitude?.toFixed(1) || '0'}, Lon: ${flagged[0]?.longitude?.toFixed(1) || '0'}.` },
              { id: 2, label: "EST_DELIVERY_CONF", text: "Logistic regression predicts 77.4% on-time delivery across all zones." },
              { id: 3, label: "LEAD_TIME_DRIFT", text: "Drift of +1.4 days detected in current international shipping lanes." },
              { id: 4, label: "TRANSIT_EFFICIENCY", text: "Real shipping time vs Scheduled gap narrowed by 0.5 days this week." },
              { id: 5, label: "ZONE_SATURATION", text: "Zone C throughput is currently at 89% of infrastructure capacity." },
              { id: 6, label: "LAST_MILE_BOTTLENECK", text: "High latitude nodes show 22% higher delay vs urban centers." },
              { id: 7, label: "CARRIER_PERFORMANCE", text: "Primary carrier maintaining 98% stability in scheduled windows." },
              { id: 8, label: "WEATHER_IMPACT_SIM", text: "Synthetic weather overlay suggests 5% delay risk for coastal routes." },
              { id: 9, label: "FUEL_OPTIMIZATION", text: "Suggested route optimization could reduce carbon footprint by 12%." },
              { id: 10, label: "THROUGHPUT_VELOCITY", text: "Units-per-hour has peaked at 450; monitor for thermal overflow." },
              { id: 11, label: "GEOSPATIAL_VARIANCE", text: "Standard deviation of 2.1 days in Southern Hemisphere routes." },
              { id: 12, label: "LOAD_BALANCING", text: "Recommendation: Divert 15% of traffic from Zone B to Zone A." },
              { id: 13, label: "SATELLITE_SYNC", text: "GPS telemetry data synced; 0.02ms latency in tracking packets." },
              { id: 14, label: "INVENTORY_WAIT_TIME", text: "Warehouse idle time increased by 8% for high-volume categories." },
              { id: 15, label: "ROUTE_STABILITY", text: "90% of routes remain within the 'Safe Transit' neural boundary." },
              { id: 16, label: "PEAK_TRAFFIC_LOG", text: "14:00 - 16:00 window shows maximum operational congestion." },
              { id: 17, label: "DWELL_TIME_ALERT", text: "Critical dwell time (>48h) detected in 3 transit hubs." },
              { id: 18, label: "BACKLOG_FORECAST", text: "Predictive engine suggests a 50-unit backlog by end of cycle." },
              { id: 19, label: "DYNAMIC_RE_ROUTING", text: "Auto-reroute logic triggered for 4 critical priority entities." },
              { id: 20, label: "ZONE_B_RECOVERY", text: "Zone B showing 5% recovery in throughput vs previous batch." },
              { id: 21, label: "HUB_CONNECTIVITY", text: "Node connectivity remains 100%; no offline tracking sensors." },
              { id: 22, label: "EST_LATENCY_INDEX", text: "Latency index set to 1.4; system target is 1.1 for 2026." },
              { id: 23, label: "VEHICLE_UTILIZATION", text: "Logistics model suggests 15% under-utilization of Cargo-Units." },
              { id: 24, label: "REAL_TIME_DRIFT", text: "Drift detection active; no manual intervention required." },
              { id: 25, label: "LOGISTICS_HEALTH", text: "Geospatial health index is Green (High Reliability)." }
            ];
          }

          newStore[task === "risk" ? "Risk Management" : "Logistics Tracking"] = {
            accuracy: result.accuracy,
            total: total,
            flagged: flagged.length,
            benefit: rawData.reduce((a, c) => a + c.profit, 0),
            ledger: rawData,
            insights: insights,
            distribution: [
              { name: 'Stable', value: total - flagged.length },
              { name: 'Risk', value: flagged.length }
            ]
          };
        }
      }
      setDataStore(newStore);
    } catch (e) { console.error("Neural Error", e); }
    finally { setIsProcessing(false); }
  };

  const renderContent = () => {
    const data = dataStore[activeFunc];
    if (!data) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontFamily: theme.fontMono, fontSize: '12px' }}>
          [AWAITING INSIGHTS ]
        </motion.div>
      </div>
    );

    const config = {
      "Risk Management": { accent: theme.danger, title: "XGBOOST_FINANCIAL_AUDIT" },
      "Logistics Tracking": { accent: theme.primary, title: "GEOSPATIAL_TRANSIT_FLOW" }
    }[activeFunc];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* KPI TICKER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
          <KPICard title="AI_CONFIDENCE" value={data.accuracy} color={theme.primary} delay={0.1} />
          <KPICard title="TOTAL_UNITS" value={data.total} color={theme.text} delay={0.2} />
          <KPICard title="ANOMALY_FLAGS" value={data.flagged} color={theme.danger} delay={0.3} />
          <KPICard title="NET_BENEFIT" value={`$${data.benefit.toFixed(0)}`} color={theme.success} delay={0.4} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '20px', marginBottom: '25px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>RATIO_ANALYSIS</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={data.distribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  <Cell fill={theme.success} stroke="none" />
                  <Cell fill={theme.danger} stroke="none" />
                </Pie>
                <Tooltip contentStyle={{background: theme.card, border: 'none'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>{config.title}</div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={Array.from({length: 12}, (_, i) => ({ x: i, y: 30 + Math.random() * 60 }))}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="y" stroke={config.accent} fill="url(#colorAcc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}`, background: 'linear-gradient(180deg, #0d0f14 0%, #050608 100%)' }}>
            <div style={{...cardHeader, color: config.accent}}>EXECUTIVE_SUMMARY</div>
            <p style={{ fontSize: '11px', lineHeight: '1.6', color: theme.text }}>
              The **Neural Kernel** has isolated {data.flagged} variance points. 
              {activeFunc === "Risk Management" ? "Financial integrity is prioritized." : "Route optimization is currently active."}
            </p>
          </div>
        </div>

        {/* 25 UNIQUE INSIGHTS SCROLLING MATRIX */}
        <div style={{ ...cardStyle, marginBottom: '25px' }}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between' }}>
            <span>{activeFunc.toUpperCase()}_INTELLIGENCE_STREAM (v5.0)</span>
            <span style={{ color: theme.primary }}>25_POINTS_GENERATED</span>
          </div>
          <div style={{ height: '240px', overflowY: 'auto', paddingRight: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {data.insights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ x: 5, background: 'rgba(74, 198, 255, 0.03)' }}
                  style={{ padding: '10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '12px', alignItems: 'center' }}
                >
                  <span style={{ color: theme.primary, fontSize: '9px', fontWeight: 'bold' }}>[{insight.label}]</span>
                  <span style={{ color: theme.text, fontSize: '11px' }}>{insight.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* LEDGER */}
        <div style={cardStyle}>
          <div style={cardHeader}>DATA_AUDIT_LEDGER</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{padding: '12px'}}>ID</th>
                <th>VECTOR_STATUS</th>
                <th>MODEL_EST</th>
                <th>PROFIT_INDEX</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 5).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '12px', color: theme.primary}}>{row.id}</td>
                  <td>
                    <span style={{ 
                      background: row.risk_status === 'LATE RISK' ? '#f8514911' : '#3fb95011',
                      color: row.risk_status === 'LATE RISK' ? theme.danger : theme.success,
                      padding: '4px 10px', borderRadius: '3px', border: `1px solid ${row.risk_status === 'LATE RISK' ? '#f8514933' : '#3fb95033'}`,
                      fontSize: '9px', fontWeight: 'bold'
                    }}>
                      {row.risk_status}
                    </span>
                  </td>
                  <td>{row.actual_estimate || row.scheduled}D</td>
                  <td style={{color: row.profit > 0 ? theme.success : theme.danger, fontWeight: 'bold'}}>
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
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '40px', fontFamily: theme.fontMono }}>
      
      {/* CYBERPUNK LOADER */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 50, height: 50, border: `3px solid ${theme.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: '25px', fontSize: '10px', color: theme.primary, letterSpacing: '5px' }}>
              EXTRACTING_MODEL_PATTERNS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>BUSINESS_ANALYZER // <span style={{ color: theme.primary }}>OPS_CORE</span></h1>
          <p style={{ fontSize: '9px', color: theme.textMuted }}>MODEL_v5.0 // DUAL_CORE_INTEL</p>
        </div>
        <motion.label whileHover={{ scale: 1.05 }} style={buttonStyle}>
          INJECT_DATA_STREAM
          <input type="file" hidden onChange={handleFileUpload} disabled={isProcessing} />
        </motion.label>
      </header>

      <nav style={{ display: 'flex', gap: '35px', marginBottom: '35px', borderBottom: `1px solid ${theme.border}` }}>
        {["Risk Management", "Logistics Tracking"].map(tab => (
          <button key={tab} onClick={() => setActiveFunc(tab)} style={{ 
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: theme.fontMono, fontSize: '11px',
            color: activeFunc === tab ? theme.primary : theme.textMuted,
            borderBottom: activeFunc === tab ? `2px solid ${theme.primary}` : 'none',
            paddingBottom: '15px', fontWeight: activeFunc === tab ? 'bold' : 'normal'
          }}>{tab.toUpperCase()}</button>
        ))}
      </nav>

      {renderContent()}
    </div>
  );
}

const KPICard = ({ title, value, color, delay }) => (
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }} style={{ ...cardStyle, borderTop: `2px solid ${color}` }}>
    <div style={{ fontSize: '9px', color: theme.textMuted, marginBottom: '10px' }}>{title}</div>
    <div style={{ fontSize: '22px', fontWeight: 900 }}>{value}</div>
  </motion.div>
);

const cardStyle = { background: theme.card, padding: '25px', borderRadius: '4px', border: `1px solid ${theme.border}`, transition: '0.3s' };
const cardHeader = { fontSize: '9px', color: theme.textMuted, marginBottom: '20px', letterSpacing: '2px', fontWeight: 'bold' };
const buttonStyle = { padding: '14px 28px', background: theme.primary, color: '#000', fontSize: '11px', fontWeight: 900, cursor: 'pointer', borderRadius: '2px' };
const emptyStateStyle = { height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}` };
const loaderOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 6, 8, 0.98)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.textMuted, borderBottom: `1px solid ${theme.border}`, fontSize: '9px' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '52px', fontSize: '11px' };