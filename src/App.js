// src/App.js
import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";
import EnterpriseDashboard from "./components/EnterpriseDashboard";
import Subscription from "./SubscriptionPlans";
import { Login, Signup } from "./components/Auth";
import ChatbotPage from "./components/ChatbotPage";

// ----------------- Styles -----------------
const styles = {
  app: { display: "flex", height: "100vh", background: "#0d0d14", color: "#e0e0e0", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 250, background: "#1a1a2e", padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 12, cursor: "pointer", color: "#fff", borderRadius: 10 },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 },
  sidebarToggle: { fontSize: 20, cursor: "pointer" },
  search: { padding: 6, borderRadius: 8, border: "1px solid #444", background: "#0d0d14", color: "#fff", flex: 1, marginRight: 10 },
  authContainer: { maxWidth: 400, margin: "100px auto", padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center" },
  authInput: { padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 },
  primaryBtn: { padding: "12px", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", width: "100%" },
};

function App() {
  const [page, setPage] = useState("login");
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [isEnterprise, setIsEnterprise] = useState(false);

  // ✅ PRO FILE FLOW STATES (FIXED)
  const [files, setFiles] = useState([]);

  const handleFileUpload = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    setPage("dashboard");
  };

  // ----------------- LOGIN -----------------
  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    setUser({ name: "Maham", email, password });
    setPage("subscription");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    setUser({ name, email, password });
    setPage("subscription");
  };

  // ----------------- AUTH CHECK -----------------
  const verifyUser = () => {
    if (tempEmail === user?.email && tempPassword === user?.password) {
      setPage("proUpload"); // go to upload
    } else {
      alert("Wrong email or password");
    }
  };

  // ----------------- SUBSCRIPTION -----------------
  const handleSubscription = (plan) => {
    if (plan === "enterprise") {
      setIsEnterprise(true);
      setPage("enterpriseDashboard");
    } else {
      setIsEnterprise(false);
      setPage("authCheck");
    }
  };

  // ----------------- PRO FILE UPLOAD PAGE -----------------
  if (page === "proUpload") {
    return (
      <div style={{ padding: 50, textAlign: "center", color: "#fff" }}>
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
    );
  }

  // ----------------- PRO DASHBOARD -----------------
  if (page === "dashboard") {
    return (
      <div style={styles.app}>
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <h2 style={{ textAlign: "center" }}>AI Analyzer</h2>

            <div
              style={{ ...styles.menuItem, background: "#2a2f4a", textAlign: "center" }}
              onClick={() => setPage("subscription")}
            >
              🏠 Home
            </div>

            <div style={styles.menuItem} onClick={() => setModule("finance")}>Finance</div>
            <div style={styles.menuItem} onClick={() => setModule("hr")}>HR</div>
            <div style={styles.menuItem} onClick={() => setModule("marketing")}>Marketing</div>
            <div style={styles.menuItem} onClick={() => setModule("chatbot")}>Chatbot</div>
          </div>
        )}

        <div style={styles.main}>
          <div style={styles.topbar}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
            <input placeholder="Search..." style={styles.search} />
            <div>👤 {user?.name}</div>
          </div>

          <div style={{ flex: 1, padding: 20 }}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
            {module === "chatbot" && <ChatbotPage />}
            {!module && <h2 style={{ textAlign: "center" }}>Welcome {user?.name}</h2>}
          </div>
        </div>
      </div>
    );
  }

  // ----------------- ENTERPRISE -----------------
  if (page === "enterpriseDashboard") {
    return <EnterpriseDashboard user={user} onHome={() => setPage("subscription")} />;
  }

  // ----------------- AUTH CHECK -----------------
  if (page === "authCheck") {
    return (
      <div style={styles.authContainer}>
        <h2>Verify Your Account</h2>
        <input placeholder="Email" style={styles.authInput} onChange={(e) => setTempEmail(e.target.value)} />
        <input type="password" placeholder="Password" style={styles.authInput} onChange={(e) => setTempPassword(e.target.value)} />
        <button style={styles.primaryBtn} onClick={verifyUser}>Go to Dashboard</button>
      </div>
    );
  }

  // ----------------- SUBSCRIPTION -----------------
  if (page === "subscription") {
    return (
      <Subscription
        onSubscribe={handleSubscription}
        onGoToDashboard={() => setPage("authCheck")}
      />
    );
  }

  // ----------------- LOGIN / SIGNUP -----------------
  if (page === "login") return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;