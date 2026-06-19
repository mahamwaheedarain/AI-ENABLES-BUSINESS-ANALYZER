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
    
    features: ["Interactive Analytics Dashboards", "Secure Multi-format File Uploads"] 
  },
  { 
    name: "Enterprise", 
    price: "$50", 
    period: "/month",
   
    features: ["All Features + Core AI Insights", "Predictive Operations & Sales Engine", "Custom Infrastructure Hooks", "Dedicated 24/7 Priority SLA"] 
  },
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

// High-Tier SaaS Level Dedicated Auth Template Using Exact Style Standards
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

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 64px", zIndex: 10, width: "100%", boxSizing: "border-box" }}>
        <DynamicLogo />
        <div style={{ display: "flex", gap: "16px" }}>
          <button style={styles.navButton} onClick={() => setShowAbout(true)} className="saas-nav-link">Our Story</button>
          <button style={styles.navButton} onClick={() => setShowContact(true)} className="saas-nav-link">Support</button>
          
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
            Data-driven intelligence <br /><span style={{ color: "transparent", background: "linear-gradient(90deg, #fff, #8b949e)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>built for systems infrastructure.</span>
          </h1>
          <p style={{ color: theme.subtext, fontSize: "20px", maxWidth: "600px", margin: "0 auto 64px", lineHeight: "1.6", fontWeight: 400 }}>
            Transform multi-layered computational operational logs into crisp, beautifully intuitive real-time strategic projections.
          </p>
        </motion.div>

        {/* Pricing Cards Grid Container */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1100px", position: "relative", zIndex: 2 }}>
          {plans.map((plan, index) => (
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
                <div style={{ display: "flex", alignItems: "baseline", marginBottom: "32px" }}>
                  <span style={{ fontSize: "24px", fontWeight: "700", color: "#3aa2e6" }}>
                    {plan.price}{plan.period}
                  </span>
                </div>
                
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
                  // Dual layer intensive neon blur configuration for button glow element
                  boxShadow: "0 0 25px rgba(58, 162, 230, 0.6), 0 0 50px rgba(58, 162, 230, 0.3), 0 4px 15px rgba(0, 0, 0, 0.5)",
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.6)"
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedPlan(plan);
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
          ))}
        </div>
      </main>
    </div>
  );
}