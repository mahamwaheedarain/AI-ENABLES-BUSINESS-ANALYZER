import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";
import OperationsDashboard from "./components/OperationsDashboard";
import SalesDashboard from "./components/SalesDashboard";
import EnterpriseDashboard from "./components/EnterpriseDashboard";
import Subscription from "./SubscriptionPlans";
import ChatbotPage from "./components/ChatbotPage";
import { Login, Signup } from "./components/Auth";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// ----------------- YOUR ORIGINAL STYLES (UNTOUCHED) -----------------
const styles = {
  app: { display: "flex", height: "100vh", background: "#0d0d14", color: "#e0e0e0", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 250, background: "#1a1a2e", padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 12, cursor: "pointer", color: "#fff", borderRadius: 10 },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 },
  sidebarToggle: { fontSize: 20, cursor: "pointer" },
  search: { padding: 6, borderRadius: 8, border: "1px solid #444", background: "#0d0d14", color: "#fff", flex: 1, marginRight: 10 },
  authContainer: { maxWidth: 400, margin: "100px auto", padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center" },
  authInput: { padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 },
  primaryBtn: { padding: "12px", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", width: "100%" },
};

// ============================================================
// THEME — shared language with EnterpriseDashboard
// ============================================================
const theme = {
  primary: "#58a6ff",
  primaryDeep: "#1d528f",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.45)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  accentGlow: "rgba(58, 162, 230, 0.35)",
};

const MODULE_META = {
  finance: { icon: "💠", label: "Finance", blurb: "Revenue, margins & cash flow" },
  hr: { icon: "🧬", label: "HR", blurb: "Headcount, retention & sentiment" },
  marketing: { icon: "📡", label: "Marketing", blurb: "Funnel, spend & attribution" },
  operations: { icon: "⚙️", label: "Operations", blurb: "Throughput & SLA health" },
  sales: { icon: "🎯", label: "Sales", blurb: "Pipeline & win-rate trends" },
  chatbot: { icon: "🜂", label: "Chatbot", blurb: "Conversational AI assistant" },
};

const MODULES = ["Finance", "HR", "Marketing", "Chatbot"];

const INGEST_STAGES = [
  { key: "upload", label: "Transmitting" },
  { key: "parse", label: "Parsing structure" },
  { key: "index", label: "Indexing signals" },
  { key: "ready", label: "Ready" },
];

// ── Storage key helpers ──────────────────────────────────────────────────
// Same concept as HRDashboard: files are scoped to the *verified Firebase
// auth uid*, with a guest fallback bucket, instead of being keyed off
// whatever the login page happened to set in local state.
const guestKey = "InsightIQ_Pro_Files_Guest";
const userKey = (uid) => `InsightIQ_Pro_Files_User_${uid}`;

function loadFilesFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
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

