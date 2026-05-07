import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; // Essential for hardware-accelerated animations
import "../Subscription.css";

// ---------- Refined Quiet Luxury Theme ----------
const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  text: "#ffffff",
  textMuted: "#e6edf3",
  subtext: "#8b949e",
  success: "#3fb950",
  fontMain: "'Inter', sans-serif", // Clean, high-clarity Inter font
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
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: "10px",
    padding: "16px",
    color: theme.text,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    marginBottom: "24px",
    fontFamily: theme.fontMain,
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" // Quiet Luxury transition
  };

  // --- Framer Motion Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15, // Orchestrates staggered reveal
        delayChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      style={{ background: theme.bg, color: theme.text, minHeight: '100vh', padding: '60px', fontFamily: theme.fontMain }}
    >
      
      {/* Header - Aligned with Business Analyzer Dashboards */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
        <motion.div variants={itemVariants}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1.2px' }}>
            Inquiry <span style={{ color: theme.primary }}>Portal</span>
          </h1>
          <div style={{ fontSize: '12px', color: theme.subtext, fontWeight: '700', marginTop: '8px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
           
          </div>
        </motion.div>
        <motion.button 
          variants={itemVariants} 
          whileHover={{ x: -3, borderColor: theme.text }}
          onClick={onBack} 
          style={actionButtonStyle}
        >
          Return to Dashboard
        </motion.button>
      </header>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px' }}>
        
        {/* Message Input Section */}
        <motion.section variants={itemVariants} style={cardStyle}>
          <div style={cardHeader}>Send a Message</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <motion.input 
                whileFocus={{ borderColor: theme.primary }}
                type="text" 
                placeholder="Full Name" 
                required 
                style={inputStyle}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <motion.input 
                whileFocus={{ borderColor: theme.primary }}
                type="email" 
                placeholder="Email Address" 
                required 
                style={inputStyle}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <motion.textarea 
              whileFocus={{ borderColor: theme.primary }}
              placeholder="Your Message" 
              rows="8" 
              required 
              style={{...inputStyle, resize: 'none'}}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            ></motion.textarea>
            
            <motion.button 
              whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(88, 166, 255, 0.2)" }}
              whileTap={{ scale: 0.99 }}
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
        <motion.section variants={itemVariants} style={{ ...cardStyle, borderLeft: `4px solid ${theme.primary}` }}>
          <div style={{ ...cardHeader, color: theme.primary }}>Access Points</div>
          
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
            <p style={{ fontSize: '11px', color: theme.subtext, lineHeight: '1.6', margin: 0 }}>
              All inquiries are processed through our encrypted data stream to ensure total privacy.
            </p>
          </div>
        </motion.section>
      </div>

      {/* Analysts Ticker Style */}
      <section style={{ marginTop: '60px' }}>
        <motion.div variants={itemVariants} style={cardHeader}>Core Analytics Team</motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { name: "Maham Waheed", role: "Project Lead", icon: "👩‍💼" },
            { name: "Adeena Sheikh", role: "Team Member", icon: "👩‍💻" },
            { name: "InsightIQ AI", role: "Neural Engine", icon: "🤖" }
          ].map((analyst, index) => (
            <motion.div 
              key={analyst.name}
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.02)", borderColor: theme.primary }}
              style={cardStyle}
            >
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>{analyst.icon}</div>
              <div style={{ fontSize: '11px', color: theme.subtext, fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{analyst.role}</div>
              <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '6px', letterSpacing: '-0.5px' }}>{analyst.name}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

// ---------- Dashboard Styles ----------
const cardStyle = { background: theme.card, padding: '35px', borderRadius: '14px', border: `1px solid ${theme.border}`, transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" };
const cardHeader = { fontSize: '12px', color: theme.subtext, marginBottom: '25px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' };
const actionButtonStyle = { padding: '12px 28px', background: 'transparent', color: theme.subtext, fontSize: '12px', fontWeight: '700', cursor: 'pointer', borderRadius: '8px', border: `1px solid ${theme.border}`, transition: '0.2s' };
const submitButtonStyle = { padding: '16px', background: theme.primary, color: '#fff', fontSize: '13px', fontWeight: '800', cursor: 'pointer', borderRadius: '10px', border: 'none', width: '100%', transition: 'all 0.3s' };
const infoBox = { marginBottom: '24px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '16px' };
const label = { fontSize: '11px', color: theme.subtext, fontWeight: '700', marginBottom: '6px' };
const val = { fontSize: '15px', fontWeight: '600' };
const auditNote = { marginTop: '32px', padding: '18px', background: 'rgba(88,166,255,0.04)', borderRadius: '10px', border: `1px solid ${theme.border}` };