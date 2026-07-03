import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import FinanceDashboard from "./FinanceDashboard";
import MarketingDashboard from "./MarketingDashboard";
import ChatbotPage from "./ChatbotPage";
import HRDashboard from "./HRDashboard";
import OperationsDashboard from "./OperationsDashboard";
import SalesDashboard from "./SalesDashboard";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// ============================================================
// THEME
// ============================================================
// Unified Vercel-style type system — this is the single source of truth
// for fonts across the whole dashboard (sidebar, topbar, headings, modals,
// toasts, everything). Matches the clean geometric sans used across the
// Vercel dashboard in the reference screenshot.
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const theme = {
  primary: "#58a6ff",
  primaryDeep: "#1d528f",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.45)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  accentGlow: "rgba(58, 162, 230, 0.35)",
  font: FONT,
};

// ============================================================
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

const MODULES = ["Finance", "HR", "Marketing", "Operations", "Sales", "Chatbot"];

const INGEST_STAGES = [
  { key: "upload", label: "Transmitting" },
  { key: "parse", label: "Parsing structure" },
  { key: "index", label: "Indexing signals" },
  { key: "ready", label: "Ready" },
];

// ── Storage key helpers ──────────────────────────────────────────────────
// Same concept as HRDashboard: files are scoped to the *verified Firebase
// auth uid*, with a guest fallback bucket, instead of being keyed off
// whatever the `user` prop happened to be passed down with.
const guestKey = "insightiq_enterprise_files_guest";
const userKey = (uid) => `insightiq_enterprise_files_user_${uid}`;

function loadFilesFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse stored files", e);
    return [];
  }
}

