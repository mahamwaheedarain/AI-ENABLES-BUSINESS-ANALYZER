// src/components/AboutApp.js
import React from "react";
import { motion } from "framer-motion";

// ---------- Premium Cyber Theme ----------
const theme = {
  primary: "#58a6ff",
  primaryDeep: "#1d528f",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.45)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  accentGlow: "rgba(58, 162, 230, 0.25)",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

// ---------- Glassmorphic Styles ----------
const containerStyle = {
  minHeight: "100vh",
  background: theme.bg,
  color: theme.text,
  fontFamily: theme.fontMain,
  padding: "40px 24px",
  boxSizing: "border-box",
  position: "relative",
  overflowX: "hidden",
};

const backBtnStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  border: `1px solid ${theme.border}`,
  borderRadius: "12px",
  padding: "10px 20px",
  color: theme.primary,
  fontSize: "13.5px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "32px",
};

const aboutPageStyle = {
  maxWidth: "880px",
  margin: "0 auto",
  background: theme.card,
  backdropFilter: "blur(32px) saturate(190%)",
  WebkitBackdropFilter: "blur(32px) saturate(190%)",
  border: `1px solid ${theme.border}`,
  borderRadius: "28px",
  padding: "48px 48px",
  boxShadow: `0 0 50px -15px ${theme.accentGlow}, 0 30px 60px -20px rgba(0, 0, 0, 0.7)`,
  boxSizing: "border-box",
};

const titleStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: "300",
  fontSize: "2.5rem",
  letterSpacing: "-0.5px",
  margin: "0 0 16px 0",
  color: "#fff",
};

const sectionTitleStyle = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: "600",
  fontSize: "1.3rem",
  color: "#fff",
  marginTop: "36px",
  marginBottom: "16px",
  borderLeft: `3px solid ${theme.primary}`,
  paddingLeft: "12px",
};

const paragraphStyle = {
  color: theme.subtext,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 24px 0",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const cardItemStyle = {
  background: "rgba(255, 255, 255, 0.02)",
  border: `1px solid ${theme.border}`,
  borderRadius: "16px",
  padding: "20px",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#dfe3ea",
  transition: "all 0.25s ease",
};

// ---------- Ambient Mesh Background ----------
const MeshBackdrop = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        width: 600,
        height: 600,
        top: "-10%",
        right: "-5%",
        borderRadius: "50%",
        filter: "blur(140px)",
        background: `radial-gradient(circle, ${theme.primary} 0%, rgba(31,111,235,0.15) 60%, transparent 100%)`,
        opacity: 0.12,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)",
      }}
    />
  </div>
);

export default function AboutApp({ onBack }) {
  return (
    <div style={containerStyle}>
      <MeshBackdrop />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "880px", margin: "0 auto" }}>
        {/* Back Button */}
        <motion.button 
          whileHover={{ scale: 1.03, background: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(88, 166, 255, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="back-btn" 
          onClick={onBack}
          style={backBtnStyle}
        >
          ← Back to Plans
        </motion.button>

        {/* About Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="about-page"
          style={aboutPageStyle}
        >
          <h2 style={titleStyle}>
            About Insight<span style={{ color: theme.primary, fontWeight: 700, fontStyle: "italic" }}>IQ</span>
          </h2>
          <p style={paragraphStyle}>
            InsightIQ is an AI-powered Business Analyzer helping businesses make smarter, data-driven decisions. Explore detailed dashboards, upload files, and get actionable AI insights to improve your operations.
          </p>

          {/* Benefits */}
          <h3 style={sectionTitleStyle}>Benefits</h3>
          <div className="benefits-grid" style={gridStyle}>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(88, 166, 255, 0.3)" }} className="benefit-card" style={cardItemStyle}>
              📊 Dashboards & analytics for Finance, HR & Marketing
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(88, 166, 255, 0.3)" }} className="benefit-card" style={cardItemStyle}>
              🤖 AI insights & predictions for optimization
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(88, 166, 255, 0.3)" }} className="benefit-card" style={cardItemStyle}>
              📁 Upload & process business files seamlessly
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(88, 166, 255, 0.3)" }} className="benefit-card" style={cardItemStyle}>
              💡 Actionable recommendations for growth
            </motion.div>
          </div>

          {/* How It Works */}
          <h3 style={sectionTitleStyle}>Step-by-Step Guide</h3>
          <div className="tutorial-cards" style={gridStyle}>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }} className="tutorial-card" style={cardItemStyle}>
              1️⃣ Sign up and choose a subscription plan
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }} className="tutorial-card" style={cardItemStyle}>
              2️⃣ Upload your business data securely
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }} className="tutorial-card" style={cardItemStyle}>
              3️⃣ InsightIQ analyzes your data with AI
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }} className="tutorial-card" style={cardItemStyle}>
              4️⃣ Access dashboards, insights, and recommendations
            </motion.div>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.15)" }} className="tutorial-card" style={cardItemStyle}>
              5️⃣ Apply insights to improve business decisions
            </motion.div>
          </div>

          {/* Who Can Benefit */}
          <h3 style={sectionTitleStyle}>Who Can Benefit</h3>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            Startups, SMEs, and large enterprises aiming to improve their Finance, HR, and Marketing strategies.
          </p>
        </motion.section>
      </div>
    </div>
  );
}