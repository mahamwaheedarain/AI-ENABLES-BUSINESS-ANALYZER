// src/components/SalesDashboard.js
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
  accent: "#8957e5",
  success: "#3fb950",
  danger: "#da3633",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const PIE_COLORS = [theme.primary, theme.accent, theme.success, "#ffab40", "#da3633"];

// ─── Prediction service connection ────────────────────────────────────────────
// Matches the running Swagger contract: POST /api/sales/predict?task=<task>
// with a required multipart/form-data "file" field (see docs at
// localhost:8000/docs#/default/sales_predict_api_sales_predict_post).
const API_BASE = "http://localhost:8000/api/sales/predict";

// ─── Module / tab definitions ─────────────────────────────────────────────────
// `task` is the exact query param sent to the prediction endpoint for that tab.
// `metricKeys` are candidate field names to look for in the API's response
// item for that row (adjust these if your backend uses different field
// names — the extractor also falls back to any numeric field it finds).
// `secondaryKeys` / `tertiaryKeys` pull extra context straight from the
// uploaded CSV's own columns (not the API), so charts always have something
// to compare the prediction against even if the API only returns a scalar.
const modules = [
  {
    id: "Revenue",
    task: "amazon_revenue",
    color: theme.primary,
    title: "Revenue Forecast Matrix",
    metricLabel: "Predicted Revenue",
    metricKeys: ["predicted_revenue", "revenue", "Revenue", "amazon_revenue", "Amazon_Revenue", "prediction", "value"],
    secondaryKeys: ["Quantity", "quantity", "Units", "units", "UnitsSold", "Sales", "sales"],
    secondaryLabel: "Units Sold",
    tertiaryKeys: ["Price", "price", "UnitPrice", "unit_price", "Cost", "cost"],
    tertiaryLabel: "Unit Price",
    kpi1Label: "Records Analyzed",
    kpi2Label: "Net Forecast",
    kpi2Format: "currency",
    kpi3Label: "Model Stability",
  },
  {
    id: "Marketing ROI",
    task: "marketing_roi",
    color: theme.accent,
    title: "Capital Efficiency Logs",
    metricLabel: "Predicted ROI",
    metricKeys: ["predicted_roi", "roi", "ROI", "marketing_roi", "Marketing_ROI", "prediction", "value"],
    secondaryKeys: ["Spend", "spend", "Ad_Spend", "ad_spend", "Budget", "budget"],
    secondaryLabel: "Ad Spend",
    tertiaryKeys: ["Clicks", "clicks", "Impressions", "impressions", "Conversions", "conversions"],
    tertiaryLabel: "Impressions",
    kpi1Label: "Campaigns Analyzed",
    kpi2Label: "Net Attribution",
    kpi2Format: "number",
    kpi3Label: "Channel Efficiency",
  },
  {
    id: "Customer Churn",
    task: "customer_churn",
    color: theme.danger,
    title: "Risk Probability Dashboard",
    metricLabel: "Churn Probability",
    metricKeys: ["predicted_churn", "churn", "Churn", "churn_rate", "Churn_Rate", "customer_churn", "prediction", "value"],
    secondaryKeys: ["Tenure", "tenure", "Account_Age", "account_age"],
    secondaryLabel: "Account Tenure",
    tertiaryKeys: ["Support_Tickets", "support_tickets", "Tickets", "tickets"],
    tertiaryLabel: "Support Tickets",
    kpi1Label: "Customers Analyzed",
    kpi2Label: "At-Risk Impact",
    kpi2Format: "number",
    kpi3Label: "Churn Velocity",
  },
];

const tabsList = modules.map(m => m.id);

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
  const rows = (text || "").split("\n").filter(r => r.trim() !== "");
  if (rows.length <= 1) return [];
  const headers = rows[0].split(",").map(h => h.trim());
  return rows.slice(1).map(row => {
    const values = row.split(",");
    return headers.reduce((obj, header, index) => {
      const val = values[index]?.trim();
      const cleanHeader = header.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
      const num = parseFloat(val);
      obj[cleanHeader] = isNaN(num) || val === "" ? val : num;
      obj[header] = isNaN(num) || val === "" ? val : num;
      return obj;
    }, {});
  });
}

