// src/components/OperationsDashboard.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, Legend
} from 'recharts';
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// ============================================================
// ICONS — thin-stroke monochrome line icons (Vercel-dashboard style):
// currentColor stroke, ~1.7px weight, rounded caps, 24x24 viewBox.
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

// ---------- High-Clarity Unified Theme ----------
const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "#161b22",
  surface: "#21262d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  border: "#30363d",
  accent: "#8957e5",
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// Palette used for multi-slice charts (pie/donut) — pulled from the theme
// so new charts stay visually consistent with the rest of the system.
const PIE_COLORS = [theme.primary, theme.accent, theme.success, "#ffab40", "#f85149"];

// ============================================================
// BACKEND CONNECTION
// ============================================================
// All CSV parsing / prediction now happens server-side via FastAPI.
// POST /api/operations/predict?task=<task>  (multipart/form-data, field "file")
const API_BASE_URL = "http://localhost:8000";
const PREDICT_ENDPOINT = `${API_BASE_URL}/api/operations/predict`;

// ─── Module definitions ───────────────────────────────────────────────────────
// Each module calls the backend prediction endpoint with its own `task`.
// The backend returns `data_rows` — the parsed/enriched ledger — which is
// normalized (see normalizeBackendRow) into the same field names the rest of
// this dashboard already expects (risk_status, otif_status, profit, etc.).
const modules = [
  {
    id: "Risk Management",
    task: "risk",
    color: theme.danger,
    flagKey: "risk_status",
    flagValue: "LATE RISK",
    distributionLabels: ["Compliant", "Breach"],
    metricKey: "profit", metricLabel: "Profit",
    secondaryKey: "sales", secondaryLabel: "Sales",
    tertiaryKey: "quantity", tertiaryLabel: "Order Quantity",
    kpi1Label: "Throughput Units",
    kpi2Label: "Breach Flags",
    kpi3Label: "EBITDA Impact",
    kpi3Type: "sum",
    kpi3Format: "currency",
    chartTitle: "Financial Margin Stream",
  },
  {
    id: "Logistics Tracking",
    task: "otif",
    color: theme.primary,
    flagKey: "otif_status",
    flagValue: "LATE",
    distributionLabels: ["On-Time", "Late"],
    metricKey: "transit_days", metricLabel: "Transit Days",
    secondaryKey: "distance", secondaryLabel: "Distance",
    tertiaryKey: "quantity", tertiaryLabel: "Order Quantity",
    kpi1Label: "Shipments Tracked",
    kpi2Label: "Late Deliveries",
    kpi3Label: "Avg Transit Days",
    kpi3Type: "avg",
    kpi3Format: "number",
    chartTitle: "Geospatial OTIF Stream",
  },
];

const tabsList = modules.map(m => m.id);

// ── Storage key helpers ───────────────────────────────────────────────────────
const guestKey = "InsightIQ_Operations_Files_Guest";
const userKey  = (uid) => `InsightIQ_Operations_Files_User_${uid}`;

// ─── Generic helpers ──────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Maps the backend's `data_rows` field names onto the field names the rest of
// the dashboard already relies on (both the clean lowercase keys and the
// original keys are kept so nothing downstream needs to change).
const BACKEND_FIELD_MAP = {
  Id: "id",
  Month: "Month",
  Risk_Status: "risk_status",
  Otif_Status: "otif_status",
  Profit: "profit",
  Sales: "sales",
  Quantity: "quantity",
  Transit_Days: "transit_days",
  Distance: "distance",
};

function normalizeBackendRow(row) {
  const out = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    const mapped = BACKEND_FIELD_MAP[key] || key;
    out[mapped] = value;
    out[key] = value;
  });
  return out;
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
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

