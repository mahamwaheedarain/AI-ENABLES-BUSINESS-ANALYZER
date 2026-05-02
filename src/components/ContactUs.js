// src/components/ContactUs.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Updated to match your exact file name
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../Subscription.css";

export default function ContactUs({ onBack }) {
  const [scrollY, setScrollY] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(""); 

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Firebase Submission Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // Connects to your "insightiqweb" Firestore instance
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
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "15px 20px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
    width: "100%",
    marginBottom: "15px"
  };

  return (
    <div className="subscription-container">
      <button className="back-btn" onClick={onBack}>← Back to Plans</button>

      {/* Hero Section */}
      <section className={`hero ${scrollY > 50 ? "fade-in" : ""}`}>
        <div className="hero-content">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
            <span style={{ height: "1px", width: "30px", background: "#4ac6ff" }}></span>
            <span style={{ color: "#4ac6ff", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "4px", fontWeight: "600" }}>Inquiry Portal</span>
            <span style={{ height: "1px", width: "30px", background: "#4ac6ff" }}></span>
          </div>
          
          <h1 style={{ position: "relative", display: "inline-block" }}>
            Contact InsightIQ
            <span className="live-indicator"></span>
          </h1>
          <p style={{ marginTop: "20px", opacity: 0.8, fontWeight: "300" }}>Our analysts are ready to scale your vision.</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`contact-form-section ${scrollY > 300 ? "slide-up" : ""}`}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontWeight: '300', letterSpacing: "1px" }}>Send Us a Message</h2>
            <div style={{ width: "40px", height: "2px", background: "linear-gradient(90deg, #4ac6ff, transparent)", margin: "10px auto" }}></div>
        </div>
        
        <form className="contact-form" onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Your Name" 
            required 
            style={inputStyle}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            onFocus={(e) => e.target.style.borderColor = "#4ac6ff"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            required 
            style={inputStyle}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            onFocus={(e) => e.target.style.borderColor = "#4ac6ff"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
          />
          <textarea 
            placeholder="Your Message" 
            rows="5" 
            required 
            style={{...inputStyle, resize: 'none'}}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            onFocus={(e) => e.target.style.borderColor = "#4ac6ff"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
          ></textarea>
          
          <button type="submit" className="auth-btn" style={{ width: '100%', letterSpacing: "2px" }}>
            {status === "sending" ? "TRANSMITTING..." : "INITIALIZE MESSAGE"}
          </button>

          {status === "success" && <p style={{ color: "#4ac6ff", marginTop: "15px", fontSize: "0.9rem" }}>Data securely stored in InsightIQ systems.</p>}
          {status === "error" && <p style={{ color: "#ff4a4a", marginTop: "15px", fontSize: "0.9rem" }}>Transmission error. Verify your connection.</p>}
        </form>
      </section>

      {/* Team Section */}
      <section className={`team ${scrollY > 600 ? "fade-in" : ""}`}>
        <h2>Our Experts</h2>
        <div className="team-grid">
          <div className="team-card hover-animate">
            <div className="avatar">👩‍💼</div>
            <h3>Maham Waheed</h3>
            <p>Project Lead & AI Analyst</p>
          </div>
          <div className="team-card hover-animate">
            <div className="avatar">👩‍💻</div>
            <h3>Adeena Sheikh</h3>
            <p>Team Member</p>
          </div>
          <div className="team-card hover-animate">
            <div className="avatar">🤖</div>
            <h3>InsightIQ AI</h3>
            <p>AI & Analytics Engine</p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className={`contact-info ${scrollY > 900 ? "slide-up" : ""}`}>
        <h2 style={{ color: "#4ac6ff", fontWeight: "300" }}>Contact Details</h2>
        <ul className="info-list">
          <li>📧 Email: wmaham06@gmail.com</li>
          <li>📞 Phone: +92 300 3799 170</li>
          <li>🌐 Website: www.insightiq.com</li>
          <li>📍 Location: Mirpurkhas, Pakistan</li>
        </ul>
      </section>

      <style>{`
        .live-indicator {
          position: absolute; 
          top: 10px; 
          right: -20px; 
          height: 8px; 
          width: 8px; 
          background: #4ac6ff; 
          border-radius: 50%; 
          box-shadow: 0 0 10px #4ac6ff;
          animation: pulse 2s infinite;
        }

        .info-list {
          background: rgba(255,255,255,0.02); 
          padding: 30px; 
          border-radius: 20px; 
          border: 1px solid rgba(255,255,255,0.05);
          list-style: none;
        }

        .info-list li {
          border-bottom: 1px solid rgba(255,255,255,0.05); 
          padding: 12px 0;
          color: rgba(255,255,255,0.7);
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 198, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(74, 198, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 198, 255, 0); }
        }
      `}</style>
    </div>
  );
}