// Pulls a numeric value off a row, tolerant of header spelling/casing
// differences, falling back to the first numeric field present.
function extractMetricValue(row, possibleKeys) {
  for (const k of possibleKeys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && v !== "" && !isNaN(v)) return Number(v);
    const normalizedKey = k.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');
    const v2 = row?.[normalizedKey];
    if (v2 !== undefined && v2 !== null && v2 !== "" && !isNaN(v2)) return Number(v2);
  }
  for (const v of Object.values(row || {})) {
    if (v !== "" && v !== null && v !== undefined && !isNaN(v) && isFinite(Number(v))) return Number(v);
  }
  return 0;
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
      files.map(({ name, size, dataStoreFragment }) => ({ name, size, dataStoreFragment }))
    ));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// Merges every uploaded file's per-tab fragment into one combined ledger
// per tab, across all uploaded files.
function buildDataStore(files) {
  const store = {};
  modules.forEach(mod => {
    let combinedLedger = [];
    files.forEach(f => {
      const frag = f.dataStoreFragment?.[mod.id];
      if (frag?.ledger?.length) combinedLedger = [...combinedLedger, ...frag.ledger];
    });
    store[mod.id] = { ledger: combinedLedger, total: combinedLedger.length };
  });
  return store;
}

// ── Pure numeric / statistical helpers (all computed from real ledger data) ──
function getNumericSeries(ledger, key) {
  return (ledger || []).map(r => parseFloat(r?.[key])).filter(v => !isNaN(v));
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
  return (Math.sqrt(variance) / Math.abs(avg)) * 100;
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
  const last = series[series.length - 1], prev = series[series.length - 2];
  if (prev === 0 || isNaN(prev) || isNaN(last)) return null;
  return ((last - prev) / Math.abs(prev)) * 100;
}
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
  return `${strength} ${r >= 0 ? "positive" : "negative"}`;
}

// Finds whichever candidate column name is actually present in the ledger.
function resolveKey(ledger, candidates) {
  if (!ledger || !ledger.length) return candidates[0];
  const sample = ledger[0];
  for (const c of candidates) {
    if (sample[c] !== undefined) return c;
    const clean = c.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '');
    if (sample[clean] !== undefined) return clean;
  }
  return candidates[0];
}

// Aggregate stats for the active module's prediction column.
function computeSalesMetrics(ledger) {
  const total = ledger.length;
  const series = getNumericSeries(ledger, "__prediction");
  const sum = series.reduce((a, b) => a + b, 0);
  const avg = computeAverage(series);
  const volatility = computeVolatility(series);
  return { total, sum, avg, volatility };
}

// Builds the expanded, dynamic insight list for the active module.
// NOTE: copy is deliberately framed as business analysis — no mention of the
// underlying model, service, or infrastructure that produced the numbers.
function generateSalesInsights(ledger, config, metrics, secondaryKey) {
  const insights = [];
  if (!ledger || !ledger.length) return insights;

  insights.push(
    `Across ${metrics.total} records analyzed for ${config.id}, the average ${config.metricLabel.toLowerCase()} came in at ${metrics.avg !== null ? metrics.avg.toFixed(2) : "0.00"}.`
  );

  const trendPct = trendForKey(ledger, "__prediction");
  if (trendPct !== null) {
    insights.push(
      `${config.metricLabel} has ${trendPct >= 0 ? "risen" : "fallen"} ${Math.abs(trendPct).toFixed(1)}% between the last two records in the uploaded ledger.`
    );
  }

  const peakTrough = computePeakTrough(ledger, "__prediction");
  if (peakTrough) {
    insights.push(
      `${config.metricLabel} peaked at ${peakTrough.max.toFixed(2)} (${peakTrough.maxLabel}) and bottomed at ${peakTrough.min.toFixed(2)} (${peakTrough.minLabel}).`
    );
  }

  if (metrics.volatility !== null) {
    const stability = metrics.volatility < 10 ? "highly stable" : metrics.volatility < 25 ? "moderately volatile" : "highly volatile";
    insights.push(
      `${config.metricLabel} has been ${stability} across the dataset, with a coefficient of variation of ${metrics.volatility.toFixed(1)}%.`
    );
  }

  if (secondaryKey) {
    const secondarySeries = getNumericSeries(ledger, secondaryKey);
    const predictionSeries = getNumericSeries(ledger, "__prediction");
    if (secondarySeries.length >= 2 && predictionSeries.length >= 2) {
      const corr = computeCorrelation(predictionSeries, secondarySeries);
      if (corr !== null) {
        insights.push(
          `${config.metricLabel} shows a ${describeCorrelation(corr)} correlation (r = ${corr.toFixed(2)}) with ${config.secondaryLabel.toLowerCase()} across all records.`
        );
      }
    }
  }

  return insights;
}