// Calls the backend prediction endpoint for a single file + task, returning
// the normalized ledger rows from `data_rows`.
async function fetchOperationsPredict(task, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${PREDICT_ENDPOINT}?task=${encodeURIComponent(task)}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Backend responded with status ${response.status}`);
  }

  const payload = await response.json();
  return (payload.data_rows || []).map(normalizeBackendRow);
}

// ── Pure numeric / statistical helpers (all computed from real ledger data) ──
function getNumericSeries(ledger, key) {
  return (ledger || [])
    .map(r => parseFloat(r?.[key]))
    .filter(v => !isNaN(v));
}

function computeAverage(series) {
  if (!series || !series.length) return null;
  return series.reduce((a, b) => a + b, 0) / series.length;
}

function computeVolatility(series) {
  if (!series || series.length < 2) return null;
  const avg = computeAverage(series);
  if (!avg) return null;
  const variance = series.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / series.length;
  const stdev = Math.sqrt(variance);
  return (stdev / Math.abs(avg)) * 100;
}

function computePeakTrough(ledger, key) {
  if (!ledger || !ledger.length) return null;
  let maxRow = null, minRow = null, maxIdx = 0, minIdx = 0;
  ledger.forEach((row, i) => {
    const v = parseFloat(row?.[key]);
    if (isNaN(v)) return;
    if (!maxRow || v > parseFloat(maxRow[key])) { maxRow = row; maxIdx = i; }
    if (!minRow || v < parseFloat(minRow[key])) { minRow = row; minIdx = i; }
  });
  if (!maxRow || !minRow) return null;
  return {
    max: parseFloat(maxRow[key]), maxLabel: maxRow.Month || maxRow.id || `record ${maxIdx + 1}`,
    min: parseFloat(minRow[key]), minLabel: minRow.Month || minRow.id || `record ${minIdx + 1}`,
  };
}

function trendForKey(ledger, key) {
  const series = getNumericSeries(ledger, key);
  if (series.length < 2) return null;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (prev === 0 || isNaN(prev) || isNaN(last)) return null;
  return ((last - prev) / Math.abs(prev)) * 100;
}

// Pearson correlation coefficient between two numeric series (paired by index).
function computeCorrelation(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  const xs2 = xs.slice(0, n), ys2 = ys.slice(0, n);
  const avgX = computeAverage(xs2), avgY = computeAverage(ys2);
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs2[i] - avgX, dy = ys2[i] - avgY;
    num += dx * dy; denX += dx * dx; denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

function describeCorrelation(r) {
  const abs = Math.abs(r);
  const strength = abs > 0.7 ? "strong" : abs > 0.4 ? "moderate" : "weak";
  const direction = r >= 0 ? "positive" : "negative";
  return `${strength} ${direction}`;
}

// Reads a status column with graceful fallback across common alternates,
// so a ledger row only needs one of risk_status / otif_status / status present.
function readFlag(row, config) {
  const raw = row?.[config.flagKey] ?? row?.risk_status ?? row?.otif_status ?? row?.status;
  return String(raw ?? "").trim().toUpperCase();
}

// Aggregate stats for the active module, derived entirely from the ledger.
function computeModuleMetrics(ledger, config) {
  const total = ledger.length;
  const flagValueNorm = String(config.flagValue).toUpperCase();
  const flagged = ledger.filter(row => readFlag(row, config) === flagValueNorm).length;
  const compliant = total - flagged;

  const metricSeries = getNumericSeries(ledger, config.metricKey);
  const sumMetric = metricSeries.reduce((a, b) => a + b, 0);
  const avgMetric = computeAverage(metricSeries);

  return {
    total, flagged, compliant, sumMetric, avgMetric,
    distribution: [
      { name: config.distributionLabels[0], value: compliant },
      { name: config.distributionLabels[1], value: flagged },
    ],
  };
}

// Builds the expanded, dynamic insight list for the active module.
function generateOperationsInsights(ledger, config, metrics) {
  const insights = [];
  if (!ledger || !ledger.length) return insights;

  const breachRate = metrics.total > 0 ? (metrics.flagged / metrics.total) * 100 : 0;
  insights.push(
    `${config.distributionLabels[1]} events account for ${breachRate.toFixed(1)}% of all ${metrics.total} tracked records in the uploaded ledger.`
  );

  const trendPct = trendForKey(ledger, config.metricKey);
  if (trendPct !== null) {
    insights.push(
      `${config.metricLabel} has ${trendPct >= 0 ? "increased" : "decreased"} ${Math.abs(trendPct).toFixed(1)}% from the prior reporting period.`
    );
  }

  const peakTrough = computePeakTrough(ledger, config.metricKey);
  if (peakTrough) {
    insights.push(
      `${config.metricLabel} peaked at ${peakTrough.max.toFixed(2)} (${peakTrough.maxLabel}) and bottomed at ${peakTrough.min.toFixed(2)} (${peakTrough.minLabel}).`
    );
  }

  const volatility = computeVolatility(getNumericSeries(ledger, config.metricKey));
  if (volatility !== null) {
    const stability = volatility < 10 ? "highly stable" : volatility < 25 ? "moderately volatile" : "highly volatile";
    insights.push(
      `${config.id} has been ${stability}, with a coefficient of variation of ${volatility.toFixed(1)}% on ${config.metricLabel.toLowerCase()}.`
    );
  }

  if (metrics.avgMetric !== null) {
    insights.push(
      `Average ${config.metricLabel.toLowerCase()} across all ${metrics.total} records sits at ${metrics.avgMetric.toFixed(2)}.`
    );
  }

  const secondarySeries = getNumericSeries(ledger, config.secondaryKey);
  const metricSeries = getNumericSeries(ledger, config.metricKey);
  if (secondarySeries.length >= 2 && metricSeries.length >= 2) {
    const corr = computeCorrelation(metricSeries, secondarySeries);
    if (corr !== null) {
      insights.push(
        `${config.metricLabel} and ${config.secondaryLabel} show a ${describeCorrelation(corr)} correlation (r = ${corr.toFixed(2)}) across the dataset.`
      );
    }
  }

  return insights;
}

// ── Chart-data builders — everything below is derived straight from the
// backend-returned ledger for the active module, no hardcoded/mock numbers. ──
function buildTimeSeriesData(ledger, keys, limit = 20) {
  return (ledger || []).slice(-limit).map((row, i) => {
    const point = { Month: row.Month || row.id || `#${i + 1}` };
    keys.forEach(k => {
      const v = parseFloat(row?.[k]);
      point[k] = isNaN(v) ? 0 : v;
    });
    return point;
  });
}

