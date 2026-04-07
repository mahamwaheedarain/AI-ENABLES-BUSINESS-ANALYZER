// src/components/EnterpriseDashboard.js
import React, { useState } from "react";
import FinanceDashboard from "./FinanceDashboard";
import MarketingDashboard from "./MarketingDashboard";
import ChatbotPage from "./ChatbotPage";

import HRDashboard from "./HRDashboard";
import OperationsDashboard from "./OperationsDashboard";
import SalesDashboard from "./SalesDashboard";

function EnterpriseDashboard({ user, onHome }) {
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ APP.JS STYLE FLOW STATES
  const [step, setStep] = useState("upload"); // upload → dashboard
  const [files, setFiles] = useState([]);

  const modules = ["Finance", "HR", "Marketing", "Operations", "Sales", "Chatbot"];

  // ---------------- FILE UPLOAD ----------------
  const handleFileUpload = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    setStep("dashboard"); // ✅ controlled flow like App.js
  };

  // ---------------- MAIN RETURN ----------------
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

          {/* ✅ Modules enabled only after upload */}
          {modules.map((m) => (
            <div
              key={m}
              style={{
                padding: 12,
                cursor: step === "dashboard" ? "pointer" : "not-allowed",
                color: step === "dashboard" ? "#fff" : "#777",
                borderRadius: 10
              }}
              onClick={() => step === "dashboard" && setModule(m.toLowerCase())}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#0d0d14" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ fontSize: 20, cursor: "pointer" }}>☰</button>

          <input
            placeholder="Search..."
            style={{
              padding: 6,
              borderRadius: 8,
              border: "1px solid #444",
              background: "#0d0d14",
              color: "#fff",
              flex: 1,
              marginRight: 10
            }}
          />

          <div style={{ fontSize: 20 }}>👤 {user?.name}</div>
          <div style={{ fontSize: 20 }}>🔔</div>
        </div>

        {/* ---------------- STEP CONTROL ---------------- */}

        {/* ✅ STEP 1: FILE UPLOAD */}
        {step === "upload" && (
          <div style={{ padding: 50, textAlign: "center" }}>
            <h2>Upload Your Business Data</h2>
            <p style={{ color: "#aaa", marginBottom: 20 }}>
              Upload files (CSV, Excel, PDFs) to unlock AI dashboards
            </p>

            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{
                marginBottom: 20,
                padding: 10,
                background: "#1a1a2e",
                color: "#fff",
                borderRadius: 10,
                border: "1px solid #444"
              }}
            />

            {files.length > 0 && (
              <p style={{ marginBottom: 20 }}>{files.length} file(s) selected</p>
            )}

            <button
              onClick={handleContinue}
              style={{
                padding: "12px 30px",
                borderRadius: 25,
                border: "none",
                background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {/* ✅ STEP 2: DASHBOARD (UNCHANGED UI) */}
        {step === "dashboard" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
            {module === "operations" && <OperationsDashboard />}
            {module === "sales" && <SalesDashboard />}
            {module === "chatbot" && <ChatbotPage />}

            {!module && (
              <div style={{ padding: 50, textAlign: "center" }}>
                Welcome {user?.name}! Select a module to begin.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default EnterpriseDashboard;