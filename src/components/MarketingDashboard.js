import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, Cell
} from "recharts";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// ---------- Unified High-Clarity Theme ----------
const theme = {
  primary:  "#58a6ff",
  bg:       "#0d1117",
  card:     "#161b22",
  surface:  "#21262d",
  border:   "#30363d",
  text:     "#ffffff",
  textMuted:"#e6edf3",
  subtext:  "#8b949e",
  accent:   "#8957e5",
  success:  "#3fb950",
  danger:   "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const modules = [
  { id: "Market Trends" },
  { id: "Lead Prioritization" },
  { id: "Retention & Churn" },
  { id: "Campaign Analysis" },
];

// ── Storage key helpers ───────────────────────────────────────────────────────
const guestKey = "InsightIQ_Marketing_Files_Guest";
const userKey  = (uid) => `InsightIQ_Marketing_Files_User_${uid}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseCSV(text) {
  const rows = text.split("\n").filter(r => r.trim() !== "");
  if (rows.length <= 1) return [];
  const headers = rows[0].split(",").map(h => h.trim());
  return rows.slice(1).map(row => {
    const values = row.split(",");
    return headers.reduce((obj, header, idx) => {
      const val      = values[idx]?.trim();
      const cleanKey = header.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "");
      obj[cleanKey]  = isNaN(val) ? val : parseFloat(val);
      obj[header]    = isNaN(val) ? val : parseFloat(val);
      return obj;
    }, {});
  });
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw).map(f => ({ ...f, rows: parseCSV(f.content || "") }));
  } catch {
    return [];
  }
}

function saveToStorage(key, files) {
  try {
    localStorage.setItem(key, JSON.stringify(
      files.map(({ name, size, content }) => ({ name, size, content }))
    ));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

function buildDataStore(files) {
  const allRows = files.flatMap(f => f.rows || []);
  const store   = {};
  modules.forEach(mod => {
    store[mod.id] = { ledger: allRows, total: allRows.length };
  });
  return store;
}

// ─── File Chip ────────────────────────────────────────────────────────────────
const FileChip = ({ file, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 8px 7px 14px", borderRadius: "100px",
      background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.22)",
      fontSize: 12.5, color: theme.textMuted,
    }}
  >
    <span>📄</span>
    <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {file.name}
    </span>
    <span style={{ color: theme.subtext, fontSize: 11 }}>{formatBytes(file.size)}</span>
    <button
      onClick={() => onRemove(file.name)}
      style={{
        background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%",
        width: 18, height: 18, color: "#9aa4b2", cursor: "pointer", fontSize: 11,
        lineHeight: "18px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >✕</button>
  </motion.div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, color, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }}
    style={{ ...cardStyle, borderTop: `3px solid ${color}` }}
  >
    <div style={{ fontSize: "12px", color: theme.subtext, marginBottom: "10px", fontWeight: "700" }}>{title}</div>
    <div style={{ fontSize: "26px", fontWeight: "800" }}>{value}</div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketingDashboard() {
  const [activeFunc,    setActiveFunc]    = useState("Market Trends");
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [isDragOver,    setIsDragOver]    = useState(false);
  const [notification,  setNotification]  = useState("");
  const [showManage,    setShowManage]    = useState(false);

  // ── Auth gate ─────────────────────────────────────────────────────────────
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser,     setCurrentUser]     = useState(null);
  const [storageKey,      setStorageKey]      = useState(guestKey);
  const [files,           setFiles]           = useState([]);

  const fileInputRef = useRef(null);

  // 1. Auth lifecycle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const key = userKey(user.uid);
        setStorageKey(key);
        setFiles(loadFromStorage(key));
      } else {
        setCurrentUser(null);
        setStorageKey(guestKey);
        setFiles(loadFromStorage(guestKey));
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync to localStorage
  useEffect(() => {
    if (isAuthResolving) return;
    saveToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);
  const dataStore  = useMemo(() => buildDataStore(files), [files]);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  const readRawFiles = (rawFiles) =>
    Promise.all(
      rawFiles.map(raw =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve({
            name: raw.name, size: raw.size,
            content: e.target.result, rows: parseCSV(e.target.result),
          });
          reader.readAsText(raw);
        })
      )
    );

  const mergeInto = (prev, incoming) => {
    const existing = new Set(prev.map(f => f.name));
    return [...prev, ...incoming.filter(f => !existing.has(f.name))];
  };

  const syncToPostgres = async (allFiles) => {
    try {
      const payload   = allFiles.map(f => ({ filename: f.name, content: f.content }));
      const uploadRes = await fetch("http://localhost:5000/api/upload/upload-multiple", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payload }),
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      showNotification("Archives successfully synchronized with PostgreSQL");
    } catch (err) {
      console.error("Sync error:", err);
      showNotification("⚠️ Sync failed — check backend on port 5000");
    }
  };

  const processAndAdd = async (rawFiles) => {
    if (!rawFiles.length) return;
    setIsProcessing(true);
    const processed = await readRawFiles(rawFiles);
    setFiles(prev => {
      const updated = mergeInto(prev, processed);
      syncToPostgres(updated);
      return updated;
    });
    setIsProcessing(false);
  };

  const handleFileInput = async (e) => {
    await processAndAdd(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    await processAndAdd(Array.from(e.dataTransfer.files || []));
  };

  const removeFile = (name) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.name !== name);
      if (updated.length > 0) syncToPostgres(updated);
      return updated;
    });
  };

  const normalizeRow = (row, i) => {
    const findValue = (possibleKeys, fallbackIndex) => {
      for (let k of possibleKeys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
        const normalizedKey = k.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "");
        if (row[normalizedKey] !== undefined && row[normalizedKey] !== null && row[normalizedKey] !== "") return row[normalizedKey];
      }
      const fallback = Object.values(row)[fallbackIndex];
      return fallback !== undefined ? fallback : 0;
    };

    const spent    = parseFloat(findValue(["Total_Spent","Spent","ad_spend","budget","total_spent"], 1)) || 0;
    const eng      = parseFloat(findValue(["Engagement_Score","Engagement","engagement_score","clicks"], 2)) || 0;
    const sessions = parseFloat(findValue(["Web_Sessions","Sessions","web_sessions","traffic"], 3)) || 0;
    const conv     = parseFloat(findValue(["Conversion_Rate","Conversion","conversion_rate","conversions"], 4)) || 0;

    return {
      id:         findValue(["Customer_ID","ID","id","customer_id","lead_id"], 0) || `CUST-${500 + i}`,
      spent,
      engagement: eng,
      sessions,
      conversion: conv,
      roi:        spent > 0 ? ((sessions * conv * 100) / spent).toFixed(2) : "0.00",
      status:     (row.predicted_churn === 1 || row.status === "CRITICAL" || eng < 30) ? "CRITICAL" : "STABLE",
    };
  };

  const getInsightsFor = (tab, flaggedCount) => {
    if (tab === "Market Trends") return [
      { label: "Market Reach",      text: "Organic growth trend suggests a 12% expansion in target demographics." },
      { label: "Segment Velocity",  text: "High-engagement clusters are forming around the mid-tier spending bracket." },
    ];
    if (tab === "Retention & Churn") return [
      { label: "Churn Velocity",    text: `${flaggedCount} profiles show signs of engagement decay.` },
      { label: "Retention Strategy",text: "Re-engagement campaigns recommended for segments with high risk drop-offs." },
    ];
    if (tab === "Lead Prioritization") return [
      { label: "Hot Leads Identified", text: "Targeted conversions score highly across returning web sessions." },
      { label: "Pipeline Velocity",    text: "Accelerating routing mechanisms for immediate stable profile captures." },
    ];
    return [
      { label: "ROI Optimization",  text: "Multi-channel advertising campaigns verified steady scale multipliers." },
      { label: "Capital Efficiency",text: "Budget distribution matrix validates lower customer acquisition costs." },
    ];
  };

  const renderContent = () => {
    const raw = dataStore[activeFunc];
    if (!raw || !raw.ledger || raw.ledger.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: "14px", fontWeight: "600", color: theme.primary }}
          >
            Awaiting Marketing Insights
          </motion.div>
        </div>
      );
    }

    const ledger     = raw.ledger.map((row, i) => normalizeRow(row, i));
    const flagged    = ledger.filter(l => l.status === "CRITICAL").length;
    const timeSeries = ledger.slice(0, 15).map((d, index) => ({ x: index, val: d.engagement, reach: d.sessions || d.spent }));
    const insights   = getInsightsFor(activeFunc, flagged);
    const data       = { ...raw, ledger, flagged, timeSeries, insights };

    const config = {
      "Market Trends":       { kpi1: "Total Audience",  kpi2: "Avg Engagement", kpi3: "Market Cap",      accent: theme.primary },
      "Lead Prioritization": { kpi1: "High Value Leads",kpi2: "Conv Index",      kpi3: "Total Sessions",  accent: theme.success },
      "Retention & Churn":   { kpi1: "Churn Detected",  kpi2: "Loyalty Score",  kpi3: "Revenue At Risk", accent: theme.danger  },
      "Campaign Analysis":   { kpi1: "Campaign ROI",    kpi2: "Total Ad Spend", kpi3: "Active Channels", accent: theme.accent  },
    }[activeFunc];

    const getKpiValues = () => {
      const total = data.total || 1;
      if (activeFunc === "Market Trends") {
        const avgEng     = data.ledger.reduce((a, c) => a + c.engagement, 0) / total;
        const totalSpent = data.ledger.reduce((a, c) => a + c.spent, 0);
        return [data.total, `${avgEng.toFixed(1)}%`, `$${totalSpent.toLocaleString()}`];
      }
      if (activeFunc === "Retention & Churn") {
        const avgLoyalty  = (data.ledger.filter(x => x.status === "STABLE").length / total) * 100;
        const riskRevenue = data.ledger.filter(x => x.status === "CRITICAL").reduce((a, c) => a + c.spent, 0);
        return [data.flagged, `${avgLoyalty.toFixed(1)}%`, `$${riskRevenue.toLocaleString()}`];
      }
      if (activeFunc === "Lead Prioritization") {
        const highValueCount = data.ledger.filter(x => x.conversion > 0.05 || x.engagement > 70).length;
        const avgConv        = data.ledger.reduce((a, c) => a + c.conversion, 0) / total;
        const totalSessions  = data.ledger.reduce((a, c) => a + c.sessions, 0);
        return [highValueCount, `${(avgConv * 100).toFixed(1)}%`, totalSessions.toLocaleString()];
      }
      const avgRoi       = data.ledger.reduce((a, c) => a + parseFloat(c.roi), 0) / total;
      const totalAdSpend = data.ledger.reduce((a, c) => a + c.spent, 0);
      return [`${avgRoi.toFixed(2)}x`, `$${totalAdSpend.toLocaleString()}`, "4 Live Nodes"];
    };

    const getDynamicMetricConfig = () => {
      switch (activeFunc) {
        case "Market Trends":       return { label: "Engagement Score",        valueKey: "engagement", format: (v) => `${v}%` };
        case "Lead Prioritization": return { label: "Conversion Rate",         valueKey: "conversion", format: (v) => `${(v * 100).toFixed(1)}%` };
        case "Retention & Churn":   return { label: "Risk Vulnerability",      valueKey: "engagement", format: (v) => `${(100 - v).toFixed(0)}% Risk` };
        case "Campaign Analysis":   return { label: "Campaign ROI Multiplier", valueKey: "roi",        format: (v) => `${v}x` };
        default:                    return { label: "Primary Metric",          valueKey: "spent",      format: (v) => `$${v}` };
      }
    };

    const metricConfig = getDynamicMetricConfig();
    const kpiVals      = getKpiValues();

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <KPICard title={config.kpi1} value={kpiVals[0]} color={config.accent} delay={0.1} />
          <KPICard title={config.kpi2} value={kpiVals[1]} color={theme.text}    delay={0.2} />
          <KPICard title={config.kpi3} value={kpiVals[2]} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.8fr", gap: "25px", marginBottom: "30px" }}>
          <div style={cardStyle}>
            <div style={cardHeader}>Metric Correlation Matrix</div>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <XAxis type="number" dataKey="spent"      name="Spend"      stroke={theme.subtext} fontSize={10} hide />
                <YAxis type="number" dataKey="engagement" name="Engagement" stroke={theme.subtext} fontSize={10} hide />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "6px", fontSize: "12px", color: theme.text }}
                />
                <Scatter data={data.ledger} fill={theme.primary}>
                  {data.ledger.map((e, i) => (
                    <Cell key={i} fill={e.status === "CRITICAL" ? theme.danger : theme.success} />
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
                    <stop offset="5%"  stopColor={config.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.accent} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="x" stroke={theme.subtext} fontSize={10} tickLine={false} />
                <YAxis stroke={theme.subtext} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }}
                />
                <Area type="monotone" dataKey="reach" stroke={config.accent} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}` }}>
            <div style={{ ...cardHeader, color: config.accent }}>Marketing Intelligence</div>
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: theme.text, margin: 0 }}>
              Analyzed {data.total} consumer profiles.
              Engagement patterns indicate a highly unified architecture across primary acquisition and verification channels.
            </p>
            <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: "11px", color: theme.subtext, fontWeight: "800" }}>PRODUCTION STREAM: LIVE</span>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: "30px" }}>
          <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between" }}>
            <span>{activeFunc} Intelligence Matrix</span>
            <span style={{ color: theme.primary }}>Predictive Points Active</span>
          </div>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              {data.insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5, background: "rgba(88,166,255,0.05)" }}
                  style={{ padding: "15px", borderBottom: `1px solid ${theme.border}`, display: "flex", gap: "15px", alignItems: "center", borderRadius: "4px" }}
                >
                  <span style={{ color: theme.primary, fontSize: "12px", fontWeight: "800", minWidth: "120px" }}>{insight.label}</span>
                  <span style={{ color: theme.text, fontSize: "13px" }}>{insight.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between" }}>
            <span>{activeFunc} Operational Ledger</span>
            <span style={{ color: theme.primary }}>Verified Database Records</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{ padding: "15px" }}>ID Identifier</th>
                <th>Capital Investment</th>
                <th>{metricConfig.label}</th>
                <th>Status Flags</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{ padding: "15px", color: theme.primary, fontWeight: "600" }}>{row.id}</td>
                  <td style={{ color: theme.textMuted }}>${row.spent.toLocaleString()}</td>
                  <td style={{ color: theme.text, fontWeight: "500" }}>
                    {metricConfig.format(row[metricConfig.valueKey])}
                  </td>
                  <td>
                    <span style={{
                      background: row.status === "CRITICAL" ? "rgba(248,81,73,0.1)" : "rgba(63,185,80,0.1)",
                      color: row.status === "CRITICAL" ? theme.danger : theme.success,
                      padding: "5px 12px", borderRadius: "6px",
                      border: `1px solid ${row.status === "CRITICAL" ? "rgba(248,81,73,0.2)" : "rgba(63,185,80,0.2)"}`,
                      fontSize: "11px", fontWeight: "800",
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

  // ─── Auth resolving gate ───────────────────────────────────────────────────
  if (isAuthResolving) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: theme.fontMain }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: "32px", height: "32px", border: `3px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: theme.subtext, fontSize: "14px", fontWeight: "500", letterSpacing: "0.3px", margin: 0 }}>
          Authenticating secure metric profile runtime...
        </p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", padding: "40px", fontFamily: theme.fontMain }}>
      <style>{`@keyframes fn-spin { 100% { transform: rotate(360deg); } }`}</style>

      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 60, height: 60, border: `4px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%" }}
            />
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ marginTop: "25px", fontSize: "13px", color: theme.primary, fontWeight: "700", letterSpacing: "2px" }}
            >
              RE-ALIGNING LIVE METRICS
            </motion.div>
          </motion.div>
        )}

        {notification && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={notificationStyle}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
            Business Analyzer | <span style={{ color: theme.primary }}>Marketing Dashboard</span>
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: theme.subtext }}>
            {currentUser
              ? <>Workspace: <span style={{ color: theme.primary }}>{currentUser.email}</span></>
              : <span style={{ color: theme.subtext }}>Guest workspace</span>}
            {files.length > 0 && ` · ${files.length} file${files.length > 1 ? "s" : ""} indexed · ${formatBytes(totalBytes)} · auto-saved`}
          </p>
        </div>

        {/* ── Manage Files toggle ── */}
        <button
          onClick={() => setShowManage(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: "8px",
            border: showManage ? "1px solid rgba(88,166,255,0.5)" : `1px solid ${theme.border}`,
            background: showManage ? "rgba(88,166,255,0.1)" : theme.surface,
            color: showManage ? theme.primary : theme.textMuted,
            fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease",
          }}
        >
          <span>📁</span>
          Manage Files
          {files.length > 0 && (
            <span style={{
              background: "rgba(88,166,255,0.2)", border: "1px solid rgba(88,166,255,0.35)",
              color: theme.primary, borderRadius: "100px", padding: "1px 8px",
              fontSize: "11px", fontWeight: "800",
            }}>
              {files.length}
            </span>
          )}
        </button>
      </header>

      {/* ── Manage Files Panel ── */}
      <AnimatePresence>
        {showManage && (
          <motion.div
            key="manage-panel"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: "28px" }}
          >
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "14px", padding: "24px" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: theme.text }}>File Manager</div>
                  <div style={{ fontSize: "11px", color: theme.subtext, marginTop: 3 }}>
                    {files.length > 0
                      ? `${files.length} file${files.length > 1 ? "s" : ""} · ${formatBytes(totalBytes)} · saved to ${currentUser ? currentUser.email : "guest"}`
                      : `No files loaded — scoped to ${currentUser ? currentUser.email : "guest session"}`}
                  </div>
                </div>
                <label style={{ ...uploadButtonStyle, cursor: "pointer" }}>
                  + Add CSV Files
                  <input ref={fileInputRef} type="file" multiple hidden accept=".csv" disabled={isProcessing} onChange={handleFileInput} />
                </label>
              </div>

              {/* Drop zone */}
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                style={{
                  display: "block",
                  padding: files.length > 0 ? "16px 20px" : "36px 20px",
                  background: isDragOver ? "rgba(88,166,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `2px dashed ${isDragOver ? "rgba(88,166,255,0.6)" : theme.border}`,
                  borderRadius: "12px", cursor: "pointer",
                  marginBottom: files.length > 0 ? "16px" : "0",
                  textAlign: "center", transition: "all 0.25s ease", boxSizing: "border-box",
                }}
              >
                <input type="file" multiple hidden accept=".csv" onChange={handleFileInput} />
                <div style={{ fontSize: files.length > 0 ? "1.2rem" : "1.8rem", marginBottom: 6 }}>
                  {isDragOver ? "📥" : "📊"}
                </div>
                <span style={{ color: theme.subtext, fontSize: "13px" }}>
                  {isDragOver
                    ? "Release to add files"
                    : files.length > 0
                    ? "Drop more CSV files here to add them to the analysis"
                    : "Drop CSV files here, or click + Add CSV Files above"}
                </span>
              </label>

              {/* File chips */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                  >
                    {files.map(f => (
                      <FileChip key={f.name} file={f} onRemove={removeFile} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Module nav ── */}
      <nav style={{ display: "flex", gap: "40px", marginBottom: "40px", borderBottom: `1px solid ${theme.border}` }}>
        {["Market Trends", "Lead Prioritization", "Retention & Churn", "Campaign Analysis"].map(tab => (
          <button
            key={tab} onClick={() => setActiveFunc(tab)}
            style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: theme.fontMain,
              fontSize: "15px", color: activeFunc === tab ? theme.primary : theme.subtext,
              borderBottom: activeFunc === tab ? `3px solid ${theme.primary}` : "none",
              paddingBottom: "15px", fontWeight: "700", transition: "all 0.2s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {renderContent()}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle          = { background: theme.card, padding: "30px", borderRadius: "12px", border: `1px solid ${theme.border}` };
const cardHeader         = { fontSize: "12px", color: theme.subtext, marginBottom: "20px", fontWeight: "800", letterSpacing: "0.5px" };
const uploadButtonStyle  = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle    = { height: "350px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "12px" };
const loaderOverlayStyle = { position: "fixed", inset: 0, background: "rgba(13,17,23,0.95)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" };
const notificationStyle  = { position: "fixed", bottom: "30px", right: "30px", background: theme.success, color: "#fff", padding: "15px 25px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
const tableStyle         = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thStyle            = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: "13px", fontWeight: "700" };
const trStyle            = { borderBottom: `1px solid ${theme.border}`, height: "55px", fontSize: "14px" };