function buildKPIComparisonData(config, metrics) {
  const kpi3Value = config.kpi3Type === "sum" ? metrics.sumMetric : metrics.avgMetric;
  return [
    { name: config.kpi1Label, value: metrics.total },
    { name: config.kpi2Label, value: metrics.flagged },
    { name: config.kpi3Label, value: Math.abs(kpi3Value || 0) },
  ];
}

function buildRadarData(ledger, config) {
  const lastEntry = ledger[ledger.length - 1] || {};
  const dims = [
    { key: config.metricKey, label: config.metricLabel },
    { key: config.secondaryKey, label: config.secondaryLabel },
    { key: config.tertiaryKey, label: config.tertiaryLabel },
  ];
  return dims.map(({ key, label }) => {
    const avg = computeAverage(getNumericSeries(ledger, key)) || 0;
    const cur = parseFloat(lastEntry?.[key]);
    return { metric: label, current: isNaN(cur) ? 0 : cur, average: avg };
  });
}

function buildScatterData(ledger, config) {
  return (ledger || [])
    .map(row => ({
      x: parseFloat(row?.[config.metricKey]),
      y: parseFloat(row?.[config.secondaryKey]),
    }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));
}

function formatKPIValue(value, format) {
  if (value === null || value === undefined || isNaN(value)) return format === "currency" ? "$0.00" : "0";
  return format === "currency" ? `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : Number(value).toFixed(2);
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
    <Icons.File size={14} />
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
    <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: theme.fontMono }}>{value}</div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OperationsDashboard() {
  const [activeFunc, setActiveFunc] = useState(tabsList[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState("");
  const [showManage, setShowManage] = useState(false);

  // ── Auth gate ───────────────────────────────────────────────────────────────
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageKey, setStorageKey] = useState(guestKey);
  const [files, setFiles] = useState([]);

  // ── Backend-driven ledgers, one per module, keyed by module id ─────────────
  // { [moduleId]: { ledger: [...], loading: bool, error: string|null } }
  const [moduleLedgers, setModuleLedgers] = useState(() =>
    modules.reduce((acc, m) => ({ ...acc, [m.id]: { ledger: [], loading: false, error: null } }), {})
  );

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

  // 3. Whenever the file set changes, re-run predictions against the backend
  //    for every module (each module hits the endpoint with its own `task`).
  useEffect(() => {
    if (isAuthResolving) return;

    if (files.length === 0) {
      setModuleLedgers(modules.reduce((acc, m) => ({ ...acc, [m.id]: { ledger: [], loading: false, error: null } }), {}));
      return;
    }

    let cancelled = false;

    modules.forEach(async (mod) => {
      setModuleLedgers(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], loading: true, error: null } }));
      try {
        const results = await Promise.all(
          files.map(f => fetchOperationsPredict(mod.task, new File([f.content], f.name, { type: "text/csv" })))
        );
        const merged = results.flat();
        if (!cancelled) {
          setModuleLedgers(prev => ({ ...prev, [mod.id]: { ledger: merged, loading: false, error: null } }));
        }
      } catch (err) {
        console.error(`Backend prediction failed for task "${mod.task}":`, err);
        if (!cancelled) {
          setModuleLedgers(prev => ({ ...prev, [mod.id]: { ledger: [], loading: false, error: err.message || "Backend request failed" } }));
        }
      }
    });

    return () => { cancelled = true; };
  }, [files, isAuthResolving]);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);

  // ── Read raw File objects into text content (parsing now happens server-side) ──
  const readRawFiles = (rawFiles) =>
    Promise.all(
      rawFiles.map(raw =>
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve({
            name: raw.name, size: raw.size, content: e.target.result,
          });
          reader.readAsText(raw);
        })
      )
    );

  const mergeInto = (prev, incoming) => {
    const existing = new Set(prev.map(f => f.name));
    return [...prev, ...incoming.filter(f => !existing.has(f.name))];
  };

  const processAndAdd = async (rawFiles) => {
    if (!rawFiles.length) return;
    setIsProcessing(true);
    try {
      const processed = await readRawFiles(rawFiles);
      const existingNames = new Set(files.map(f => f.name));
      const uniqueProcessed = processed.filter(f => !existingNames.has(f.name));

      if (uniqueProcessed.length > 0) {
        setFiles(prev => mergeInto(prev, uniqueProcessed));
        showNotification("Files uploaded — syncing with backend prediction engine");
      } else {
        showNotification("No new files to add");
      }
    } catch (err) {
      console.error("File read error:", err);
      showNotification("⚠️ Could not read one or more files");
    } finally {
      setIsProcessing(false);
    }
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
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  // ─── Dashboard renderer ────────────────────────────────────────────────────
  const renderContent = () => {
    const config = modules.find(m => m.id === activeFunc);
    const moduleState = moduleLedgers[activeFunc] || { ledger: [], loading: false, error: null };

    if (moduleState.loading) {
      return (
        <div style={emptyStateStyle}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 36, height: 36, border: `3px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%", marginBottom: 16 }} />
        </div>
      );
    }

    if (moduleState.error) {
      return (
        <div style={{ ...emptyStateStyle, flexDirection: "column", gap: "10px", borderColor: "rgba(248,81,73,0.4)" }}>
          <div style={{ color: theme.danger, fontSize: "14px", fontWeight: "700" }}>Backend request failed</div>
          <div style={{ color: theme.subtext, fontSize: "12px" }}>{moduleState.error}</div>
        </div>
      );
    }

    const ledger = moduleState.ledger;

    if (!ledger || ledger.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontSize: '14px', fontWeight: '600' }}>
            Awaiting Operations Insights
          </motion.div>
        </div>
      );
    }

    const metrics = computeModuleMetrics(ledger, config);
    const insights = generateOperationsInsights(ledger, config, metrics);

    const history = buildTimeSeriesData(ledger, [config.metricKey], 20).map((p, i) => ({ x: i, y: p[config.metricKey] }));
    const multiMetricData = buildTimeSeriesData(ledger, [config.metricKey, config.secondaryKey, config.tertiaryKey], 12);
    const composedData = buildTimeSeriesData(ledger, [config.metricKey], 12).map(p => ({ Month: p.Month, value: p[config.metricKey] }));
    const kpiComparisonData = buildKPIComparisonData(config, metrics);
    const radarData = buildRadarData(ledger, config);
    const scatterData = buildScatterData(ledger, config);

    const kpi3Value = config.kpi3Type === "sum" ? metrics.sumMetric : metrics.avgMetric;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title={config.kpi1Label} value={metrics.total} color={theme.text} delay={0.1} />
          <KPICard title={config.kpi2Label} value={metrics.flagged} color={theme.danger} delay={0.2} />
          <KPICard title={config.kpi3Label} value={formatKPIValue(kpi3Value, config.kpi3Format)} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '25px', marginBottom: '30px', alignItems: 'stretch' }}>
          <div style={chartCardStyle}>
            <div style={cardHeader}>Compliance Ratio</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.distribution} innerRadius="52%" outerRadius="92%" paddingAngle={5} dataKey="value">
                    <Cell fill={theme.success} stroke="none" />
                    <Cell fill={theme.danger} stroke="none" />
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={chartCardStyle}>
            <div style={cardHeader}>{config.chartTitle}</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Area type="monotone" dataKey="y" stroke={config.color} fill="url(#colorAcc)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...chartCardStyle, borderLeft: `4px solid ${config.color}` }}>
            <div style={{ ...cardHeader, color: config.color }}>Operational Insights</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px", flex: 1 }}>
              {insights.map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.color, marginTop: "7px", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", lineHeight: "1.6", color: theme.text }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Advanced Analytics — additional chart types, all computed live
             from the backend-returned ledger for the active module ── */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ ...cardHeader, marginBottom: "16px" }}>Advanced Analytics</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px', alignItems: 'stretch' }}>

          {/* Bar chart: current KPI comparison */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>KPI Comparison</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiComparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: theme.subtext, fontSize: 11 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                  <YAxis tick={{ fill: theme.subtext, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line chart: multi-metric trend across reporting periods */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>Multi-Metric Trend</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiMetricData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="Month" tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                  <YAxis tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey={config.metricKey} name={config.metricLabel} stroke={theme.primary} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={config.secondaryKey} name={config.secondaryLabel} stroke={theme.accent} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={config.tertiaryKey} name={config.tertiaryLabel} stroke={theme.success} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart: current KPI composition */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>KPI Composition</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={kpiComparisonData} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="80%" paddingAngle={3}>
                    {kpiComparisonData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar chart: current vs average benchmark */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>Current vs Average Benchmark</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke={theme.border} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: theme.subtext, fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: theme.subtext, fontSize: 9 }} axisLine={false} />
                  <Radar name="Current" dataKey="current" stroke={config.color} fill={config.color} fillOpacity={0.3} />
                  <Radar name="Average" dataKey="average" stroke={theme.subtext} fill={theme.subtext} fillOpacity={0.12} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter chart: correlation between the module's primary and secondary metric */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>{config.metricLabel} vs {config.secondaryLabel} Correlation</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={theme.border} strokeDasharray="3 3" />
                  <XAxis dataKey="x" name={config.metricLabel} tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                  <YAxis dataKey="y" name={config.secondaryLabel} tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Scatter data={scatterData} fill={config.color} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Composed chart: core metric as bar + trend line overlay */}
          <div style={chartCardStyle}>
            <div style={cardHeader}>{config.metricLabel} — Composed View</div>
            <div style={chartWrapStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={composedData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="Month" tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                  <YAxis tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Bar dataKey="value" fill={config.color} fillOpacity={0.25} radius={[3, 3, 0, 0]} />
                  <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Supply Chain Audit Ledger</div>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{ padding: '15px' }}>Log ID</th>
                  <th>Status</th>
                  <th>{config.metricLabel}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.slice(-10).map((row, i) => {
                  const flagged = readFlag(row, config) === String(config.flagValue).toUpperCase();
                  const val = parseFloat(row?.[config.metricKey]);
                  return (
                    <tr key={i} style={trStyle}>
                      <td style={{ padding: '15px', color: theme.primary, fontWeight: '600' }}>{row.id || `NEURAL-${String(i + 1).padStart(3, '0')}`}</td>
                      <td>
                        <span style={{
                          background: flagged ? 'rgba(248, 81, 73, 0.1)' : 'rgba(63, 185, 80, 0.1)',
                          color: flagged ? theme.danger : theme.success,
                          padding: '5px 12px', borderRadius: '6px',
                          border: `1px solid ${flagged ? 'rgba(248, 81, 73, 0.2)' : 'rgba(63, 185, 80, 0.2)'}`,
                          fontSize: '11px', fontWeight: '800'
                        }}>
                          {flagged ? config.distributionLabels[1] : config.distributionLabels[0]}
                        </span>
                      </td>
                      <td style={{ color: !isNaN(val) ? (val >= 0 ? theme.success : theme.danger) : theme.text, fontWeight: '700', fontFamily: theme.fontMono }}>
                        {!isNaN(val) ? val.toFixed(2) : "0.00"}
                      </td>
                    </tr>
                  );
                })}
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

      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
            Business Analyzer | <span style={{ color: theme.primary }}>Operations Dashboard</span>
          </h1>
        </div>

        {/* ── Manage Files toggle ── */}
        <button
          onClick={() => setShowManage(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: "8px",
            border: showManage ? "1px solid rgba(88,166,255,0.5)" : `1px solid ${theme.border}`,
            background: showManage ? "rgba(88,166,255,0.1)" : theme.card,
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
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: theme.primary }}>
                  {isDragOver ? <Icons.Upload size={26} /> : <Icons.BarChart size={26} />}
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

      {/* ── Nav tabs ── */}
      <nav style={{ display: 'flex', gap: '40px', marginBottom: '40px', borderBottom: `1px solid ${theme.border}` }}>
        {tabsList.map(tab => (
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

// ─── Shared styles ────────────────────────────────────────────────────────────
const cardStyle          = { background: theme.card, padding: "25px", borderRadius: "12px", border: `1px solid ${theme.border}` };
// chartCardStyle: same as cardStyle but stretches to fill the grid row height
// (via CSS Grid's default/explicit align-items: stretch on the parent) and
// lays its children out as a column so the chart wrapper can grow to fill
// all remaining vertical space instead of sitting in a fixed-px box.
const chartCardStyle      = { ...cardStyle, display: "flex", flexDirection: "column", height: "100%", minHeight: "300px" };
// chartWrapStyle: the flexible region inside a chart card that the
// ResponsiveContainer (height="100%") expands into — this is what makes the
// chart cover the whole card instead of leaving empty space around it.
const chartWrapStyle      = { flex: 1, minHeight: 0, width: "100%" };
const cardHeader          = { fontSize: "12px", color: theme.subtext, marginBottom: "20px", fontWeight: "800", letterSpacing: "0.5px", textTransform: "uppercase" };
const uploadButtonStyle   = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle     = { height: "400px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "16px" };
const loaderOverlayStyle  = { position: "fixed", inset: 0, background: "rgba(13,17,23,0.95)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" };
const notificationStyle   = { position: "fixed", bottom: "30px", right: "30px", background: theme.success, color: "#fff", padding: "15px 25px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
const tableStyle          = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thStyle             = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: "13px", fontWeight: "700" };
const trStyle             = { borderBottom: `1px solid ${theme.border}`, height: "55px", fontSize: "14px" };