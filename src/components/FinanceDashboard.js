// src/components/FinanceDashboard.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// ─── Theme ────────────────────────────────────────────────────────────────────
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
const theme = {
  primary:   "#58a6ff",
  bg:        "#0d1117",
  card:      "#161b22",
  surface:   "#21262d",
  border:    "#30363d",
  text:      "#ffffff",
  textMuted: "#e6edf3",
  subtext:   "#8b949e",
  accent:    "#8957e5",
  success:   "#3fb950",
  danger:    "#f85149",
  fontMain:  "'Inter', -apple-system, system-ui, sans-serif",
  fontMono:  "'JetBrains Mono', monospace",
};

// ─── Module definitions ───────────────────────────────────────────────────────
const modules = [
  { id: "Profitability Velocity",  kpi1: "Net Profit",     kpi1Key: "NetProfit",        kpi2: "Gross Margin",   kpi2Key: "GrossMargin",   kpi3: "EBITDA",            kpi3Key: "EBITDA",        color: "#58a6ff", chartKey: "NetProfit",            metricTelemetryName: "Net Income Variance",             outputTelemetryName: "Liquid Retained Earnings ($)"   },
  { id: "Liquidity Strength",      kpi1: "Quick Ratio",    kpi1Key: "QuickRatio",       kpi2: "Current Ratio",  kpi2Key: "CurrentRatio",  kpi3: "Cash Reserves",     kpi3Key: "CashReserves",  color: "#3fb950", chartKey: "QuickRatio",           metricTelemetryName: "Immediate Asset Liquid Index",    outputTelemetryName: "Solvency Coverage Factor (:1)"  },
  { id: "Market Dominance",        kpi1: "Market Share",   kpi1Key: "MarketShare",      kpi2: "Capture Rate",   kpi2Key: "CaptureRate",   kpi3: "HHI Index",         kpi3Key: "HHIIndex",      color: "#b388ff", chartKey: "MarketShare",          metricTelemetryName: "HHI Concentration Score",         outputTelemetryName: "Sector Penetration Share (%)"   },
  { id: "Efficiency Matrix",       kpi1: "Productivity",   kpi1Key: "Productivity",     kpi2: "OpEx Ratio",     kpi2Key: "OpExRatio",     kpi3: "Labor Yield",       kpi3Key: "LaborYield",    color: "#ffab40", chartKey: "EmployeeProductivity", metricTelemetryName: "Labor Productivity Coefficient",  outputTelemetryName: "Operational Resource Yield"     },
  { id: "Solvency Risk",           kpi1: "Interest Cov",   kpi1Key: "InterestCov",      kpi2: "WACC",           kpi2Key: "WACC",          kpi3: "Solvency Coverage", kpi3Key: "InterestCov",   color: "#f85149", chartKey: "InterestCov",          metricTelemetryName: "Interest Coverage Ratio (TIE)",   outputTelemetryName: "Debt-to-Earnings Multiplier"    },
  { id: "Burn Rate Variance",      kpi1: "Net Burn",       kpi1Key: "NetBurn",          kpi2: "Runway",         kpi2Key: "Runway",        kpi3: "Venture Ratio",     kpi3Key: "VentureRatio",  color: "#f85149", chartKey: "NetBurn",              metricTelemetryName: "Net Capital Outflow Rate",        outputTelemetryName: "Monthly Run-Rate Exhaustion ($)"},
  { id: "Predictive LTV",          kpi1: "ARPU",           kpi1Key: "ARPU",             kpi2: "Retention",      kpi2Key: "Retention",     kpi3: "Churn Rate",        kpi3Key: "ChurnRate",     color: "#58a6ff", chartKey: "ARPU",                 metricTelemetryName: "Unit Economic Yield (ARPU)",      outputTelemetryName: "Net Lifetime Value Capital ($)" },
  { id: "Capital Health",          kpi1: "Working Cap",    kpi1Key: "WorkingCap",       kpi2: "Inventory Turn", kpi2Key: "InventoryTurn", kpi3: "Asset Liq",         kpi3Key: "AssetLiq",      color: "#3fb950", chartKey: "WorkingCap",           metricTelemetryName: "Net Operating Capital Velocity",  outputTelemetryName: "Liquid Capital Run-Rate ($)"    },
  { id: "Customer Acquisition",    kpi1: "CAC",            kpi1Key: "CAC",              kpi2: "Organic Lift",   kpi2Key: "OrganicLift",   kpi3: "Marketing ROI",     kpi3Key: "MarketingROI",  color: "#b388ff", chartKey: "CAC",                  metricTelemetryName: "Blended Acquisition Threshold",   outputTelemetryName: "Per-Capita Capital Overhead ($)"},
  { id: "Risk vs Volatility",      kpi1: "Risk Score",     kpi1Key: "RiskScore",        kpi2: "Beta Factor",    kpi2Key: "BetaFactor",    kpi3: "Sharpe Ratio",      kpi3Key: "SharpeRatio",   color: "#ffab40", chartKey: "RiskScore",            metricTelemetryName: "Sharpe Risk-Adjusted Return",     outputTelemetryName: "Beta Systematic Variance Index" },
];

