// src/components/ChatbotPage.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import FileManagerPanel from "./FileManagerPanel";

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
  padding: "30px 16px 20px 16px",
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "relative",
  background: theme.bg,
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
  whiteSpace: "pre-wrap",
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

.chat-session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease, color 0.15s ease;
  color: ${theme.textMuted};
}
.chat-session-item:hover {
  background: #21262d;
  color: #ffffff;
}
.chat-session-item.active {
  background: #1f6feb;
  color: #ffffff;
}
.session-title {
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  padding-right: 8px;
}
.action-icons { 
  display: flex; 
  gap: 10px; 
  opacity: 0; 
  transition: opacity 0.15s ease;
  align-items: center;
}
.chat-session-item:hover .action-icons { 
  opacity: 0.85; 
}
.chat-session-item.active .action-icons {
  opacity: 1;
}
.action-icons span {
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}
.action-icons span:hover {
  transform: scale(1.15);
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

export default function ChatbotPage({ onSignOut }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState("Loading...");
  
  // Critical Loading Gate to guard LocalStorage while Firebase handles token handshakes
  const [isAuthResolving, setIsAuthResolving] = useState(true);

  const [storageKey, setStorageKey] = useState("InsightIQ_Workspace_Sessions_Secure_Guest");

  const defaultSessions = [
    { 
      id: Date.now(), 
      name: "New Analysis", 
      messages: [{ text: "How can I assist with your business data analysis today?", isUser: false, time: new Date().toISOString() }] 
    }
  ];

  const [sessions, setSessions] = useState(defaultSessions);
  const [activeId, setActiveId] = useState(Date.now());
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingMsgIdx, setEditingMsgIdx] = useState(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [showFilePanel, setShowFilePanel] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Core Auth Lifecycle Listener & Email-specific Data Hydration Pipe
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let activeKey = "InsightIQ_Workspace_Sessions_Secure_Guest";
      
      if (user) {
        setCurrentUser(user);
        // Generates a dedicated account storage target unique to this verified UID
        activeKey = `InsightIQ_Workspace_Sessions_User_${user.uid}`;
        setStorageKey(activeKey);

        // Fetch Tier from Firestore
        try {
          const docRef = doc(db, "subscriptions", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserPlan(data.plan ? data.plan.toUpperCase() : "PRO");
          } else {
            setUserPlan("PRO");
          }
        } catch (err) {
          console.error("Error mapping cloud workspace tier params:", err);
          setUserPlan("PRO");
        }
      } else {
        setCurrentUser(null);
        setUserPlan("Guest");
        setStorageKey(activeKey);
      }

      // Read history from the contextual target key confirmed by Auth state
      const savedLogs = localStorage.getItem(activeKey);
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          if (parsed && parsed.length > 0) {
            setSessions(parsed);
            // Default to the first available ongoing historical log workspace
            setActiveId(parsed[0].id);
          } else {
            setSessions(defaultSessions);
            setActiveId(defaultSessions[0].id);
          }
        } catch (e) {
          console.error("Failed parsing localized user log structure:", e);
          setSessions(defaultSessions);
        }
      } else {
        setSessions(defaultSessions);
        setActiveId(defaultSessions[0].id);
      }

      // Handshake resolution verified. LocalStorage safely unlocked for execution writes.
      setIsAuthResolving(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Synchronous LocalStorage State Serialization Hook
  useEffect(() => {
    // Structural Guard: Prevents overwriting valid records while Auth completes initialization routines
    if (isAuthResolving) return;

    if (sessions && sessions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    }
  }, [sessions, storageKey, isAuthResolving]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeId]);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0] || { messages: [] };
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // ---------- PostgreSQL Connected Query Handler ----------
  // NOTE: sends the logged-in user's email so the backend only pulls
  // context from THAT user's uploaded files (not everyone's).
  const fetchBotResponse = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          email: currentUser?.email || "guest",
        }),
      });
      
      if (!response.ok) throw new Error("Network execution error");
      const data = await response.json();
      
      return { 
        text: data.reply || "No structured analysis returned.", 
        isUser: false, 
        time: new Date().toISOString() 
      };
    } catch (error) {
      console.error("AI Retrieval Failure:", error);
      return { 
        text: "Critical Connection Failure. Ensure your local PostgreSQL engine and Node server are active.", 
        isUser: false, 
        time: new Date().toISOString() 
      };
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isUser: true, time: new Date().toISOString() };
    
    setIsLoading(true);
    setSessions(prev => prev.map(s => {
      if (s.id !== activeId) return s;
      return { 
        ...s, 
        messages: [...s.messages, userMsg], 
        name: s.messages.length === 1 ? capitalizeFirst(input.substring(0, 24)) : s.name 
      };
    }));
    
    const currentInput = input;
    setInput("");
    
    const botReply = await fetchBotResponse(currentInput);
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: [...s.messages, botReply] } : s));
    setIsLoading(false);
  };

  const saveEdit = async (idx) => {
    if (!editBuffer.trim()) return;
    
    setIsLoading(true);
    setSessions(prev => prev.map(s => s.id === activeId ? {
      ...s, messages: s.messages.map((m, i) => i === idx ? { ...m, text: editBuffer } : m).slice(0, idx + 1)
    } : s));
    setEditingMsgIdx(null);
    
    const botReply = await fetchBotResponse(editBuffer);
    setSessions(prev => prev.map(s => s.id === activeId ? { ...s, messages: [...s.messages, botReply] } : s));
    setIsLoading(false);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
      const fallbackId = Date.now();
      const freshStart = [{ id: fallbackId, name: "New Analysis", messages: [{ text: "How can I assist with your business data analysis today?", isUser: false, time: new Date().toISOString() }] }];
      setSessions(freshStart);
      setActiveId(fallbackId);
    } else {
      setSessions(newSessions);
      if (activeId === id) {
        setActiveId(newSessions[0].id);
      }
    }
  };

  const clearSession = (id, e) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, messages: [] } : s));
  };

  const createNewSession = () => {
    const newId = Date.now();
    const newSess = {
      id: newId,
      name: "New Analysis",
      messages: [{ text: "How can I assist with your business data analysis today?", isUser: false, time: new Date().toISOString() }]
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveId(newId);
  };

  const handleKeyPress = (e) => { 
    if (e.key === "Enter") sendMessage(); 
  };
  
  const formatTime = (timeData) => {
    try {
      const date = new Date(timeData);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return "";
    }
  };

  const handleSystemLogOut = async () => {
    try {
      await signOut(auth);
      if (onSignOut) onSignOut();
    } catch (err) {
      alert("Error securely severing dashboard session parameters: " + err.message);
    }
  };

  // Pre-render state to ensure full synchronization transitions cleanly without flickering UI layouts
  if (isAuthResolving) {
    return (
      <div style={{ ...containerStyle, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "32px", height: "32px", border: `3px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: theme.subtext, fontSize: "14px", fontWeight: "500", letterSpacing: "0.3px" }}>Loading responses</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{globalStyles}</style>

      {/* Dynamic Sidebar Module with ChatGPT / Gemini Inspired Sidebar Layout */}
      <aside style={sidebarStyle}>
        <div style={{ marginBottom: "25px", padding: "0 8px" }}>
        <motion.div
    style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
      fontWeight: 700, // High-quality bold weight for system fonts
      fontSize: "23px", 
      letterSpacing: "-1.5px", // Slightly tuned spacing for the logo text
      color: "#fff", 
      display: "flex", 
      alignItems: "center", 
      gap: "4px" 
    }}
  >
    <span>Insight</span>
    <span style={{ 
      color: theme.primary, 
      fontStyle: "italic", 
      fontWeight: "800" // Slightly heavier weight so the italics stay perfectly legible
    }}>
      IQ
    </span>
  </motion.div>
          
        </div>

        <button 
          onClick={createNewSession}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            background: "transparent",
            color: "#ffffff",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            padding: "12px 14px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            textAlign: "left",
            marginBottom: "25px",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: "18px", fontWeight: "300" }}>+</span> New chat
        </button>

        <div style={{ color: "white", fontSize: '11px', fontWeight: '700', marginBottom: '10px', padding: "0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Recent Chats
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>
          {sessions.map(s => (
            <div 
              key={s.id} 
              className={`chat-session-item ${activeId === s.id ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              {editingSessionId === s.id ? (
                <input 
                  autoFocus 
                  defaultValue={s.name} 
                  style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "2px 6px", fontSize: "13px", width: "100%", outline: "none" }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  onBlur={(e) => { 
                    setSessions(p => p.map(sess => sess.id === s.id ? {...sess, name: capitalizeFirst(e.target.value || "Untitled")} : sess)); 
                    setEditingSessionId(null); 
                  }} 
                />
              ) : (
                <>
                  <span style={{ marginRight: "10px", opacity: 0.6, fontSize: "14px" }}>✉</span>
                  <span className="session-title">{s.name}</span>
                </>
              )}
              
              <div className="action-icons" onClick={(e) => e.stopPropagation()}>
                <span title="Rename chat" onClick={() => setEditingSessionId(s.id)}>✎</span>
                <span title="Clear messages" onClick={(e) => clearSession(s.id, e)}>○</span>
                <span title="Delete chat" onClick={(e) => deleteSession(s.id, e)} style={{ color: activeId === s.id ? "#ffffff" : theme.danger }}>🗑</span>
              </div>
            </div>
          ))}
        </div>

        {/* Secure Workspace Infrastructure Termination Control */}
        
      </aside>

      {/* Primary Communication Terminal Shell */}
      <div style={mainStyle}>
        <header style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{activeSession?.name || "New Analysis"}</h3>
         
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: theme.primary }}>
                <div style={{ width: "12px", height: "12px", border: `2px solid ${theme.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                Processing Metrics...
              </div>
            )}
          
          </div>
        </header>

        <div style={chatWindowStyle}>
          {activeSession?.messages?.map((msg, idx) => (
            <div key={idx} className="message-wrapper" style={messageWrapper(msg.isUser)}>
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
                      style={{ marginTop: '5px', alignSelf: 'flex-end' }}
                    >
                      Edit
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
            placeholder="Ask a question regarding analytics..." 
            style={inputStyle} 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyPress} 
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            style={{ ...buttonStyle, opacity: isLoading || !input.trim() ? 0.6 : 1 }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </footer>

        {showFilePanel && (
          <FileManagerPanel
            userEmail={currentUser?.email}
            onClose={() => setShowFilePanel(false)}
          />
        )}
      </div>
    </div>
  );
}