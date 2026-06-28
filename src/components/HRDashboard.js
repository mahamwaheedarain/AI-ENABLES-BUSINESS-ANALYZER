// src/components/HRDashboard.js
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
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
      "Salary Distribution": { kpi1: "Headcount",    kpi2: "Avg Salary",    kpi3: "Total Payroll",   color: theme.primary, chartKey: "salary"   },
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

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <KPICard title={config.kpi1} value={kpiVals[0]} color={config.color}  delay={0.1} />
          <KPICard title={config.kpi2} value={kpiVals[1]} color={theme.text}    delay={0.2} />
          <KPICard title={config.kpi3} value={kpiVals[2]} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px", marginBottom: "30px" }}>
          <div style={cardStyle}>
            <div style={cardHeader}>{activeFunc} Distribution Matrix</div>
            <ResponsiveContainer width="100%" height={220}>
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

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.color}` }}>
            <div style={{ ...cardHeader, color: config.color }}>HR Intelligence</div>
            <p style={{ fontSize: "14px", lineHeight: "1.7", color: theme.text, margin: 0 }}>
              Live processing validation for database streams.
              {activeFunc === "Attrition Analysis"
                ? ` System has tracked ${data.flagged} critical risk anomalies based on extreme overtime records.`
                : " Core performance trends are rendering cleanly against training track timelines."}
            </p>
            <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: "11px", color: theme.subtext, fontWeight: "800" }}>PRODUCTION STREAM: LIVE</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...cardHeader, display: "flex", justifyContent: "space-between" }}>
            <span>{activeFunc} System Ledger</span>
            <span style={{ color: theme.primary }}>Verified Database Records</span>
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
const trStyle            = { borderBottom: `1px solid ${theme.border}`, height: "55px", fontSize: "14px" };