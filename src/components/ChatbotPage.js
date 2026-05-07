// src/components/ChatbotPage.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- High-Clarity Unified Theme ----------
const theme = {
  primary: "#58a6ff", 
  bg: "#0d1117", 
  card: "#161b22", 
  surface: "#21262d",
  text: "#ffffff", // Pure White
  textMuted: "#e6edf3", // High-Clarity Off-White
  subtext: "#8b949e",
  border: "#30363d",
  accent: "#1f6feb", 
  success: "#3fb950",
  danger: "#f85149",
  fontMain: "'Inter', -apple-system, system-ui, sans-serif", // Uniform font for everything
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
  position: "relative",
  background: theme.bg
};

const topbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 40px",
  background: theme.card,
  borderBottom: `1px solid ${theme.border}`,
};

const chatWindowStyle = {
  flex: 1,
  padding: "40px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "25px",
  background: `radial-gradient(circle at top right, #161b22, ${theme.bg})`,
};

const messageWrapper = (isUser) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  maxWidth: "70%",
  display: "flex",
  flexDirection: "column",
  alignItems: isUser ? "flex-end" : "flex-start",
});

const messageStyle = (isUser) => ({
  background: isUser ? theme.accent : theme.surface,
  color: theme.text,
  padding: "16px 22px",
  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  fontSize: "15px",
  lineHeight: "1.6",
  fontWeight: "400",
  border: `1px solid ${isUser ? theme.accent : theme.border}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
});

const inputContainerStyle = {
  display: "flex",
  gap: "20px",
  padding: "30px 40px",
  background: theme.card,
  borderTop: `1px solid ${theme.border}`,
};

const inputStyle = {
  flex: 1,
  padding: "16px 24px",
  borderRadius: "8px",
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.text,
  fontSize: "15px",
  outline: "none",
  fontFamily: theme.fontMain,
  transition: "border-color 0.2s ease",
};

const buttonStyle = {
  padding: "0 30px",
  borderRadius: "8px",
  border: "none",
  background: theme.primary,
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
  transition: "opacity 0.2s ease",
};

// ---------- Global Styles ----------
const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
.settings-menu {
  backdrop-filter: blur(16px);
  background: rgba(22, 27, 34, 0.95);
  animation: fadeIn 0.2s ease-out;
}
.message-entry {
  animation: fadeIn 0.4s ease-out forwards;
}
`;

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      text: "System initialized. How can I assist with your business data analysis today?",
      isUser: false,
      time: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      text: input,
      isUser: true,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, {
        text: data.reply || "Data Error: No response received.",
        isUser: false,
        time: new Date(),
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        text: "Critical System Failure: Unable to reach the server.",
        isUser: false,
        time: new Date(),
      }]);
    }
  };

  const clearChat = () => {
    setMessages([{
      text: "Terminal session cleared. System standing by.",
      isUser: false,
      time: new Date(),
    }]);
    setShowSettings(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={containerStyle}>
      <style>{globalStyles}</style>

      {/* High-Clarity Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '40px', color: theme.primary }}>
          Business Analyzer | Chatbot
        </div>
        <div style={{ color: theme.subtext, fontSize: '12px', fontWeight: '700', marginBottom: '20px' }}>Chat History</div>
        <div style={{ 
          background: "rgba(88,166,255,0.08)", 
          padding: '14px', 
          borderRadius: '8px', 
          fontSize: '13px', 
          color: theme.primary,
          borderLeft: `3px solid ${theme.primary}`,
          fontWeight: '600'
        }}>
          Current Analysis
        </div>
      </aside>

      <div style={mainStyle}>
        {/* Topbar */}
        <header style={topbarStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.success, boxShadow: `0 0 10px ${theme.success}` }}></div>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>AI Chatbot </span>
          </div>
          <div 
            style={{ color: theme.textMuted, fontSize: '20px', cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
            {showSettings && (
              <div className="settings-menu" style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '200px',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                zIndex: 100
              }}>
                <div style={{ fontSize: '11px', color: theme.subtext, marginBottom: '10px', padding: '0 8px', fontWeight: 'bold' }}>Settings</div>
                <button 
                  onClick={clearChat}
                  style={{
                    width: '100%',
                    padding: '10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: theme.danger,
                    fontSize: '13px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontFamily: theme.fontMain
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(248, 81, 73, 0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
                >
                  Clear Session
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Window */}
        <div style={chatWindowStyle}>
          {messages.map((msg, idx) => (
            <div key={idx} style={messageWrapper(msg.isUser)} className="message-entry">
              <div style={messageStyle(msg.isUser)}>
                {msg.text}
              </div>
              <div style={{
                  fontSize: 11,
                  marginTop: 8,
                  color: theme.subtext,
                  fontWeight: '500'
                }}>
                {formatTime(msg.time)}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <footer style={inputContainerStyle}>
          <input
            type="text"
            placeholder="Ask a question..."
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendMessage} style={buttonStyle}>
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}