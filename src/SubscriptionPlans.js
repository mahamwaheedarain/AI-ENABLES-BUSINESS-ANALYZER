import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import ContactUs from "./components/ContactUs";
import AboutApp from "./components/AboutApp";
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
    features: ["All Features + Core AI Insights", "Predictive Operations & Sales Engine", "Custom Infrastructure Hooks", "Dedicated 24/7 Priority SLA", "Multi-Tenant Workspace Partitioning", "Anomalous Telemetry Mitigation Hooks", "Advanced Encrypted Key Rotation"] 
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
  accentGlow: "rgba(58, 162, 230, 0.35)" // Tuned for higher vibrance
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
    fontSize: "72px",
    fontWeight: "900",
    fontFamily: "'Montserrat', sans-serif",
    lineHeight: "1.05",
    letterSpacing: "-2.5px",
  },
  // Premium SaaS Arial Specific Overrides for Login Viewports
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
  // Dynamic SaaS Layout Additions Preserving Visual Standards Perfectly
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
  }
};

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
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 15 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={styles.saasLoginCard}
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

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [verifyEnterprise, setVerifyEnterprise] = useState(false);

  const [proEmail, setProEmail] = useState("");
  const [proPassword, setProPassword] = useState("");
  const [verifyPro, setVerifyPro] = useState(false);

  // Added Funcs State Hooks
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(false);

  // 10 NEW FUNCTIONS INTEGRATION STATES
  const [currency, setCurrency] = useState("USD");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [masterFaqState, setMasterFaqState] = useState({ forceOpen: false, forceClose: false });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // FUNCTION 1: Currency Converter Engine (Configured for PKR and USD Only)
  const handleCurrencyToggle = (selectedCurrency) => {
    handleTrackAnalyticsClick("Currency Switch: " + selectedCurrency);
    setCurrency(selectedCurrency);
  };

  const getCurrencySymbolAndPrice = (basePriceInUsd) => {
    const rawNumeric = parseInt(basePriceInUsd.replace("$", ""), 10);
    if (currency === "PKR") return { symbol: "Rs ", price: Math.floor(rawNumeric * 278) };
    return { symbol: "$", price: rawNumeric };
  };

  // FUNCTION 2: Dynamic FAQ Filter Search Engine
  const handleSearchFaq = (e) => {
    setFaqSearchQuery(e.target.value);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  // FUNCTION 4: Master Accordion Expand / Collapse Controller
  const handleToggleAllFaqs = (action) => {
    handleTrackAnalyticsClick("FAQ Master Switch: " + action);
    if (action === "expand") {
      setMasterFaqState({ forceOpen: true, forceClose: false });
    } else {
      setMasterFaqState({ forceOpen: false, forceClose: true });
    }
    setTimeout(() => setMasterFaqState({ forceOpen: false, forceClose: false }), 150);
  };

  // FUNCTION 5: Interactive Link Generation Clipboard Share Pipeline
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

  // FUNCTION 6: Newsletter Analytics Release Feed Loop Form Submission
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

  // FUNCTION 7: Infrastructure Reset Controls Filter Variable Flush
  const handleResetFilters = () => {
    setCurrency("USD");
    setBillingCycle("monthly");
    setFaqSearchQuery("");
    handleTrackAnalyticsClick("System Control Variables Reset Flush");
  };

  // FUNCTION 8: Simulated Analytical Log Pipeline Telemetry Logger
  const handleTrackAnalyticsClick = (interactionName) => {
    console.log("[TELEMETRY STREAM LOG] Ingested user event hook direct mapping metrics: " + interactionName);
  };

  // FUNCTION 9: Core Application Customer Sentiment Feedback Rating Ingest
  const handleFeedbackSubmit = (rating) => {
    setUserRating(rating);
    setFeedbackSubmitted(true);
    handleTrackAnalyticsClick("Satisfaction Rating Score Received: " + rating + " Stars");
  };

  // FUNCTION 10: Downstream Spec Sheet Markdown Generator File Transpiler
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
          alert(`Access Denied!`);
          await signOut(auth);
        }
      } else {
        alert("No business subscription found for this account.");
        await signOut(auth);
      }
    } catch (error) {
      alert("Verification Failed: " + error.message);
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

  // Premium SaaS Enterprise Auth
  if (verifyEnterprise) {
    return (
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
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 0 30px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3)" 
            }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            style={{ 
              width: "100%", 
              padding: "14px", 
              background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
              border: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "12px", 
              fontWeight: "700", 
              cursor: "pointer", 
              color: "#ffffff", 
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              marginTop: "8px",
              boxShadow: "0 0 15px rgba(58, 162, 230, 0.3)",
              transition: "all 0.25s ease"
            }}
          >
            Access Enterprise Plan 
          </motion.button>
        </form>
      </PremiumAuthLayout>
    );
  }

  // Premium SaaS Pro Auth
  if (verifyPro) {
    return (
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
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 0 30px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3)" 
            }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            style={{ 
              width: "100%", 
              padding: "14px", 
              background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
              border: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "12px", 
              fontWeight: "700", 
              cursor: "pointer", 
              color: "#ffffff", 
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              marginTop: "8px",
              boxShadow: "0 0 15px rgba(58, 162, 230, 0.3)",
              transition: "all 0.25s ease"
            }}
          >
             Access Pro Plan
          </motion.button>
        </form>
      </PremiumAuthLayout>
    );
  }

  if (goToPayment && selectedPlan) {
    return <PaymentPage plan={selectedPlan} onSuccess={() => setPaymentComplete(true)} onBack={() => setGoToPayment(false)} />;
  }

  if (showContact) return <ContactUs onBack={() => setShowContact(false)} />;
  if (showAbout) return <AboutApp onBack={() => setShowAbout(false)} />;

  return (
    <div style={{ ...styles.pageWrapper, flexDirection: "column" }}>
      {/* Canvas Lights */}
      <motion.div animate={{ x: [-30, 30, -30], y: [0, 60, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} style={{ ...styles.blob, top: "-15%", right: "-10%" }} />
      <motion.div animate={{ x: [30, -30, 30], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} style={{ ...styles.blob, bottom: "-20%", left: "-10%", background: "radial-gradient(circle, #1f6feb 0%, transparent 70%)", opacity: 0.08 }} />

      {/* Shared Action Notification Broadcast Banner Row */}
      {toastMessage && (
        <div style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", padding: "12px 24px", background: "linear-gradient(135deg, #1d528f 0%, #05080e 100%)", border: "1px solid #58a6ff", borderRadius: "12px", zIndex: 100, color: "#fff", fontSize: "13px", fontFamily: "Arial, sans-serif", boxShadow: "0 0 20px rgba(58,162,230,0.5)" }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 64px", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
        <DynamicLogo />
        <div style={{ display: "flex", gap: "16px" }}>
          <button style={styles.navButton} onClick={() => { handleTrackAnalyticsClick("Our Story Navigation Clicked"); setShowAbout(true); }} className="saas-nav-link">Our Story</button>
          <button style={styles.navButton} onClick={() => { handleTrackAnalyticsClick("Support Navigation Clicked"); setShowContact(true); }} className="saas-nav-link">Support</button>
          
          {/* Nav Interactions with Added High-tier Hover Blowups */}
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

      {/* Hero Canvas Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", position: "relative", zIndex: 2 }}>
        
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: "center" }}>
          <h1 style={{ ...styles.titleH1, margin: "0 auto 24px", maxWidth: "800px" }}>
            Insight-driven intelligence <br />
            <span style={{ color: "transparent", background: "linear-gradient(90deg, #fff, #8b949e)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              built for intelligent infrastructure.
            </span>
          </h1>
          <p style={{ color: theme.subtext, fontSize: "20px", maxWidth: "600px", margin: "0 auto 64px", lineHeight: "1.6", fontWeight: 400 }}>
            Transform multi-layered computational operational logs into crisp, beautifully intuitive real-time strategic projections.
          </p>
        </motion.div>

        {/* Dynamic Global Multi-Currency Selection Controls (Configured for USD and PKR Only) */}
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

        {/* FUNC 1: ANNUAL/MONTHLY DYNAMIC BILLING CYCLE TOGGLE ENGINE */}
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

        {/* Pricing Cards Grid Container */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1100px", position: "relative", zIndex: 2 }}>
          {plans.map((plan, index) => {
            // Apply Dynamic Currency and Billing Cycle Calculations
            const baseData = getCurrencySymbolAndPrice(plan.price);
            let rawNumericPrice = baseData.price;
            
            if (billingCycle === "annual") {
              rawNumericPrice = Math.floor(rawNumericPrice * 12 * 0.8);
            }

            const calculatedPrice = baseData.symbol + rawNumericPrice;
            const calculatedPeriod = billingCycle === "annual" ? "/year" : "/month";

            return (
              <MagneticCard
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 90, damping: 20 }}
                whileHover={{ 
                  boxShadow: "0 0 50px -5px rgba(58, 162, 230, 0.45), 0 30px 60px -10px rgba(0, 0, 0, 0.85)",
                  borderColor: "rgba(58, 162, 230, 0.4)"
                }}
                style={{ 
                  ...styles.card, 
                  width: "100%", 
                  maxWidth: "420px", 
                  padding: "54px 40px", 
                  boxSizing: "border-box", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  justifyContent: "space-between", 
                  position: "relative" 
                }}
              >
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Title */}
                  <h3 style={{ fontSize: "32px", fontWeight: "700", color: "#798cb3", margin: "0 0 14px 0", letterSpacing: "-0.5px", fontFamily: "'Inter', sans-serif" }}>
                    {plan.name}
                  </h3>
                  
                  {/* Tagline */}
                  <p style={{ color: theme.subtext, fontSize: "13px", textAlign: "center", margin: "0 0 24px 0", padding: "0 14px", lineHeight: "1.4" }}>
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "baseline", marginBottom: "16px" }}>
                    <span style={{ fontSize: "24px", fontWeight: "700", color: "#3aa2e6" }}>
                      {calculatedPrice}{calculatedPeriod}
                    </span>
                  </div>

                  <span 
                    onClick={() => handleSharePlan(plan.name)}
                    style={{ fontSize: "11px", color: theme.primary, cursor: "pointer", textDecoration: "underline", marginBottom: "24px" }}
                  >
                    🔗 Share Link Tier Route
                  </span>
                  
                  {/* Features */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    {plan.features.map((feature, i) => (
                      <li key={i} style={{ fontSize: "14px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#9ca3af" }}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* NEON GLOWING SUBSCRIBE BUTTON */}
                <motion.button 
                  whileHover={{ 
                    scale: 1.04,
                    boxShadow: "0 0 25px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3), 0 4px 15px rgba(0, 0, 0, 0.5)",
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.6)"
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    handleTrackAnalyticsClick("Checkout Initiated: " + plan.name);
                    setSelectedPlan({ ...plan, price: calculatedPrice, period: calculatedPeriod });
                    setGoToPayment(true);
                  }}
                  style={{ 
                    width: "160px", 
                    padding: "11px 0", 
                    borderRadius: "24px", 
                    fontSize: "14px", 
                    fontWeight: "700", 
                    cursor: "pointer", 
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
                    color: "#fff",
                    boxShadow: "0 0 15px rgba(58, 162, 230, 0.3), 0 4px 10px rgba(0, 0, 0, 0.4)",
                    textAlign: "center",
                    transition: "box-shadow 0.25s ease, border-color 0.25s ease"
                  }}
                >
                  Subscribe
                </motion.button>
              </MagneticCard>
            );
          })}
        </div>

        {/* FUNC 2: INTERACTIVE FEATURE-MATRIX EXPANDABLE BREAKDOWN CONTROLLER */}
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

        {/* FUNC 3: ENTERPRISE SLA PRIORITY METRICS TELEMETRY DRAWER */}
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

        {/* FUNC 4: PROFESSIONAL EXPANDABLE ACCORDION FAQ CONSTRUCT */}
        <section style={styles.faqSection}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: theme.subtext, fontSize: "15px", marginBottom: "24px" }}>
              Everything you need to understand about the InsightIQ orchestration engine.
            </p>

            {/* Dynamic FAQ Search Input Elements */}
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

        {/* Interactive Application Feedback Score Widget */}
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

      {/* FUNC 5: STRUCTURED ENTERPRISE LEVEL GRID FOOTER */}
      <footer style={styles.footerWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", maxWidth: "1200px", margin: "0 auto 48px" }}>
          <div style={{ flex: "1 1 250px" }}>
            <DynamicLogo />
            <p style={{ color: theme.subtext, fontSize: "13px", marginTop: "16px", lineHeight: "1.6", maxWidth: "240px" }}>
              Architecting the next standard of system telemetry monitoring and programmatic log mapping analytics.
            </p>
            
            {/* Integrated In-Footer Newsletter Terminal Form Row */}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", paddingHeight: "24px", borderTop: `1px solid rgba(255,255,255,0.04)`, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          <span>&copy; {new Date().getFullYear()} InsightIQ Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span>System Status: <span style={{ color: "#34d399" }}>● Operational</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}