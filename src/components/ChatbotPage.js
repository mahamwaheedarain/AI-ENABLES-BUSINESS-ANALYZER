// src/components/ChatbotPage.js
import React, { useState, useEffect, useRef } from "react";

// ---------- Unified Theme Constants ----------
const theme = {
  primary: "#4ac6ff", 
  bg: "#050608", 
  card: "#0d0f14", 
  surface: "#161b22",
  text: "#e6edf3", 
  textMuted: "#7d8590", 
  border: "#30363d",
  accent: "#8957e5", 
  success: "#3fb950",
  danger: "#f85149",
  fontMono: "'JetBrains Mono', monospace"
};

// ---------- Styles ----------
const containerStyle = {
  display: "flex",
  height: "100vh",
  background: theme.bg,
  color: theme.text,
  fontFamily: theme.fontMono,
};

const sidebarStyle = {
  width: "260px",
  background: theme.card,
  borderRight: `1px solid ${theme.border}`,
  display: "flex",
  flexDirection: "column",
  padding: "20px",
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  position: "relative"
};

const topbarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 30px",
  background: theme.bg,
  borderBottom: `1px solid ${theme.border}`,
};

const chatWindowStyle = {
  flex: 1,
  padding: "30px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  background: `radial-gradient(circle at top right, #161b22, ${theme.bg})`,
};

const messageWrapper = (isUser) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  maxWidth: "75%",
  display: "flex",
  flexDirection: "column",
  alignItems: isUser ? "flex-end" : "flex-start",
});

const messageStyle = (isUser) => ({
  background: isUser ? theme.accent : theme.surface,
  color: "#fff",
  padding: "14px 18px",
  borderRadius: isUser ? "15px 15px 2px 15px" : "15px 15px 15px 2px",
  fontSize: "14px",
  lineHeight: "1.6",
  border: `1px solid ${isUser ? theme.accent : theme.border}`,
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  transition: "transform 0.2s ease",
  opacity: 0,
  animation: "fadeIn 0.4s forwards",
});

const inputContainerStyle = {
  display: "flex",
  gap: "15px",
  padding: "25px 30px",
  background: theme.bg,
  borderTop: `1px solid ${theme.border}`,
};

const inputStyle = {
  flex: 1,
  padding: "14px 20px",
  borderRadius: "4px",
  border: `1px solid ${theme.border}`,
  background: theme.card,
  color: theme.text,
  fontSize: "14px",
  outline: "none",
  fontFamily: theme.fontMono,
};

const buttonStyle = {
  padding: "0 25px",
  borderRadius: "4px",
  border: "none",
  background: theme.primary,
  color: theme.bg,
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

// ---------- Keyframes ----------
const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
.settings-menu {
  backdrop-filter: blur(12px);
  background: rgba(22, 27, 34, 0.9);
  animation: fadeIn 0.2s ease-out;
}
`;

// ---------- COMPONENT ----------
export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      text: "How can I assist with your business data today?",
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
      const botMsg = {
        text: data.reply || "ERROR: NO RESPONSE",
        isUser: false,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "CRITICAL FAILURE: UNABLE TO REACH BACKEND",
          isUser: false,
          time: new Date(),
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([{
      text: "Chat history cleared.",
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

      {/* Advanced Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ fontSize: '12px', fontWeight: '800', marginBottom: '30px', color: theme.primary }}>
          BUSINESS_ANALYZER | CHATBOT
        </div>
        <div style={{ color: theme.textMuted, fontSize: '10px', marginBottom: '15px' }}>HISTORY_LOGS</div>
        <div style={{ background: theme.surface, padding: '10px', borderRadius: '4px', fontSize: '11px', borderLeft: `2px solid ${theme.accent}` }}>
          Current_Session.log
        </div>
      </div>

      <div style={mainStyle}>
        {/* Advanced Topbar */}
        <div style={topbarStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.success }}></div>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>AI ANALYZER</span>
          </div>
          <div 
            style={{ color: theme.textMuted, fontSize: '18px', cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
            {showSettings && (
              <div className="settings-menu" style={{
                position: 'absolute',
                top: '35px',
                right: '0',
                width: '180px',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '8px', padding: '0 5px' }}>CONFIGURATION</div>
                <button 
                  onClick={clearChat}
                  style={{
                    width: '100%',
                    padding: '8px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: theme.danger,
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: theme.fontMono,
                    borderRadius: '4px'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(248, 81, 73, 0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
                >
                  [!] CLEAR_SESSION
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div style={chatWindowStyle}>
          {messages.map((msg, idx) => (
            <div key={idx} style={messageWrapper(msg.isUser)}>
              <div style={messageStyle(msg.isUser)}>
                {msg.text}
              </div>
              <div style={{
                  fontSize: 9,
                  marginTop: 6,
                  color: theme.textMuted,
                  fontFamily: theme.fontMono
                }}>
                [{formatTime(msg.time)}]
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Terminal Input */}
        <div style={inputContainerStyle}>
          <input
            type="text"
            placeholder="ASK CHATBOT"
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendMessage} style={buttonStyle}>
            EXECUTE
          </button>
        </div>
      </div>
    </div>
  );
}