import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import ContactUs from "./components/ContactUs";
import AboutApp from "./components/AboutApp";
import Tutorial from "./Tutorial"; // ← NEW IMPORT
import { auth, db } from "./firebase"; 
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import "./Subscription.css";

const plans = [
  { 
    name: "Pro", 
    price: "$25", 
    period: "/month",
    features: ["Interactive Analytics Dashboards", "Secure Multi-format File Uploads", "Dynamic Trend Forecasting", "Automated Compliance Auditing"] 
  },
  { 
    name: "Enterprise", 
    price: "$50", 
    period: "/month",
    features: ["All Features + Core AI Insights", "Predictive Operations & Sales Engine",  "Anomalous Telemetry Mitigation Hooks", "Advanced Encrypted Key Rotation"] 
  },
];

// Premium Tier SaaS FAQ Dataset
const faqs = [
  {
    question: "How does the InsightIQ analytical integration engine connect?",
    answer: "InsightIQ interfaces seamlessly via custom secure multi-format endpoints. Real-time predictive logs map onto interactive dashboards within seconds of initial payload distribution."
  },
  {
    question: "Can we transition between Pro and Enterprise tiers mid-cycle?",
    answer: "Yes. System allocations scale dynamic resources instantly. Final computational invoices are calculated at a pro-rated infrastructure tier cost structure."
  },
  {
    question: "What specific security primitives are enforced across core data?",
    answer: "Data matrices are governed under strict cryptographic protection frameworks. Enterprise pipelines leverage dedicated isolated architecture hooks ensuring end-to-end telemetry isolation."
  }
];

// High-Tier Telemetry KPI Matrix Row Data
const telemetryMetrics = [
  { label: "Core Global API Availability Latency", pro: "< 45ms", enterprise: "< 8ms (Dedicated Edge Router)" },
  { label: "Concurrent Log Analysis Pipeline Throughput", pro: "Up to 50,000/sec", enterprise: "Unlimited / Horizontal Sharding" },
  { label: "Predictive AI Generation Cycle Frequency", pro: "Hourly Intervals", enterprise: "Real-time Stream Pipeline" },
  { label: "Dedicated Isolated Infrastructure Hooks", pro: "Shared VPC Pod", enterprise: "Single-tenant Cryptographic Isolation" },
  { label: "Real-time Anomalous Drift Interception", pro: "Not Available", enterprise: "Sub-millisecond Pre-emptive Purge" },
  { label: "Automated Governance Compliance Anchors", pro: "Daily Verification", enterprise: "Continuous Telemetry Validation Loop" }
];

const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.4)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  accentGlow: "rgba(58, 162, 230, 0.35)"
};

const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.bg,
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
    position: "relative",
    color: theme.text,
  },
  blob: {
    position: "absolute",
    width: "800px",
    height: "800px",
    background: `radial-gradient(circle, ${theme.primary} 0%, rgba(31,111,235,0.2) 60%, transparent 100%)`,
    filter: "blur(140px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  navButton: {
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    border: `1px solid ${theme.border}`,
    background: "rgba(255, 255, 255, 0.02)",
    color: theme.text,
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  card: {
    background: theme.card,
    borderRadius: "32px",
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
    border: `1px solid ${theme.border}`,
    boxShadow: "0 0 40px -10px rgba(58, 162, 230, 0.25), 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.15)",
    transition: "box-shadow 0.3s ease, border-color 0.3s ease"
  },
  input: {
    width: "100%",
    padding: "16px 20px",
    marginBottom: "16px",
    background: "rgba(0, 0, 0, 0.5)",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  },
  titleH1: {
    fontSize: "66px",
    fontWeight: "900",
    fontFamily: "'Montserrat', sans-serif",
    lineHeight: "1.05",
    letterSpacing: "-2.3px",
  },
  saasLoginCard: {
    background: "rgba(18, 22, 30, 0.7)",
    borderRadius: "24px",
    backdropFilter: "blur(32px) saturate(200%)",
    WebkitBackdropFilter: "blur(32px) saturate(200%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 0 60px -10px rgba(58, 162, 230, 0.4), 0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.1)",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    zIndex: 10,
    fontFamily: "Arial, sans-serif"
  },
  saasInputField: {
    width: "100%",
    padding: "14px 18px",
    marginBottom: "18px",
    background: "rgba(5, 8, 14, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.25s ease"
  },
  toggleContainer: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.03)",
    border: `1px solid ${theme.border}`,
    borderRadius: "30px",
    padding: "4px",
    marginBottom: "48px",
    position: "relative",
    zIndex: 2
  },
  toggleButton: {
    padding: "10px 24px",
    background: "transparent",
    border: "none",
    color: theme.subtext,
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "24px",
    cursor: "pointer",
    transition: "color 0.2s ease"
  },
  faqSection: {
    width: "100%",
    maxWidth: "840px",
    margin: "120px auto 40px",
    padding: "0 24px",
    zIndex: 2,
    position: "relative"
  },
  faqItem: {
    background: "rgba(22, 27, 34, 0.2)",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    marginBottom: "16px",
    overflow: "hidden",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  matrixSection: {
    width: "100%",
    maxWidth: "960px",
    margin: "90px auto 20px",
    padding: "48px 32px",
    background: "rgba(22, 27, 34, 0.2)",
    border: `1px solid ${theme.border}`,
    borderRadius: "24px",
    backdropFilter: "blur(20px)",
    zIndex: 2,
    position: "relative"
  },
  footerWrapper: {
    width: "100%",
    borderTop: `1px solid ${theme.border}`,
    background: "rgba(13, 17, 23, 0.7)",
    backdropFilter: "blur(12px)",
    padding: "64px 64px 32px",
    boxSizing: "border-box",
    marginTop: "120px",
    zIndex: 10,
    position: "relative"
  },
  toastBanner: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "14px 28px",
    background: "rgba(22, 27, 34, 0.8)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: `1px solid ${theme.border}`,
    borderRadius: "16px",
    zIndex: 100,
    color: theme.text,
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif",
    boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 30px -5px rgba(58, 162, 230, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  }
};

