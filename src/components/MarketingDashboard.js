import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ScatterChart, Scatter, Cell,
  BarChart, Bar, PieChart, Pie,
  LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
// ICONS — thin-stroke monochrome line icons (Vercel-dashboard style):
// currentColor stroke, ~1.7px weight, rounded caps, 24x24 viewBox.
// Replaces every emoji in the UI so the whole app reads like one system.
// ============================================================
const Icon = ({ children, size = 18, strokeWidth = 1.75, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}
    {...props}
  >
    {children}
  </svg>
);

const Icons = {
  Home: (p) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H9.5v-6h5v6h3a1 1 0 0 0 1-1v-9" /></Icon>,
  Folder: (p) => <Icon {...p}><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" /></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>,
  User: (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" /></Icon>,
  Chevron: (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>,
  LogOut: (p) => <Icon {...p}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="m16 8 4 4-4 4" /><path d="M20 12H9" /></Icon>,
  Ban: (p) => <Icon {...p}><circle cx="12" cy="12" r="8" /><path d="m6.5 6.5 11 11" /></Icon>,
  Menu: (p) => <Icon {...p}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Icon>,
  Zap: (p) => <Icon {...p}><path d="M12 2 4 14h7l-1 8 9-13h-7l1-7Z" /></Icon>,
  Check: (p) => <Icon {...p}><path d="M5 12.5 10 17l9-10" /></Icon>,
  Package: (p) => <Icon {...p}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" /><path d="M3.5 7.5 12 12l8.5-4.5" /><path d="M12 12v9" /></Icon>,
  Brain: (p) => <Icon {...p}><path d="M9 4.5a2.5 2.5 0 0 0-2.5 2.5v.3A3 3 0 0 0 5 10v.5A2.5 2.5 0 0 0 5.5 15a3 3 0 0 0 3 3.5H10V4.5H9Z" /><path d="M15 4.5a2.5 2.5 0 0 1 2.5 2.5v.3A3 3 0 0 1 19 10v.5A2.5 2.5 0 0 1 18.5 15a3 3 0 0 1-3 3.5H14V4.5h1Z" /></Icon>,
  Loader: (p) => <Icon {...p}><path d="M12 3v3" /><path d="m18.4 5.6-2.1 2.1" /><path d="M21 12h-3" /><path d="m18.4 18.4-2.1-2.1" /><path d="M12 18v3" /><path d="m5.6 18.4 2.1-2.1" /><path d="M3 12h3" /><path d="m5.6 5.6 2.1 2.1" /></Icon>,
  Upload: (p) => <Icon {...p}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></Icon>,
  File: (p) => <Icon {...p}><path d="M7 3h7l4 4v14H7Z" /><path d="M14 3v4h4" /></Icon>,
  X: (p) => <Icon {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></Icon>,
  BarChart: (p) => <Icon {...p}><path d="M4 20V10" /><path d="M11 20V4" /><path d="M18 20v-7" /></Icon>,
  Lock: (p) => <Icon {...p}><rect x="5" y="10.5" width="14" height="9" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></Icon>,
  InfoCircle: (p) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><path d="M12 8v.01" /></Icon>,
  CheckCircle: (p) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.5 2.3 2.3 4.7-5.1" /></Icon>,
  Grid: (p) => <Icon {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Icon>,
  DollarSign: (p) => <Icon {...p}><path d="M12 3v18" /><path d="M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3c0 4 9 2 9 6 0 1.7-2 3-4.5 3s-4.5-1.3-4.5-3" /></Icon>,
  Users: (p) => <Icon {...p}><circle cx="9" cy="8" r="3" /><path d="M3 19c.8-3.2 3-5 6-5s5.2 1.8 6 5" /><circle cx="17.5" cy="9" r="2.2" /><path d="M15.8 14.2c2.3.3 3.9 1.9 4.5 4.3" /></Icon>,
  Radio: (p) => <Icon {...p}><circle cx="12" cy="12" r="2.2" /><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6" /><path d="M15.8 8.2a5.4 5.4 0 0 1 0 7.6" /><path d="M5.3 5.3a9.8 9.8 0 0 0 0 13.4" /><path d="M18.7 5.3a9.8 9.8 0 0 1 0 13.4" /></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></Icon>,
  Target: (p) => <Icon {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></Icon>,
  MessageCircle: (p) => <Icon {...p}><path d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1.2-3.6A7.9 7.9 0 0 1 4 12Z" /></Icon>,
};

const MODULE_META = {
  finance: { icon: Icons.DollarSign, label: "Finance", blurb: "Revenue, margins & cash flow" },
  hr: { icon: Icons.Users, label: "HR", blurb: "Headcount, retention & sentiment" },
  marketing: { icon: Icons.Radio, label: "Marketing", blurb: "Funnel, spend & attribution" },
  operations: { icon: Icons.Settings, label: "Operations", blurb: "Throughput & SLA health" },
  sales: { icon: Icons.Target, label: "Sales", blurb: "Pipeline & win-rate trends" },
  chatbot: { icon: Icons.MessageCircle, label: "Chatbot", blurb: "Conversational AI assistant" },
};
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
// Simple Pearson correlation coefficient
function pearsonCorrelation(a, b) {
  const n = a.length;
  if (n === 0) return 0;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA, db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

// Derives extra chart-ready data + narrative insights from the ledger
function computeExtraAnalytics(ledger) {
  if (!ledger.length) return null;

  const total = ledger.length;
  const stableCount   = ledger.filter(r => r.status === "STABLE").length;
  const criticalCount = total - stableCount;

  const topAccounts = [...ledger]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8)
    .map(r => ({ id: String(r.id).slice(0, 10), spent: r.spent }));

  const criticalSpend = ledger.filter(r => r.status === "CRITICAL").reduce((s, r) => s + r.spent, 0);
  const totalSpend    = ledger.reduce((s, r) => s + r.spent, 0);
  const riskConcentration = totalSpend > 0 ? ((criticalSpend / totalSpend) * 100).toFixed(1) : "0.0";

  const spendVals = ledger.map(r => r.spent);
  const engVals    = ledger.map(r => r.engagement);
  const corr = pearsonCorrelation(spendVals, engVals);

  const mid = Math.floor(total / 2);
  const firstHalfAvgEng  = ledger.slice(0, mid).reduce((s, r) => s + r.engagement, 0) / (mid || 1);
  const secondHalfAvgEng = ledger.slice(mid).reduce((s, r) => s + r.engagement, 0) / ((total - mid) || 1);
  const trendDirection = secondHalfAvgEng >= firstHalfAvgEng ? "improving" : "declining";
  const trendDelta = Math.abs(secondHalfAvgEng - firstHalfAvgEng).toFixed(1);

  const avg = (key) => ledger.reduce((s, r) => s + (typeof r[key] === "string" ? parseFloat(r[key]) : r[key]), 0) / total;
  const radarData = [
    { metric: "Engagement",  value: Math.min(100, avg("engagement")) },
    { metric: "Sessions",    value: Math.min(100, avg("sessions") / 2) },
    { metric: "Conversion",  value: Math.min(100, avg("conversion") * 1000) },
    { metric: "Spend",       value: Math.min(100, avg("spent") / 50) },
    { metric: "ROI",         value: Math.min(100, ledger.reduce((s, r) => s + parseFloat(r.roi), 0) / total) },
  ];

  return {
    statusPie: [
      { name: "Stable",   value: stableCount },
      { name: "Critical", value: criticalCount },
    ],
    topAccounts,
    riskConcentration,
    corr,
    trendDirection,
    trendDelta,
    radarData,
  };
}
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
  function getExtraInsights(extra) {
    if (!extra) return [];
    const corrLabel = Math.abs(extra.corr) > 0.5 ? "a strong" : Math.abs(extra.corr) > 0.2 ? "a moderate" : "a weak";
    const corrDir = extra.corr >= 0 ? "positive" : "negative";
    return [
      { label: "Spend-Engagement Link", text: `Analysis shows ${corrLabel} ${corrDir} correlation (r=${extra.corr.toFixed(2)}) between spend and engagement.` },
      { label: "Risk Concentration",    text: `${extra.riskConcentration}% of total spend sits in flagged CRITICAL accounts.` },
      { label: "Engagement Trend",      text: `Engagement is ${extra.trendDirection} across the record set (Δ${extra.trendDelta} pts, first half vs second half).` },
    ];
  }
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
    const extra = computeExtraAnalytics(ledger);
const extraInsights = getExtraInsights(extra);

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
            <div style={cardHeader}>Spend-Engagement Matrix</div>
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
            <div style={{ ...cardHeader, color: config.accent }}>Marketing Insights</div>
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: theme.text, margin: 0 }}>
              Analyzed {data.total} consumer profiles.
              Engagement patterns indicate a highly unified architecture across primary acquisition and verification channels.
            </p>
           
          </div>
        </div>
        {extra && (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "25px", marginBottom: "30px" }}>
    <div style={cardStyle}>
      <div style={cardHeader}>Top Accounts by Spend</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={extra.topAccounts}>
          <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="id" stroke={theme.subtext} fontSize={9} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
          <YAxis stroke={theme.subtext} fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }} />
          <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
            {extra.topAccounts.map((_, i) => <Cell key={i} fill={theme.primary} fillOpacity={1 - i * 0.08} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div style={cardStyle}>
      <div style={cardHeader}>Status Distribution</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={extra.statusPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
            {extra.statusPie.map((entry, i) => (
              <Cell key={i} fill={entry.name === "Critical" ? theme.danger : theme.success} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }} />
          <Legend wrapperStyle={{ fontSize: "11px", color: theme.subtext }} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div style={cardStyle}>
      <div style={cardHeader}>Metric Profile (Radar)</div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={extra.radarData} outerRadius={70}>
          <PolarGrid stroke={theme.border} />
          <PolarAngleAxis dataKey="metric" stroke={theme.subtext} fontSize={10} />
          <PolarRadiusAxis stroke={theme.border} fontSize={9} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={theme.accent} fill={theme.accent} fillOpacity={0.35} />
          <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

{extra && (
  <div style={{ ...cardStyle, marginBottom: "30px" }}>
    <div style={cardHeader}>Engagement vs Sessions Trend</div>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={timeSeries}>
        <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="x" stroke={theme.subtext} fontSize={10} tickLine={false} />
        <YAxis stroke={theme.subtext} fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }} />
        <Legend wrapperStyle={{ fontSize: "11px", color: theme.subtext }} />
        <Line type="monotone" dataKey="val"   name="Engagement" stroke={theme.primary} strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="reach" name="Sessions/Spend" stroke={theme.accent}  strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

        <div style={{ ...cardStyle, marginBottom: "30px" }}>
          <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between" }}>
            <span>{activeFunc}  </span>
       
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
            <span style={{ color: theme.primary }}>Records</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{ padding: "15px" }}>ID Identifier</th>
                <th>Capital Investment</th>
                <th>{metricConfig.label}</th>
                <th>Status</th>
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
           <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icons.Folder size={16} strokeWidth={1.8} /> Manage Files
              </span>
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