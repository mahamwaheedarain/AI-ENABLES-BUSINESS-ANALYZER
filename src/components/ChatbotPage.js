// src/components/ChatbotPage.js
import React, { useState, useEffect, useRef } from "react";

// ---------- Styles ----------
const containerStyle = {
  display: "flex",
  height: "100vh",
  background: "#0d0d14",
  color: "#e0e0e0",
  fontFamily: "'Roboto', sans-serif",
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
};

const topbarStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  padding: "15px 25px",
  background: "#0d0d14",
  borderBottom: "1px solid #333",
  gap: 15,
};

const chatWindowStyle = {
  flex: 1,
  padding: 25,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "linear-gradient(135deg, #1a1a2e, #0d0d14)",
  borderRadius: "0 0 15px 15px",
};

const messageStyle = (isUser) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  background: isUser ? "#4ac6ff" : "#2a2f4a",
  color: "#fff",
  padding: "14px 20px",
  borderRadius: 25,
  maxWidth: "70%",
  wordWrap: "break-word",
  boxShadow: isUser ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.6)",
  fontSize: 15,
  lineHeight: 1.5,
  transition: "all 0.3s",
  opacity: 0,
  animation: "fadeIn 0.3s forwards",
});

const inputContainerStyle = {
  display: "flex",
  gap: 12,
  padding: 20,
  background: "#0d0d14",
  borderTop: "1px solid #333",
};

const inputStyle = {
  flex: 1,
  padding: 16,
  borderRadius: 25,
  border: "1px solid #444",
  background: "#1a1a2e",
  color: "#fff",
  fontSize: 16,
  outline: "none",
};

const buttonStyle = {
  padding: "12px 20px",
  borderRadius: 25,
  border: "none",
  background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
  transition: "all 0.3s",
};

// ---------- Keyframes for fadeIn ----------
const globalStyles = `
@keyframes fadeIn {
  to { opacity: 1; }
}
`;

// ---------- ChatbotPage Component ----------
export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. Ask me anything.", isUser: false, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = { text: input, isUser: true, time: new Date() };
    setMessages((prev) => [...prev, newMsg]);

    // Dummy AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: `AI Response: "${input}" (ready for AI/ML processing).`,
          isUser: false,
          time: new Date(),
        },
      ]);
    }, 700);

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={containerStyle}>
      <style>{globalStyles}</style>

      <div style={mainStyle}>
        {/* Topbar */}
        <div style={topbarStyle}>
          <div>👤</div>
          <div>🔔</div>
        </div>

        {/* Chat Window */}
        <div style={chatWindowStyle}>
          {messages.map((msg, idx) => (
            <div key={idx} style={messageStyle(msg.isUser)}>
              <div>{msg.text}</div>
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 4, opacity: 0.6 }}>
                {formatTime(msg.time)}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={inputContainerStyle}>
          <input
            type="text"
            placeholder="Type your question..."
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage} style={buttonStyle}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}