function App() {
  const [page, setPage] = useState("login");
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Auth state — now sourced from Firebase's auth gateway (onAuthStateChanged),
  // not from whatever the Login/Signup form happened to pass up. This is the
  // same pattern HRDashboard uses, so the email shown anywhere in the Pro
  // dashboard always reflects the real authenticated session.
  const [user, setUser] = useState(null);
  const [isAuthResolving, setIsAuthResolving] = useState(true);
  const [storageKey, setStorageKey] = useState(guestKey);

  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const proModules = MODULES;
  const [files, setFiles] = useState([]);

  // States required for User Menu overlay, cancellation, and logout handling
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const userMenuRef = useRef(null);

  // 1. Auth lifecycle — single source of truth for "who is logged in".
  //    Mirrors HRDashboard: resolves the Firebase user, picks the matching
  //    per-uid storage bucket, and hydrates files from it.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const resolvedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Pro User",
        };
        const key = userKey(firebaseUser.uid);
        setUser(resolvedUser);
        setStorageKey(key);
        setFiles(loadFilesFromStorage(key));
      } else {
        setUser(null);
        setStorageKey(guestKey);
        setFiles(loadFilesFromStorage(guestKey));
      }
      setIsAuthResolving(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Persist files to the correct per-uid bucket whenever they change.
  //    Guarded so we never clobber storage mid auth-handshake.
  useEffect(() => {
    if (isAuthResolving) return;
    saveFilesToStorage(storageKey, files);
  }, [files, storageKey, isAuthResolving]);

  // 3. Fall back to PostgreSQL if this user's local bucket is empty.
  useEffect(() => {
    if (page !== "proDashboard" || isAuthResolving) return;
    if (files.length > 0) {
      setStep("dashboard");
      return;
    }
    if (!user?.email) return;

    const fetchFilesFromDB = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/upload/files/${encodeURIComponent(user.email)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.files && data.files.length > 0) {
            setFiles(data.files);
            setStep("dashboard");
          }
        }
      } catch (err) {
        console.error("Failed to fetch files from PostgreSQL:", err);
      }
    };

    fetchFilesFromDB();
  }, [page, user, isAuthResolving, files.length]);

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

  const pushToast = (message, tone = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  // Close Pro dropdown overlay menu on clicking completely outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (page !== "proDashboard") return;
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
  }, [paletteOpen, page]);

  const paletteActions = useMemo(
    () => [
      { id: "home", label: "Go to Home", action: () => setPage("subscription") },
      { id: "manage-files", label: "Manage / Upload Files", icon: "📁", action: () => { setStep("upload"); setModule(null); } },
      ...MODULES.map((m) => ({
        id: m.toLowerCase(),
        label: `Open ${m} module`,
        icon: MODULE_META[m.toLowerCase()].icon,
        disabled: step !== "dashboard",
        action: () => setModule(m.toLowerCase()),
      })),
      { id: "toggle-sidebar", label: sidebarOpen ? "Collapse sidebar" : "Expand sidebar", icon: "▤", action: () => setSidebarOpen((s) => !s) },
    ],
    [step, sidebarOpen]
  );

  const filteredPaletteActions = paletteActions.filter((a) =>
    a.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  const handleFileUpload = (e) => {
    if (e.target.files?.length) {
      const incomingFiles = Array.from(e.target.files);
      Promise.all(
        incomingFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({ name: file.name, size: file.size, content: event.target.result });
            };
            reader.readAsText(file);
          });
        })
      ).then((processedFiles) => {
        setFiles((prev) => {
          const existingNames = new Set(prev.map((f) => f.name));
          const filteredNew = processedFiles.filter((f) => !existingNames.has(f.name));
          return [...prev, ...filteredNew];
        });
      });
    }
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.length) {
      const incomingFiles = Array.from(e.dataTransfer.files);
      Promise.all(
        incomingFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({ name: file.name, size: file.size, content: event.target.result });
            };
            reader.readAsText(file);
          });
        })
      ).then((processedFiles) => {
        setFiles((prev) => {
          const existingNames = new Set(prev.map((f) => f.name));
          const filteredNew = processedFiles.filter((f) => !existingNames.has(f.name));
          return [...prev, ...filteredNew];
        });
      });
    }
  };

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
    const fileData = files.map((file) => ({ filename: file.name, content: file.content }));
    try {
      const response = await fetch("http://localhost:5000/api/upload/upload-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileData, userEmail: user?.email || "anonymous" }),
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

  useEffect(() => {
    return () => clearInterval(ingestTimerRef.current);
  }, []);

  // Login/Signup just authenticate with Firebase and navigate forward.
  // The onAuthStateChanged listener above is what actually populates
  // `user` (and therefore every email shown in the UI) — it's the
  // single "gateway" rather than the login form setting it directly.
  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPage("subscription");
    } catch (error) { alert(error.message); }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), { name, email, uid: userCredential.user.uid });
      setPage("subscription");
    } catch (error) { alert(error.message); }
  };

  const handleSubscription = (plan) => {
    if (plan === "enterprise") {
      setPage("enterpriseDashboard");
    } else {
      setPage("proDashboard");
      setStep("upload");
    }
  };

  // User Actions definitions
  const handleLogoutAction = async () => {
    setShowLogoutConfirm(false);
    setUserMenuOpen(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
    // onAuthStateChanged will clear `user`/storageKey/files automatically.
    setPage("login");
  };

  const handleCancelSubscriptionAction = () => {
    setShowCancelConfirm(false);
    setUserMenuOpen(false);
    pushToast("Subscription cancellation requested. You'll receive a confirmation email.", "info");
  };

  if (page === "proDashboard") {
    // Wait for the Firebase auth handshake to resolve before rendering,
    // same guard HRDashboard uses, so we never flash a stale/empty email.
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
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <style>{`@keyframes app-spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${theme.primary}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "app-spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: theme.subtext, fontSize: 14, fontWeight: 500, letterSpacing: 0.3, margin: 0 }}>
            Authenticating secure session...
          </p>
        </div>
      );
    }

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
    };

    const navItemStyle = (isActive, isDisabled) => ({
      padding: "13px 16px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      color: isDisabled ? "#444c5e" : isActive ? theme.primary : "#dfe3ea",
      borderRadius: "14px",
      background: isActive ? "rgba(88, 166, 255, 0.1)" : "transparent",
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      fontSize: "0.92rem",
      fontWeight: isActive ? "600" : "400",
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
      boxShadow: loading ? "none" : "0 0 18px rgba(58, 162, 230, 0.35), 0 4px 12px rgba(0,0,0,0.4)",
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      width: "100%",
    };

    // Email now comes straight from the Firebase auth gateway (`user.email`,
    // set only by onAuthStateChanged) rather than anything the login page set.
    const userDisplayLabel = user?.email || "Guest User";
    const userDisplayShort = userDisplayLabel.length > 28 ? userDisplayLabel.slice(0, 26) + "…" : userDisplayLabel;

    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: theme.bg,
          color: "#e0e0e0",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <MeshBackdrop />

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -288, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={sidebarStyle}
            >
              <div style={{ display: "flex", alignItems: "center", justifyindex: "center", gap: 8, marginBottom: 8 }}>
                <h2
                  style={{
                    color: "#fff",
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 900,
                    fontSize: "1.5rem",
                    letterSpacing: "-1px",
                    margin: "10px 0 22px",
                  }}
                >
                  Insight
                  <span style={{ color: theme.primary, fontStyle: "italic", fontWeight: 700 }}>IQ</span>
                </h2>
              </div>

              <motion.div whileHover={{ x: 2 }} style={navItemStyle(false, false)} onClick={() => setPage("subscription")}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>🏠 Home</span>
              </motion.div>

              <motion.div whileHover={{ x: 2 }} style={navItemStyle(step === "upload", false)} onClick={() => { setStep("upload"); setModule(null); }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>📁 Manage Files</span>
              </motion.div>

              <div style={{ height: "1px", background: theme.border, margin: "16px 4px" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 10px" }}>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "#5b6472",
                    textTransform: "uppercase",
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
                  {step === "dashboard" ? "LIVE" : "IDLE"}
                </span>
              </div>

              {proModules.map((m) => {
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
                      <span style={{ fontSize: "1rem" }}>{meta.icon}</span>
                      {m}
                    </span>
                    {isCurrent && (
                      <motion.span
                        layoutId="pro-active-dot"
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

              <div
                style={{
                  margin: "10px 4px 0",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(88,166,255,0.1), rgba(163,113,247,0.08))",
                  border: "1px solid rgba(88,166,255,0.18)",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.7rem", color: theme.subtext, lineHeight: 1.5 }}>
                  ⚡ Engine status: <span style={{ color: "#3fb950", fontWeight: 700 }}>Operational</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 2 }}>
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
                fontSize: "18px",
                cursor: "pointer",
                opacity: 0.85,
                boxSizing: "border-box",
              }}
            >
              ☰
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
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ?
              </motion.button>
              <motion.div whileHover={{ scale: 1.1 }} style={{ fontSize: "1.2rem", cursor: "pointer", opacity: 0.75, position: "relative" }}>
                🔔
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#f85149",
                    border: "2px solid #0d1117",
                  }}
                />
              </motion.div>

              {/* ── USER MENU — email sourced from Firebase auth gateway (`user.email`) ── */}
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
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>👤</span>
                  <span
                    style={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.85rem",
                      color: "#dfe3ea",
                    }}
                    title={userDisplayLabel}
                  >
                    {userDisplayShort}
                  </span>
                  <motion.span
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: "10px", color: "#5b6472", lineHeight: 1 }}
                  >
                    ▼
                  </motion.span>
                </motion.div>

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
                      }}
                    >
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
                          <span style={{ fontSize: 15 }}>🚫</span>
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
                          <span style={{ fontSize: 15 }}>🔓</span>
                          Log Out
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

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
                    fontWeight: 700,
                    color: theme.primary,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    display: "inline-block",
                    marginBottom: "26px",
                  }}
                >
                  ⚡ Secure Ingestion Pipeline
                </div>

                <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 22px" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "1px dashed rgba(88,166,255,0.35)",
                    }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      inset: 14,
                      borderRadius: "50%",
                      border: "1px solid rgba(163,113,247,0.3)",
                    }}
                  />
                  <motion.div
                    animate={{
                      boxShadow: loading
                        ? [
                            "0 0 20px rgba(88,166,255,0.4)",
                            "0 0 50px rgba(88,166,255,0.7)",
                            "0 0 20px rgba(88,166,255,0.4)",
                          ]
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
                      fontSize: "26px",
                    }}
                  >
                    {loading ? "⏳" : files.length > 0 ? "📦" : "🧠"}
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
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: "300",
                    letterSpacing: "-0.5px",
                    marginBottom: "10px",
                    color: "#fff",
                  }}
                >
                  {loading ? "Engine Processing..." : "Initialize AI Engine"}
                </h2>
                <p style={{ color: theme.subtext, marginBottom: "32px", lineHeight: "1.6", fontSize: "15px" }}>
                  Upload your financial records, HR logs, or marketing data.
                  <br />
                  Our AI will process these to generate your executive dashboards.
                </p>

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
                              color: i <= ingestStage ? "#06121f" : "#5b6472",
                              boxShadow: i === ingestStage ? "0 0 16px rgba(88,166,255,0.6)" : "none",
                            }}
                          >
                            {i < ingestStage ? "✓" : i + 1}
                          </motion.div>
                          <span style={{ fontSize: 10.5, color: i <= ingestStage ? "#dfe3ea" : "#444c5e", textAlign: "center" }}>
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

                {!loading && (
                  <>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
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
                      <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{isDragOver ? "📥" : "📁"}</div>
                      <span style={{ color: "#aaa", fontSize: "14px" }}>
                        {files.length > 0
                          ? `${files.length} file${files.length > 1 ? "s" : ""} active · ${formatBytes(totalBytes)}`
                          : "Drop files here, or click to browse"}
                      </span>
                    </label>

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
                                color: "#dfe3ea",
                              }}
                            >
                              <span>📄</span>
                              <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {f.name}
                              </span>
                              <span style={{ color: "#5b6472" }}>{formatBytes(f.size)}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFile(f.name);
                                }}
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 18,
                                  height: 18,
                                  color: "#9aa4b2",
                                  cursor: "pointer",
                                  fontSize: 11,
                                  lineHeight: "18px",
                                  padding: 0,
                                }}
                              >
                                ✕
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <motion.button
                  whileHover={
                    !loading
                      ? { scale: 1.02, boxShadow: "0 0 28px rgba(58, 162, 230, 0.55), 0 0 50px rgba(58, 162, 230, 0.25)" }
                      : {}
                  }
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  onClick={handleContinue}
                  disabled={loading}
                  style={primaryBtnStyle}
                >
                  {loading ? `${INGEST_STAGES[ingestStage].label}...` : "Analyze Data & Continue"}
                </motion.button>

                <p style={{ marginTop: 18, fontSize: 11.5, color: "#4d5562", letterSpacing: 0.3 }}>
                  🔒 Encrypted in transit · Stored in PostgreSQL · SOC 2-aligned handling
                </p>
              </motion.div>
            </div>
          )}

          {step === "dashboard" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
              {module === "finance" && <FinanceDashboard />}
              {module === "hr" && <HRDashboard />}
              {module === "marketing" && <MarketingDashboard />}
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
                        fontSize: "3.2rem",
                        marginBottom: "20px",
                        filter: "drop-shadow(0 0 28px rgba(88, 166, 255, 0.4))",
                      }}
                    >
                      📊
                    </div>
                    <h2
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: "300",
                        fontSize: "2rem",
                        letterSpacing: "-0.5px",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      System Ready, {user?.name?.split(" ")[0] || "there"}
                    </h2>
                    <p style={{ color: theme.subtext, fontSize: "14.5px" }}>
                      Select a specialized module below to view real-time insights.
                    </p>
                  </div>

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
                        <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Montserrat', sans-serif" }}>
                          <CountUp value={stat.value} suffix={stat.suffix} />
                        </div>
                        <div style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: 18,
                    }}
                  >
                    {proModules.map((m) => {
                      const key = m.toLowerCase();
                      const meta = MODULE_META[key];
                      return (
                        <MagneticTilt
                          key={m}
                          whileHover={{
                            y: -4,
                            boxShadow: "0 0 40px -8px rgba(58,162,230,0.4), 0 25px 50px -15px rgba(0,0,0,0.8)",
                          }}
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
                              fontSize: 20,
                              marginBottom: 16,
                            }}
                          >
                            {meta.icon}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{meta.label}</div>
                          <div style={{ fontSize: 12.5, color: theme.subtext }}>{meta.blurb}</div>
                        </MagneticTilt>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Action Confirmation Modals Match Structure from Enterprise Layout */}
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
                background: "rgba(5, 8, 14, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 400,
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
                  maxWidth: 400,
                  background: "rgba(18, 22, 30, 0.95)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 24,
                  padding: "32px",
                  textAlign: "center",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🔓</div>
                <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: "1.3rem", fontWeight: 600 }}>Confirm Log Out</h3>
                <p style={{ margin: "0 0 24px", color: theme.subtext, fontSize: "0.95rem", lineHeight: 1.5 }}>
                  Are you sure you want to log out of your session? You will need to authentication credentials again to access data dashboards.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      border: `1px solid ${theme.border}`,
                      background: "rgba(255,255,255,0.03)",
                      color: "#dfe3ea",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutAction}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      background: "#f85149",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                background: "rgba(5, 8, 14, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 400,
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
                  maxWidth: 400,
                  background: "rgba(18, 22, 30, 0.95)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 24,
                  padding: "32px",
                  textAlign: "center",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🚫</div>
                <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: "1.3rem", fontWeight: 600 }}>Cancel Subscription?</h3>
                <p style={{ margin: "0 0 24px", color: theme.subtext, fontSize: "0.95rem", lineHeight: 1.5 }}>
                  This action flags your configuration parameters for downgrade at the completion of your current billing window. Dashboard services remain available until termination date.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      border: `1px solid ${theme.border}`,
                      background: "rgba(255,255,255,0.03)",
                      color: "#dfe3ea",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Keep Pro
                  </button>
                  <button
                    onClick={handleCancelSubscriptionAction}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #e05656 0%, #9f2b2b 100%)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ opacity: 0.6 }}>🔍</span>
                  <input
                    autoFocus
                    value={paletteQuery}
                    onChange={(e) => setPaletteQuery(e.target.value)}
                    placeholder="Type a command or search..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: 15,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "#5b6472",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 6,
                      padding: "3px 7px",
                    }}
                  >
                    ESC
                  </span>
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto", padding: 8 }}>
                  {filteredPaletteActions.length === 0 && (
                    <div style={{ padding: 24, textalign: "center", color: theme.subtext, fontSize: 13 }}>No matching commands</div>
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
                      <span>{a.icon}</span>
                      <span style={{ flex: 1 }}>{a.label}</span>
                      {a.disabled && <span style={{ fontSize: 10.5, color: "#444c5e" }}>Locked</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Montserrat', sans-serif" }}>
                  Keyboard Shortcuts
                </h3>
                {[
                  { keys: ["⌘", "K"], label: "Open command palette" },
                  { keys: ["☰"], label: "Toggle sidebar" },
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

        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 300,
          }}
        >
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
                  color: "#dfe3ea",
                }}
              >
                <span>{t.tone === "success" ? "✅" : "ℹ️"}</span>
                <span style={{ flex: 1 }}>{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (page === "enterpriseDashboard") return <EnterpriseDashboard user={user} onHome={() => setPage("subscription")} />;
  if (page === "subscription") return <Subscription onSubscribe={handleSubscription} onGoToDashboard={() => setPage("proDashboard")} />;

  if (page === "login") {
    return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  }
  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;