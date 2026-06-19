// src/components/ChatbotPage.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- High-Clarity Unified Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  text: "#ffffff", 
  textMuted: "#e6edf3", 
  subtext: "#8b949e",
  border: "#30363d",
  accent: "#1f6feb", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif",
};

// ---------- Styles ----------
const containerStyle = {
  display: "flex",
  height: "100vh",
  background: theme.bg,
  color: theme.text,
  fontFamily: theme.fontMain,
};

const sidebarStyle = {
  width: "280px",
  background: theme.card,
  borderRight: `1px solid ${theme.border}`,
  display: "flex",
  flexDirection: "column",
  padding: "40px 25px",
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "relative",
};

const headerStyle = {
  padding: "20px 40px",
  borderBottom: `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(22, 27, 34, 0.5)",
  backdropFilter: "blur(8px)",
};

const chatContainerStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const messageWrapperStyle = (isUser) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: isUser ? "flex-end" : "flex-start",
  maxWidth: "75%",
  alignSelf: isUser ? "flex-end" : "flex-start",
});

const messageStyle = (isUser) => ({
  background: isUser ? theme.accent : theme.surface,
  color: theme.text,
  padding: "14px 20px",
  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  fontSize: "14.5px",
  lineHeight: "1.6",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  whiteSpace: "pre-wrap",
});

const inputContainerStyle = {
  padding: "30px 40px",
  background: "transparent",
  display: "flex",
  gap: "15px",
};

const inputStyle = {
  flex: 1,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: "12px",
  padding: "15px 20px",
  color: theme.text,
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const buttonStyle = {
  background: theme.accent,
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "0 28px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your InsightIQ Business Intelligence Assistant. How can I analyze your company architecture today?", isUser: false, time: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMsgIdx, setEditingMsgIdx] = useState(null);
  const [editBuffer, setEditBuffer] = useState("");
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- PostgreSQL Connected Query Handler ----------
  const fetchBotResponse = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) throw new Error("Network execution error");
      const data = await response.json();
      
      return { 
        text: data.reply || "No structured analysis returned.", 
        isUser: false, 
        time: new Date() 
      };
    } catch (error) {
      console.error("AI Retrieval Failure:", error);
      return { 
        text: "Critical Connection Failure. Ensure your local PostgreSQL engine and Node server are active.", 
        isUser: false, 
        time: new Date() 
      };
    }
  };

  const handleSend = async (messageToSend) => {
    const text = messageToSend || input;
    if (!text.trim()) return;

    if (!messageToSend) setInput("");

    // Append user query node
    const userMsg = { text, isUser: true, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Call connected backend route pipeline
    const botReply = await fetchBotResponse(text);
    setMessages((prev) => [...prev, botReply]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const saveEdit = async (idx) => {
    if (!editBuffer.trim()) return;
    
    // Clear modern message slice trail
    const updated = messages.slice(0, idx);
    setMessages(updated);
    setEditingMsgIdx(null);
    
    // Process updated payload structure
    await handleSend(editBuffer);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={containerStyle}>
      {/* Dynamic Sidebar Module */}
      <div style={sidebarStyle}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: theme.primary, letterSpacing: "-0.5px" }}>
            Insight<span style={{ color: "#ffffff", fontStyle: "italic" }}>IQ</span>
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "11px", color: theme.subtext, textTransform: "uppercase", letterSpacing: "1px" }}>
            Enterprise Workspace
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ background: "rgba(88, 166, 255, 0.05)", border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "15px", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: theme.primary }}>Operational Target</h4>
            <p style={{ margin: 0, fontSize: "13px", color: theme.textMuted, fontWeight: "500" }}>Academic Attire Co.</p>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "20px", fontSize: "11px", color: theme.subtext, textAlign: "center" }}>
          Connected to PostgreSQL Pipeline
        </div>
      </div>

      {/* Primary Communication Terminal */}
      <div style={mainStyle}>
        <header style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Analytical Core Chat</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: theme.subtext }}>Real-time cross-functional system query console</p>
          </div>
          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.primary }}>
              <div style={{ width: "12px", height: "12px", border: `2px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Processing Metrics...
            </div>
          )}
        </header>

        <div style={chatContainerStyle}>
          {messages.map((msg, idx) => (
            <div key={idx} style={messageWrapperStyle(msg.isUser)} className="message-wrapper">
              {editingMsgIdx === idx ? (
                <div style={{ width: "100%", background: theme.card, padding: "15px", borderRadius: "12px", border: `1px solid ${theme.primary}` }}>
                  <textarea defaultValue={msg.text} onChange={(e) => setEditBuffer(e.target.value)} style={{ ...inputStyle, width: "100%", marginBottom: "10px", resize: "none", height: "80px" }} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => saveEdit(idx)} style={{ ...buttonStyle, padding: "5px 15px", fontSize: "12px" }}>Save &amp; Regenerate</button>
                    <button onClick={() => setEditingMsgIdx(null)} style={{ ...buttonStyle, background: theme.surface, padding: "5px 15px", fontSize: "12px" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={messageStyle(msg.isUser)}>{msg.text}</div>
                  {msg.isUser && (
                    <span 
                      className="edit-btn" 
                      onClick={() => { setEditBuffer(msg.text); setEditingMsgIdx(idx); }} 
                      style={{ marginTop: "6px", alignSelf: "flex-end", fontSize: "11px", color: theme.primary, cursor: "pointer", opacity: 0.7 }}
                    >
                      Edit Prompt
                    </span>
                  )}
                </>
              )}
              <div style={{ fontSize: 11, marginTop: 8, color: theme.subtext }}>{formatTime(msg.time)}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <footer style={inputContainerStyle}>
          <input 
            type="text" 
            placeholder="Ask a question regarding operational analytics..." 
            style={inputStyle} 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyPress} 
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSend()} 
            style={{ ...buttonStyle, opacity: isLoading || !input.trim() ? 0.6 : 1 }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </footer>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .message-wrapper:hover .edit-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}