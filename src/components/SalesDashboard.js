import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
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

// Modules referenced by the upload/merge logic — mirrors the three dashboard tabs
const modules = [
  { id: "Revenue" },
  { id: "Marketing ROI" },
  { id: "Customer Churn" },
];

// ── Storage key helpers ───────────────────────────────────────────────────────
const guestKey = "InsightIQ_Sales_Files_Guest";
const userKey  = (uid) => `InsightIQ_Sales_Files_User_${uid}`;

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
    return headers.reduce((obj, header, index) => {
      const val = values[index]?.trim();
      const cleanHeader = header.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
      obj[cleanHeader] = isNaN(val) ? val : parseFloat(val);
      obj[header] = isNaN(val) ? val : parseFloat(val);
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
  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }} style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '10px', fontWeight: '700' }}>{title}</div>
    <div style={{ fontSize: '26px', fontWeight: '800' }}>{value}</div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const [activeFunc, setActiveFunc] = useState("Revenue");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState("");
  const [showManage, setShowManage] = useState(false);

  // Auth gate — mirrors HRDashboard persistence pattern
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageKey, setStorageKey] = useState(guestKey);
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  // 1. Auth lifecycle — sets the correct per-user storage key, then hydrates files
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

  // 2. Sync to localStorage whenever files or key change
  useEffect(() => {
    if (isAuthResolving) return; 
    saveToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);
  const dataStore  = useMemo(() => buildDataStore(files), [files]);

  // ── Notification ───────────────────────────────────────────────────────────
  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  // ── Read raw File objects ──────────────────────────────────────────────────
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

  // ── Merge without duplicates ───────────────────────────────────────────────
  const mergeInto = (prev, incoming) => {
    const existing = new Set(prev.map(f => f.name));
    return [...prev, ...incoming.filter(f => !existing.has(f.name))];
  };

  // ── Sync to PostgreSQL ─────────────────────────────────────────────────────
  const syncToPostgres = async (allFiles) => {
    try {
      const payload = allFiles.map(f => ({ filename: f.name, content: f.content }));
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

  // ── Process & add files ────────────────────────────────────────────────────
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

  // ── Remove a file ──────────────────────────────────────────────────────────
  const removeFile = (name) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.name !== name);
      if (updated.length > 0) syncToPostgres(updated);
      return updated;
    });
  };

  // Pulls a numeric value off a raw CSV row, tolerant of header spelling/casing differences.
  const extractMetricValue = (row, possibleKeys) => {
    for (let k of possibleKeys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== "" && !isNaN(row[k])) return Number(row[k]);
      const normalizedKey = k.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');
      if (row[normalizedKey] !== undefined && row[normalizedKey] !== null && row[normalizedKey] !== "" && !isNaN(row[normalizedKey])) return Number(row[normalizedKey]);
    }
    for (const v of Object.values(row)) {
      if (v !== "" && v !== null && v !== undefined && !isNaN(v) && isFinite(Number(v))) {
        return Number(v);
      }
    }
    return 0;
  };

  // Builds the dashboard structures from the ledger array
  const buildTabData = (tab, ledger) => {
    const metricKeysByTab = {
      "Revenue": ["Amazon_Revenue", "Revenue", "amazon_revenue", "revenue", "sales", "Sales", "amount", "Amount"],
      "Marketing ROI": ["Marketing_ROI", "ROI", "marketing_roi", "roi", "ad_spend", "Ad_Spend", "spend", "Spend"],
      "Customer Churn": ["Customer_Churn", "Churn", "customer_churn", "churn", "churn_rate", "Churn_Rate", "risk", "Risk"]
    };
    const predictions = ledger.map((row) => extractMetricValue(row, metricKeysByTab[tab]));

    const total = predictions.length;
    const metric = predictions.reduce((a, b) => a + b, 0).toFixed(2);
    const accuracy = total > 0 ? 0.94 : 0;

    const labelMapping = {
      "Revenue": ["SKU Velocity", "Buy Box Delta", "Organic Rank Index", "Inventory Liquidity", "Pricing Elasticity"],
      "Marketing ROI": ["Acquisition Yield", "ACOS Protocol", "Conversion Velocity", "Brand Attribution", "PPC Efficiency"],
      "Customer Churn": ["LTV Survival", "Cohort Alpha", "Dormant Recovery", "Subscription Health", "Attrition Log"]
    };
    const labelSet = labelMapping[tab] || ["Data Vector"];
    const insights = predictions.map((val, i) => ({
      label: labelSet[i % labelSet.length],
      value: val,
      conf: (accuracy * 100).toFixed(1),
      status: val > predictions[0] ? "Expanding" : "Stable"
    }));

    const distribution = [
      { name: 'Signal', value: accuracy * 100 },
      { name: 'Noise', value: 100 - (accuracy * 100) }
    ];

    return { accuracy, total, metric, predictions, insights, distribution };
  };

  const renderContent = () => {
    const raw = dataStore[activeFunc];
    if (!raw || !raw.ledger || raw.ledger.length === 0) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '14px', fontWeight: '600', color: theme.primary }}>
          Awaiting Commercial Insights
        </motion.div>
      </div>
    );

    const data = buildTabData(activeFunc, raw.ledger);

    const config = {
      "Revenue": { 
        accent: theme.primary, title: "Revenue Forecast Matrix",
        kpis: ["Inventory", "Net Forecast", "Inventory Health"],
        columns: ["Product Name", "Monthly Revenue", "Accuracy", "Trend"]
      },
      "Marketing ROI": { 
        accent: theme.accent, title: "Capital Efficiency Logs",
        kpis: ["Spend Volume", "Net Attribution", "Channel Efficiency"],
        columns: ["Marketing Channel", "Return on Ad Spend", "Accuracy", "Trend"]
      },
      "Customer Churn": { 
        accent: theme.danger, title: "Risk Probability Dashboard",
        kpis: ["At-Risk Entities", "LTV Impact", "Churn Velocity"],
        columns: ["Customer Segment", "Churn Rate", "Accuracy", "Trend"]
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
            <div style={{...cardHeader, color: config.accent}}>Sales Insights</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.text }}>
              Revenue streams indicate {data.accuracy > 0.8 ? "high" : "moderate"} reliability. 
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <span style={{ color: theme.text }}>{activeFunc} Audit Ledger</span>
           
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={tableStyle}>
            <thead>
  <tr style={thStyle}>
    <th style={{padding: '15px'}}>{config.columns[0]}</th>
    <th>{config.columns[1]}</th>
    <th>{config.columns[2]}</th>
    <th>{config.columns[3]}</th>
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

  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '40px', fontFamily: theme.fontMain }}>
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 60, height: 60, border: `4px solid ${theme.primary}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ marginTop: '25px', fontSize: '13px', color: theme.primary, fontWeight: '700', letterSpacing: '2px' }}>
              RE-ALIGNING LIVE METRICS
            </motion.div>
          </motion.div>
        )}

        {notification && (
          <motion.div key="toast" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={notificationStyle}>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Business Analyzer | <span style={{ color: theme.primary }}>Sales Dashboard</span></h1>
          
        </div>
        
        {/* ── Manage Files Panel Toggle ── */}
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

      {/* ── Manage Files Drop/View Panel ── */}
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

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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

const cardStyle = { background: theme.card, padding: '30px', borderRadius: '12px', border: `1px solid ${theme.border}` };
const cardHeader = { fontSize: '12px', color: theme.subtext, marginBottom: '20px', fontWeight: '800', letterSpacing: '0.5px' };
const buttonStyle = { padding: '14px 28px', background: theme.primary, color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer', borderRadius: '8px' };
const uploadButtonStyle  = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle = { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}`, borderRadius: '16px' };
const loaderOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(13, 17, 23, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const notificationStyle = { position: 'fixed', bottom: '30px', right: '30px', background: theme.success, color: '#fff', padding: '15px 25px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };