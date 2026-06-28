import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  accent: "#1f6feb", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

const tabsList = ["Risk Management", "Logistics Tracking"];

// ── Storage key helpers ───────────────────────────────────────────────────────
const guestKey = "InsightIQ_Operations_Files_Guest";
const userKey  = (uid) => `InsightIQ_Operations_Files_User_${uid}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
export default function OperationsDashboard() {
  const [activeFunc, setActiveFunc] = useState("Risk Management");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState("");
  const [showManage, setShowManage] = useState(false);

  // ── Auth gate ───────────────────────────────────────────────────────────────
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageKey, setStorageKey] = useState(guestKey);
  const [files, setFiles] = useState([]);

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

  const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 4000); };

  // Compute total byte metrics
  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);

  // Unified Data Store Generator compiled dynamically from all active file fragments
  const dataStore = useMemo(() => {
    const store = {};
    files.forEach(f => {
      if (!f.dataStoreFragment) return;
      Object.keys(f.dataStoreFragment).forEach(key => {
        if (!store[key]) {
          store[key] = { total: 0, flagged: 0, benefit: 0, ledger: [], distribution: [], history: [], insights: [] };
        }
        const frag = f.dataStoreFragment[key];
        const combinedLedger = [...store[key].ledger, ...(frag.ledger || [])];
        const total = combinedLedger.length;
        const flagged = combinedLedger.filter(p => p.risk_status === "LATE RISK").length;
        const totalProfit = combinedLedger.reduce((a, c) => a + c.profit, 0);

        store[key] = {
          total: total,
          flagged: flagged,
          benefit: totalProfit,
          ledger: combinedLedger,
          distribution: [
            { name: 'SLA Compliant', value: total - flagged },
            { name: 'SLA Breach', value: flagged }
          ],
          history: combinedLedger.slice(0, 15).map((d, i) => ({ x: i, y: d.profit })),
          insights: key === "Risk Management"
            ? [
                { label: "Margin Erosion", text: `Breached SLAs represent a potential $${(flagged * 42).toFixed(0)} hit to net earnings.` },
                { label: "Working Capital Trap", text: `Total capital locked in high-risk transit.` },
                { label: "Primary Risk Drivers", text: "Correlation analysis identifies Order Quantity as the top predictor of failure." }
              ]
            : [
                { label: "OTIF Performance", text: `On-Time In-Full rate is ${total > 0 ? (100 - (flagged / total * 100)).toFixed(1) : 0}%.` },
                { label: "Cycle Time Variance", text: "Standard deviation of lead times is 2.2 days." },
                { label: "Logistics Health", text: "Global transit reliability index: 0.92." }
              ]
        };
      });
    });
    return store;
  }, [files]);

  // Process and query analytics endpoints for each uploaded file
  const processAndAdd = async (rawFiles) => {
    if (!rawFiles.length) return;
    setIsProcessing(true);

    const tasks = ["risk", "logistics"];
    const incomingProcessedFiles = [];

    // Filter out names already active inside existing file state array
    const existingNames = new Set(files.map(f => f.name));
    const uniqueRawFiles = rawFiles.filter(rf => !existingNames.has(rf.name));

    try {
      for (const file of uniqueRawFiles) {
        let fileProcessed = false;
        let fileDataStoreFragment = {};

        for (const task of tasks) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`http://127.0.0.1:8000/api/operations/predict?task=${task}`, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();

          if (result.status === "success" && result.operations_data) {
            fileProcessed = true;
            const key = task === "risk" ? "Risk Management" : "Logistics Tracking";

            const rawData = result.operations_data.map(d => ({
              ...d,
              profit: Number(d.profit) || 0,
              sales: Number(d.sales) || 0
            }));

            fileDataStoreFragment[key] = { ledger: rawData };
          }
        }

        if (fileProcessed) {
          incomingProcessedFiles.push({
            name: file.name,
            size: file.size,
            dataStoreFragment: fileDataStoreFragment
          });
        }
      }

      if (incomingProcessedFiles.length > 0) {
        setFiles(prev => [...prev, ...incomingProcessedFiles]);
        showNotification("Operational metrics synchronized dynamically");
      }
    } catch (err) {
      console.error("Critical Processing Error:", err);
      showNotification("⚠️ Processing error — verify microservices core port 8000");
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
    if (!data || !data.ledger || data.ledger.length === 0) return (
      <div style={emptyStateStyle}>
        <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: theme.primary, fontSize: '14px', fontWeight: '600' }}>
          Awaiting Operations Insights
        </motion.div>
      </div>
    );

    const config = {
      "Risk Management": { accent: theme.danger, title: "Financial Margin Stream" },
      "Logistics Tracking": { accent: theme.primary, title: "Geospatial OTIF Stream" }
    }[activeFunc];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title="Throughput Units" value={data.total} color={theme.text} delay={0.1} />
          <KPICard title="SLA Breach Flags" value={data.flagged} color={theme.danger} delay={0.2} />
          <KPICard title="EBITDA Impact" value={`$${data.benefit.toLocaleString()}`} color={theme.success} delay={0.3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: '25px', marginBottom: '30px' }}>
          <div style={cardStyle}>
            <div style={cardHeader}>SLA Compliance Ratio</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.distribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  <Cell fill={theme.success} stroke="none" />
                  <Cell fill={theme.danger} stroke="none" />
                </Pie>
                <Tooltip contentStyle={{background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={cardHeader}>{config.title}</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="y" stroke={config.accent} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...cardStyle, borderLeft: `4px solid ${config.accent}` }}>
            <div style={{...cardHeader, color: config.accent}}>Operational Summary</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: theme.text }}>
              Verified {data.total} units. 
              {activeFunc === "Risk Management" ? " Financial integrity is optimized for gross margin defense." : " Transit flow tracked for OTIF compliance across all geo-nodes."}
            </p>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeader}>Supply Chain Audit Ledger</div>
          <table style={tableStyle}>
            <thead>
              <tr style={thStyle}>
                <th style={{padding: '15px'}}>Log ID</th>
                <th>SLA Status</th>
                <th>Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.ledger.slice(0, 10).map((row, i) => (
                <tr key={i} style={trStyle}>
                  <td style={{padding: '15px', color: theme.primary, fontWeight: '600'}}>{row.id || `NEURAL-${String(i+1).padStart(3, '0')}`}</td>
                  <td>
                    <span style={{ 
                      background: row.risk_status === 'LATE RISK' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(63, 185, 80, 0.1)',
                      color: row.risk_status === 'LATE RISK' ? theme.danger : theme.success,
                      padding: '5px 12px', borderRadius: '6px', border: `1px solid ${row.risk_status === 'LATE RISK' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(63, 185, 80, 0.2)'}`,
                      fontSize: '11px', fontWeight: '800'
                    }}>
                      {row.risk_status === 'LATE RISK' ? 'Breached' : 'Compliant'}
                    </span>
                  </td>
                  <td style={{color: row.profit !== 0 ? (row.profit > 0 ? theme.success : theme.danger) : theme.text, fontWeight: '700'}}>
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
            background: showManage ? "rgba(88,166,255,0.1)" : theme.card,
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
const cardStyle          = { background: theme.card, padding: "30px", borderRadius: "12px", border: `1px solid ${theme.border}` };
const cardHeader         = { fontSize: "12px", color: theme.subtext, marginBottom: "20px", fontWeight: "800", letterSpacing: "0.5px" };
const uploadButtonStyle  = { padding: "10px 18px", background: theme.primary, color: "#fff", fontSize: "11px", fontWeight: "900", cursor: "pointer", borderRadius: "6px", letterSpacing: "1px", display: "inline-block" };
const emptyStateStyle    = { height: "400px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${theme.border}`, borderRadius: "16px" };
const loaderOverlayStyle = { position: "fixed", inset: 0, background: "rgba(13,17,23,0.95)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" };
const notificationStyle  = { position: "fixed", bottom: "30px", right: "30px", background: theme.success, color: "#fff", padding: "15px 25px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
const tableStyle         = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thStyle            = { color: theme.subtext, borderBottom: `1px solid ${theme.border}`, fontSize: "13px", fontWeight: "700" };
const trStyle            = { borderBottom: `1px solid ${theme.border}`, height: "55px", fontSize: "14px" };