// ── Chart-data builders — all derived from the enriched ledger (CSV rows +
// prediction service results merged together) for the active module. ───────
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

function buildKPIComparisonData(config, metrics, secondaryKey, secondaryLedger) {
  const secondaryAvg = computeAverage(getNumericSeries(secondaryLedger, secondaryKey)) || 0;
  return [
    { name: "Records", value: metrics.total },
    { name: config.metricLabel, value: Math.abs(metrics.avg || 0) },
    { name: config.secondaryLabel, value: Math.abs(secondaryAvg) },
  ];
}

function buildRadarData(ledger, config, secondaryKey, tertiaryKey) {
  const lastEntry = ledger[ledger.length - 1] || {};
  const dims = [
    { key: "__prediction", label: config.metricLabel },
    { key: secondaryKey, label: config.secondaryLabel },
    { key: tertiaryKey, label: config.tertiaryLabel },
  ];
  return dims.map(({ key, label }) => {
    const avg = computeAverage(getNumericSeries(ledger, key)) || 0;
    const cur = parseFloat(lastEntry?.[key]);
    return { metric: label, current: isNaN(cur) ? 0 : cur, average: avg };
  });
}

function buildScatterData(ledger, secondaryKey) {
  return (ledger || [])
    .map(row => ({ x: parseFloat(row?.__prediction), y: parseFloat(row?.[secondaryKey]) }))
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
export default function SalesDashboard() {
  const [activeFunc, setActiveFunc] = useState(tabsList[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState("");
  const [showManage, setShowManage] = useState(false);

  // Auth gate
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageKey, setStorageKey] = useState(guestKey);
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

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

  useEffect(() => {
    if (isAuthResolving) return;
    saveToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);
  const dataStore = useMemo(() => buildDataStore(files), [files]);

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  // ── Process & add files: call the prediction endpoint once per tab (task)
  // for each uploaded file, then merge the response with the raw CSV row it
  // corresponds to (by index) so secondary/tertiary CSV columns stay
  // available for the extra charts even though the API only scores the
  // target metric. ──────────────────────────────────────────────────────────
  const processAndAdd = async (rawFiles) => {
    if (!rawFiles.length) return;
    setIsProcessing(true);

    const existingNames = new Set(files.map(f => f.name));
    const uniqueRawFiles = rawFiles.filter(rf => !existingNames.has(rf.name));
    const incomingProcessedFiles = [];

    try {
      for (const file of uniqueRawFiles) {
        const csvText = await file.text();
        const csvRows = parseCSV(csvText);
        const dataStoreFragment = {};
        let anyTabSucceeded = false;

        for (const mod of modules) {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch(`${API_BASE}?task=${mod.task}`, {
              method: "POST",
              body: formData,
            });
            const result = await response.json();

            if (result && result.status !== "error") {
              // Accepts a few common response shapes: sales_data / predictions / data.
              const predicted = result.sales_data || result.predictions || result.data || [];

              const enrichedLedger = csvRows.map((row, i) => {
                const predictionItem = predicted[i];
                const predictionSource = predictionItem && typeof predictionItem === "object"
                  ? predictionItem
                  : { prediction: predictionItem };
                const merged = { ...row, ...predictionSource };
                const predictionValue = extractMetricValue(merged, mod.metricKeys);
                return { ...merged, __prediction: predictionValue };
              });

              dataStoreFragment[mod.id] = { ledger: enrichedLedger };
              anyTabSucceeded = true;
            }
          } catch (apiErr) {
            console.error(`Prediction request failed for task=${mod.task}:`, apiErr);
          }
        }

        if (anyTabSucceeded) {
          incomingProcessedFiles.push({ name: file.name, size: file.size, dataStoreFragment });
        } else {
          showNotification(`⚠️ No results returned for ${file.name}`);
        }
      }

      if (incomingProcessedFiles.length > 0) {
        setFiles(prev => [...prev, ...incomingProcessedFiles]);
        showNotification("Sales metrics updated");
      }
    } catch (err) {
      console.error("Critical processing error:", err);
      showNotification("⚠️ Something went wrong while processing your files — please try again");
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
    const data = dataStore[activeFunc];
    const config = modules.find(m => m.id === activeFunc);

    if (!data || !data.ledger || data.ledger.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '14px', fontWeight: '600', color: theme.primary }}>
            Awaiting Commercial Insights
          </motion.div>
        </div>
      );
    }

    const ledger = data.ledger;
    const metrics = computeSalesMetrics(ledger);
    const secondaryKey = resolveKey(ledger, config.secondaryKeys);
    const tertiaryKey = resolveKey(ledger, config.tertiaryKeys);
    const insights = generateSalesInsights(ledger, config, metrics, secondaryKey);

    const history = buildTimeSeriesData(ledger, ["__prediction"], 30).map((p, i) => ({ x: i, y: p.__prediction }));
    const multiMetricData = buildTimeSeriesData(ledger, ["__prediction", secondaryKey, tertiaryKey], 12);
    const composedData = buildTimeSeriesData(ledger, ["__prediction"], 12).map(p => ({ Month: p.Month, value: p.__prediction }));
    const kpiComparisonData = buildKPIComparisonData(config, metrics, secondaryKey, ledger);
    const radarData = buildRadarData(ledger, config, secondaryKey, tertiaryKey);
    const scatterData = buildScatterData(ledger, secondaryKey);

    // Above/below average split — used for the compliance-style pie.
    const aboveAvg = ledger.filter(r => parseFloat(r.__prediction) >= (metrics.avg || 0)).length;
    const belowAvg = metrics.total - aboveAvg;
    const distribution = [
      { name: "At/Above Average", value: aboveAvg },
      { name: "Below Average", value: belowAvg },
    ];

    const stabilityLabel = metrics.volatility === null ? "N/A"
      : metrics.volatility < 10 ? "Stable"
      : metrics.volatility < 25 ? "Moderate"
      : "Volatile";

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title={config.kpi1Label} value={metrics.total} color={theme.text} delay={0.1} />
          <KPICard title={config.kpi2Label} value={formatKPIValue(metrics.sum, config.kpi2Format)} color={config.color} delay={0.2} />
          <KPICard title={config.kpi3Label} value={stabilityLabel} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '25px', marginBottom: '30px', alignItems: 'stretch' }}>
          {/* Each card below is a flex column with the chart/content wrapper set
              to flex:1, so all three cards stretch to match the tallest one
              (usually the insights list) and the charts fill that full height
              instead of leaving empty space under a fixed pixel height. */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
            <div style={cardHeader}>Prediction Distribution</div>
            <div style={{ flex: 1, minHeight: 180, display: "flex", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} innerRadius="38%" outerRadius="65%" paddingAngle={8} dataKey="value">
                    <Cell fill={config.color} stroke="none" />
                    <Cell fill={theme.border} stroke="none" />
                  </Pie>
                  <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
            <div style={cardHeader}>{config.title}</div>
            <div style={{ flex: 1, minHeight: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="y" stroke={config.color} fill="url(#colorSales)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.color}`, display: "flex", flexDirection: "column" }}>
            <div style={{ ...cardHeader, color: config.color }}>Sales Insights</div>
            <ul style={{ flex: 1, margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "space-between" }}>
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
             from the merged CSV + prediction ledger ── */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ ...cardHeader, marginBottom: "16px" }}>Advanced Analytics</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '30px' }}>

          {/* Bar chart: KPI comparison */}
          <div style={cardStyle}>
            <div style={cardHeader}>KPI Comparison</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpiComparisonData}>
                <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: theme.subtext, fontSize: 11 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                <YAxis tick={{ fill: theme.subtext, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart: multi-metric trend */}
          <div style={cardStyle}>
            <div style={cardHeader}>Multi-Metric Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={multiMetricData}>
                <CartesianGrid stroke={theme.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="Month" tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                <YAxis tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="__prediction" name={config.metricLabel} stroke={theme.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={secondaryKey} name={config.secondaryLabel} stroke={theme.accent} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={tertiaryKey} name={config.tertiaryLabel} stroke={theme.success} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart: KPI composition */}
          <div style={cardStyle}>
            <div style={cardHeader}>KPI Composition</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={kpiComparisonData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {kpiComparisonData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart: current vs average benchmark */}
          <div style={cardStyle}>
            <div style={cardHeader}>Current vs Average Benchmark</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
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

          {/* Scatter chart: prediction vs secondary metric correlation */}
          <div style={cardStyle}>
            <div style={cardHeader}>{config.metricLabel} vs {config.secondaryLabel} Correlation</div>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart>
                <CartesianGrid stroke={theme.border} strokeDasharray="3 3" />
                <XAxis dataKey="x" name={config.metricLabel} tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                <YAxis dataKey="y" name={config.secondaryLabel} tick={{ fill: theme.subtext, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                <Scatter data={scatterData} fill={config.color} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Composed chart: prediction bar + trend line overlay */}
          <div style={cardStyle}>
            <div style={cardHeader}>{config.metricLabel} — Composed View</div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={composedData}>
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

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
            <span style={{ color: theme.text }}>{activeFunc} Audit Ledger</span>
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={thStyle}>
                  <th style={{ padding: '15px' }}>Record</th>
                  <th>{config.metricLabel}</th>
                  <th>{config.secondaryLabel}</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.slice(-15).map((row, i) => {
                  const val = parseFloat(row.__prediction);
                  const secVal = parseFloat(row?.[secondaryKey]);
                  const above = !isNaN(val) && val >= (metrics.avg || 0);
                  return (
                    <tr key={i} style={trStyle}>
                      <td style={{ padding: '15px', color: theme.primary, fontWeight: '600' }}>{row.id || row.Month || `REC-${String(i + 1).padStart(3, '0')}`}</td>
                      <td style={{ color: theme.textMuted, fontFamily: theme.fontMono }}>{!isNaN(val) ? val.toFixed(2) : "0.00"}</td>
                      <td style={{ color: theme.textMuted, fontFamily: theme.fontMono }}>{!isNaN(secVal) ? secVal.toFixed(2) : "—"}</td>
                      <td>
                        <span style={{
                          background: above ? 'rgba(63, 185, 80, 0.1)' : 'rgba(218, 54, 51, 0.1)',
                          color: above ? theme.success : theme.danger,
                          padding: '6px 14px', borderRadius: '6px',
                          border: `1px solid ${above ? 'rgba(63, 185, 80, 0.2)' : 'rgba(218, 54, 51, 0.2)'}`,
                          fontSize: '11px', fontWeight: '800'
                        }}>
                          {above ? "Above Avg" : "Below Avg"}
                        </span>
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
              ANALYZING SALES DATA
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
const cardStyle          = { background: theme.card, padding: '25px', borderRadius: '12px', border: `1px solid ${theme.border}` };
const cardHeader          = { fontSize: '12px', color: theme.subtext, marginBottom: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: "uppercase" };
const uploadButtonStyle   = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle     = { height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${theme.border}`, borderRadius: '16px' };
const loaderOverlayStyle  = { position: 'fixed', inset: 0, background: 'rgba(13, 17, 23, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' };
const notificationStyle   = { position: 'fixed', bottom: '30px', right: '30px', background: theme.success, color: '#fff', padding: '15px 25px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
const tableStyle          = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const thStyle             = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: '13px', fontWeight: '700' };
const trStyle             = { borderBottom: `1px solid ${theme.border}`, height: '55px', fontSize: '14px' };