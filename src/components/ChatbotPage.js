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

const sidebarStyle = {
  width: 250,
  background: "#1a1a2e",
  padding: 25,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  boxShadow: "2px 0 5px rgba(0,0,0,0.5)",
};

const sidebarItemStyle = {
  padding: 12,
  cursor: "pointer",
  color: "#fff",
  borderRadius: 10,
  transition: "all 0.3s",
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
  padding: "15px 20px",
  background: "#0d0d14",
  borderBottom: "1px solid #333",
};

const chatWindowStyle = {
  flex: 1,
  padding: 20,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  background: "#1a1a2e",
  borderRadius: "0 0 15px 15px",
};

const messageStyle = (isUser) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  background: isUser ? "#4ac6ff" : "#2a2f4a",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 20,
  maxWidth: "70%",
  wordWrap: "break-word",
  boxShadow: isUser ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.6)",
  fontSize: 15,
  lineHeight: 1.4,
});

const inputContainerStyle = {
  display: "flex",
  gap: 10,
  padding: 15,
  background: "#0d0d14",
  borderTop: "1px solid #333",
};

const inputStyle = {
  flex: 1,
  padding: 14,
  borderRadius: 25,
  border: "1px solid #444",
  background: "#0d0d14",
  color: "#fff",
  fontSize: 16,
  outline: "none",
};

const buttonStyle = {
  padding: "12px 25px",
  borderRadius: 25,
  border: "none",
  background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
  transition: "all 0.3s",
};

const fileUploadStyle = {
  padding: "10px 15px",
  borderRadius: 15,
  border: "2px dashed #4ac6ff",
  color: "#4ac6ff",
  cursor: "pointer",
  textAlign: "center",
  fontSize: 14,
};

// ---------- ChatbotPage Component ----------
export default function ChatbotPage({ goBack }) {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. Upload a file or ask a question.", isUser: false, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
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
          text: `AI Response for your query: "${input}" (can process uploaded files later).`,
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      setMessages((prev) => [
        ...prev,
        { text: `File "${file.name}" uploaded successfully.`, isUser: false, time: new Date() },
      ]);
    });
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>AI Analyzer</h2>
        <div
          style={sidebarItemStyle}
          onClick={goBack}
          onMouseOver={(e) => e.currentTarget.style.background = "linear-gradient(90deg, #4ac6ff, #2a2f4a)"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          ⬅ Back
        </div>
      </div>

      {/* Main Area */}
      <div style={mainStyle}>
        {/* Topbar without search */}
        <div style={topbarStyle}>
          <div>👤</div>
          <div>🔔</div>
        </div>

        {/* Chat Window */}
        <div style={chatWindowStyle}>
          {/* Uploaded Files Info */}
          {uploadedFiles.length > 0 && (
            <div style={{ color: "#4ac6ff", fontSize: 14, marginBottom: 10 }}>
              Uploaded Files: {uploadedFiles.map((f) => f.name).join(", ")}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div key={idx} style={messageStyle(msg.isUser)}>
              <div>{msg.text}</div>
              <div style={{ fontSize: 10, textAlign: "right", marginTop: 3, opacity: 0.6 }}>
                {formatTime(msg.time)}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={inputContainerStyle}>
          <label style={fileUploadStyle}>
            Upload files
            <input type="file" multiple style={{ display: "none" }} onChange={handleFileUpload} />
          </label>
          <input
            type="text"
            placeholder="Type your message or question..."
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage} style={buttonStyle}>Send</button>
        </div>
      </div>
    </div>
  );
}