// src/components/HRDashboard.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend
} from "recharts";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// ---------- Unified High-Clarity Theme ----------

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
  { id: "Salary Distribution", chartKey: "salary"   },
  { id: "Attrition Analysis",  chartKey: "overtime" },
  { id: "Training Impact",     chartKey: "training" },
];

// ── Storage key helpers ───────────────────────────────────────────────────────
// Mirrors the chatbot pattern: one key per verified UID, guest fallback
const guestKey = "InsightIQ_HR_Files_Guest";
const userKey  = (uid) => `InsightIQ_HR_Files_User_${uid}`;

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

// ── Insight math helpers — all derived straight from the uploaded CSV rows,
// same concept as FinanceDashboard's generateInsights: no hardcoded copy,
// every line below is computed from the normalized employee ledger. ────────
function computeAverage(series) {
  if (!series || !series.length) return null;
  return series.reduce((a, b) => a + b, 0) / series.length;
}

// Coefficient of variation (stdev / |mean| * 100) — scale-independent read
// on how spread out a metric is across the current workforce.
function computeVolatility(series) {
  if (!series || series.length < 2) return null;
  const avg = computeAverage(series);
  if (!avg) return null;
  const variance = series.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / series.length;
  const stdev = Math.sqrt(variance);
  return (stdev / Math.abs(avg)) * 100;
}

// Highest / lowest employee for a given metric key, tagged with employee id
// so insights can call out real records instead of anonymous numbers.
function computePeakTrough(ledger, key) {
  if (!ledger || !ledger.length) return null;
  let maxRow = null, minRow = null;
  ledger.forEach(row => {
    const v = row[key];
    if (v === undefined || v === null || isNaN(v)) return;
    if (!maxRow || v > maxRow[key]) maxRow = row;
    if (!minRow || v < minRow[key]) minRow = row;
  });
  if (!maxRow || !minRow) return null;
  return { max: maxRow[key], maxId: maxRow.id, min: minRow[key], minId: minRow.id };
}

// Splits the ledger (in upload order) into an earlier and later half and
// compares average metric value between them — a lightweight trend read
// when there's no explicit reporting-period column in the CSV.
function computeTrend(ledger, key) {
  if (!ledger || ledger.length < 4) return null;
  const mid = Math.floor(ledger.length / 2);
  const firstHalf  = ledger.slice(0, mid).map(r => r[key]).filter(v => !isNaN(v));
  const secondHalf = ledger.slice(mid).map(r => r[key]).filter(v => !isNaN(v));
  const a1 = computeAverage(firstHalf);
  const a2 = computeAverage(secondHalf);
  if (a1 === null || a2 === null || a1 === 0) return null;
  return ((a2 - a1) / Math.abs(a1)) * 100;
}

// Per-module metric metadata used purely for phrasing the insights text —
// the numbers themselves always come from the ledger.
const INSIGHT_METRIC = {
  "Salary Distribution": { key: "salary",   label: "salary",         fmt: (v) => `$${Math.round(v).toLocaleString()}` },
  "Attrition Analysis":  { key: "overtime", label: "overtime hours", fmt: (v) => `${v.toFixed(1)}h` },
  "Training Impact":     { key: "training", label: "training hours", fmt: (v) => `${v.toFixed(1)}h` },
};

