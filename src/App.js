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

  // ✅ PRO FILE FLOW STATES
  const [files, setFiles] = useState([]);

  // ✅ UI CHANGE: Appends new files to the list instead of replacing them
  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleContinue = async () => {
    if (files.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    try {
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ filename: file.name, content: reader.result });
          reader.onerror = reject;
          reader.readAsText(file); 
        });
      });

      const preparedFiles = await Promise.all(filePromises);

      const response = await fetch("http://localhost:5000/api/upload/upload-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: preparedFiles }),
      });

      if (response.ok) {
        console.log("Batch upload to PostgreSQL successful");
        setPage("dashboard");
      } else {
        alert("Failed to save files to the database.");
      }
    } catch (error) {
      console.error("Multi-file upload error:", error);
      alert("Error processing business data.");
    }
  };

  // ----------------- FIREBASE LOGIN -----------------
  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser({
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });
      setPage("subscription");
    } catch (error) {
      alert(error.message);
    }
  };

  // ----------------- FIREBASE SIGNUP -----------------
  const handleSignup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      setUser({
        name,
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        uid: userCredential.user.uid,
      });

      setPage("subscription");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubscription = (plan) => {
    if (plan === "enterprise") {
      setPage("enterpriseDashboard");
    } else {
      setPage("proUpload"); 
    }
  };

  // ----------------- PRO FILE UPLOAD -----------------
  if (page === "proUpload") {
    return (
      <div style={{ padding: 50, textAlign: "center", color: "#fff" }}>
        <h2>Upload Your Business Data</h2>
        <p style={{ color: "#aaa", marginBottom: 20 }}>
          Upload files (CSV, Excel, PDFs) to unlock AI dashboards
        </p>

        {/* ✅ UI CHANGE: Ensure 'multiple' is enabled and displays current list */}
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
            border: "1px solid #444",
          }}
        />

        {files.length > 0 && (
          <div style={{ marginBottom: 20, textAlign: "left", maxWidth: "400px", margin: "0 auto" }}>
            <strong>Selected Files:</strong>
            <ul style={{ listStyleType: "none", padding: 0, color: "#4ac6ff" }}>
              {files.map((file, index) => (
                <li key={index}>📄 {file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleContinue}
          style={{
            padding: "12px 30px",
            borderRadius: 25,
            border: "none",
            background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Continue to Dashboard ({files.length} Files)
        </button>
      </div>
    );
  }

  // ----------------- DASHBOARD -----------------
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
            <div>👤 {user?.name || ""}</div>
          </div>

          <div style={{ flex: 1, padding: 20 }}>
            {module === "finance" && <FinanceDashboard />}
            {module === "hr" && <HRDashboard />}
            {module === "marketing" && <MarketingDashboard />}
            {module === "chatbot" && <ChatbotPage />}
            {!module && <h2 style={{ textAlign: "center" }}>Welcome</h2>}
          </div>
        </div>
      </div>
    );
  }

  if (page === "enterpriseDashboard") {
    return <EnterpriseDashboard user={user} onHome={() => setPage("subscription")} />;
  }

  if (page === "subscription") {
    return (
      <Subscription
        onSubscribe={handleSubscription}
        onGoToDashboard={() => setPage("proUpload")} 
      />
    );
  }

  if (page === "login") {
    return <Login onLogin={handleLogin} switchToSignup={() => setPage("signup")} styles={styles} />;
  }

  return <Signup onSignup={handleSignup} switchToLogin={() => setPage("login")} styles={styles} />;
}

export default App;