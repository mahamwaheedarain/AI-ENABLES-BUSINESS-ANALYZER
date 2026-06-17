// src/components/Auth.js
import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// RETAINED EXACT THEME COLORS
const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.6)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
};

const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.bg,
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
    position: "relative",
    perspective: "1000px",
  },
  blob: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: theme.primary,
    filter: "blur(180px)",
    borderRadius: "50%",
    opacity: 0.15,
    zIndex: 0,
  },
  visualSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "120px",
    zIndex: 1,
  },
  authSide: {
    width: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: `1px solid rgba(255,255,255,0.04)`,
    background: "linear-gradient(135deg, rgba(13,17,23,0.3) 0%, rgba(13,17,23,0.1) 100%)",
    zIndex: 2,
  },
  card: {
    width: "380px",
    background: theme.card,
    padding: "54px",
    borderRadius: "38px",
    backdropFilter: "blur(28px) saturate(180%)",
    webkitBackdropFilter: "blur(28px) saturate(180%)",
    boxShadow: `
      0 20px 50px -10px rgba(0,0,0,0.8),
      0 0 1px 1px rgba(255,255,255,0.05) inset
    `,
    borderTop: `1px solid rgba(255,255,255,0.15)`,
    borderLeft: `1px solid ${theme.border}`,
    borderRight: `1px solid ${theme.border}`,
    borderBottom: `1px solid rgba(255,255,255,0.05)`,
  },
  input: {
    width: "100%",
    padding: "18px 22px",
    marginBottom: "18px",
    background: "rgba(0,0,0,0.4)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: "18px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },
  titleH1: {
    fontSize: "68px",
    fontWeight: "900",
    fontFamily: "'Montserrat', sans-serif",
    color: "#fff",
    lineHeight: "1.05",
    letterSpacing: "-2.5px",
    marginTop: "48px",
    marginBottom: "18px",
    span: {
      color: theme.primary,
      fontStyle: 'italic',
      fontWeight: '600'
    }
  }
};

const MagneticCard = ({ children, style, ...props }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

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
    animate={{ scale: [1, 1.025, 1] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "44px", letterSpacing: "-3.2px", color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}
  >
    <span>Insight</span>
    <span style={{ color: "#fff", background: theme.primary, padding: '4px 10px', borderRadius: '12px', fontSize: '38px', boxShadow: `0 4px 15px rgba(88,166,255, 0.6)` }}>IQ</span>
  </motion.div>
);

const AuthLayout = ({ children, title }) => (
  <div style={styles.pageWrapper}>
    <motion.div animate={{ x: [0, 90, 0], y: [0, 70, 0] }} transition={{ duration: 25, repeat: Infinity }} style={{ ...styles.blob, top: "-15%", left: "-15%" }} />
    <motion.div animate={{ x: [0, -70, 0], y: [0, -90, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ ...styles.blob, bottom: "-15%", right: "-8%" }} />

    <div style={styles.visualSide}>
      <DynamicLogo />
      <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} style={styles.titleH1}>
        Data-driven <br /> <span style={styles.titleH1.span}>clarity for the</span> <br /> modern enterprise.
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ color: theme.subtext, fontSize: "20px", maxWidth: "480px", lineHeight: "1.5" }}>
        Elevate your business insights. Transform complex logs into actionable intelligence.
      </motion.p>
    </div>

    <div style={styles.authSide}>
      <MagneticCard initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 90, damping: 20 }} style={styles.card}>
        <h2 style={{ fontSize: "26px", marginBottom: "34px", fontFamily: "'Montserrat', sans-serif", color: theme.text, letterSpacing: '-0.5px' }}>{title}</h2>
        {children}
      </MagneticCard>
    </div>
  </div>
);

export const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
        <input placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" style={{ ...styles.input, background: theme.primary, border: "none", fontWeight: "800", cursor: "pointer", marginTop: "12px", color: "#fff", boxShadow: `0 8px 25px rgba(88,166,255, 0.4)` }}>Sign In</button>
      </form>
      <p style={{ textAlign: "center", color: theme.subtext, fontSize: "14px", marginTop: "24px", letterSpacing: '0.2px' }}>
        No account? <span style={{ color: theme.primary, cursor: "pointer", fontWeight: "700" }} onClick={switchToSignup}>Create an account</span>
      </p>
    </AuthLayout>
  );
};

export const Signup = ({ onSignup, switchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <AuthLayout title="Get Started">
      <form onSubmit={(e) => { e.preventDefault(); onSignup(name, email, password); }}>
        <input placeholder="Full Name" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" style={{ ...styles.input, background: theme.primary, border: "none", fontWeight: "800", cursor: "pointer", marginTop: "12px", color: "#fff", boxShadow: `0 8px 25px rgba(88,166,255, 0.4)` }}>Get Started</button>
      </form>
      <p style={{ textAlign: "center", color: theme.subtext, fontSize: "14px", marginTop: "24px", letterSpacing: '0.2px' }}>
        Already a member? <span style={{ color: theme.primary, cursor: "pointer", fontWeight: "700" }} onClick={switchToLogin}>Sign in</span>
      </p>
    </AuthLayout>
  );
};