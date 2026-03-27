import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";
import Subscription from "./SubscriptionPlans"; // <-- new

function App() {
  const [page, setPage] = useState("login"); // login / signup / subscription / dashboard
  const [module, setModule] = useState("finance"); // finance/hr/marketing
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Dummy login/signup
  const handleLogin = (e) => { e.preventDefault(); setUser({ name: "Maham" }); setPage("subscription"); };
  const handleSignup = (e) => { e.preventDefault(); setUser({ name: "Maham" }); setPage("subscription"); };

  // After subscription payment
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

  // ----------------- Login -----------------
  if (page === "login") {
    return (
      <div style={styles.authContainer}>
        <h1>Login</h1>
        <form onSubmit={handleLogin} style={styles.authForm}>
          <input type="email" placeholder="Email" required style={styles.authInput}/>
          <input type="password" placeholder="Password" required style={styles.authInput}/>
          <button style={styles.primaryBtn} type="submit">Login</button>
        </form>
        <p>Don't have an account? <span style={styles.link} onClick={() => setPage("signup")}>Sign Up</span></p>
      </div>
    );
  }

  // ----------------- Signup -----------------
  return (
    <div style={styles.authContainer}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup} style={styles.authForm}>
        <input type="text" placeholder="Name" required style={styles.authInput}/>
        <input type="email" placeholder="Email" required style={styles.authInput}/>
        <input type="password" placeholder="Password" required style={styles.authInput}/>
        <button style={styles.primaryBtn} type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <span style={styles.link} onClick={() => setPage("login")}>Login</span></p>
    </div>
  );
}

// Keep your styles unchanged
const styles = {
  authContainer: {
    fontFamily: "Segoe UI",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f0f2f5",
    padding: "20px"
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px"
  },
  authInput: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  primaryBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    background: "#667eea",
    color: "white",
    fontWeight: "bold"
  },
  link: {
    color: "#667eea",
    cursor: "pointer"
  },
  paymentBtn: {
    padding: "12px 25px",
    borderRadius: "25px",
    background: "#764ba2",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI"
  },
  sidebar: {
    width: "220px",
    background: "#2C3E50",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  menuItem: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "0.2s"
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    background: "#ECF0F1",
    gap: "10px"
  },
  sidebarToggle: {
    padding: "5px 10px",
    cursor: "pointer"
  },
  search: {
    flex: 1,
    padding: "5px 10px",
    borderRadius: "5px",
    border: "1px solid #BDC3C7"
  },
  profile: {
    fontSize: "20px",
    cursor: "pointer"
  },
  notifications: {
    fontSize: "20px",
    cursor: "pointer"
  },
  dashboard: {
    padding: "20px",
    overflowY: "auto"
  } }; 

export default App;