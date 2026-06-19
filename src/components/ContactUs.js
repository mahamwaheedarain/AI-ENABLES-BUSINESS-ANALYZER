// src/components/ContactUs.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; // Essential for hardware-accelerated animations
import "../Subscription.css";

// ---------- High-Clarity Unified Elite Theme ----------
const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.45)",
  border: "rgba(255, 255, 255, 0.08)",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  success: "#3fb950",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif", // Clean, high-clarity Inter font
  accentGlow: "rgba(58, 162, 230, 0.25)",
};

export default function ContactUs({ onBack }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", message: "" }); 
    } catch (error) {
      console.error("Firestore Transmission Error: ", error);
      setStatus("error");
    }
  };

  const inputStyle = {
    background: "rgba(0, 0, 0, 0.35)",
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    padding: "16px",
    color: theme.text,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    marginBottom: "24px",
    fontFamily: theme.fontMain,
    boxSizing: "border-box",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)" 
  };

  // --- Framer Motion Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1, // Orchestrates staggered reveal
        delayChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      style={{ 
        background: theme.bg, 
        color: theme.text, 
        minHeight: '100vh', 
        padding: '50px 60px', 
        fontFamily: theme.fontMain, 
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden"
      }}
    >
      {/* Decorative Grid Mesh Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", width: 600, height: 600, top: "-10%", right: "-5%", borderRadius: "50%", filter: "blur(140px)",
          background: `radial-gradient(circle, ${theme.primary} 0%, rgba(31,111,235,0.15) 60%, transparent 100%)`, opacity: 0.12
        }} />
        <div style={{
          position: "absolute", inset: 0, backgroundSize: "64px 64px",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)"
        }} />
      </div>
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header - Aligned with Business Analyzer Dashboards */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <motion.div variants={itemVariants}>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '32px', fontWeight: '300', margin: 0, letterSpacing: '-0.5px' }}>
              Inquiry <span style={{ color: theme.primary, fontWeight: 800, fontStyle: "italic" }}>Portal</span>
            </h1>
           
          </motion.div>
          <motion.button 
            variants={itemVariants} 
            whileHover={{ scale: 1.03, background: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(88, 166, 255, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack} 
            style={actionButtonStyle}
          >
            Return to Dashboard
          </motion.button>
        </header>

        {/* Main Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', marginBottom: '48px' }}>
          
          {/* Message Input Section */}
          <motion.section variants={itemVariants} style={cardStyle}>
            <div style={cardHeader}>Send a Message</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <motion.input 
                  whileFocus={{ borderColor: "rgba(88, 166, 255, 0.45)", boxShadow: "0 0 0 3px rgba(88, 166, 255, 0.1)" }}
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <motion.input 
                  whileFocus={{ borderColor: "rgba(88, 166, 255, 0.45)", boxShadow: "0 0 0 3px rgba(88, 166, 255, 0.1)" }}
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  style={inputStyle}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <motion.textarea 
                whileFocus={{ borderColor: "rgba(88, 166, 255, 0.45)", boxShadow: "0 0 0 3px rgba(88, 166, 255, 0.1)" }}
                placeholder="Your Message" 
                rows="8" 
                required 
                style={{...inputStyle, resize: 'none'}}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></motion.textarea>
              
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${theme.accentGlow}` }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                style={submitButtonStyle}
              >
                {status === "sending" ? "Sending..." : "Initialize Transmission"}
              </motion.button>

              <AnimatePresence>
                {status === "success" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ color: theme.success, marginTop: "20px", fontSize: "13px", fontWeight: "600" }}>
                    ✓ Transmission successful. Your message has been securely logged.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.section>

          {/* Support Information Section */}
          <motion.section variants={itemVariants} style={{ ...cardStyle, borderLeft: `3px solid ${theme.primary}`, boxShadow: `0 0 30px -10px ${theme.accentGlow}, 0 20px 40px -15px rgba(0,0,0,0.5)` }}>
            <div style={{ ...cardHeader, color: theme.primary, marginBottom: '32px' }}>Access Points</div>
            
            <div style={infoBox}>
              <div style={label}>Support Email</div>
              <div style={val}>wmaham06@gmail.com</div>
            </div>
            
            <div style={infoBox}>
              <div style={label}>Direct Line</div>
              <div style={val}>+92 300 3799 170</div>
            </div>
            
            <div style={infoBox}>
              <div style={label}>Base Location</div>
              <div style={val}>Mirpurkhas, Pakistan</div>
            </div>

            <div style={auditNote}>
              <p style={{ fontSize: '11.5px', color: theme.subtext, lineHeight: '1.6', margin: 0 }}>
                All inquiries are processed through our encrypted data stream to ensure total privacy.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Analysts Ticker Style */}
        <section style={{ marginTop: '32px' }}>
          <motion.div variants={itemVariants} style={{ ...cardHeader, marginBottom: '20px' }}>Analytics Team</motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { name: "Maham Waheed", role: "Project Lead", icon: "👩‍💼" },
              { name: "Adeena Sheikh", role: "Team Member", icon: "👩‍💻" },
              { name: "InsightIQ AI", role: "Neural Engine", icon: "🤖" }
            ].map((analyst, index) => (
              <motion.div 
                key={analyst.name}
                variants={itemVariants}
                whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(88, 166, 255, 0.3)" }}
                style={cardStyle}
              >
                <div style={{ fontSize: '24px', marginBottom: '16px', filter: `drop-shadow(0 0 6px ${theme.primary})` }}>{analyst.icon}</div>
                <div style={{ fontSize: '10px', color: '#5b6472', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' }}>{analyst.role}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '6px', letterSpacing: '-0.3px', color: '#fff' }}>{analyst.name}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// ---------- Modernized Premium Styles ----------
const cardStyle = { 
  background: theme.card, 
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  padding: '36px', 
  borderRadius: '20px', 
  border: `1px solid ${theme.border}`, 
  boxSizing: 'border-box',
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)" 
};

const cardHeader = { 
  fontSize: '11px', 
  color: theme.subtext, 
  marginBottom: '24px', 
  fontWeight: '700', 
  letterSpacing: '1.5px', 
  textTransform: 'uppercase' 
};

const actionButtonStyle = { 
  padding: '10px 22px', 
  background: 'rgba(255, 255, 255, 0.02)', 
  color: theme.primary, 
  fontSize: '13px', 
  fontWeight: '600', 
  cursor: 'pointer', 
  borderRadius: '12px', 
  border: `1px solid ${theme.border}`, 
  transition: 'all 0.2s ease' 
};

const submitButtonStyle = { 
  padding: '14px 24px', 
  background: "linear-gradient(135deg, #42b3ff 0%, #1d528f 100%)", 
  color: '#fff', 
  fontSize: '13.5px', 
  fontWeight: '700', 
  cursor: 'pointer', 
  borderRadius: '12px', 
  border: '1px solid rgba(255, 255, 255, 0.1)', 
  width: '100%', 
  boxShadow: `0 0 16px ${theme.accentGlow}`,
  transition: 'all 0.25s ease' 
};

const infoBox = { 
  marginBottom: '20px', 
  borderBottom: `1px solid rgba(255, 255, 255, 0.05)`, 
  paddingBottom: '14px' 
};

const label = { 
  fontSize: '10.5px', 
  color: theme.subtext, 
  fontWeight: '700', 
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const val = { 
  fontSize: '14.5px', 
  fontWeight: '500', 
  color: '#dfe3ea' 
};

const auditNote = { 
  marginTop: '28px', 
  padding: '16px', 
  background: 'rgba(88,166,255,0.03)', 
  borderRadius: '12px', 
  border: `1px solid rgba(88, 166, 255, 0.15)` 
};