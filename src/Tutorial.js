import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.4)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  accentGlow: "rgba(58, 162, 230, 0.35)"
};

const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.bg,
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
    position: "relative",
    color: theme.text,
    flexDirection: "column"
  },
  blob: {
    position: "absolute",
    width: "800px",
    height: "800px",
    background: `radial-gradient(circle, rgba(88,166,255,0.18) 0%, rgba(31,111,235,0.1) 60%, transparent 100%)`,
    filter: "blur(140px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  card: {
    background: theme.card,
    borderRadius: "24px",
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
    border: `1px solid ${theme.border}`,
    boxShadow: "0 0 40px -10px rgba(58, 162, 230, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.08)",
  }
};

const DynamicLogo = () => (
  <motion.div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "32px", letterSpacing: "-2px", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
    <span>Insight</span><span style={{ color: theme.primary, fontStyle: "italic", fontWeight: "700" }}>IQ</span>
  </motion.div>
);

// ─── DATASET DEFINITIONS ────────────────────────────────────────────────────
const datasets = [
  {
    id: "financial",
    label: "Financial KPI Matrix",
    icon: "📊",
    color: "#58a6ff",
    glow: "rgba(88,166,255,0.25)",
    description: "Core profitability and financial health signals. Upload monthly to power trend forecasting and compliance auditing dashboards.",
    usedFor: ["Trend Forecasting", "Compliance Auditing", "Analytics Dashboards"],
    csvHeader: "Month,NetProfit,GrossMargin,EBITDA,QuickRatio,CurrentRatio,CashReserves,MarketShare,CaptureRate,HHIIndex,Productivity,OpExRatio,LaborYield,DebtToEquity,InterestCov,WACC,NetBurn,Runway,VentureRatio,CustomerLTV,ARPU,Retention,WorkingCap,InventoryTurn,AssetLiq,CAC,OrganicLift,MarketingROI,RiskScore,BetaFactor,SharpeRatio,EmployeeProductivity",
    sampleRow: "FY26-M01,45000,0.65,52000,1.2,1.8,120000,14.2,0.08,1800,85,0.42,3.2,0.45,4.2,0.085,25000,18,1.4,1500,120,0.92,85000,6.2,0.75,45,0.22,2.8,42,1.1,1.8,85",
    columns: [
      { name: "Month", type: "string", example: "FY26-M01", desc: "Period label (e.g. FY26-M01 through FY26-M12)" },
      { name: "NetProfit", type: "number", example: "45000", desc: "Net profit after tax in base currency" },
      { name: "GrossMargin", type: "decimal", example: "0.65", desc: "Gross margin ratio (0–1)" },
      { name: "EBITDA", type: "number", example: "52000", desc: "Earnings before interest, taxes, depreciation & amortization" },
      { name: "QuickRatio", type: "decimal", example: "1.2", desc: "Liquid assets divided by current liabilities" },
      { name: "CurrentRatio", type: "decimal", example: "1.8", desc: "Current assets divided by current liabilities" },
      { name: "CashReserves", type: "number", example: "120000", desc: "Total available cash and equivalents" },
      { name: "MarketShare", type: "decimal", example: "14.2", desc: "Percentage of addressable market captured" },
      { name: "CaptureRate", type: "decimal", example: "0.08", desc: "New market capture rate (0–1)" },
      { name: "HHIIndex", type: "number", example: "1800", desc: "Herfindahl–Hirschman Index for market concentration" },
      { name: "Productivity", type: "number", example: "85", desc: "Aggregate team productivity score (0–100)" },
      { name: "OpExRatio", type: "decimal", example: "0.42", desc: "Operating expenses as a fraction of revenue" },
      { name: "LaborYield", type: "decimal", example: "3.2", desc: "Revenue generated per unit of labor cost" },
      { name: "DebtToEquity", type: "decimal", example: "0.45", desc: "Total debt divided by shareholder equity" },
      { name: "InterestCov", type: "decimal", example: "4.2", desc: "EBIT divided by interest expense" },
      { name: "WACC", type: "decimal", example: "0.085", desc: "Weighted average cost of capital (0–1)" },
      { name: "NetBurn", type: "number", example: "25000", desc: "Monthly net cash burn" },
      { name: "Runway", type: "number", example: "18", desc: "Months of runway remaining at current burn" },
      { name: "VentureRatio", type: "decimal", example: "1.4", desc: "Venture investment to revenue ratio" },
      { name: "CustomerLTV", type: "number", example: "1500", desc: "Average lifetime value per customer" },
      { name: "ARPU", type: "number", example: "120", desc: "Average revenue per user per month" },
      { name: "Retention", type: "decimal", example: "0.92", desc: "Monthly customer retention rate (0–1)" },
      { name: "WorkingCap", type: "number", example: "85000", desc: "Current assets minus current liabilities" },
      { name: "InventoryTurn", type: "decimal", example: "6.2", desc: "Inventory turnover cycles per period" },
      { name: "AssetLiq", type: "decimal", example: "0.75", desc: "Asset liquidity ratio (0–1)" },
      { name: "CAC", type: "number", example: "45", desc: "Customer acquisition cost in base currency" },
      { name: "OrganicLift", type: "decimal", example: "0.22", desc: "Organic growth contribution (0–1)" },
      { name: "MarketingROI", type: "decimal", example: "2.8", desc: "Return on marketing investment multiplier" },
      { name: "RiskScore", type: "number", example: "42", desc: "Composite operational risk score (0–100)" },
      { name: "BetaFactor", type: "decimal", example: "1.1", desc: "Market beta coefficient" },
      { name: "SharpeRatio", type: "decimal", example: "1.8", desc: "Risk-adjusted return ratio" },
      { name: "EmployeeProductivity", type: "number", example: "85", desc: "Output score per employee (0–100)" },
    ]
  },
  {
    id: "product",
    label: "Product & Sales Intelligence",
    icon: "🛒",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
    description: "Multi-category sales, ad spend, and churn signals. Powers predictive sales engine and anomalous telemetry detection.",
    usedFor: ["Predictive Sales Engine", "Anomaly Detection", "Analytics Dashboards"],
    csvHeader: "ID,Category,Sales_Volume,Price_Point,Ad_Spend,Promotion_Discount,Tenure_Months,Monthly_Charges,Complaints,Support_Calls,Impressions,Clicks,Conversions,Operating_Cost,Month_Index",
    sampleRow: "101,Electronics,150,299,500,0.10,45,75.5,0,1,50000,1200,150,12000,1",
    columns: [
      { name: "ID", type: "number", example: "101", desc: "Unique product or SKU identifier" },
      { name: "Category", type: "string", example: "Electronics", desc: "Product category name (Electronics, Fashion, Home_Decor, Books)" },
      { name: "Sales_Volume", type: "number", example: "150", desc: "Units sold in the period" },
      { name: "Price_Point", type: "number", example: "299", desc: "Listed unit price in base currency" },
      { name: "Ad_Spend", type: "number", example: "500", desc: "Advertising expenditure for this SKU in the period" },
      { name: "Promotion_Discount", type: "decimal", example: "0.10", desc: "Promotional discount applied (0–1)" },
      { name: "Tenure_Months", type: "number", example: "45", desc: "Months the product has been listed" },
      { name: "Monthly_Charges", type: "decimal", example: "75.5", desc: "Recurring platform or subscription cost" },
      { name: "Complaints", type: "number", example: "0", desc: "Customer complaints received this period" },
      { name: "Support_Calls", type: "number", example: "1", desc: "Support calls logged for this SKU" },
      { name: "Impressions", type: "number", example: "50000", desc: "Total ad or listing impressions" },
      { name: "Clicks", type: "number", example: "1200", desc: "Total clicks on the product listing" },
      { name: "Conversions", type: "number", example: "150", desc: "Units purchased from ad-driven traffic" },
      { name: "Operating_Cost", type: "number", example: "12000", desc: "Total operating cost for this SKU" },
      { name: "Month_Index", type: "number", example: "1", desc: "Sequential month index (1 = first month of data)" },
    ]
  },
  {
    id: "logistics",
    label: "Supply Chain & Order Routing",
    icon: "🚚",
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    description: "Order-level fulfilment timing and category profit data. Feeds geographic demand mapping and SLA compliance anchors.",
    usedFor: ["Compliance Auditing", "Analytics Dashboards", "Anomaly Detection"],
    csvHeader: "Order_Id,Days_For_Shipment_Scheduled,Days_For_Shipping_Real,Sales,Benefit_Per_Order,Latitude,Longitude,Order_Item_Quantity,Category_Name",
    sampleRow: "NEURAL-001,3,7,1250.00,-210.50,18.45,-66.10,12,Technology",
    columns: [
      { name: "Order_Id", type: "string", example: "NEURAL-001", desc: "Unique order identifier (prefix + 3-digit number)" },
      { name: "Days_For_Shipment_Scheduled", type: "number", example: "3", desc: "Promised delivery window in days" },
      { name: "Days_For_Shipping_Real", type: "number", example: "7", desc: "Actual delivery time in days (delta reveals SLA drift)" },
      { name: "Sales", type: "decimal", example: "1250.00", desc: "Order revenue in base currency" },
      { name: "Benefit_Per_Order", type: "decimal", example: "-210.50", desc: "Net margin per order (negative = loss)" },
      { name: "Latitude", type: "decimal", example: "18.45", desc: "Delivery destination latitude" },
      { name: "Longitude", type: "decimal", example: "-66.10", desc: "Delivery destination longitude" },
      { name: "Order_Item_Quantity", type: "number", example: "12", desc: "Total line items in the order" },
      { name: "Category_Name", type: "string", example: "Technology", desc: "Product category (Technology, Furniture, Office Supplies)" },
    ]
  },
  {
    id: "workforce",
    label: "Workforce Performance",
    icon: "👥",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.25)",
    description: "Employee compensation, overtime, training, and performance. Powers labor yield and productivity analytics.",
    usedFor: ["Analytics Dashboards", "Predictive Operations", "Compliance Auditing"],
    csvHeader: "Employee_ID,Monthly_Salary,Overtime_Hours,Training_Hours,Last_Performance_Score",
    sampleRow: "EMP-101,7500,12,20,88",
    columns: [
      { name: "Employee_ID", type: "string", example: "EMP-101", desc: "Unique employee identifier (EMP- prefix + 3 digits)" },
      { name: "Monthly_Salary", type: "number", example: "7500", desc: "Base monthly compensation in base currency" },
      { name: "Overtime_Hours", type: "number", example: "12", desc: "Overtime hours logged in the period" },
      { name: "Training_Hours", type: "number", example: "20", desc: "Training hours completed in the period" },
      { name: "Last_Performance_Score", type: "number", example: "88", desc: "Latest performance review score (0–100)" },
    ]
  },
  {
    id: "customer",
    label: "Customer Intelligence",
    icon: "🎯",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.25)",
    description: "Customer-level spend, engagement, web sessions, and conversion rates. Drives LTV modelling and retention forecasting.",
    usedFor: ["Trend Forecasting", "Predictive Sales Engine", "Analytics Dashboards"],
    csvHeader: "Customer_ID,Total_Spent,Engagement_Score,Web_Sessions,Conversion_Rate",
    sampleRow: "CUST-501,4500,85,42,0.12",
    columns: [
      { name: "Customer_ID", type: "string", example: "CUST-501", desc: "Unique customer identifier (CUST- prefix + 3 digits)" },
      { name: "Total_Spent", type: "number", example: "4500", desc: "Cumulative spend by this customer in base currency" },
      { name: "Engagement_Score", type: "number", example: "85", desc: "Platform engagement score (0–100)" },
      { name: "Web_Sessions", type: "number", example: "42", desc: "Website sessions logged for this customer" },
      { name: "Conversion_Rate", type: "decimal", example: "0.12", desc: "Purchase conversion rate (0–1)" },
    ]
  }
];