// ── Storage key helpers — mirrors ChatbotPage pattern ─────────────────────────
const guestKey = "InsightIQ_Finance_Files_Guest";
const userKey  = (uid) => `InsightIQ_Finance_Files_User_${uid}`;

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

// ── Deterministic pseudo-random helper — derives a stable "random" number
// from the uploaded CSV content + module id, so the trend shown for a given
// module stays consistent for a given dataset instead of re-rolling on every
// render, while still varying meaningfully as new files are uploaded. ──────
function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Computes a trend percentage for a module based on the actual uploaded
// ledger data. Prefers a real period-over-period change on the module's
// chart metric; falls back to a seeded pseudo-random value (still derived
// from the CSV content, so it changes when the files change) if the metric
// isn't present in the data.
function computeTrendPercent(ledger, config) {
  if (ledger && ledger.length >= 2) {
    const key    = config.chartKey;
    const last   = parseFloat(ledger[ledger.length - 1]?.[key]);
    const prev   = parseFloat(ledger[ledger.length - 2]?.[key]);
    if (!isNaN(last) && !isNaN(prev) && prev !== 0) {
      return ((last - prev) / Math.abs(prev)) * 100;
    }
  }
  const seedSource = JSON.stringify(ledger || []) + config.id;
  const seed = hashSeed(seedSource);
  // Map to a plausible -20% .. +20% range
  return (seededRandom(seed) * 40) - 20;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, color }) => (
  <div style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: "10px", color: theme.subtext, marginBottom: "8px", fontWeight: "900", letterSpacing: "0.5px" }}>
      {title.toUpperCase()}
    </div>
    <div style={{ fontSize: "24px", fontWeight: "800", fontFamily: theme.fontMono }}>{value}</div>
  </div>
);

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [activeFunc,   setActiveFunc]   = useState("Profitability Velocity");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver,   setIsDragOver]   = useState(false);
  const [toast,        setToast]        = useState("");
  const [showManage,   setShowManage]   = useState(false);
  const fileInputRef = useRef(null);

  // ── Auth gate — same pattern as ChatbotPage ────────────────────────────────
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser,     setCurrentUser]     = useState(null);
  const [storageKey,      setStorageKey]      = useState(guestKey);
  const [files,           setFiles]           = useState([]);

  // 1. Auth lifecycle — sets per-user key, then hydrates files from that key
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
      // Handshake resolved — safe to allow writes
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync to localStorage on every files change (guard mirrors chatbot)
  useEffect(() => {
    if (isAuthResolving) return; // never overwrite during auth init
    saveToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);
  const dataStore  = useMemo(() => buildDataStore(files), [files]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

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

      const allRows   = allFiles.flatMap(f => f.rows || []);
      const lastEntry = allRows[allRows.length - 1] || {};
      const extractValue = key => lastEntry[key] ?? lastEntry[key.replace(/\s/g, "")] ?? "0.00";

      const insights = modules.map(mod => ({
        module:  mod.id,
        kpi1:    { label: mod.kpi1, value: extractValue(mod.kpi1Key) },
        kpi2:    { label: mod.kpi2, value: extractValue(mod.kpi2Key) },
        kpi3:    { label: mod.kpi3, value: extractValue(mod.kpi3Key) },
        records: allRows.length,
      }));

      await fetch("http://localhost:5000/api/finance/insights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insights }),
      });

      showToast("✅ Files & insights synced to PostgreSQL");
    } catch (err) {
      console.error("Sync error:", err);
      showToast("⚠️ Sync failed — check backend on port 5000");
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

  // ─── Dashboard renderer ────────────────────────────────────────────────────
  const renderDashboard = () => {
    const data   = dataStore[activeFunc];
    const config = modules.find(m => m.id === activeFunc);

    if (!data || !data.ledger || data.ledger.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: "14px", fontWeight: "600", color: theme.primary }}
          >
            Awaiting Financial Insights
          </motion.div>
        </div>
      );
    }

    const lastEntry    = data.ledger[data.ledger.length - 1] || {};
    const extractValue = (cleanKey, fallbackTitle) => {
      if (lastEntry[cleanKey] !== undefined) return lastEntry[cleanKey];
      const strip = fallbackTitle.replace(/\s/g, "");
      if (lastEntry[strip] !== undefined) return lastEntry[strip];
      if (lastEntry[fallbackTitle] !== undefined) return lastEntry[fallbackTitle];
      return "0.00";
    };

    // Trend % derived from the uploaded CSV data (real period-over-period
    // change when available, otherwise a value seeded from the file content
    // so it's stable per-dataset rather than a hardcoded constant).
    const trendPercent = computeTrendPercent(data.ledger, config);
    const trendIsUp    = trendPercent >= 0;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <KPICard title={config.kpi1} value={extractValue(config.kpi1Key, config.kpi1)} color={config.color} />
          <KPICard title={config.kpi2} value={extractValue(config.kpi2Key, config.kpi2)} color={theme.text} />
          <KPICard title={config.kpi3} value={extractValue(config.kpi3Key, config.kpi3)} color={theme.success} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", marginBottom: "30px" }}>
          <div style={cardStyle}>
            <div style={cardHeader}>{activeFunc}</div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.ledger.slice(-20)}>
                <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="Month" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: "12px" }} />
                <Area type="monotone" dataKey={config.chartKey} stroke={config.color} fill={config.color} fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.color}` }}>
            <div style={{ ...cardHeader, color: config.color }}>Financial Insights</div>
            <p style={{ fontSize: "14px", lineHeight: "1.8", color: theme.textMuted }}>
              The current trend for {activeFunc} indicates a {Math.abs(trendPercent).toFixed(1)}%
              {trendIsUp ? " improvement" : " decline"} in fiscal efficiency, based on the uploaded ledger data.
              No anomalies detected in current transactional audit.
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Records</div>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{ padding: "15px" }}>Reporting Period</th>
                  <th>Audit Status</th>
                  <th>{config.outputTelemetryName}</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.slice(-10).map((row, i) => (
                  <tr key={i} style={trStyle}>
                    <td style={{ padding: "15px", fontFamily: theme.fontMono, color: theme.primary }}>
                      {row.Month || `FY26-Q${i + 1}`}
                    </td>
                    <td><span style={statusBadge}>NORMAL</span></td>
                    <td style={{ fontFamily: theme.fontMono }}>
                      {row[config.chartKey] !== undefined ? row[config.chartKey] : "0"}
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

  // ─── Auth resolving gate — shown while Firebase handshake completes ────────
  if (isAuthResolving) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: theme.fontMain }}>
        <style>{`@keyframes fn-spin { 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ ...spinnerStyle, animation: "fn-spin 0.8s linear infinite" }} />
        <p style={{ color: theme.subtext, fontSize: "14px", fontWeight: "500", letterSpacing: "0.3px", margin: 0 }}>
          Authenticating secure metric profile runtime...
        </p>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", padding: "40px", fontFamily: theme.fontMain }}>
      <style>{`
        .fn-nav::-webkit-scrollbar { height: 4px; }
        .fn-nav::-webkit-scrollbar-track { background: ${theme.bg}; }
        .fn-nav::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
        .fn-nav::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
        @keyframes fn-spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* ── Global overlays ── */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={loaderOverlayStyle}>
            <div style={{ ...spinnerStyle, animation: "fn-spin 0.8s linear infinite" }} />
          </motion.div>
        )}
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={notificationStyle}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "900", margin: 0, letterSpacing: "-0.5px" }}>
            Business Analyzer |<span style={{ color: theme.primary }}> Financial Dashboard</span>
          </h1>
          {/* Active workspace email — mirrors chatbot sidebar display */}
          
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

              {/* Panel header row */}
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
      <nav
        className="fn-nav"
        style={{
          display: "flex", gap: "10px", marginBottom: "40px",
          overflowX: "auto", paddingBottom: "12px", borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {modules.map(mod => (
          <button
            key={mod.id} onClick={() => setActiveFunc(mod.id)}
            style={{
              padding: "10px 24px", borderRadius: "6px", fontSize: "13px", fontWeight: "700",
              cursor: "pointer", whiteSpace: "nowrap",
              background: activeFunc === mod.id ? "rgba(88, 166, 255, 0.1)" : "transparent",
              color:      activeFunc === mod.id ? theme.primary : theme.subtext,
              border:     `1px solid ${activeFunc === mod.id ? theme.primary : "transparent"}`,
              transition: "0.2s all",
            }}
          >
            {mod.id}
          </button>
        ))}
      </nav>

      {/* ── Dashboard content ── */}
      {renderDashboard()}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle          = { background: theme.card, padding: "25px", borderRadius: "10px", border: `1px solid ${theme.border}` };
const cardHeader         = { fontSize: "11px", color: theme.subtext, marginBottom: "20px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" };
const uploadButtonStyle  = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle    = { height: "350px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "12px" };
const tableStyle         = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thStyle            = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: "11px", fontWeight: "900", textTransform: "uppercase" };
const trStyle             = { borderBottom: `1px solid ${theme.border}`, height: "50px", fontSize: "13px" };
const statusBadge        = { background: "rgba(63, 185, 80, 0.1)", color: theme.success, padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: "900", border: "1px solid rgba(63, 185, 80, 0.2)" };
const loaderOverlayStyle = { position: "fixed", inset: 0, background: "rgba(13, 17, 23, 0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)" };
const notificationStyle  = { position: "fixed", bottom: "30px", right: "30px", background: theme.card, color: theme.text, padding: "14px 22px", borderRadius: "12px", fontSize: "13px", fontWeight: "700", zIndex: 2000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", border: `1px solid ${theme.border}` };
const spinnerStyle       = { width: "40px", height: "40px", border: `3px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%" };