// ─── ACCESS DENIED MODAL ───────────────────────────────────────────────────────
const AccessDeniedModal = ({ onClose, attemptedPlan }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px"
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(14, 18, 26, 0.92)",
          borderRadius: "24px",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          boxShadow: "0 0 60px -10px rgba(239, 68, 68, 0.3), 0 30px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255,255,255,0.06)",
          padding: "48px 44px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          position: "relative"
        }}
      >
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "120px",
          background: "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%"
        }} />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "26px",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)"
          }}
        >
          🔒
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#ffffff",
            margin: "0 0 10px 0",
            letterSpacing: "-0.4px"
          }}
        >
          Access Denied
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{
            color: theme.subtext,
            fontSize: "13px",
            lineHeight: "1.6",
            margin: "0 0 28px 0"
          }}
        >
          Your credentials do not match an active{" "}
          <span style={{ color: "#f87171", fontWeight: "600" }}>
            {attemptedPlan || "subscription"}
          </span>{" "}
          tier. Verify your account and subscription status before retrying.
        </motion.p>

        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.25), transparent)",
          margin: "0 0 28px 0"
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.07)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "10px",
            marginBottom: "32px"
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 6px #ef4444" }} />
         
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            background: "linear-gradient(135deg, rgba(239,68,68,0.85) 0%, rgba(185,28,28,0.9) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            boxShadow: "0 0 15px rgba(239, 68, 68, 0.2), 0 4px 10px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease"
          }}
        >
          Dismiss & Retry
        </motion.button>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "20px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.25)",
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: 1,
            transition: "color 0.2s ease",
            padding: "4px"
          }}
          onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.25)"}
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);
// ──────────────────────────────────────────────────────────────────────────────

const MagneticCard = ({ children, style, ...props }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-400, 400], [7, -7]);
  const rotateY = useTransform(mouseX, [-400, 400], [-7, 7]);

  return (
    <motion.div
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ─── ROTATING 3D CUBE ────────────────────────────────────────────────────────
const RotatingCube = () => (
  <div style={{
    width: "420px",
    height: "420px",
    position: "relative",
    flexShrink: 0,
    perspective: "900px",
    perspectiveOrigin: "50% 50%",
  }}>
    {/* Ambient glow behind the cube */}
    <div style={{
      position: "absolute",
      inset: "10%",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(58,162,230,0.18) 0%, transparent 70%)",
      filter: "blur(40px)",
      pointerEvents: "none",
    }} />
    <style>{`
      @keyframes iiq-cube-spin {
        0%   { transform: rotateX(15deg) rotateY(0deg)   rotateZ(0deg); }
        100% { transform: rotateX(15deg) rotateY(360deg) rotateZ(0deg); }
      }
      .iiq-cube-scene {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .iiq-cube-wrapper {
        width: 240px;
        height: 240px;
        position: relative;
        transform-style: preserve-3d;
        animation: iiq-cube-spin 10s linear infinite;
      }
      .iiq-cube-face {
        position: absolute;
        width: 240px;
        height: 240px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 3px;
        padding: 3px;
        box-sizing: border-box;
        backface-visibility: visible;
      }
      .iiq-cube-face.front  { transform: translateZ(120px); }
      .iiq-cube-face.back   { transform: rotateY(180deg) translateZ(120px); }
      .iiq-cube-face.right  { transform: rotateY(90deg)  translateZ(120px); }
      .iiq-cube-face.left   { transform: rotateY(-90deg) translateZ(120px); }
      .iiq-cube-face.top    { transform: rotateX(90deg)  translateZ(120px); }
      .iiq-cube-face.bottom { transform: rotateX(-90deg) translateZ(120px); }

      /* Tile variants */
      .iiq-tile-solid {
        border-radius: 5px;
        background: linear-gradient(135deg, #1e2a3a 0%, #111823 100%);
        border: 1px solid rgba(88,166,255,0.18);
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.06);
      }
      .iiq-tile-accent {
        border-radius: 5px;
        background: linear-gradient(135deg, rgba(58,130,200,0.55) 0%, rgba(20,60,110,0.7) 100%);
        border: 1px solid rgba(88,166,255,0.4);
        box-shadow: 0 0 8px rgba(58,162,230,0.35), inset 0 1px 1px rgba(255,255,255,0.1);
      }
      .iiq-tile-grid {
        border-radius: 5px;
        background: linear-gradient(135deg, #16202e 0%, #0d1520 100%);
        border: 1px solid rgba(88,166,255,0.12);
        display: grid;
        grid-template-columns: repeat(3,1fr);
        grid-template-rows: repeat(3,1fr);
        gap: 2px;
        padding: 4px;
        box-sizing: border-box;
      }
      .iiq-tile-grid-dot {
        border-radius: 2px;
        background: rgba(88,166,255,0.25);
      }
      .iiq-tile-dark {
        border-radius: 5px;
        background: #090e16;
        border: 1px solid rgba(255,255,255,0.04);
      }
    `}</style>
    <div className="iiq-cube-scene">
      <div className="iiq-cube-wrapper">
        {["front","back","right","left","top","bottom"].map((face) => (
          <div key={face} className={`iiq-cube-face ${face}`}>
            {/* 9 tiles per face with a varied pattern */}
            {[0,1,2,3,4,5,6,7,8].map((i) => {
              const accentPositions = { front:[4], back:[0,8], right:[2,6], left:[4], top:[1,7], bottom:[3,5] };
              const gridPositions  = { front:[0,8], back:[4], right:[0,8], left:[2,6], top:[4], bottom:[0,8] };
              const darkPositions  = { front:[2,6], back:[2,6], right:[1,7], left:[0,8], top:[0,8], bottom:[1,7] };
              if (accentPositions[face].includes(i)) return <div key={i} className="iiq-tile-accent" />;
              if (gridPositions[face].includes(i))  return (
                <div key={i} className="iiq-tile-grid">
                  {Array(9).fill(0).map((_,j) => <div key={j} className="iiq-tile-grid-dot" />)}
                </div>
              );
              if (darkPositions[face].includes(i))  return <div key={i} className="iiq-tile-dark" />;
              return <div key={i} className="iiq-tile-solid" />;
            })}
          </div>
        ))}
      </div>
    </div>
  </div>
);
// ──────────────────────────────────────────────────────────────────────────────