const steps = [
  { step: "01", title: "Pick your dataset type", body: "InsightIQ accepts five distinct CSV schemas — Financial KPI, Product & Sales, Supply Chain, Workforce, and Customer Intelligence. Each feeds different dashboard modules. Start with whichever unlocks your most pressing metric gap." },
  { step: "02", title: "Format your headers exactly", body: "Column names are case-sensitive and must match the schema exactly. Extra columns are ignored; missing required columns will trigger a validation error on upload with a specific field callout." },
  { step: "03", title: "Upload via the File Upload portal", body: "Navigate to your plan's dashboard → Data Ingestion → Upload CSV. Files up to 50 MB are processed synchronously. Larger payloads queue as async jobs — you'll receive a completion notification." },
  { step: "04", title: "Review the data preview", body: "InsightIQ renders a 10-row preview with type inference highlighted. Confirm decimal columns are not stored as strings and date/period columns parse correctly before confirming the ingest." },
  { step: "05", title: "Let the engine run", body: "Forecasting models recalculate within 60 seconds of a successful upload. Anomaly detection runs on the next 5-minute telemetry cycle. Dashboard tiles update automatically — no manual refresh needed." },
];

const typeColors = { string: "#34d399", number: "#58a6ff", decimal: "#a78bfa" };

export default function Tutorial({ onBack }) {
  const [activeDataset, setActiveDataset] = useState(datasets[0]);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [expandedCol, setExpandedCol] = useState(null);

  const handleCopyHeader = () => {
    const text = activeDataset.csvHeader + "\n" + activeDataset.sampleRow;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2500);
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes tut-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes tut-pulse { 0%,100%{opacity:1} 50%{opacity:0} }
        .tut-step-num { font-family:'Montserrat',sans-serif; font-size:48px; font-weight:900; line-height:1; letter-spacing:-3px; }
        .tut-col-row:hover { background: rgba(255,255,255,0.03) !important; }
        .tut-tab:hover { border-color: rgba(255,255,255,0.2) !important; color: #fff !important; }
        .tut-copy-btn:hover { background: rgba(88,166,255,0.2) !important; border-color: rgba(88,166,255,0.5) !important; }
        .tut-back:hover { color: #fff !important; }
        .tut-nav-link:hover { color: #fff !important; }
      `}</style>

      {/* Background blobs */}
      <div style={{ ...styles.blob, top: "-10%", right: "-5%", animation: "tut-float 20s ease-in-out infinite" }} />
      <div style={{ ...styles.blob, bottom: "-15%", left: "-8%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)", filter: "blur(120px)" }} />

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 64px", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
        <DynamicLogo />
        <button
          className="tut-back"
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${theme.border}`, padding: "10px 20px", borderRadius: "12px", color: theme.subtext, fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "color 0.2s ease" }}
        >
          ← Back to Plans
        </button>
      </header>

      <main style={{ flex: 1, maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "40px 24px 100px", boxSizing: "border-box", position: "relative", zIndex: 2 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: "center", marginBottom: "80px" }}>
         
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "60px", fontWeight: "900", letterSpacing: "-3px", lineHeight: 1.05, margin: "0 auto 20px", maxWidth: "780px" }}>
            Prepare your data for{" "}
            <span style={{ color: "transparent", background: `linear-gradient(90deg, ${theme.primary}, #a78bfa)`, WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              InsightIQ
            </span>
          </h1>
          <p style={{ color: theme.subtext, fontSize: "18px", maxWidth: "580px", margin: "0 auto", lineHeight: "1.65", fontWeight: 400 }}>
            Five CSV schemas power every dashboard, forecast, and anomaly alert. Here's exactly what each one needs — and why each column matters.
          </p>
        </motion.div>

        {/* HOW IT WORKS — 5 steps */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }} style={{ marginBottom: "80px" }}>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "28px", fontWeight: "800", letterSpacing: "-1px", marginBottom: "32px" }}>
            How it works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.45 }}
                style={{ ...styles.card, padding: "32px 28px", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: `linear-gradient(90deg, transparent, ${theme.primary}40, transparent)` }} />
                <div className="tut-step-num" style={{ color: "rgba(88,166,255,0.12)", marginBottom: "12px" }}>{s.step}</div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 10px 0", letterSpacing: "-0.3px" }}>{s.title}</h3>
                <p style={{ fontSize: "13px", color: theme.subtext, lineHeight: "1.65", margin: 0 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* DATASET SCHEMA EXPLORER */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "28px", fontWeight: "800", letterSpacing: "-1px", margin: 0 }}>
              CSV Schema Reference
            </h2>
            <span style={{ fontSize: "12px", color: theme.subtext }}>Select a dataset type to explore its columns</span>
          </div>

          {/* Dataset Tabs */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
            {datasets.map((ds) => (
              <button
                key={ds.id}
                className="tut-tab"
                onClick={() => { setActiveDataset(ds); setExpandedCol(null); }}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: `1px solid ${activeDataset.id === ds.id ? ds.color : theme.border}`,
                  background: activeDataset.id === ds.id ? `rgba(${ds.color === "#58a6ff" ? "88,166,255" : ds.color === "#a78bfa" ? "167,139,250" : ds.color === "#34d399" ? "52,211,153" : ds.color === "#fb923c" ? "251,146,60" : "244,114,182"},0.12)` : "rgba(255,255,255,0.02)",
                  color: activeDataset.id === ds.id ? "#fff" : theme.subtext,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{ds.icon}</span>
                {ds.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDataset.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Dataset header card */}
              <div style={{ ...styles.card, padding: "32px 36px", marginBottom: "20px", borderColor: `${activeDataset.color}28`, boxShadow: `0 0 40px -10px ${activeDataset.glow}, 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.06)` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "28px" }}>{activeDataset.icon}</span>
                      <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>{activeDataset.label}</h3>
                    </div>
                    <p style={{ color: theme.subtext, fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px 0", maxWidth: "560px" }}>{activeDataset.description}</p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {activeDataset.usedFor.map((tag) => (
                        <span key={tag} style={{ padding: "3px 10px", background: `${activeDataset.color}14`, border: `1px solid ${activeDataset.color}30`, borderRadius: "10px", fontSize: "11px", fontWeight: "700", color: activeDataset.color, letterSpacing: "0.3px" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="tut-copy-btn"
                    onClick={handleCopyHeader}
                    style={{ padding: "10px 18px", borderRadius: "10px", background: "rgba(88,166,255,0.06)", border: `1px solid ${theme.border}`, color: copiedHeader ? "#34d399" : theme.primary, fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "7px" }}
                  >
                    {copiedHeader ? "✓ Copied!" : "📋 Copy CSV template"}
                  </button>
                </div>

                {/* CSV preview strip */}
                <div style={{ marginTop: "24px", background: "rgba(0,0,0,0.4)", borderRadius: "12px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${theme.border}`, fontSize: "10px", fontWeight: "700", color: theme.subtext, letterSpacing: "0.5px" }}>
                    CSV PREVIEW — HEADER + SAMPLE ROW
                  </div>
                  <div style={{ padding: "16px", overflowX: "auto" }}>
                    <pre style={{ margin: 0, fontSize: "11px", color: activeDataset.color, fontFamily: "monospace", lineHeight: "1.8", whiteSpace: "pre" }}>
                      {activeDataset.csvHeader}
                    </pre>
                    <pre style={{ margin: "4px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: "monospace", lineHeight: "1.8", whiteSpace: "pre" }}>
                      {activeDataset.sampleRow}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Column reference table */}
              <div style={{ ...styles.card, overflow: "hidden" }}>
                <div style={{ padding: "20px 28px", borderBottom: `1px solid ${theme.border}` }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", letterSpacing: "-0.2px" }}>
                    Column Definitions — {activeDataset.columns.length} fields
                  </h4>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                        {["Column Name", "Type", "Example", "Description"].map((h) => (
                          <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: theme.subtext, letterSpacing: "0.4px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeDataset.columns.map((col, i) => (
                        <tr
                          key={col.name}
                          className="tut-col-row"
                          onClick={() => setExpandedCol(expandedCol === col.name ? null : col.name)}
                          style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: "pointer", transition: "background 0.15s ease", background: expandedCol === col.name ? "rgba(88,166,255,0.04)" : "transparent" }}
                        >
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "600", color: activeDataset.color }}>{col.name}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", background: `${typeColors[col.type]}14`, color: typeColors[col.type], letterSpacing: "0.3px" }}>
                              {col.type}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <code style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>{col.example}</code>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", color: theme.subtext, lineHeight: "1.5" }}>{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "14px 24px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "20px", alignItems: "center" }}>
                  {Object.entries(typeColors).map(([type, color]) => (
                    <span key={type} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: theme.subtext }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: color, display: "inline-block" }} />
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* Tips section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }} style={{ marginTop: "60px" }}>
          <div style={{ ...styles.card, padding: "40px 36px", borderColor: "rgba(52,211,153,0.2)", boxShadow: "0 0 40px -10px rgba(52,211,153,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <span style={{ fontSize: "22px" }}>⚡</span>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "20px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>Tips for best results</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {[
                { icon: "📅", title: "Consistent date formatting", body: "Use FY26-M01 through FY26-M12 for financial periods. Inconsistent formats block trend interpolation." },
                { icon: "🔢", title: "No currency symbols in number fields", body: "Store raw numeric values only — no $, ₹, or commas. The currency toggle handles display formatting." },
                { icon: "📈", title: "Minimum 3 months for forecasting", body: "Trend forecasting requires at least 3 sequential monthly rows. More data improves prediction confidence intervals." },
                { icon: "🔗", title: "Upload all 5 schemas for full coverage", body: "Each schema feeds different modules. Financial + Customer together unlock the LTV vs ARPU correlation view." },
                { icon: "✅", title: "Decimal ratios must be 0–1", body: "Fields like Retention, GrossMargin, and Conversion_Rate expect decimals (0.92), not percentages (92)." },
                { icon: "🆔", title: "Keep IDs unique across rows", body: "Duplicate IDs in the same upload overwrite previous rows. Use sequential or prefixed identifiers." },
              ].map((tip) => (
                <div key={tip.title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "5px" }}>{tip.title}</div>
                    <div style={{ fontSize: "12px", color: theme.subtext, lineHeight: "1.6" }}>{tip.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </main>

      {/* Footer strip */}
      <div style={{ borderTop: `1px solid ${theme.border}`, padding: "28px 64px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "rgba(255,255,255,0.25)", zIndex: 10, position: "relative", boxSizing: "border-box" }}>
        <span>&copy; {new Date().getFullYear()} InsightIQ Inc. All rights reserved.</span>
        <span>System Status: <span style={{ color: "#34d399" }}>● Operational</span></span>
      </div>
    </div>
  );
}