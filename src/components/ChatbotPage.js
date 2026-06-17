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
  position: "relative",
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
.message-entry {
  animation: fadeIn 0.4s ease-out forwards;
}
.edit-btn { opacity: 0; transition: opacity 0.2s; cursor: pointer; color: ${theme.subtext}; font-size: 12px; }
.message-wrapper:hover .edit-btn { opacity: 1; }
.action-icons { display: flex; gap: 8px; opacity: 0.6; }
.action-icons:hover { opacity: 1; }
`;

export default function ChatbotPage() {
  const [sessions, setSessions] = useState([
    { 
      id: Date.now(), 
      name: "New Analysis", 
      messages: [{ text: "How can I assist with your business data analysis today?", isUser: false, time: new Date() }] 
    }
  ]);
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [input, setInput] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingMsgIdx, setEditingMsgIdx] = useState(null);
  const [editBuffer, setEditBuffer] = useState("");
  const chatEndRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeId);
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages]);

  const fetchBotResponse = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      return { text: data.reply || "Data Error.", isUser: false, time: new Date() };
    } catch (error) {
      return { text: "Critical System Failure.", isUser: false, time: new Date() };
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isUser: true, time: new Date() };
    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      return { ...s, messages: [...s.messages, userMsg], name: s.messages.length === 1 ? capitalizeFirst(input.substring(0, 20)) : s.name };
    }));
    const currentInput = input;
    setInput("");
    const botReply = await fetchBotResponse(currentInput);
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: [...s.messages, botReply] } : s));
  };

  const saveEdit = async (idx) => {
    setSessions(prev => prev.map(s => s.id === activeId ? {
      ...s, messages: s.messages.map((m, i) => i === idx ? { ...m, text: editBuffer } : m).slice(0, idx + 1)
    } : s));
    setEditingMsgIdx(null);
    const botReply = await fetchBotResponse(editBuffer);
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: [...s.messages, botReply] } : s));
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
        setSessions([{ id: Date.now(), name: "New Analysis", messages: [{ text: "How can I assist you?", isUser: false, time: new Date() }] }]);
        setActiveId(sessions[0].id);
    } else {
        setSessions(newSessions);
        setActiveId(newSessions[0].id);
    }
  };

  const clearSession = (id, e) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, messages: [] } : s));
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") sendMessage(); };
  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={containerStyle}>
      <style>{globalStyles}</style>

      <aside style={sidebarStyle}>
        <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '40px', color: theme.primary }}>Business Analyzer | Chatbot</div>
        <div style={{ color: theme.subtext, fontSize: '12px', fontWeight: '700', marginBottom: '20px' }}>Chat History</div>
        {sessions.map(s => (
          <div key={s.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: activeId === s.id ? "rgba(88,166,255,0.08)" : "transparent" }}>
            {editingSessionId === s.id ? (
              <input autoFocus defaultValue={s.name} onBlur={(e) => { setSessions(p => p.map(sess => sess.id === s.id ? {...sess, name: capitalizeFirst(e.target.value)} : sess)); setEditingSessionId(null); }} />
            ) : (
              <span onClick={() => setActiveId(s.id)} style={{ cursor: 'pointer', fontSize: '13px', color: activeId === s.id ? theme.primary : theme.textMuted }}>{s.name}</span>
            )}
            <div className="action-icons">
              <span onClick={() => setEditingSessionId(s.id)} style={{ cursor: 'pointer' }}>✎</span>
              <span onClick={(e) => clearSession(s.id, e)} style={{ cursor: 'pointer' }}>○</span>
              <span onClick={(e) => deleteSession(s.id, e)} style={{ cursor: 'pointer', color: theme.danger }}>🗑</span>
            </div>
          </div>
        ))}
      </aside>

      <div style={mainStyle}>
        <header style={topbarStyle}>
          <span style={{ fontSize: '13px', fontWeight: '700' }}>{activeSession.name}</span>
        </header>

        <div style={chatWindowStyle}>
          {activeSession.messages.map((msg, idx) => (
            <div key={idx} className="message-wrapper" style={messageWrapper(msg.isUser)}>
              {editingMsgIdx === idx ? (
                <div style={{ width: '100%' }}>
                  <textarea defaultValue={msg.text} onChange={(e) => setEditBuffer(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => saveEdit(idx)} style={{ ...buttonStyle, padding: '5px 15px', fontSize: '12px' }}>Save & Regenerate</button>
                    <button onClick={() => setEditingMsgIdx(null)} style={{ ...buttonStyle, background: theme.surface, padding: '5px 15px', fontSize: '12px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={messageStyle(msg.isUser)}>{msg.text}</div>
                  {msg.isUser && <span className="edit-btn" onClick={() => { setEditBuffer(msg.text); setEditingMsgIdx(idx); }} style={{ marginTop: '5px', alignSelf: 'flex-end' }}>Edit</span>}
                </>
              )}
              <div style={{ fontSize: 11, marginTop: 8, color: theme.subtext }}>{formatTime(msg.time)}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <footer style={inputContainerStyle}>
          <input type="text" placeholder="Ask a question..." style={inputStyle} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} />
          <button onClick={sendMessage} style={buttonStyle}>Send</button>
        </footer>
      </div>
    </div>
  );
}