const DynamicLogo = () => (
  <motion.div
    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "32px", letterSpacing: "-2px", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}
  >
    <span>Insight</span><span style={{ color: theme.primary, fontStyle: "italic", fontWeight: "700" }}>IQ</span>
  </motion.div>
);

const PremiumAuthLayout = ({ children, title, subtitle, onCancel }) => (
  <div style={{ ...styles.pageWrapper, justifyContent: "center", alignItems: "center", padding: "24px" }}>
    <div style={{ ...styles.blob, top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(58, 162, 230, 0.22) 0%, transparent 65%)" }} />

    {/* Giant faint watermark word behind the gateway card */}
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -54%)",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(80px, 16vw, 220px)",
        letterSpacing: "-6px",
        color: "transparent",
        WebkitTextStroke: "1px rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
      }}
    >
      InsightIQ
    </div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(18, 22, 30, 0.35)",
        borderRadius: "24px",
        backdropFilter: "blur(40px) saturate(220%)",
        WebkitBackdropFilter: "blur(40px) saturate(220%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 0 60px -10px rgba(58, 162, 230, 0.35), 0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255,255,255,0.12)",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        zIndex: 10,
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: "0 0 10px 0", letterSpacing: "-0.5px", fontFamily: "Arial, sans-serif" }}>
          {title}
        </h2>
        <p style={{ color: theme.subtext, fontSize: "13px", margin: 0, lineHeight: "1.4", fontFamily: "Arial, sans-serif" }}>
          {subtitle}
        </p>
      </div>

      {children}

      <button 
        onClick={onCancel} 
        style={{ 
          background: "none", 
          border: "none", 
          color: "rgba(255, 255, 255, 0.4)", 
          marginTop: "24px", 
          cursor: "pointer", 
          fontSize: "13px", 
          width: "100%", 
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          transition: "color 0.2s ease"
        }}
        onMouseEnter={(e) => e.target.style.color = "#fff"}
        onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.4)"}
      >
        ← Return back to pricing plans
      </button>
    </motion.div>
  </div>
);

