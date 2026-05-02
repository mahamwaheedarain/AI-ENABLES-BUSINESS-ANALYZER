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
    setStep("dashboard"); 
  };

  // ---------------- STYLES ----------------
  const sidebarStyle = {
    width: 280,
    background: "rgba(26, 26, 46, 0.6)",
    backdropFilter: "blur(15px)",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease"
  };

  const navItemStyle = (isActive, isDisabled) => ({
    padding: "14px 20px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "#555" : isActive ? "#4ac6ff" : "#e0e0e0",
    borderRadius: "12px",
    background: isActive ? "rgba(74, 198, 255, 0.1)" : "transparent",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    fontWeight: isActive ? "600" : "400",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: isActive ? "1px solid rgba(74, 198, 255, 0.3)" : "1px solid transparent"
  });

  const topbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#08080c",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  };

  const uploadCardStyle = {
    background: "rgba(26, 26, 46, 0.4)",
    backdropFilter: "blur(10px)",
    padding: "60px",
    borderRadius: "30px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    maxWidth: "600px",
    margin: "100px auto",
    textAlign: "center"
  };

  const primaryBtnStyle = {
    padding: "14px 40px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4ac6ff 0%, #2a2f4a 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(74, 198, 255, 0.2)",
    transition: "transform 0.2s ease"
  };

  // ---------------- MAIN RETURN ----------------
  return (
    <div style={{ display: "flex", height: "100vh", background: "#08080c", color: "#e0e0e0", fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={sidebarStyle}>
          <h2 style={{ color: "#fff", fontSize: "1.4rem", marginBottom: "30px", textAlign: "center", letterSpacing: "1px" }}>Insight<span style={{ color: "#4ac6ff" }}>IQ</span></h2>

          <div
            style={navItemStyle(false, false)}
            onClick={onHome}
          >
            🏠 Home Dashboard
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "15px 0" }} />
          
          <p style={{ fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "2px", paddingLeft: "20px" }}>Analytics Modules</p>

          {modules.map((m) => {
            const isCurrent = module === m.toLowerCase();
            const isDisabled = step !== "dashboard";
            return (
              <div
                key={m}
                style={navItemStyle(isCurrent, isDisabled)}
                onClick={() => !isDisabled && setModule(m.toLowerCase())}
              >
                ✦ {m}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={topbarStyle}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ background: "none", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer", opacity: 0.7 }}
          >
            ☰
          </button>

          <div style={{ flex: 1, margin: "0 40px", position: "relative" }}>
            <input
              placeholder="Search business insights..."
              style={{
                width: "100%",
                padding: "10px 20px",
                borderRadius: "12px",
                border: "1px solid #2a2a3a",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "1.2rem", cursor: "pointer", opacity: 0.7 }}>🔔</div>
            <div style={{ 
              background: "rgba(74, 198, 255, 0.1)", 
              padding: "8px 15px", 
              borderRadius: "10px", 
              border: "1px solid rgba(74, 198, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem"
            }}>
              <span style={{ fontSize: "1.2rem" }}>👤</span> {user?.name || "Premium User"}
            </div>
          </div>
        </div>

        {/* ---------------- STEP CONTROL ---------------- */}

        {/* ✅ STEP 1: FILE UPLOAD */}
        {step === "upload" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
            <div style={uploadCardStyle}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📁</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "300", marginBottom: "10px" }}>Initialize AI Engine</h2>
              <p style={{ color: "#888", marginBottom: "40px", lineHeight: "1.6" }}>
                Upload your financial records, HR logs, or sales data.<br/>
                Our AI will process these to generate your executive dashboards.
              </p>

              <label style={{ 
                display: "inline-block",
                padding: "15px 30px",
                background: "rgba(255,255,255,0.03)",
                border: "2px dashed #333",
                borderRadius: "15px",
                cursor: "pointer",
                marginBottom: "30px",
                width: "80%",
                transition: "border-color 0.3s"
              }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <span style={{ color: "#aaa" }}>{files.length > 0 ? `${files.length} Files Ready` : "Drop files here or click to browse"}</span>
              </label>

              <div>
                <button onClick={handleContinue} style={primaryBtnStyle}>
                  Analyze Data & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ STEP 2: DASHBOARD */}
        {step === "dashboard" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>

            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
            {module === "operations" && <OperationsDashboard />}
            {module === "sales" && <SalesDashboard />}
            {module === "chatbot" && <ChatbotPage />}

            {!module && (
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                opacity: 0.5
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📊</div>
                <h2 style={{ fontWeight: "300" }}>System Ready, {user?.name?.split(' ')[0]}</h2>
                <p>Select a specialized module from the sidebar to view insights.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default EnterpriseDashboard;