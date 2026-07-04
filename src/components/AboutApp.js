// src/components/AboutApp.js
import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Plasma from './Plasma';
import {
  BarChart3,
  Sparkles,
  FolderUp,
  Lightbulb,
  UserPlus,
  UploadCloud,
  BrainCircuit,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

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

// Plasma now sits fixed behind everything, covering the whole viewport
const plasmaBackdropStyle = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  zIndex: 0,
  pointerEvents: "none",
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

// Perspective wrapper — this is what makes the child's rotateX/rotateY read as real depth
const perspectiveWrapStyle = {
  perspective: "1600px",
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
  position: "relative",
  transformStyle: "preserve-3d",
  willChange: "transform",
};

// Glare overlay that sweeps with cursor to sell the 3D illusion
const glareStyle = {
  position: "absolute",
  inset: 0,
  borderRadius: "28px",
  pointerEvents: "none",
  mixBlendMode: "overlay",
  zIndex: 5,
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
  perspective: "800px",
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
  transformStyle: "preserve-3d",
  willChange: "transform",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "12px",
};

// ---------- Vercel-style icon badge, themed to the app's cyber-blue palette ----------
const iconBadgeStyle = {
  width: "32px",
  height: "32px",
  minWidth: "32px",
  borderRadius: "8px",
  background: `linear-gradient(160deg, ${theme.primaryDeep} 0%, ${theme.bg} 100%)`,
  border: `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 0 0 1px rgba(88,166,255,0.08), 0 2px 8px -2px ${theme.accentGlow}`,
};

const IconBadge = ({ icon: Icon }) => (
  <div style={iconBadgeStyle}>
    <Icon size={16} strokeWidth={1.75} color={theme.primary} />
  </div>
);

// ---------- Ambient Mesh Background (subtle grid overlay on top of Plasma) ----------
const MeshBackdrop = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
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

// ---------- 3D Tilt Card wrapper ----------
const TiltCard = ({ children, style, ...props }) => {
  const ref = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Raw rotation from cursor position, smoothed with a spring
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [8, -8]),
    { stiffness: 150, damping: 20, mass: 0.5 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-8, 8]),
    { stiffness: 150, damping: 20, mass: 0.5 }
  );

  // Glare position follows the cursor
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.18), transparent 55%)`
  );

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div style={perspectiveWrapStyle}>
      <motion.section
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          ...style,
          rotateX,
          rotateY,
        }}
        {...props}
      >
        {/* Glare sweep sits above content, follows cursor */}
        <motion.div style={{ ...glareStyle, background: glareBg }} />
        <div style={{ position: "relative", zIndex: 1, transform: "translateZ(30px)" }}>
          {children}
        </div>
      </motion.section>
    </div>
  );
};

export default function AboutApp({ onBack }) {
  return (
    <div style={containerStyle}>
      {/* Plasma fills the entire viewport as the base layer */}
      <div style={plasmaBackdropStyle}>
        <Plasma
          color="#B497CF"
          speed={1}
          direction="backward"
          scale={1}
          opacity={1}
          mouseInteractive={false}
        />
      </div>

      <MeshBackdrop />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "880px", margin: "0 auto" }}>
        {/* Back Button */}
        <motion.button 
  whileHover={{ 
    scale: 1.03, 
    background: "rgba(255, 255, 255, 0.06)", 
    borderColor: "rgba(88, 166, 255, 0.4)" 
  }}

  whileTap={{ scale: 0.97 }}

  className="back-btn" 

  onClick={onBack}

  style={{ 
    ...backBtnStyle, 
    color: "white" 
  }}
>
  Back to Plans
</motion.button>

        {/* About Section — now a full 3D tilt card */}
        <TiltCard className="about-page" style={aboutPageStyle}>
          <h2 style={titleStyle}>
            About Insight<span style={{ color: theme.primary, fontWeight: 700, fontStyle: "italic" }}>IQ</span>
          </h2>
          <p style={paragraphStyle}>
            InsightIQ is an AI-powered Business Analyzer helping businesses make smarter, data-driven decisions. Explore detailed dashboards, upload files, and get actionable AI insights to improve your operations.
          </p>

          {/* Benefits */}
          <h3 style={sectionTitleStyle}>Benefits</h3>
          <div className="benefits-grid" style={gridStyle}>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(88, 166, 255, 0.3)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="benefit-card" style={cardItemStyle}>
              <IconBadge icon={BarChart3} />
              Dashboards & analytics for Finance, HR & Marketing
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(88, 166, 255, 0.3)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="benefit-card" style={cardItemStyle}>
              <IconBadge icon={Sparkles} />
              AI insights & predictions for optimization
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(88, 166, 255, 0.3)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="benefit-card" style={cardItemStyle}>
              <IconBadge icon={FolderUp} />
              Upload & process business files seamlessly
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(88, 166, 255, 0.3)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="benefit-card" style={cardItemStyle}>
              <IconBadge icon={Lightbulb} />
              Actionable recommendations for growth
            </motion.div>
          </div>

          {/* How It Works */}
          <h3 style={sectionTitleStyle}>Step-by-Step Guide</h3>
          <div className="tutorial-cards" style={gridStyle}>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="tutorial-card" style={cardItemStyle}>
              <IconBadge icon={UserPlus} />
              Sign up and choose a subscription plan
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="tutorial-card" style={cardItemStyle}>
              <IconBadge icon={UploadCloud} />
              Upload your business data securely
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="tutorial-card" style={cardItemStyle}>
              <IconBadge icon={BrainCircuit} />
              InsightIQ analyzes your data with AI
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="tutorial-card" style={cardItemStyle}>
              <IconBadge icon={LayoutDashboard} />
              Access dashboards, insights, and recommendations
            </motion.div>
            <motion.div whileHover={{ z: 40, rotateX: -6, scale: 1.05, borderColor: "rgba(255,255,255,0.15)", boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)" }} className="tutorial-card" style={cardItemStyle}>
              <IconBadge icon={CheckCircle2} />
              Apply insights to improve business decisions
            </motion.div>
          </div>

          {/* Who Can Benefit */}
          <h3 style={sectionTitleStyle}>Who Can Benefit</h3>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            Startups, SMEs, and large enterprises aiming to improve their Finance, HR, and Marketing strategies.
          </p>
        </TiltCard>
      </div>
    </div>
  );
}