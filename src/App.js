// src/App.js
import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";
import Subscription from "./SubscriptionPlans"; 
import { Login, Signup } from "./components/Auth"; 

// ----------------- Styles -----------------
const styles = {
  app: { display: "flex", height: "100vh", background: "#0d0d14", color: "#e0e0e0" },
  sidebar: { width: 250, background: "#1a1a2e", padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 10, cursor: "pointer", color: "#fff" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#0d0d14" },
  sidebarToggle: { fontSize: 20, cursor: "pointer" },
  search: { padding: 5, borderRadius: 5, border: "1px solid #444", background: "#0d0d14", color: "#fff" },
  profile: { fontSize: 20 },
  notifications: { fontSize: 20 },
  dashboard: { padding: 20, flex: 1, overflowY: "auto" },
  authContainer: { maxWidth: 400, margin: "100px auto", padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center" },
  authForm: { display: "flex", flexDirection: "column", gap: 15 },
  authInput: { padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff" },
  primaryBtn: { padding: "12px 0", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", fontWeight: "bold" },
  link: { color: "#4ac6ff", cursor: "pointer", textDecoration: "underline" },
};

// ----------------- App Component -----------------
function App() {
  const [page, setPage] = useState("login"); // login / signup / subscription / dashboard
  const [module, setModule] = useState("finance"); // finance/hr/marketing
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Dummy login/signup
  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: "Maham" });
    setPage("subscription");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setUser({ name: "Maham" });
    setPage("subscription");
  };

  // After payment success
  const handleSubscriptionComplete = (plan) => {
    console.log("Subscribed to:", plan);
    setPage("dashboard");
  };

  // ----------------- Dashboard -----------------
  if (page === "dashboard") {
    return (
      <div style={styles.app}>
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <h2 style={{ color: "white", textAlign: "center" }}>AI Analyzer</h2>
            <div style={styles.menuItem} onClick={() => setModule("finance")}>Finance</div>
            <div style={styles.menuItem} onClick={() => setModule("hr")}>HR</div>
            <div style={styles.menuItem} onClick={() => setModule("marketing")}>Marketing</div>
            <div style={styles.menuItem} onClick={() => setPage("subscription")}>🏠 Home</div>
          </div>
        )}

        <div style={styles.main}>
          <div style={styles.topbar}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
            <input type="text" placeholder="Search..." style={styles.search} />
            <div style={styles.profile}>👤</div>
            <div style={styles.notifications}>🔔</div>
          </div>

          <div style={styles.dashboard}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
          </div>
        </div>
      </div>
    );
  }

  // ----------------- Subscription -----------------
  if (page === "subscription") {
    return <Subscription onSubscribe={handleSubscriptionComplete} />;
  }

  // ----------------- Login & Signup -----------------
  if (page === "login") {
    return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  }

  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;