// High-Tier Micro Accordion Sub-Component
const FaqAccordionItem = ({ question, answer, forceOpen, forceClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (forceClose) setIsOpen(false);
  }, [forceClose]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        ...styles.faqItem, 
        borderColor: isOpen ? "rgba(58, 162, 230, 0.4)" : isHovered ? "rgba(255,255,255,0.15)" : theme.border,
        background: isOpen ? "rgba(22, 27, 34, 0.4)" : isHovered ? "rgba(255,255,255,0.02)" : "rgba(22, 27, 34, 0.2)"
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "24px 32px",
          background: "transparent",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
          outline: "none"
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "600", color: isOpen ? theme.primary : "#ffffff", transition: "color 0.2s" }}>
          {question}
        </span>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: theme.primary, fontSize: "16px", fontWeight: "bold" }}
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div style={{ padding: "0 32px 24px 32px", color: theme.subtext, fontSize: "14px", lineHeight: "1.6" }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Subscription({ onSubscribe, onGoToDashboard }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [goToPayment, setGoToPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false); // ← NEW STATE

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [verifyEnterprise, setVerifyEnterprise] = useState(false);

  const [proEmail, setProEmail] = useState("");
  const [proPassword, setProPassword] = useState("");
  const [verifyPro, setVerifyPro] = useState(false);

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(false);

  const [currency, setCurrency] = useState("USD");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [masterFaqState, setMasterFaqState] = useState({ forceOpen: false, forceClose: false });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedPlanName, setDeniedPlanName] = useState("");

  const handleCurrencyToggle = (selectedCurrency) => {
    handleTrackAnalyticsClick("Currency Switch: " + selectedCurrency);
    setCurrency(selectedCurrency);
  };

  const getCurrencySymbolAndPrice = (basePriceInUsd) => {
    const rawNumeric = parseInt(basePriceInUsd.replace("$", ""), 10);
    if (currency === "PKR") return { symbol: "Rs ", price: Math.floor(rawNumeric * 278) };
    return { symbol: "$", price: rawNumeric };
  };

  const handleSearchFaq = (e) => {
    setFaqSearchQuery(e.target.value);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const handleToggleAllFaqs = (action) => {
    handleTrackAnalyticsClick("FAQ Master Switch: " + action);
    if (action === "expand") {
      setMasterFaqState({ forceOpen: true, forceClose: false });
    } else {
      setMasterFaqState({ forceOpen: false, forceClose: true });
    }
    setTimeout(() => setMasterFaqState({ forceOpen: false, forceClose: false }), 150);
  };

  const handleSharePlan = (planName) => {
    handleTrackAnalyticsClick("Share Triggered: " + planName);
    const simulatedLink = window.location.origin + "?tier=" + planName.toLowerCase() + "&cycle=" + billingCycle;
    navigator.clipboard.writeText(simulatedLink).then(() => {
      setToastMessage("Copied shareable environment route for " + planName + "!");
      setTimeout(() => setToastMessage(""), 4000);
    }).catch(() => {
      alert("Failed to access system clipboard environment.");
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterStatus("Invalid stream subscription route.");
      return;
    }
    handleTrackAnalyticsClick("Newsletter Ingest: " + newsletterEmail);
    setNewsletterStatus("Terminal registration successful. Telemetry stream locked.");
    setNewsletterEmail("");
  };

  const handleResetFilters = () => {
    setCurrency("USD");
    setBillingCycle("monthly");
    setFaqSearchQuery("");
    handleTrackAnalyticsClick("System Control Variables Reset Flush");
  };

  const handleTrackAnalyticsClick = (interactionName) => {
    console.log("[TELEMETRY STREAM LOG] Ingested user event hook direct mapping metrics: " + interactionName);
  };

  const handleFeedbackSubmit = (rating) => {
    setUserRating(rating);
    setFeedbackSubmitted(true);
    handleTrackAnalyticsClick("Satisfaction Rating Score Received: " + rating + " Stars");
  };

  const handleDownloadSpecSheet = () => {
    handleTrackAnalyticsClick("Spec Sheet System Manifest Download Requested");
    const documentContent = "# InsightIQ Structural Matrix Parameters\n\nGenerated: " + new Date().toISOString() + "\n- Current Ingest Frequency: " + currency + "\n- Configured Cycle: " + billingCycle + "\n- Verified Status: Operational Cluster\n";
    const environmentBlob = new Blob([documentContent], { type: "text/markdown" });
    const dynamicAnchor = document.createElement("a");
    dynamicAnchor.href = URL.createObjectURL(environmentBlob);
    dynamicAnchor.download = "insightiq_telemetry_blueprint.md";
    document.body.appendChild(dynamicAnchor);
    dynamicAnchor.click();
    document.body.removeChild(dynamicAnchor);
  };

  const handleBusinessAuth = async (email, password, type) => {
    if (!email || !password) {
      alert("Please enter Email and Password to continue!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const subDoc = await getDoc(doc(db, "subscriptions", uid));

      if (subDoc.exists()) {
        const subData = subDoc.data();
        const paidPlan = subData.plan.toLowerCase();
        const targetDashboard = type.toLowerCase();

        if (paidPlan === targetDashboard) {
          if (paidPlan === "enterprise") {
            onSubscribe("enterprise");
          } else {
            onGoToDashboard();
          }
        } else {
          await signOut(auth);
          setDeniedPlanName(type.charAt(0).toUpperCase() + type.slice(1));
          setAccessDenied(true);
        }
      } else {
        await signOut(auth);
        setDeniedPlanName(type.charAt(0).toUpperCase() + type.slice(1));
        setAccessDenied(true);
      }
    } catch (error) {
      setDeniedPlanName(type.charAt(0).toUpperCase() + type.slice(1));
      setAccessDenied(true);
    }
  };

  useEffect(() => {
    if (paymentComplete && selectedPlan) {
      if (selectedPlan.name === "Enterprise") {
        setVerifyEnterprise(true);
      } else if (selectedPlan.name === "Pro") {
        setVerifyPro(true);
      }
    }
  }, [paymentComplete, selectedPlan]);

  // ── TUTORIAL PAGE ROUTE ────────────────────────────────────────────────────
  if (showTutorial) {
    return <Tutorial onBack={() => setShowTutorial(false)} />;
  }

  // Premium SaaS Enterprise Auth
  if (verifyEnterprise) {
    return (
      <>
        <PremiumAuthLayout 
          title="Enterprise Terminal Gateway" 
          subtitle="Log into your interactive metrics tracking runtime environment."
          onCancel={() => setVerifyEnterprise(false)}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleBusinessAuth(authEmail, authPassword, "enterprise"); }}>
            <input 
              type="email" 
              placeholder="name@company.com" 
              style={styles.saasInputField} 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "rgba(58, 162, 230, 0.6)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
            />
            <input 
              type="password" 
              placeholder="••••••••••••" 
              style={styles.saasInputField} 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              onFocus={(e) => e.target.style.borderColor = "rgba(58, 162, 230, 0.6)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
            />
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              style={{ 
                width: "100%", padding: "14px", 
                background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
                border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", 
                fontWeight: "700", cursor: "pointer", color: "#ffffff", 
                fontFamily: "Arial, sans-serif", fontSize: "14px", marginTop: "8px",
                boxShadow: "0 0 15px rgba(58, 162, 230, 0.3)", transition: "all 0.25s ease"
              }}
            >
              Access Enterprise Plan 
            </motion.button>
          </form>
        </PremiumAuthLayout>
        {accessDenied && <AccessDeniedModal attemptedPlan={deniedPlanName} onClose={() => setAccessDenied(false)} />}
      </>
    );
  }

  // Premium SaaS Pro Auth
  if (verifyPro) {
    return (
      <>
        <PremiumAuthLayout 
          title="Pro Terminal Gateway" 
          subtitle="Log into your interactive metrics tracking runtime environment."
          onCancel={() => setVerifyPro(false)}
        >
          <form onSubmit={(e) => { e.preventDefault(); handleBusinessAuth(proEmail, proPassword, "pro"); }}>
            <input 
              type="email" 
              placeholder="Account profile email address" 
              style={styles.saasInputField} 
              value={proEmail} 
              onChange={(e) => setProEmail(e.target.value)} 
              onFocus={(e) => e.target.style.borderColor = "rgba(58, 162, 230, 0.6)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
            />
            <input 
              type="password" 
              placeholder="••••••••••••" 
              style={styles.saasInputField} 
              value={proPassword} 
              onChange={(e) => setProPassword(e.target.value)} 
              onFocus={(e) => e.target.style.borderColor = "rgba(58, 162, 230, 0.6)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
            />
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              style={{ 
                width: "100%", padding: "14px", 
                background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
                border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", 
                fontWeight: "700", cursor: "pointer", color: "#ffffff", 
                fontFamily: "Arial, sans-serif", fontSize: "14px", marginTop: "8px",
                boxShadow: "0 0 15px rgba(58, 162, 230, 0.3)", transition: "all 0.25s ease"
              }}
            >
               Access Pro Plan
            </motion.button>
          </form>
        </PremiumAuthLayout>
        {accessDenied && <AccessDeniedModal attemptedPlan={deniedPlanName} onClose={() => setAccessDenied(false)} />}
      </>
    );
  }

  if (goToPayment && selectedPlan) {
    return <PaymentPage plan={selectedPlan} onSuccess={() => setPaymentComplete(true)} onBack={() => setGoToPayment(false)} />;
  }

  if (showContact) return <ContactUs onBack={() => setShowContact(false)} />;
  if (showAbout) return <AboutApp onBack={() => setShowAbout(false)} />;

  return (
    <div style={{ ...styles.pageWrapper, flexDirection: "column" }}>

      <style>{`
        @keyframes iiq-float-a  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(.4deg)} }
        @keyframes iiq-float-b  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(-.3deg)} }
        @keyframes iiq-blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes iiq-spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes iiq-beam {
          0%   { transform: translateX(-100%) skewX(-15deg); opacity:0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(400%) skewX(-15deg); opacity:0; }
        }

        .iiq-float-card-0 { animation: iiq-float-a 10s ease-in-out infinite; }
        .iiq-float-card-1 { animation: iiq-float-b 12s ease-in-out infinite 1.8s; }

        .iiq-live-badge { display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);border-radius:20px;font-size:10px;font-weight:700;color:#34d399;letter-spacing:.4px;margin-bottom:16px;animation:iiq-float-a 4s ease-in-out infinite; }
        .iiq-live-dot   { width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;animation:iiq-blink 1.4s ease-in-out infinite; }

        .iiq-savings-chip { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);border-radius:12px;font-size:11px;font-weight:700;color:#34d399;margin-bottom:20px; }

        .iiq-feature-check { display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:rgba(88,166,255,.12);border:1px solid rgba(88,166,255,.25);flex-shrink:0;font-size:10px;color:#58a6ff; }

        .iiq-beam-wrap { position:absolute;inset:0;overflow:hidden;border-radius:32px;pointer-events:none; }
        .iiq-beam {
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: iiq-beam 3.5s ease-in-out infinite;
        }

        .iiq-top-line {
          position: absolute;
          top: 0; left: 20%; right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(88,166,255,0.6), transparent);
          border-radius: 1px;
        }

        .iiq-ring-border {
          position: absolute;
          inset: -1px;
          border-radius: 33px;
          pointer-events: none;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(88,166,255,0.5) 60deg, transparent 120deg, transparent 360deg);
          animation: iiq-spin 6s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          padding: 1px;
        }

        .iiq-btn-wrap {
          position: relative;
          display: inline-block;
        }
        .iiq-btn-wrap::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(88,166,255,0.5), rgba(29,82,143,0.3), rgba(88,166,255,0.5));
          z-index: 0;
          animation: iiq-spin 4s linear infinite;
        }

        .saas-nav-link:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }

        /* Tutorial button pulse glow */
        @keyframes tut-btn-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(88,166,255,0.2); }
          50% { box-shadow: 0 0 18px rgba(88,166,255,0.45); }
        }
        .iiq-tutorial-btn {
          animation: tut-btn-glow 3s ease-in-out infinite;
        }
        .iiq-tutorial-btn:hover {
          background: rgba(88,166,255,0.12) !important;
          border-color: rgba(88,166,255,0.5) !important;
          color: #fff !important;
        }

        /* ── AMBIANCE ELEMENTS ───────────────────────────────── */

        /* Dot grid */
        .iiq-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(88,166,255,0.13) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%);
          z-index: 0;
        }

        /* Floating particles */
        @keyframes iiq-particle-rise {
          0%   { transform: translateY(0px) scale(1);   opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
        }
        .iiq-particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #58a6ff;
          box-shadow: 0 0 6px #58a6ff;
          animation: iiq-particle-rise linear infinite;
          pointer-events: none;
        }

        /* Cube corner brackets */
        .iiq-bracket {
          position: absolute;
          width: 20px; height: 20px;
          border-color: rgba(88,166,255,0.5);
          border-style: solid;
          pointer-events: none;
        }
        .iiq-bracket-tl { top: 8px; left: 8px;  border-width: 2px 0 0 2px; }
        .iiq-bracket-tr { top: 8px; right: 8px;  border-width: 2px 2px 0 0; }
        .iiq-bracket-bl { bottom: 8px; left: 8px;  border-width: 0 0 2px 2px; }
        .iiq-bracket-br { bottom: 8px; right: 8px;  border-width: 0 2px 2px 0; }

        /* Announcement badge */
        @keyframes iiq-badge-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(88,166,255,0.3); }
          50%     { box-shadow: 0 0 0 5px rgba(88,166,255,0); }
        }
        .iiq-announce-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px 5px 6px;
          background: rgba(88,166,255,0.07);
          border: 1px solid rgba(88,166,255,0.3);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #a8d4ff;
          margin-bottom: 22px;
          cursor: default;
          animation: iiq-badge-pulse 2.5s ease-in-out infinite;
          width: fit-content;
        }
        .iiq-announce-badge .iiq-badge-pill {
          background: linear-gradient(135deg, #58a6ff, #1d528f);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          letter-spacing: 0.4px;
        }

        /* CTA buttons */
        .iiq-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: #ffffff;
          color: #0d1117;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2);
        }
        .iiq-cta-primary:hover {
          background: #e8f4ff;
          box-shadow: 0 0 20px rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.4);
          transform: translateY(-1px);
        }
        .iiq-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: rgba(88,166,255,0.07);
          color: #a8d4ff;
          border: 1px solid rgba(88,166,255,0.3);
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .iiq-cta-secondary:hover {
          background: rgba(88,166,255,0.14);
          border-color: rgba(88,166,255,0.6);
          color: #fff;
          transform: translateY(-1px);
        }

        /* Stats row */
        .iiq-stat-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.08);
        }

        /* Orbit ring around cube */
        @keyframes iiq-orbit {
          from { transform: rotateZ(0deg); }
          to   { transform: rotateZ(360deg); }
        }
        .iiq-orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(88,166,255,0.12);
          pointer-events: none;
        }
        .iiq-orbit-ring-1 {
          width: 340px; height: 340px;
          top: 50%; left: 50%;
          margin: -170px 0 0 -170px;
          animation: iiq-orbit 18s linear infinite;
          border-style: dashed;
        }
        .iiq-orbit-ring-2 {
          width: 460px; height: 460px;
          top: 50%; left: 50%;
          margin: -230px 0 0 -230px;
          animation: iiq-orbit 28s linear infinite reverse;
          border-color: rgba(88,166,255,0.06);
        }
        /* Dot on orbit ring */
        .iiq-orbit-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #58a6ff;
          box-shadow: 0 0 8px #58a6ff;
          top: -3px; left: 50%; margin-left: -3px;
        }
      `}</style>

      {/* Canvas Lights */}
      <motion.div animate={{ x: [-30, 30, -30], y: [0, 60, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} style={{ ...styles.blob, top: "-15%", right: "-10%" }} />
      <motion.div animate={{ x: [30, -30, 30], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} style={{ ...styles.blob, bottom: "-20%", left: "-10%", background: "radial-gradient(circle, #1f6feb 0%, transparent 70%)", opacity: 0.08 }} />

      {/* Dot grid ambient overlay */}
      <div className="iiq-dot-grid" />

      {/* Floating particles */}
      {[
        { left: "12%",  bottom: "18%", size: "3px", dur: "6s",   delay: "0s"   },
        { left: "22%",  bottom: "30%", size: "2px", dur: "9s",   delay: "1.5s" },
        { left: "35%",  bottom: "12%", size: "4px", dur: "7s",   delay: "0.8s" },
        { left: "60%",  bottom: "22%", size: "2px", dur: "11s",  delay: "2s"   },
        { left: "75%",  bottom: "35%", size: "3px", dur: "8s",   delay: "0.3s" },
        { left: "88%",  bottom: "15%", size: "2px", dur: "10s",  delay: "3s"   },
        { left: "50%",  bottom: "8%",  size: "3px", dur: "7.5s", delay: "1s"   },
      ].map((p, i) => (
        <div key={i} className="iiq-particle" style={{
          left: p.left, bottom: p.bottom,
          width: p.size, height: p.size,
          animationDuration: p.dur,
          animationDelay: p.delay,
          zIndex: 1,
        }} />
      ))}

      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95, translateX: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, translateX: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.95, translateX: "-50%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={styles.toastBanner}
          >
            <span style={{ color: theme.primary }}>✦</span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 64px", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
        <DynamicLogo />
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>

          {/* ── TUTORIAL BUTTON (new) ── */}
          <motion.button
            className="iiq-tutorial-btn saas-nav-link"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              handleTrackAnalyticsClick("Tutorial Navigation Clicked");
              setShowTutorial(true);
            }}
            style={{
              ...styles.navButton,
              borderColor: "rgba(88,166,255,0.35)",
              background: "rgba(88,166,255,0.06)",
              color: theme.primary,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "13px" }}></span>
            Tutorial
          </motion.button>

          <button style={styles.navButton} onClick={() => { handleTrackAnalyticsClick("Our Story Navigation Clicked"); setShowAbout(true); }} className="saas-nav-link">Our Story</button>
          <button style={styles.navButton} onClick={() => { handleTrackAnalyticsClick("Support Navigation Clicked"); setShowContact(true); }} className="saas-nav-link">Support</button>
          
          <motion.button 
            whileHover={{ boxShadow: "0 0 15px rgba(58, 162, 230, 0.4)", borderColor: "rgba(58, 162, 230, 0.6)" }}
            style={{ ...styles.navButton, borderColor: "rgba(255,255,255,0.15)" }} 
            onClick={() => setVerifyPro(true)} 
            className="saas-nav-link"
          >
            Pro Portal
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255, 255, 255, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            style={{ ...styles.navButton, background: "#fff", color: "#000", border: "none" }} 
            onClick={() => setVerifyEnterprise(true)} 
            className="saas-nav-action"
          >
            Enterprise Environment
          </motion.button>
        </div>
      </header>

      {/* ── HERO — left text + right rotating cube ─────────────────────────── */}
      <section style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 80px 56px",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 2,
        gap: "48px",
        minHeight: "560px",
      }}>
        {/* Left: hero text + badge + CTAs + stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ flex: "1 1 0", minWidth: 0 }}
        >
        
    

          <h1 style={{ ...styles.titleH1, margin: "0 0 24px 0", textAlign: "left" }}>
            Insight-driven intelligence <br />
            <span style={{ color: "transparent", background: "linear-gradient(90deg, #fff, #8b949e)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              built for smart infrastructure.
            </span>
          </h1>

          <p style={{ color: theme.subtext, fontSize: "16px", maxWidth: "500px", margin: "0 0 36px 0", lineHeight: "1.7", fontWeight: 400, textAlign: "left" }}>
            Transform multi-layered computational operational logs into crisp, beautifully intuitive real-time strategic projections.
          </p>

         
        </motion.div>

        {/* Right: rotating 3D cube with orbit rings + corner brackets */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ flexShrink: 0, position: "relative", width: "460px", height: "460px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {/* Orbit rings */}
          <div className="iiq-orbit-ring iiq-orbit-ring-1">
            <div className="iiq-orbit-dot" />
          </div>
          <div className="iiq-orbit-ring iiq-orbit-ring-2">
            <div className="iiq-orbit-dot" style={{ background: "rgba(88,166,255,0.5)", boxShadow: "0 0 6px rgba(88,166,255,0.5)" }} />
          </div>

          {/* Corner brackets framing the cube */}
          <div className="iiq-bracket iiq-bracket-tl" />
          <div className="iiq-bracket iiq-bracket-tr" />
          <div className="iiq-bracket iiq-bracket-bl" />
          <div className="iiq-bracket iiq-bracket-br" />


          <RotatingCube />
        </motion.div>
      </section>

      {/* Rest of main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px 80px", position: "relative", zIndex: 2 }}>

        {/* Currency Controls */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", zIndex: 5 }}>
          {["USD", "PKR"].map((currOption) => (
            <button
              key={currOption}
              onClick={() => handleCurrencyToggle(currOption)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                border: `1px solid ${currency === currOption ? theme.primary : theme.border}`,
                background: currency === currOption ? "rgba(88, 166, 255, 0.15)" : "rgba(255, 255, 255, 0.02)",
                color: currency === currOption ? "#fff" : theme.subtext,
                transition: "all 0.2s"
              }}
            >
              {currOption}
            </button>
          ))}
          {(currency !== "USD" || billingCycle !== "monthly" || faqSearchQuery !== "") && (
            <button
              onClick={handleResetFilters}
              style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1px dashed rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.05)", color: "#f87171" }}
            >
              Reset Filters ↺
            </button>
          )}
        </div>

        {/* Billing Toggle */}
        <div style={styles.toggleContainer}>
          <button 
            onClick={() => { handleTrackAnalyticsClick("Billing Cycle: Monthly"); setBillingCycle("monthly"); }}
            style={{ 
              ...styles.toggleButton, 
              color: billingCycle === "monthly" ? "#fff" : theme.subtext,
              background: billingCycle === "monthly" ? "rgba(255, 255, 255, 0.08)" : "transparent"
            }}
          >
            Monthly Billing
          </button>
          <button 
            onClick={() => { handleTrackAnalyticsClick("Billing Cycle: Annual"); setBillingCycle("annual"); }}
            style={{ 
              ...styles.toggleButton, 
              color: billingCycle === "annual" ? theme.primary : theme.subtext,
              background: billingCycle === "annual" ? "rgba(88, 166, 255, 0.15)" : "transparent"
            }}
          >
            Annual Plan <span style={{ fontSize: "11px", marginLeft: "4px", padding: "2px 6px", borderRadius: "8px", background: theme.primary, color: "#000", fontWeight: "bold" }}>Save 20%</span>
          </button>
        </div>

        {/* ── PRICING SECTION WRAPPER (watermark lives here) ────────────────── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1100px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Giant faint watermark word behind the pricing cards */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(70px, 13vw, 200px)",
              letterSpacing: "-6px",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.06)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          >
            InsightIQ
          </div>

          {/* Pricing Cards */}
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center", width: "100%", position: "relative", zIndex: 2 }}>
            {plans.map((plan, index) => {
              const isEnterprise = plan.name === "Enterprise";
              const baseData = getCurrencySymbolAndPrice(plan.price);
              let rawNumericPrice = baseData.price;
              
              if (billingCycle === "annual") {
                rawNumericPrice = Math.floor(rawNumericPrice * 12 * 0.8);
              }

              const calculatedPrice = baseData.symbol + rawNumericPrice;
              const calculatedPeriod = billingCycle === "annual" ? "/year" : "/month";
              const annualSavings = billingCycle === "annual"
                ? baseData.symbol + Math.floor(baseData.price * 12 * 0.2)
                : null;

              return (
                <div
                  key={plan.name}
                  className={`iiq-float-card-${index}`}
                  style={{ width: "100%", maxWidth: "420px", paddingTop: isEnterprise ? "14px" : "0" }}
                >
                  <MagneticCard
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 90, damping: 20 }}
                    whileHover={{ 
                      boxShadow: isEnterprise
                        ? "0 0 60px -5px rgba(88,166,255,0.5), 0 30px 60px -10px rgba(0,0,0,0.9)"
                        : "0 0 50px -5px rgba(58, 162, 230, 0.45), 0 30px 60px -10px rgba(0, 0, 0, 0.85)",
                      borderColor: "rgba(88, 166, 255, 0.4)"
                    }}
                    style={{ 
                      background: "rgba(18, 22, 30, 0.32)",
                      borderRadius: "32px",
                      backdropFilter: "blur(36px) saturate(200%)",
                      WebkitBackdropFilter: "blur(36px) saturate(200%)",
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 0 40px -10px rgba(58, 162, 230, 0.22), 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.12)",
                      transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      ...(isEnterprise ? {
                        borderColor: "rgba(58, 162, 230, 0.32)",
                        boxShadow: "0 0 0 1px rgba(58,162,230,0.16), 0 0 40px -10px rgba(58,162,230,0.3), 0 25px 50px -12px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.12)"
                      } : {}),
                      width: "100%", 
                      padding: "54px 40px", 
                      boxSizing: "border-box", 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center",
                      justifyContent: "space-between", 
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div className="iiq-beam-wrap"><div className="iiq-beam" /></div>
                    <div className="iiq-top-line" />
                    {isEnterprise && <div className="iiq-ring-border" />}

                    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <h3 style={{ fontSize: "32px", fontWeight: "700", color: isEnterprise ? "#7aa2d4" : "#798cb3", margin: "0 0 14px 0", letterSpacing: "-0.5px", fontFamily: "'Inter', sans-serif" }}>
                        {plan.name}
                      </h3>
                      <p style={{ color: theme.subtext, fontSize: "13px", textAlign: "center", margin: "0 0 24px 0", padding: "0 14px", lineHeight: "1.4" }}>
                        {plan.tagline}
                      </p>

                      <div style={{ display: "flex", alignItems: "baseline", marginBottom: "10px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "800", color: isEnterprise ? "#58a6ff" : "#3aa2e6", fontFamily: "'Montserrat', sans-serif", letterSpacing: "-1px" }}>
                          {calculatedPrice}
                        </span>
                        <span style={{ fontSize: "14px", color: theme.subtext, marginLeft: "4px" }}>
                          {calculatedPeriod}
                        </span>
                      </div>

                      {annualSavings ? (
                        <div className="iiq-savings-chip">✦ You save {annualSavings} per year</div>
                      ) : (
                        <div style={{ marginBottom: "20px" }} />
                      )}

                      <span 
                        onClick={() => handleSharePlan(plan.name)}
                        style={{ fontSize: "11px", color: theme.primary, cursor: "pointer", textDecoration: "underline", marginBottom: "28px", opacity: 0.7 }}
                      >
                        🔗 Share tier route
                      </span>
                      
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", width: "100%" }}>
                        {plan.features.map((feature, i) => (
                          <li key={i} style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="iiq-feature-check">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="iiq-btn-wrap" style={{ position: "relative" }}>
                      <motion.button 
                        whileHover={{ 
                          scale: 1.04,
                          boxShadow: isEnterprise
                            ? "0 0 30px rgba(88,166,255,0.65), 0 0 60px rgba(88,166,255,0.3)"
                            : "0 0 25px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3)",
                        }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          handleTrackAnalyticsClick("Checkout Initiated: " + plan.name);
                          setSelectedPlan({ ...plan, price: calculatedPrice, period: calculatedPeriod });
                          setGoToPayment(true);
                        }}
                        style={{ 
                          position: "relative",
                          zIndex: 1,
                          width: "160px", 
                          padding: "12px 0", 
                          borderRadius: "24px", 
                          fontSize: "14px", 
                          fontWeight: "700", 
                          cursor: "pointer", 
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          background: isEnterprise
                            ? "linear-gradient(135deg, #58a6ff 0%, #1d528f 100%)"
                            : "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
                          color: "#fff",
                          boxShadow: isEnterprise
                            ? "0 0 20px rgba(88,166,255,0.45)"
                            : "0 0 15px rgba(58, 162, 230, 0.3)",
                          textAlign: "center",
                        }}
                      >
                        {isEnterprise ? "Get Started" : "Subscribe"}
                      </motion.button>
                    </div>
                  </MagneticCard>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrix Toggle + Export */}
        <div style={{ marginTop: "40px", zIndex: 3, display: "flex", gap: "24px", alignItems: "center" }}>
          <button 
            onClick={() => { handleTrackAnalyticsClick("Toggle Matrix View"); setShowFeatureMatrix(!showFeatureMatrix); }}
            style={{
              background: "transparent",
              border: "none",
              color: theme.primary,
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "underline"
            }}
          >
            {showFeatureMatrix ? "Hide Detailed Infrastructure Matrix ↑" : "Compare Detailed Infrastructure Primitives ↓"}
          </button>
          
          <button
            onClick={handleDownloadSpecSheet}
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${theme.border}`, padding: "6px 14px", borderRadius: "8px", fontSize: "12px", color: "#fff", cursor: "pointer" }}
          >
            💾 Export Specs Manifest (.md)
          </button>
        </div>

        {/* Feature Matrix Drawer */}
        <AnimatePresence>
          {showFeatureMatrix && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={styles.matrixSection}
            >
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", textAlign: "center", letterSpacing: "-0.5px" }}>
                Deep Architecture Verification Primitives
              </h3>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}`, color: "#fff" }}>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>System Capability Framework</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Pro Cluster</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600", color: theme.primary }}>Enterprise Stack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetryMetrics.map((row, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, color: theme.subtext }}>
                        <td style={{ padding: "16px", fontWeight: "500", color: "#fff" }}>{row.label}</td>
                        <td style={{ padding: "16px" }}>{row.pro}</td>
                        <td style={{ padding: "16px", color: "rgba(88, 166, 255, 0.85)" }}>{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <section style={styles.faqSection}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: theme.subtext, fontSize: "15px", marginBottom: "24px" }}>
              Everything you need to understand about the InsightIQ orchestration engine.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", maxWidth: "480px", margin: "0 auto" }}>
              <input 
                type="text" 
                placeholder="🔍 Search infrastructure queries..."
                value={faqSearchQuery}
                onChange={handleSearchFaq}
                style={{ width: "100%", padding: "12px 18px", background: "rgba(0,0,0,0.3)", border: `1px solid ${theme.border}`, borderRadius: "12px", color: "#fff", fontSize: "14px", outline: "none" }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <span onClick={() => handleToggleAllFaqs("expand")} style={{ fontSize: "12px", color: theme.primary, cursor: "pointer", textDecoration: "underline" }}>Expand All</span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                <span onClick={() => handleToggleAllFaqs("collapse")} style={{ fontSize: "12px", color: theme.primary, cursor: "pointer", textDecoration: "underline" }}>Collapse All</span>
              </div>
            </div>
          </div>
          <div>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FaqAccordionItem 
                  key={index} 
                  question={faq.question} 
                  answer={faq.answer} 
                  forceOpen={masterFaqState.forceOpen}
                  forceClose={masterFaqState.forceClose}
                />
              ))
            ) : (
              <div style={{ textAlign: "center", color: theme.subtext, fontSize: "14px", padding: "20px" }}>
                No database metrics matched your search terms literal string.
              </div>
            )}
          </div>
        </section>

        {/* Feedback Widget */}
        <div style={{ margin: "40px auto 0", textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.01)", border: `1px solid ${theme.border}`, borderRadius: "16px", maxWidth: "400px", width: "100%", zIndex: 2 }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>System Environment Optimization Score</h4>
          {!feedbackSubmitted ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => handleFeedbackSubmit(star)}
                  style={{ fontSize: "20px", cursor: "pointer", color: userRating >= star ? "#58a6ff" : "rgba(255,255,255,0.2)" }}
                  onMouseEnter={() => setUserRating(star)}
                  onMouseLeave={() => setUserRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "12px", color: "#34d399", margin: "8px 0 0 0" }}>Log metrics recorded. Thank you for refining infrastructure.</p>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer style={styles.footerWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", maxWidth: "1200px", margin: "0 auto 48px" }}>
          <div style={{ flex: "1 1 250px" }}>
            <DynamicLogo />
            <p style={{ color: theme.subtext, fontSize: "13px", marginTop: "16px", lineHeight: "1.6", maxWidth: "240px" }}>
              Architecting the next standard of system telemetry monitoring and programmatic log mapping analytics.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", color: theme.subtext, marginBottom: "8px", fontWeight: "600" }}>JOIN RELEASES DEPLOYMENT LOOP</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="email" 
                  placeholder="terminal@engine.io"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{ padding: "8px 12px", background: "#000", border: `1px solid ${theme.border}`, borderRadius: "8px", fontSize: "12px", color: "#fff", outline: "none", width: "160px" }}
                />
                <button type="submit" style={{ padding: "8px 12px", borderRadius: "8px", background: theme.primary, border: "none", color: "#000", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>Ingest</button>
              </div>
              {newsletterStatus && <p style={{ fontSize: "11px", marginTop: "6px", color: newsletterStatus.includes("successful") ? "#34d399" : "#f87171" }}>{newsletterStatus}</p>}
            </form>
          </div>
          
          <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Product</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <li><a href="#features" style={{ color: theme.subtext, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = theme.subtext}>Features</a></li>
                <li><a href="#security" style={{ color: theme.subtext, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = theme.subtext}>Security</a></li>
                <li><a href="#pricing" style={{ color: theme.subtext, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#fff"} onMouseLeave={(e) => e.target.style.color = theme.subtext}>Pricing</a></li>
                <li>
                  <span 
                    style={{ color: theme.subtext, textDecoration: "none", cursor: "pointer", transition: "color 0.2s" }} 
                    onMouseEnter={(e) => e.target.style.color = "#fff"} 
                    onMouseLeave={(e) => e.target.style.color = theme.subtext}
                    onClick={() => { handleTrackAnalyticsClick("Footer: Tutorial"); setShowTutorial(true); }}
                  >
                    Tutorial
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Company</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <li><span style={{ color: theme.subtext, cursor: "pointer" }} onClick={() => { handleTrackAnalyticsClick("Footer: About Us"); setShowAbout(true); }}>Our Story</span></li>
                <li><span style={{ color: theme.subtext, cursor: "pointer" }} onClick={() => { handleTrackAnalyticsClick("Footer: Contact Us"); setShowContact(true); }}>Support</span></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>Legal</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <li><a href="#privacy" style={{ color: theme.subtext, textDecoration: "none" }}>Privacy Policy</a></li>
                <li><a href="#terms" style={{ color: theme.subtext, textDecoration: "none" }}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", borderTop: `1px solid rgba(255,255,255,0.04)`, paddingTop: "24px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          <span>&copy; {new Date().getFullYear()} InsightIQ Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>System Status: <span style={{ color: "#34d399" }}>● Operational</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}