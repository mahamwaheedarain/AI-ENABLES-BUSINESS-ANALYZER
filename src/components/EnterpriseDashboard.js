// src/components/EnterpriseDashboard.js
import React, { useState } from "react";
import FinanceDashboard from "./FinanceDashboard";
import MarketingDashboard from "./MarketingDashboard";
import ChatbotPage from "./ChatbotPage";

function EnterpriseDashboard({ user, onHome }) {
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = ["Finance", "HR", "Marketing", "Operations", "Sales", "Chatbot"];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0d14", color: "#e0e0e0" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: 250, background: "#1a1a2e", padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>
          <h2 style={{ color: "#fff", textAlign: "center" }}>Enterprise AI Analyzer</h2>

          <div
            style={{ padding: 12, cursor: "pointer", color: "#fff", borderRadius: 10, background: "#2a2f4a", textAlign: "center" }}
            onClick={onHome}
          >
            🏠 Home
          </div>

          {modules.map((m) => (
            <div
              key={m}
              style={{ padding: 12, cursor: "pointer", color: "#fff", borderRadius: 10 }}
              onClick={() => setModule(m.toLowerCase())}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#0d0d14" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ fontSize: 20, cursor: "pointer" }}>☰</button>
          <input
            placeholder="Search..."
            style={{ padding: 6, borderRadius: 8, border: "1px solid #444", background: "#0d0d14", color: "#fff", flex: 1, marginRight: 10 }}
          />
          <div style={{ fontSize: 20 }}>👤 {user?.name}</div>
          <div style={{ fontSize: 20 }}>🔔</div>
        </div>

        {/* Module Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {module === "finance" && <FinanceDashboard />}
          {module === "hr" && <div style={{ padding: 50, textAlign: "center" }}>HR Module Coming Soon</div>}
          {module === "marketing" && <MarketingDashboard />}
          {module === "operations" && <div style={{ padding: 50, textAlign: "center" }}>Operations Module Coming Soon</div>}
          {module === "sales" && <div style={{ padding: 50, textAlign: "center" }}>Sales Module Coming Soon</div>}
          {module === "chatbot" && <ChatbotPage />}
          {!module && <div style={{ padding: 50, textAlign: "center" }}>Welcome {user?.name}! Select a module to begin.</div>}
        </div>
      </div>
    </div>
  );
}

export default EnterpriseDashboard;