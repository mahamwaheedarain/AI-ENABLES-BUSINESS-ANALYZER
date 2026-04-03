// src/App.js
import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import EnterpriseDashboard from "./components/EnterpriseDashboard";
import Subscription from "./SubscriptionPlans";
import { Login, Signup } from "./components/Auth";
import ChatbotPage from "./components/ChatbotPage";

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
  authContainer: { maxWidth: 400, margin: "100px auto", padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center" },
  authInput: { padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 },
  primaryBtn: { padding: "12px", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", width: "100%" },
};

function App() {
  const [page, setPage] = useState("login"); // login / signup / subscription / authCheck / dashboard / enterpriseDashboard
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [isEnterprise, setIsEnterprise] = useState(false); // tracks if user chose Enterprise subscription

  // ----------------- Login -----------------
  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const name = "Maham"; // can ask for name if needed
    setUser({ name, email, password });
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

  // ----------------- Auth Check -----------------
  const verifyUser = () => {
    if (tempEmail === user?.email && tempPassword === user?.password) {
      setPage("dashboard"); // normal users go to normal dashboard
    } else {
      alert("Wrong email or password");
    }
  };

  // ----------------- Subscription Selection -----------------
  const handleSubscription = (plan) => {
    if (plan === "enterprise") {
      setIsEnterprise(true);
      setPage("enterpriseDashboard"); // go straight to Enterprise Dashboard
    } else {
      setIsEnterprise(false);
      setPage("authCheck"); // normal users need auth check
    }
  };

  // ----------------- Normal Dashboard -----------------
  if (page === "dashboard") {
    return (
      <div style={styles.app}>
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <h2 style={{ color: "#fff", textAlign: "center" }}>AI Analyzer</h2>

            {/* Home button */}
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
            <div style={styles.profile}>👤 {user?.name}</div>
            <div style={styles.notifications}>🔔</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <div style={{ padding: 50, textAlign: "center" }}>HR Dashboard Coming Soon</div>}
            {module === "marketing" && <div style={{ padding: 50, textAlign: "center" }}>Marketing Dashboard Coming Soon</div>}
            {module === "chatbot" && <ChatbotPage />}
            {!module && <div style={{ padding: 50, textAlign: "center" }}>Welcome {user?.name}! Select a module to begin.</div>}
          </div>
        </div>
      </div>
    );
  }

  // ----------------- Enterprise Dashboard -----------------
  if (page === "enterpriseDashboard") {
    return <EnterpriseDashboard user={user} onHome={() => setPage("subscription")} />;
  }

  // ----------------- Auth Check -----------------
  if (page === "authCheck") {
    return (
      <div style={styles.authContainer}>
        <h2>Verify Your Account</h2>
        <input
          placeholder="Enter Email"
          style={styles.authInput}
          onChange={(e) => setTempEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          style={styles.authInput}
          onChange={(e) => setTempPassword(e.target.value)}
        />
        <button style={styles.primaryBtn} onClick={verifyUser}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ----------------- Subscription Page -----------------
  if (page === "subscription") {
    return (
      <Subscription
        onSubscribe={handleSubscription} // passes plan type (enterprise / pro)
        onGoToDashboard={() => setPage("authCheck")}
      />
    );
  }

  // ----------------- Login / Signup -----------------
  if (page === "login") return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;