function saveFilesToStorage(key, files) {
  try {
    localStorage.setItem(key, JSON.stringify(files));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// ============================================================
// UTILITIES
// ============================================================
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CountUp({ value, duration = 1.1, suffix = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString() + suffix;
      },
    });
    return () => controls.stop();
  }, [value, duration, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const MeshBackdrop = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
    <motion.div
      animate={{ x: [-40, 30, -40], y: [0, 50, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 720,
        height: 720,
        top: "-18%",
        right: "-8%",
        borderRadius: "50%",
        filter: "blur(150px)",
        background: `radial-gradient(circle, ${theme.primary} 0%, rgba(31,111,235,0.15) 60%, transparent 100%)`,
        opacity: 0.16,
      }}
    />
    <motion.div
      animate={{ x: [30, -30, 30], y: [0, -45, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 640,
        height: 640,
        bottom: "-22%",
        left: "-10%",
        borderRadius: "50%",
        filter: "blur(150px)",
        background: "radial-gradient(circle, #1f6feb 0%, transparent 70%)",
        opacity: 0.1,
      }}
    />
    <motion.div
      animate={{ opacity: [0.05, 0.1, 0.05] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 500,
        height: 500,
        top: "35%",
        left: "40%",
        borderRadius: "50%",
        filter: "blur(160px)",
        background: "radial-gradient(circle, #a371f7 0%, transparent 70%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
      }}
    />
  </div>
);

const MagneticTilt = ({ children, style, ...props }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);

  return (
    <motion.div
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// ENTERPRISE DASHBOARD
// ============================================================
function EnterpriseDashboard({ user, onHome }) {
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const userMenuRef = useRef(null);

  // ── Auth state — sourced from Firebase's auth gateway (onAuthStateChanged),
  // the same pattern HRDashboard uses, instead of trusting only the `user`
  // prop passed down from App.js. This is the single source of truth for
  // "who is logged in" and for which file bucket belongs to them.
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageKey, setStorageKey] = useState(guestKey);
  const [files, setFiles] = useState([]);

  // Derive display label: prefer the verified Firebase auth email, then
  // fall back to whatever the parent passed in while the handshake resolves.
  const userDisplayLabel =
    currentUser?.email || user?.email || user?.id || user?.name || "Enterprise User";

  // Truncate long emails/IDs for display
  const userDisplayShort =
    userDisplayLabel.length > 28 ? userDisplayLabel.slice(0, 26) + "…" : userDisplayLabel;

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Auth lifecycle — resolves the Firebase user, picks the matching
  //    per-uid storage bucket, and hydrates files from it.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const key = userKey(firebaseUser.uid);
        setCurrentUser(firebaseUser);
        setStorageKey(key);
        setFiles(loadFilesFromStorage(key));
      } else {
        setCurrentUser(null);
        setStorageKey(guestKey);
        setFiles(loadFilesFromStorage(guestKey));
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // step: "upload" → "dashboard"
  const [step, setStep] = useState("upload");

  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [ingestStage, setIngestStage] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const ingestTimerRef = useRef(null);
  const toastIdRef = useRef(0);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);

  // 2. Persist files to the correct per-uid bucket whenever they change.
  //    Guarded so we never clobber storage mid auth-handshake.
  useEffect(() => {
    if (isAuthResolving) return;
    saveFilesToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  // On mount / whenever files resolve: if records exist, bypass upload phase
  useEffect(() => {
    if (isAuthResolving) return;
    if (files && files.length > 0) {
      setStep("dashboard");
    }
  }, [files, isAuthResolving]);

  // -------- toast helper --------
  const pushToast = (message, tone = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  // -------- keyboard shortcuts --------
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
        setUserMenuOpen(false);
        setShowLogoutConfirm(false);
        setShowCancelConfirm(false);
      } else if (e.key === "?" && !paletteOpen) {
        setShortcutsOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen]);

  // -------- palette actions --------
  const paletteActions = useMemo(
    () => [
      { id: "home", label: "Go to Home", icon: Icons.Home, action: () => onHome() },
      {
        id: "manage-files",
        label: "Manage / Upload Files",
        icon: Icons.Folder,
        action: () => { setStep("upload"); setModule(null); },
      },
      ...MODULES.map((m) => ({
        id: m.toLowerCase(),
        label: `Open ${m} module`,
        icon: MODULE_META[m.toLowerCase()].icon,
        disabled: step !== "dashboard",
        action: () => setModule(m.toLowerCase()),
      })),
      {
        id: "toggle-sidebar",
        label: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
        icon: Icons.Grid,
        action: () => setSidebarOpen((s) => !s),
      },
    ],
    [step, sidebarOpen, onHome]
  );

  const filteredPaletteActions = paletteActions.filter((a) =>
    a.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // -------- file helpers --------
  const readFiles = (rawFiles) =>
    Promise.all(
      rawFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) =>
              resolve({ name: file.name, size: file.size, content: event.target.result });
            reader.readAsText(file);
          })
      )
    );

  const mergeFiles = (prev, incoming) => {
    const existingNames = new Set(prev.map((f) => f.name));
    return [...prev, ...incoming.filter((f) => !existingNames.has(f.name))];
  };

  const handleFileUpload = (e) => {
    if (!e.target.files?.length) return;
    readFiles(Array.from(e.target.files)).then((processed) => {
      setFiles((prev) => mergeFiles(prev, processed));
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!e.dataTransfer?.files?.length) return;
    readFiles(Array.from(e.dataTransfer.files)).then((processed) => {
      setFiles((prev) => mergeFiles(prev, processed));
    });
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // -------- continue / ingest --------
  const handleContinue = async () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    setLoading(true);
    setIngestStage(0);
    let stage = 0;
    ingestTimerRef.current = setInterval(() => {
      stage += 1;
      if (stage < INGEST_STAGES.length - 1) setIngestStage(stage);
    }, 650);

    const fileData = files.map((f) => ({ filename: f.name, content: f.content }));

    try {
      const response = await fetch("http://localhost:5000/api/upload/upload-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileData, userEmail: currentUser?.email || user?.email || "anonymous" }),
      });
      if (response.ok) {
        clearInterval(ingestTimerRef.current);
        setIngestStage(INGEST_STAGES.length - 1);
        setStep("dashboard");
      } else {
        alert("Failed to save files to the database.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Could not connect to the database server. Ensure backend is running on port 5000.");
    } finally {
      clearInterval(ingestTimerRef.current);
      setLoading(false);
    }
  };

  useEffect(() => () => clearInterval(ingestTimerRef.current), []);

  // -------- logout handler --------
  // Fully signs out of the Firebase auth gateway (not just navigating away),
  // so the email shown elsewhere in the app clears correctly too.
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setUserMenuOpen(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
    if (typeof onHome === "function") onHome();
  };

  // -------- cancel subscription handler --------
  const handleCancelSubscription = () => {
    setShowCancelConfirm(false);
    setUserMenuOpen(false);
    pushToast("Subscription cancellation requested. You'll receive a confirmation email.", "info");
  };

  // ============================================================
  // STYLES
  // ============================================================
  const sidebarStyle = {
    width: 288,
    background: "rgba(22, 27, 34, 0.55)",
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderRight: `1px solid ${theme.border}`,
    position: "relative",
    zIndex: 5,
    fontFamily: FONT,
  };

  const navItemStyle = (isActive, isDisabled) => ({
    padding: "13px 16px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "#444c5e" : isActive ? theme.primary : "#dfe3ea",
    borderRadius: "14px",
    background: isActive ? "rgba(88, 166, 255, 0.1)" : "transparent",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    fontSize: "0.92rem",
    fontWeight: isActive ? "600" : "500",
    fontFamily: FONT,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: isActive ? "1px solid rgba(88, 166, 255, 0.3)" : "1px solid transparent",
    boxShadow: isActive ? "0 0 24px -6px rgba(58, 162, 230, 0.5)" : "none",
  });

  const topbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "rgba(13, 17, 23, 0.7)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    borderBottom: `1px solid ${theme.border}`,
    position: "relative",
    zIndex: 5,
    fontFamily: FONT,
  };

  const uploadCardStyle = {
    background: theme.card,
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
    padding: "56px 56px 48px",
    borderRadius: "32px",
    border: `1px solid ${theme.border}`,
    boxShadow:
      "0 0 60px -12px rgba(58, 162, 230, 0.28), 0 30px 70px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.12)",
    maxWidth: "660px",
    margin: "64px auto",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  };

  const primaryBtnStyle = {
    padding: "15px 44px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: loading
      ? "rgba(255,255,255,0.06)"
      : "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)",
    color: "#fff",
    cursor: loading ? "wait" : "pointer",
    fontWeight: "700",
    fontSize: "14px",
    fontFamily: FONT,
    boxShadow: loading ? "none" : "0 0 18px rgba(58, 162, 230, 0.35), 0 4px 12px rgba(0,0,0,0.4)",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    width: "100%",
  };

  // ─── Auth resolving gate — shown while the Firebase handshake completes ──
  if (isAuthResolving) {
    return (
      <div
        style={{
          background: theme.bg,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: theme.text,
          fontFamily: FONT,
        }}
      >
        <style>{`@keyframes ent-spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 32,
            height: 32,
            border: `3px solid ${theme.primary}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "ent-spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: theme.subtext, fontSize: 14, fontWeight: 500, letterSpacing: 0.3, margin: 0, fontFamily: FONT }}>
          Authenticating secure enterprise session...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: theme.bg,
        color: "#e0e0e0",
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MeshBackdrop />

      {/* ── SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={sidebarStyle}
          >
           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
  <h2
    style={{
      color: "#fff",
      fontFamily: FONT,
      fontWeight: 700, // Tuned to 700 to match the clean Vercel-style aesthetic
      fontSize: "1.5rem",
      letterSpacing: "-0.04em", // Relative tight tracking matches the Vercel look perfectly
      margin: "10px 0 22px",
    }}
  >
    Insight
    <span style={{ color: theme.primary, fontStyle: "italic", fontWeight: 800 }}>IQ</span>
  </h2>
</div>

            {/* Home */}
            <motion.div whileHover={{ x: 2 }} style={navItemStyle(false, false)} onClick={onHome}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icons.Home size={16} strokeWidth={1.8} /> Home
              </span>
            </motion.div>

            {/* ── MANAGE FILES ── */}
            <motion.div
              whileHover={{ x: 2 }}
              style={navItemStyle(step === "upload", false)}
              onClick={() => { setStep("upload"); setModule(null); }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icons.Folder size={16} strokeWidth={1.8} /> Manage Files
              </span>
              {files.length > 0 && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontFamily: FONT,
                    background: "rgba(88,166,255,0.15)",
                    border: "1px solid rgba(88,166,255,0.3)",
                    color: theme.primary,
                    borderRadius: "100px",
                    padding: "2px 8px",
                    fontWeight: 700,
                  }}
                >
                  {files.length}
                </span>
              )}
            </motion.div>

            <div style={{ height: "1px", background: theme.border, margin: "16px 4px" }} />

            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 10px" }}>
            <p
                  style={{
                    fontSize: "13px",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    color: "#5b6472",
                    letterSpacing: "2px",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Analytics Dashboards
                </p>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    color: step === "dashboard" ? "#3fb950" : "#5b6472",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                <motion.span
                  animate={step === "dashboard" ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: step === "dashboard" ? "#3fb950" : "#5b6472",
                    display: "inline-block",
                  }}
                />
          
              </span>
            </div>

            {/* Module Nav Items */}
            {MODULES.map((m) => {
              const key = m.toLowerCase();
              const isCurrent = module === key;
              const isDisabled = step !== "dashboard";
              const meta = MODULE_META[key];
              return (
                <motion.div
                  key={m}
                  whileHover={!isDisabled ? { x: 2 } : {}}
                  style={navItemStyle(isCurrent, isDisabled)}
                  onClick={() => !isDisabled && setModule(key)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <meta.icon size={16} strokeWidth={1.8} />
                    {m}
                  </span>
                  {isCurrent && (
                    <motion.span
                      layoutId="enterprise-active-dot"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: theme.primary,
                        boxShadow: "0 0 8px rgba(88,166,255,0.9)",
                      }}
                    />
                  )}
                </motion.div>
              );
            })}

            <div style={{ flex: 1 }} />

            

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 2 }}>

        {/* Topbar */}
        <div style={topbarStyle}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${theme.border}`,
              borderRadius: "10px",
              width: "38px",
              height: "38px",
              color: "#fff",
              cursor: "pointer",
              opacity: 0.85,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icons.Menu size={18} strokeWidth={1.8} />
          </motion.button>

          <div style={{ flex: 1, margin: "0 40px", position: "relative" }}>
            <input
              placeholder="Search business insights..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onClick={() => setPaletteOpen(true)}
              readOnly
              style={{
                width: "100%",
                padding: "12px 44px 12px 20px",
                borderRadius: "14px",
                border: `1px solid ${searchFocused ? "rgba(88, 166, 255, 0.5)" : theme.border}`,
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                outline: "none",
                fontSize: "14px",
                fontFamily: FONT,
                cursor: "pointer",
                boxShadow: searchFocused ? "0 0 0 4px rgba(88,166,255,0.08)" : "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            />
            <span
              onClick={() => setPaletteOpen(true)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                fontFamily: FONT,
                color: "#5b6472",
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "3px 7px",
                background: "rgba(255,255,255,0.02)",
                cursor: "pointer",
              }}
            >
              ⌘K
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: "rgba(88,166,255,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShortcutsOpen(true)}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: "7px 11px",
                color: "#8b949e",
                fontSize: 11,
                fontFamily: FONT,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ?
            </motion.button>
          
            {/* ── USER MENU — email sourced from Firebase auth gateway ── */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <motion.div
                whileHover={{ borderColor: "rgba(88,166,255,0.4)" }}
                onClick={() => setUserMenuOpen((o) => !o)}
                style={{
                  background: "rgba(88, 166, 255, 0.08)",
                  padding: "9px 18px",
                  borderRadius: "12px",
                  border: `1px solid ${userMenuOpen ? "rgba(88,166,255,0.4)" : "rgba(88, 166, 255, 0.25)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  fontFamily: FONT,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Icons.User size={16} strokeWidth={1.8} />
                <span
                  style={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.85rem",
                    fontFamily: FONT,
                    color: "#dfe3ea",
                  }}
                  title={userDisplayLabel}
                >
                  {userDisplayShort}
                </span>
                <motion.span
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: "#5b6472", lineHeight: 1, display: "flex" }}
                >
                  <Icons.Chevron size={12} strokeWidth={2} />
                </motion.span>
              </motion.div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      minWidth: 230,
                      background: "rgba(18, 22, 30, 0.96)",
                      backdropFilter: "blur(32px) saturate(190%)",
                      WebkitBackdropFilter: "blur(32px) saturate(190%)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 16,
                      boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -8px rgba(58,162,230,0.2)",
                      overflow: "hidden",
                      zIndex: 300,
                      fontFamily: FONT,
                    }}
                  >
                    {/* User info header */}
                    <div
                      style={{
                        padding: "14px 18px",
                        borderBottom: `1px solid ${theme.border}`,
                        background: "rgba(88,166,255,0.04)",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "#5b6472", marginBottom: 4, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
                        Signed in as
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#dfe3ea",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={userDisplayLabel}
                      >
                        {userDisplayLabel}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ padding: "8px" }}>
                      <motion.div
                        whileHover={{ background: "rgba(248,81,73,0.1)" }}
                        onClick={() => { setUserMenuOpen(false); setShowCancelConfirm(true); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 13.5,
                          color: "#f0a0a0",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <Icons.Ban size={15} strokeWidth={1.8} />
                        Cancel Subscription
                      </motion.div>

                      <div style={{ height: 1, background: theme.border, margin: "6px 0" }} />

                      <motion.div
                        whileHover={{ background: "rgba(248,81,73,0.12)" }}
                        onClick={() => { setUserMenuOpen(false); setShowLogoutConfirm(true); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 13.5,
                          color: "#f85149",
                          fontWeight: 600,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <Icons.LogOut size={15} strokeWidth={1.8} />
                        Log Out
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── STEP 1: FILE UPLOAD / MANAGE FILES ── */}
        {step === "upload" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={uploadCardStyle}
            >
              <div
                style={{
                  background: "rgba(88, 166, 255, 0.08)",
                  border: "1px solid rgba(88, 166, 255, 0.25)",
                  padding: "6px 16px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontFamily: FONT,
                  fontWeight: 700,
                  color: theme.primary,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: "26px",
                }}
              >
                <Icons.Zap size={12} strokeWidth={2} /> Secure Ingestion Pipeline
              </div>

              {/* Animated Orb */}
              <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 22px" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(88,166,255,0.35)" }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "1px solid rgba(163,113,247,0.3)" }}
                />
                <motion.div
                  animate={{
                    boxShadow: loading
                      ? ["0 0 20px rgba(88,166,255,0.4)", "0 0 50px rgba(88,166,255,0.7)", "0 0 20px rgba(88,166,255,0.4)"]
                      : "0 0 24px rgba(88,166,255,0.35)",
                  }}
                  transition={{ duration: 1.4, repeat: loading ? Infinity : 0, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    inset: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                      style={{ display: "flex" }}
                    >
                      <Icons.Loader size={26} strokeWidth={1.6} />
                    </motion.span>
                  ) : files.length > 0 ? (
                    <Icons.Package size={26} strokeWidth={1.5} />
                  ) : (
                    <Icons.Brain size={26} strokeWidth={1.5} />
                  )}
                </motion.div>
                {loading &&
                  [0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -3,
                          left: "50%",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: theme.primary,
                          boxShadow: "0 0 10px rgba(88,166,255,0.9)",
                        }}
                      />
                    </motion.div>
                  ))}
              </div>

              <h2
                style={{
                  fontSize: "2rem",
                  fontFamily: FONT,
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                  marginBottom: "10px",
                  color: "#fff",
                }}
              >
                {loading ? "Engine Processing..." : files.length > 0 ? "Manage Your Files" : "Initialize AI Engine"}
              </h2>
              <p style={{ color: theme.subtext, marginBottom: "32px", lineHeight: "1.6", fontSize: "15px", fontFamily: FONT }}>
                Upload your financial records, HR logs, or sales data.
                <br />
                Our AI will process these to generate your executive dashboards.
              </p>

              {/* Ingest Progress Stepper */}
              {loading && (
                <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 36 }}>
                  {INGEST_STAGES.map((s, i) => (
                    <React.Fragment key={s.key}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 90 }}>
                        <motion.div
                          animate={{
                            background: i <= ingestStage ? theme.primary : "rgba(255,255,255,0.08)",
                            scale: i === ingestStage ? 1.15 : 1,
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: FONT,
                            color: i <= ingestStage ? "#06121f" : "#5b6472",
                            boxShadow: i === ingestStage ? "0 0 16px rgba(88,166,255,0.6)" : "none",
                          }}
                        >
                          {i < ingestStage ? <Icons.Check size={14} strokeWidth={2.4} /> : i + 1}
                        </motion.div>
                        <span style={{ fontSize: 10.5, fontFamily: FONT, color: i <= ingestStage ? "#dfe3ea" : "#444c5e", textAlign: "center" }}>
                          {s.label}
                        </span>
                      </div>
                      {i < INGEST_STAGES.length - 1 && (
                        <div style={{ flex: 1, height: 1, background: theme.border, marginTop: 14, position: "relative", top: 0 }}>
                          <motion.div
                            animate={{ width: i < ingestStage ? "100%" : "0%" }}
                            transition={{ duration: 0.4 }}
                            style={{ height: 1, background: theme.primary, boxShadow: "0 0 6px rgba(88,166,255,0.7)" }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Drop Zone + File Chips */}
              {!loading && (
                <>
                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      display: "block",
                      padding: "28px 24px",
                      background: isDragOver ? "rgba(88,166,255,0.06)" : "rgba(255,255,255,0.02)",
                      border: `2px dashed ${isDragOver ? "rgba(88, 166, 255, 0.6)" : "rgba(255,255,255,0.15)"}`,
                      borderRadius: "18px",
                      cursor: "pointer",
                      marginBottom: "20px",
                      width: "100%",
                      boxSizing: "border-box",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <input type="file" multiple onChange={handleFileUpload} style={{ display: "none" }} />
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: theme.primary }}>
                      {isDragOver ? <Icons.Upload size={26} strokeWidth={1.5} /> : <Icons.Folder size={26} strokeWidth={1.5} />}
                    </div>
                    <span style={{ color: "#aaa", fontSize: "14px", fontFamily: FONT }}>
                      {files.length > 0
                        ? `${files.length} file${files.length > 1 ? "s" : ""} active · ${formatBytes(totalBytes)}`
                        : "Drop files here, or click to browse"}
                    </span>
                  </label>

                  {/* File Chips Matrix */}
                  <AnimatePresence>
                    {files.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          justifyContent: "center",
                          marginBottom: 28,
                          overflow: "hidden",
                        }}
                      >
                        {files.map((f) => (
                          <motion.div
                            key={f.name}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "7px 8px 7px 14px",
                              borderRadius: "100px",
                              background: "rgba(88,166,255,0.08)",
                              border: "1px solid rgba(88,166,255,0.22)",
                              fontSize: 12.5,
                              fontFamily: FONT,
                              color: "#dfe3ea",
                            }}
                          >
                            <Icons.File size={13} strokeWidth={1.8} style={{ color: theme.primary }} />
                            <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {f.name}
                            </span>
                            <span style={{ color: "#5b6472" }}>{formatBytes(f.size)}</span>
                            <button
                              onClick={(e) => { e.preventDefault(); removeFile(f.name); }}
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "none",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                color: "#9aa4b2",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icons.X size={9} strokeWidth={2.2} />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <motion.button
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 28px rgba(58, 162, 230, 0.55), 0 0 50px rgba(58, 162, 230, 0.25)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onClick={handleContinue}
                disabled={loading}
                style={primaryBtnStyle}
              >
                {loading ? `${INGEST_STAGES[ingestStage].label}...` : "Analyze Data & Continue"}
              </motion.button>

              <p style={{ marginTop: 18, fontSize: 11.5, fontFamily: FONT, color: "#4d5562", letterSpacing: 0.3, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Icons.Lock size={11} strokeWidth={2} /> Encrypted in transit · Stored in PostgreSQL · SOC 2-aligned handling
              </p>
            </motion.div>
          </div>
        )}

        {/* ── STEP 2: DASHBOARD DISPLAY ── */}
        {step === "dashboard" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
            {module === "operations" && <OperationsDashboard />}
            {module === "sales" && <SalesDashboard />}
            {module === "chatbot" && <ChatbotPage />}

            {!module && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ maxWidth: 1100, margin: "0 auto" }}
              >
                <div style={{ textAlign: "center", marginBottom: 48, marginTop: 28 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                      color: theme.primary,
                      filter: "drop-shadow(0 0 28px rgba(88, 166, 255, 0.4))",
                    }}
                  >
                    <Icons.BarChart size={52} strokeWidth={1.3} />
                  </div>
                  <h2
                    style={{
                      fontFamily: FONT,
                      fontWeight: "700",
                      fontSize: "2rem",
                      letterSpacing: "-0.03em",
                      color: "#fff",
                      marginBottom: "8px",
                    }}
                  >
                    System Ready, {(currentUser?.displayName || user?.name || currentUser?.email || "")?.split(" ")[0]}
                  </h2>
                  <p style={{ color: theme.subtext, fontSize: "14.5px", fontFamily: FONT }}>
                    Select a specialized module below to view real-time insights.
                  </p>
                </div>

                {/* Micro Stats Matrix */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 16,
                    marginBottom: 44,
                  }}
                >
                  {[
                    { label: "Files Indexed", value: files.length, suffix: "" },
                    { label: "Modules Live", value: MODULES.length, suffix: "" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        background: theme.card,
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        border: `1px solid ${theme.border}`,
                        borderRadius: 20,
                        padding: "20px 22px",
                        boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
                      }}
                    >
                      <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: FONT, letterSpacing: "-0.02em" }}>
                        <CountUp value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div style={{ fontSize: 12, fontFamily: FONT, color: theme.subtext, marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Module Interaction Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18 }}>
                  {MODULES.map((m) => {
                    const key = m.toLowerCase();
                    const meta = MODULE_META[key];
                    return (
                      <MagneticTilt
                        key={m}
                        whileHover={{ y: -4, boxShadow: "0 0 40px -8px rgba(58,162,230,0.4), 0 25px 50px -15px rgba(0,0,0,0.8)" }}
                        onClick={() => setModule(key)}
                        style={{
                          cursor: "pointer",
                          background: theme.card,
                          backdropFilter: "blur(24px) saturate(180%)",
                          WebkitBackdropFilter: "blur(24px) saturate(180%)",
                          border: `1px solid ${theme.border}`,
                          borderRadius: 22,
                          padding: "26px 24px",
                          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(88,166,255,0.16), rgba(163,113,247,0.12))",
                            border: "1px solid rgba(88,166,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.primary,
                            marginBottom: 16,
                          }}
                        >
                          <meta.icon size={20} strokeWidth={1.6} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, fontFamily: FONT, color: "#fff", marginBottom: 4 }}>{meta.label}</div>
                        <div style={{ fontSize: 12.5, fontFamily: FONT, color: theme.subtext }}>{meta.blurb}</div>
                      </MagneticTilt>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Progress Loader Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              transformOrigin: "left",
              background: "linear-gradient(90deg, #42b3ff, #a371f7)",
              boxShadow: "0 0 12px rgba(88,166,255,0.8)",
              zIndex: 100,
            }}
          />
        )}
      </AnimatePresence>

      {/* Interactive Command Palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaletteOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 8, 14, 0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 200,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingTop: "12vh",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 540,
                background: "rgba(18, 22, 30, 0.85)",
                backdropFilter: "blur(32px) saturate(190%)",
                WebkitBackdropFilter: "blur(32px) saturate(190%)",
                border: `1px solid ${theme.border}`,
                borderRadius: 20,
                boxShadow: "0 0 60px -10px rgba(58,162,230,0.35), 0 40px 80px -20px rgba(0,0,0,0.85)",
                overflow: "hidden",
                fontFamily: FONT,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
                <Icons.Search size={16} strokeWidth={1.8} style={{ opacity: 0.6 }} />
                <input
                  autoFocus
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 15, fontFamily: FONT }}
                />
                <span style={{ fontSize: 11, color: "#5b6472", border: `1px solid ${theme.border}`, borderRadius: 6, padding: "3px 7px" }}>
                  ESC
                </span>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto", padding: 8 }}>
                {filteredPaletteActions.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", color: theme.subtext, fontSize: 13 }}>No matching commands</div>
                )}
                {filteredPaletteActions.map((a) => (
                  <motion.div
                    key={a.id}
                    whileHover={!a.disabled ? { background: "rgba(88,166,255,0.08)" } : {}}
                    onClick={() => {
                      if (a.disabled) return;
                      a.action();
                      setPaletteOpen(false);
                      setPaletteQuery("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 14px",
                      borderRadius: 12,
                      cursor: a.disabled ? "not-allowed" : "pointer",
                      color: a.disabled ? "#444c5e" : "#dfe3ea",
                      fontSize: 13.5,
                    }}
                  >
                    {a.icon && <a.icon size={15} strokeWidth={1.8} />}
                    <span style={{ flex: 1 }}>{a.label}</span>
                    {a.disabled && <span style={{ fontSize: 10.5, color: "#444c5e" }}>Locked</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Dialog */}
      <AnimatePresence>
        {shortcutsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShortcutsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 8, 14, 0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 200,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 380,
                background: "rgba(18, 22, 30, 0.9)",
                backdropFilter: "blur(32px) saturate(190%)",
                WebkitBackdropFilter: "blur(32px) saturate(190%)",
                border: `1px solid ${theme.border}`,
                borderRadius: 20,
                boxShadow: "0 0 60px -10px rgba(58,162,230,0.3), 0 40px 80px -20px rgba(0,0,0,0.85)",
                padding: "24px 26px",
                fontFamily: FONT,
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                Keyboard Shortcuts
              </h3>
              {[
                { keys: ["⌘", "K"], label: "Open command palette" },
                { keys: ["Menu"], label: "Toggle sidebar" },
                { keys: ["Esc"], label: "Close any overlay" },
                { keys: ["?"], label: "Toggle this panel" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 0",
                    borderBottom: `1px solid ${theme.border}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "#dfe3ea" }}>{row.label}</span>
                  <span style={{ display: "flex", gap: 4 }}>
                    {row.keys.map((k) => (
                      <span
                        key={k}
                        style={{
                          fontSize: 11,
                          color: "#dfe3ea",
                          border: `1px solid ${theme.border}`,
                          borderRadius: 6,
                          padding: "3px 7px",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {k}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOGOUT CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 8, 14, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                background: "rgba(18, 22, 30, 0.97)",
                backdropFilter: "blur(32px) saturate(190%)",
                WebkitBackdropFilter: "blur(32px) saturate(190%)",
                border: `1px solid rgba(248,81,73,0.25)`,
                borderRadius: 20,
                boxShadow: "0 0 60px -10px rgba(248,81,73,0.2), 0 40px 80px -20px rgba(0,0,0,0.9)",
                padding: "28px 28px 24px",
                textAlign: "center",
                fontFamily: FONT,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: "#f85149" }}>
                <Icons.LogOut size={34} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                Log Out?
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: 13, color: theme.subtext, lineHeight: 1.55 }}>
                You'll be signed out of your session. Any unsaved work will remain stored.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ background: "rgba(255,255,255,0.06)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: "#8b949e",
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontFamily: FONT,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ background: "rgba(248,81,73,0.85)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: "1px solid rgba(248,81,73,0.4)",
                    background: "rgba(248,81,73,0.75)",
                    color: "#fff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: FONT,
                    cursor: "pointer",
                  }}
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CANCEL SUBSCRIPTION CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 8, 14, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 400,
                background: "rgba(18, 22, 30, 0.97)",
                backdropFilter: "blur(32px) saturate(190%)",
                WebkitBackdropFilter: "blur(32px) saturate(190%)",
                border: `1px solid rgba(210,130,30,0.25)`,
                borderRadius: 20,
                boxShadow: "0 0 60px -10px rgba(210,130,30,0.18), 0 40px 80px -20px rgba(0,0,0,0.9)",
                padding: "28px 28px 24px",
                textAlign: "center",
                fontFamily: FONT,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: "#d2821e" }}>
                <Icons.Ban size={34} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: FONT }}>
                Cancel Subscription?
              </h3>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: theme.subtext, lineHeight: 1.55 }}>
                You'll lose access to all analytics modules and AI features at the end of your current billing period.
              </p>
              <p style={{ margin: "0 0 24px", fontSize: 12, color: "#5b6472", lineHeight: 1.5 }}>
                A confirmation will be sent to <span style={{ color: "#dfe3ea" }}>{userDisplayLabel}</span>.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ background: "rgba(255,255,255,0.06)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCancelConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    background: "rgba(255,255,255,0.03)",
                    color: "#8b949e",
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontFamily: FONT,
                    cursor: "pointer",
                  }}
                >
                  Keep Plan
                </motion.button>
                <motion.button
                  whileHover={{ background: "rgba(210,130,30,0.8)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelSubscription}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: "1px solid rgba(210,130,30,0.4)",
                    background: "rgba(210,130,30,0.65)",
                    color: "#fff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    fontFamily: FONT,
                    cursor: "pointer",
                  }}
                >
                  Yes, Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Toast Stack Notification Layer */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 300 }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 18px",
                borderRadius: 14,
                minWidth: 260,
                background: "rgba(18, 22, 30, 0.92)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: `1px solid ${t.tone === "success" ? "rgba(63,185,80,0.35)" : theme.border}`,
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.7)",
                fontSize: 13,
                fontFamily: FONT,
                color: "#dfe3ea",
              }}
            >
              {t.tone === "success" ? (
                <Icons.CheckCircle size={16} strokeWidth={1.8} style={{ color: "#3fb950" }} />
              ) : (
                <Icons.InfoCircle size={16} strokeWidth={1.8} style={{ color: theme.primary }} />
              )}
              <span style={{ flex: 1 }}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EnterpriseDashboard;