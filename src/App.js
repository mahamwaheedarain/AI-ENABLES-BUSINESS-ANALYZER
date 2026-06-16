import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";
import EnterpriseDashboard from "./components/EnterpriseDashboard";
import Subscription from "./SubscriptionPlans";
import ChatbotPage from "./components/ChatbotPage";
import { Login, Signup } from "./components/Auth";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// ----------------- YOUR ORIGINAL STYLES (UNTOUCHED) -----------------
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

// ----------------- ENTERPRISE/PRO UI CONSTANTS -----------------
const enterpriseStyles = {
  sidebar: { width: 280, background: "rgba(26, 26, 46, 0.6)", backdropFilter: "blur(15px)", padding: "30px 20px", display: "flex", flexDirection: "column", gap: 10, borderRight: "1px solid rgba(255, 255, 255, 0.05)" },
  uploadCard: { background: "rgba(26, 26, 46, 0.4)", backdropFilter: "blur(10px)", padding: "60px", borderRadius: "30px", border: "1px solid rgba(255, 255, 255, 0.08)", maxWidth: "600px", margin: "100px auto", textAlign: "center" },
  navItem: (isActive, isDisabled) => ({
    padding: "14px 20px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "#555" : isActive ? "#4ac6ff" : "#e0e0e0",
    borderRadius: "12px",
    background: isActive ? "rgba(74, 198, 255, 0.1)" : "transparent",
    fontSize: "0.95rem",
    fontWeight: isActive ? "600" : "400",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: isActive ? "1px solid rgba(74, 198, 255, 0.3)" : "1px solid transparent"
  })
};

function App() {
  const [page, setPage] = useState("login");
  const [module, setModule] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ PRO FILE FLOW (Mirrors Enterprise Dashboard)
  const [step, setStep] = useState("upload"); 
  const [files, setFiles] = useState([]);
  const proModules = ["Finance", "HR", "Marketing", "Chatbot"];

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleContinue = () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }
    setStep("dashboard");
  };

  // ----------------- AUTH HANDLERS -----------------
  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser({ email: userCredential.user.email, uid: userCredential.user.uid });
      setPage("subscription");
    } catch (error) { alert(error.message); }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser({ name, email: userCredential.user.email, uid: userCredential.user.uid });
      await setDoc(doc(db, "users", userCredential.user.uid), { name, email, uid: userCredential.user.uid });
      setPage("subscription");
    } catch (error) { alert(error.message); }
  };

  const handleSubscription = (plan) => {
    if (plan === "enterprise") {
      setPage("enterpriseDashboard");
    } else {
      setPage("proDashboard");
      setStep("upload"); 
    }
  };

  // ----------------- PRO DASHBOARD VIEW (Enterprise UI) -----------------
  if (page === "proDashboard") {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#08080c", color: "#e0e0e0", fontFamily: "'Inter', sans-serif" }}>
        {sidebarOpen && (
          <div style={enterpriseStyles.sidebar}>
            <h2 style={{ color: "#fff", fontSize: "1.4rem", marginBottom: "30px", textAlign: "center", letterSpacing: "1px" }}>Insight<span style={{ color: "#4ac6ff" }}>IQ</span></h2>
            <div style={enterpriseStyles.navItem(false, false)} onClick={() => setPage("subscription")}>🏠 Home</div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "15px 0" }} />
            {proModules.map((m) => (
              <div key={m} style={enterpriseStyles.navItem(module === m.toLowerCase(), step !== "dashboard")} onClick={() => step === "dashboard" && setModule(m.toLowerCase())}>
                ✦ {m}
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 30px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer" }}>☰</button>
            <div style={{ background: "rgba(74, 198, 255, 0.1)", padding: "8px 15px", borderRadius: "10px", fontSize: "0.9rem" }}>
              👤 {user?.name || "Pro User"}
            </div>
          </div>

          {step === "upload" ? (
            <div style={{ flex: 1, padding: "40px" }}>
              <div style={enterpriseStyles.uploadCard}>
                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📁</div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: "300", marginBottom: "10px" }}>Initialize AI Engine</h2>
                <label style={{ display: "inline-block", padding: "15px 30px", background: "rgba(255,255,255,0.03)", border: "2px dashed #333", borderRadius: "15px", cursor: "pointer", marginBottom: "30px", width: "80%" }}>
                  <input type="file" multiple onChange={handleFileUpload} style={{ display: "none" }} />
                  <span>{files.length > 0 ? `${files.length} Files Ready` : "Drop files here or click to browse"}</span>
                </label>
                <button onClick={handleContinue} style={styles.primaryBtn}>Analyze Data & Continue</button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
              {module === "finance" && <FinanceDashboard />}
              {module === "hr" && <HRDashboard />}
              {module === "marketing" && <MarketingDashboard />}
              {module === "chatbot" && <ChatbotPage />}
              {!module && <h2 style={{ textAlign: "center", opacity: 0.5 }}>System Ready. Select a Module.</h2>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------- PAGE ROUTING -----------------
  if (page === "enterpriseDashboard") return <EnterpriseDashboard user={user} onHome={() => setPage("subscription")} />;
  if (page === "subscription") return <Subscription onSubscribe={handleSubscription} onGoToDashboard={() => setPage("proDashboard")} />;
  
  // LOGIN & SIGNUP PAGES (RETAINING YOUR ORIGINAL STYLING)
  if (page === "login") {
    return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  }
  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;