// Builds the full, expanded list of HR insights for the active module — all
// computed live from the uploaded CSV ledger, mirroring the depth of
// FinanceDashboard's generateInsights (trend, peak/trough, volatility,
// average benchmark, cohort comparison, closing audit line).
function generateInsights(ledger, activeFunc) {
  const insights = [];
  if (!ledger || !ledger.length) return insights;

  const m       = INSIGHT_METRIC[activeFunc];
  const total   = ledger.length;
  const series  = ledger.map(r => r[m.key]).filter(v => !isNaN(v));
  const flagged = ledger.filter(r => r.status === "CRITICAL").length;

  // 1. Headline trend across the workforce (earlier vs later upload half).
  const trend = computeTrend(ledger, m.key);
  if (trend !== null) {
    insights.push(
      `Average ${m.label} shows a ${Math.abs(trend).toFixed(1)}% ` +
      `${trend >= 0 ? "increase" : "decrease"} across the uploaded workforce records.`
    );
  }

  // 2. Average benchmark for the active metric.
  const avg = computeAverage(series);
  if (avg !== null) {
    insights.push(`Average ${m.label} across all ${total} employees stands at ${m.fmt(avg)}.`);
  }

  // 3. Peak / trough read, naming the actual employee IDs involved.
  const peakTrough = computePeakTrough(ledger, m.key);
  if (peakTrough) {
    insights.push(
      `${peakTrough.maxId} recorded the highest ${m.label} at ${m.fmt(peakTrough.max)}, ` +
      `while ${peakTrough.minId} recorded the lowest at ${m.fmt(peakTrough.min)}.`
    );
  }

  // 4. Volatility / spread read across the whole workforce.
  const volatility = computeVolatility(series);
  if (volatility !== null) {
    const stability = volatility < 10 ? "highly consistent" : volatility < 25 ? "moderately varied" : "highly varied";
    insights.push(
      `${m.label.charAt(0).toUpperCase() + m.label.slice(1)} has been ${stability} across the workforce, ` +
      `with a coefficient of variation of ${volatility.toFixed(1)}%.`
    );
  }

  // 5. Module-specific flagged-cohort read.
  if (activeFunc === "Attrition Analysis") {
    insights.push(
      `${flagged} employee${flagged !== 1 ? "s" : ""} (${((flagged / total) * 100).toFixed(1)}% of workforce) ` +
      `${flagged !== 1 ? "are" : "is"} currently flagged CRITICAL due to elevated overtime exposure.`
    );
  } else if (activeFunc === "Salary Distribution" && peakTrough && avg) {
    const spread = peakTrough.max - peakTrough.min;
    insights.push(
      `Salary spread across the workforce is $${spread.toLocaleString()}, ` +
      `representing a ${((spread / avg) * 100).toFixed(1)}% band around the average.`
    );
  } else if (activeFunc === "Training Impact") {
    const highTrained = ledger.filter(r => r.training > 20).length;
    insights.push(
      `${highTrained} employee${highTrained !== 1 ? "s" : ""} (${((highTrained / total) * 100).toFixed(1)}% of workforce) ` +
      `${highTrained !== 1 ? "have" : "has"} logged more than 20 hours of training.`
    );
  }

  // 6. Cross-metric cohort comparison — critical vs stable employees,
  // read against training investment, straight from the ledger.
  const criticalRows = ledger.filter(r => r.status === "CRITICAL");
  const stableRows   = ledger.filter(r => r.status === "STABLE");
  const avgTrainingCritical = computeAverage(criticalRows.map(r => r.training));
  const avgTrainingStable   = computeAverage(stableRows.map(r => r.training));
  if (avgTrainingCritical !== null && avgTrainingStable !== null) {
    insights.push(
      `Employees flagged CRITICAL average ${avgTrainingCritical.toFixed(1)}h of training versus ` +
      `${avgTrainingStable.toFixed(1)}h for stable employees, suggesting ` +
      `${avgTrainingCritical < avgTrainingStable
        ? "a possible link between lower training investment and retention risk"
        : "limited correlation between training exposure and attrition risk"}.`
    );
  }

  // 7. Closing audit line — dynamic based on how many records are flagged.
  insights.push(
    flagged > 0
      ? `${flagged} record${flagged !== 1 ? "s" : ""} flagged for HR review; all other employees are within normal operating parameters.`
      : "No anomalies detected in current workforce audit."
  );

  return insights;
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
export default function HRDashboard() {
  const [activeFunc,    setActiveFunc]    = useState("Salary Distribution");
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [isDragOver,    setIsDragOver]    = useState(false);
  const [notification,  setNotification]  = useState("");
  const [showManage,    setShowManage]    = useState(false);

  // ── Auth gate — mirrors ChatbotPage's isAuthResolving guard ───────────────
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser,     setCurrentUser]     = useState(null);
  const [storageKey,      setStorageKey]      = useState(guestKey);
  const [files,           setFiles]           = useState([]);

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
      // Handshake resolved — safe to allow writes
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync to localStorage whenever files or key change (guard mirrors chatbot)
  useEffect(() => {
    if (isAuthResolving) return; // never overwrite during auth init
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

  // ── Row normalizer ─────────────────────────────────────────────────────────
  const normalizeRow = (row, i) => {
    const findValue = (possibleKeys, indexFallback) => {
      for (let k of possibleKeys) {
        if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
        const nk = k.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "");
        if (row[nk] !== undefined && row[nk] !== null && row[nk] !== "") return row[nk];
      }
      const fallback = Object.values(row)[indexFallback];
      return fallback !== undefined ? fallback : 0;
    };
    const overtimeVal = parseFloat(findValue(["Overtime_Hours","Overtime","overtime_hours","overtime","ot"], 2)) || 0;
    return {
      id:       findValue(["Employee_ID","ID","id","employee_id","emp_id"], 0) || `EMP-${100 + i}`,
      salary:   parseFloat(findValue(["Monthly_Salary","Salary","monthly_salary","salary","pay"], 1)) || 0,
      overtime: overtimeVal,
      training: parseFloat(findValue(["Training_Hours","Training","training_hours","training","hours"], 3)) || 0,
      status:   (row.predicted_attrition === 1 || row.status === "CRITICAL" || row.prediction === 1 || overtimeVal > 20)
                  ? "CRITICAL" : "STABLE",
    };
  };

  // ─── Dashboard renderer ────────────────────────────────────────────────────
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
            Awaiting HR Insights
          </motion.div>
        </div>
      );
    }

    const ledger  = raw.ledger.map((row, i) => normalizeRow(row, i));
    const flagged = ledger.filter(l => l.status === "CRITICAL").length;
    const data    = { ...raw, ledger, flagged };

    const config = {
      "Salary Distribution": { kpi1: "Total Employees",    kpi2: "Avg Salary",    kpi3: "Total Payroll",   color: theme.primary, chartKey: "salary"   },
      "Attrition Analysis":  { kpi1: "Risk Flags",   kpi2: "Avg Overtime",  kpi3: "Retention Index", color: theme.danger,  chartKey: "overtime" },
      "Training Impact":     { kpi1: "Avg Training", kpi2: "Skill Upgrades",kpi3: "Efficiency Gain", color: theme.accent,  chartKey: "training" },
    }[activeFunc];

    const getKpiValues = () => {
      const total = data.total || 1;
      if (activeFunc === "Salary Distribution") {
        const totalPayroll = data.ledger.reduce((a, c) => a + c.salary, 0);
        return [data.total, `$${(totalPayroll / total).toFixed(0)}`, `$${totalPayroll.toLocaleString()}`];
      }
      if (activeFunc === "Attrition Analysis") {
        const avgOvertime = data.ledger.reduce((a, c) => a + c.overtime, 0) / total;
        return [data.flagged, `${avgOvertime.toFixed(1)}h`, "88.4%"];
      }
      const avgTraining = data.ledger.reduce((a, c) => a + c.training, 0) / total;
      return [`${avgTraining.toFixed(1)}h`, data.ledger.filter(x => x.training > 20).length, "94.2%"];
    };

    const getMetricHeaderName = () => {
      if (activeFunc === "Salary Distribution") return "Salary";
      if (activeFunc === "Attrition Analysis")  return "Overtime Hours";
      return "Training Hours";
    };

    const kpiVals = getKpiValues();

    // Full, expanded list of insights — all derived from the uploaded CSV
    // ledger data (trend, average benchmark, peak/trough, volatility,
    // flagged-cohort read, cross-metric comparison, closing audit line).
    const insights = generateInsights(data.ledger, activeFunc);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <KPICard title={config.kpi1} value={kpiVals[0]} color={config.color}  delay={0.1} />
          <KPICard title={config.kpi2} value={kpiVals[1]} color={theme.text}    delay={0.2} />
          <KPICard title={config.kpi3} value={kpiVals[2]} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", marginBottom: "30px", alignItems: "stretch" }}>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
            <div style={cardHeader}>{activeFunc} Matrix</div>
            <div style={{ flex: 1, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ledger.slice(0, 25)}>
                  <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="id" stroke={theme.subtext} fontSize={10} tickLine={false} />
                  <YAxis stroke={theme.subtext} fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }}
                  />
                  <Bar dataKey={config.chartKey} fill={config.color} radius={[4, 4, 0, 0]}>
                    {data.ledger.slice(0, 25).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === "CRITICAL" ? theme.danger : config.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.color}` }}>
            <div style={{ ...cardHeader, color: config.color }}>HR Insights</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "14px" }}>
              {insights.map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: config.color,
                    marginTop: "8px", flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "14px", lineHeight: "1.8", color: theme.text }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* ── Additional CSV-driven visualizations ── */}
        {(() => {
          const pieData = [
            { name: "Stable",   value: data.ledger.filter(r => r.status === "STABLE").length },
            { name: "Critical", value: data.ledger.filter(r => r.status === "CRITICAL").length },
          ];
          const pieColors = [theme.success, theme.danger];

          const trendData = data.ledger.map((r, i) => ({
            id: r.id,
            index: i + 1,
            value: r[config.chartKey],
          }));

          const stableRows   = data.ledger.filter(r => r.status === "STABLE");
          const criticalRows = data.ledger.filter(r => r.status === "CRITICAL");
          const cohortAvg = (rows) => rows.length
            ? rows.reduce((a, c) => a + c[config.chartKey], 0) / rows.length
            : 0;
          const cohortData = [
            { name: "Stable",   avg: Number(cohortAvg(stableRows).toFixed(1)) },
            { name: "Critical", avg: Number(cohortAvg(criticalRows).toFixed(1)) },
          ];

          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "25px", marginBottom: "30px" }}>

              {/* Status split pie chart */}
              <div style={cardStyle}>
                <div style={cardHeader}>Workforce Status Split</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={pieColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "12px", color: theme.subtext }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Trend line chart across ledger */}
              <div style={cardStyle}>
                <div style={cardHeader}>{getMetricHeaderName()} Trend</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="index" stroke={theme.subtext} fontSize={10} tickLine={false} />
                    <YAxis stroke={theme.subtext} fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                    <Tooltip
                      contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }}
                      labelFormatter={(i) => trendData[i - 1] ? trendData[i - 1].id : ""}
                    />
                    <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Cohort comparison bar chart */}
              <div style={cardStyle}>
                <div style={cardHeader}>Avg {getMetricHeaderName()}: Stable vs Critical</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cohortData}>
                    <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={theme.subtext} fontSize={11} tickLine={false} />
                    <YAxis stroke={theme.subtext} fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: theme.text }}
                    />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {cohortData.map((entry, index) => (
                        <Cell key={`cohort-cell-${index}`} fill={index === 1 ? theme.danger : theme.success} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          );
        })()}

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between" }}>
            <span>{activeFunc} System Ledger</span>
            <span style={{ color: theme.primary }}>Records</span>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{ padding: "15px" }}>Employee ID</th>
                <th>{getMetricHeaderName()}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{ padding: "15px", color: theme.primary, fontWeight: "600" }}>{row.id}</td>
                  <td style={{ color: theme.textMuted }}>
                    {activeFunc === "Salary Distribution" ? `$${row.salary.toLocaleString()}` :
                     activeFunc === "Attrition Analysis"  ? `${row.overtime}h` : `${row.training}h`}
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

  // ─── Auth resolving gate — shown while Firebase handshake completes ────────
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

      {/* ── Global overlays ── */}
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
            Business Analyzer | <span style={{ color: theme.primary }}>HR Dashboard</span>
          </h1>
          {/* Show which email's workspace is active */}
         
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
      <nav style={{ display: "flex", gap: "40px", marginBottom: "40px", borderBottom: `1px solid ${theme.border}` }}>
        {["Salary Distribution", "Attrition Analysis", "Training Impact"].map(tab => (
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
const trStyle             = { borderBottom: `1px solid ${theme.border}`, height: "55px", fontSize: "14px" };