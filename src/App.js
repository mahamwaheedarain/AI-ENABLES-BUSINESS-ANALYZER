// src/App.js
import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import Subscription from "./SubscriptionPlans";
import { Login, Signup } from "./components/Auth";
import ChatbotPage from "./components/ChatbotPage"; // Full-page Chatbot component

// ----------------- Styles -----------------
const styles = {
  app: { display: "flex", height: "100vh", background: "#0d0d14", color: "#e0e0e0", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 250, background: "#1a1a2e", padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 12, cursor: "pointer", color: "#fff", borderRadius: 10, transition: "0.2s" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#0d0d14" },
  sidebarToggle: { fontSize: 20, cursor: "pointer" },
  search: { padding: 6, borderRadius: 8, border: "1px solid #444", background: "#0d0d14", color: "#fff", flex: 1, marginRight: 10 },
  profile: { fontSize: 20 },
  notifications: { fontSize: 20 },
};

// ----------------- App Component -----------------
function App() {
  const [page, setPage] = useState("login"); // login / signup / subscription / dashboard
  const [module, setModule] = useState(null); // finance / hr / marketing / chatbot
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Dummy login/signup
  const handleLogin = (e) => { e.preventDefault(); setUser({ name: "Maham" }); setPage("subscription"); };
  const handleSignup = (e) => { e.preventDefault(); setUser({ name: "Maham" }); setPage("subscription"); };
  const handleSubscriptionComplete = (plan) => { console.log("Subscribed to:", plan); setPage("dashboard"); };

  // ----------------- Dashboard -----------------
  if (page === "dashboard") {
    return (
      <div style={styles.app}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <h2 style={{ color: "#fff", textAlign: "center" }}>AI Analyzer</h2>
            <div style={styles.menuItem} onClick={() => setModule("finance")}>Finance</div>
            <div style={styles.menuItem} onClick={() => setModule("hr")}>HR</div>
            <div style={styles.menuItem} onClick={() => setModule("marketing")}>Marketing</div>
            <div style={styles.menuItem} onClick={() => setModule("chatbot")}>Chatbot</div>
            <div style={styles.menuItem} onClick={() => setPage("subscription")}>🏠 Home</div>
          </div>
        )}

        {/* Main Area */}
        <div style={styles.main}>
          <div style={styles.topbar}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
            <input type="text" placeholder="Search..." style={styles.search} />
            <div style={styles.profile}>👤</div>
            <div style={styles.notifications}>🔔</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && (
              <div style={{ padding: 50, color: "#fff", textAlign: "center" }}>
                <h2>HR Dashboard Coming Soon</h2>
              </div>
            )}
            {module === "marketing" && (
              <div style={{ padding: 50, color: "#fff", textAlign: "center" }}>
                <h2>Marketing Dashboard Coming Soon</h2>
              </div>
            )}
            {module === "chatbot" && <ChatbotPage />} {/* Full-page Chatbot */}
            {!module && (
              <div style={{ padding: 50, color: "#fff", textAlign: "center" }}>
                <h2>Select a Module</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Subscription Page
  if (page === "subscription") return <Subscription onSubscribe={handleSubscriptionComplete} />;

  // Login & Signup
  if (page === "login") return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;