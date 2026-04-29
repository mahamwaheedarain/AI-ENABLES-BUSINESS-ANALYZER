import React, { useState } from "react";
import { db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";

function PaymentPage({ plan, onSuccess, onBack, user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState(null);

  const [form, setForm] = useState({
    name: user?.displayName || user?.name || "",
    business: "",
    contact: "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (!form.business || !form.email) {
      alert("Please enter your Business Name and Email.");
      return;
    }

    setLoading(true);
    setMessage("Processing secure transaction...");

    // 2. THE SAFETY TIMEOUT (Prevents the infinite "Processing" hang)
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn("Firebase Response Timeout: Proceeding in Test Mode.");
      alert("Note: Database is slow. Proceeding in Test Mode.");
      onSuccess(plan); // Force navigation to Dashboard
    }, 4000);

    try {
      // 3. FIREBASE STORAGE ATTEMPT
      const docId = user?.uid || form.email.replace(".", "_") || "guest_user";
      const docRef = doc(db, "subscriptions", docId);
      
      await setDoc(docRef, {
        customerName: form.name,
        businessName: form.business,
        contact: form.contact,
        email: form.email,
        planName: plan.name,
        price: plan.price,
        status: "active",
        purchaseDate: new Date().toISOString(),
        userId: user?.uid || "guest"
      }, { merge: true });

      // If we reach here, Firebase succeeded!
      clearTimeout(safetyTimeout); 
      setMessage("Success! Activating your account...");
      
      setTimeout(() => {
        onSuccess(plan);
      }, 1000);

    } catch (error) {
      // If we hit a direct error (like bad permissions)
      clearTimeout(safetyTimeout);
      console.error("Firestore Error:", error);
      alert("Database error, but moving to dashboard for demo purposes.");
      onSuccess(plan);
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW 1: SELECT METHOD ---
  if (!method) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: "#4ac6ff", marginBottom: "10px" }}>Secure Checkout</h2>
          <p style={{ color: "#aaa" }}>Confirming subscription for: <strong>{plan.name}</strong></p>
          
          <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <button onClick={() => setMethod("Credit Card")} style={primaryBtnStyle}>
              💳 Pay with Credit Card
            </button>
            <button onClick={onBack} style={linkBtnStyle}>
              ← Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CARD & BUSINESS FORM ---
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: "800px", display: "flex", flexWrap: "wrap", gap: "40px", textAlign: "left" }}>
        
        {/* Left: Summary */}
        <div style={{ flex: "1", minWidth: "250px", borderRight: "1px solid #333", paddingRight: "20px" }}>
          <h3 style={{ color: "#4ac6ff" }}>Order Summary</h3>
          <h1 style={{ fontSize: "2.5rem", margin: "10px 0" }}>{plan.price}</h1>
          <p style={{ color: "#ccc" }}>{plan.name} Membership</p>
          <ul style={{ padding: "20px 0", color: "#888", fontSize: "0.9rem", lineHeight: "1.8", listStyle: "none" }}>
            {plan.features.map((f, i) => <li key={i}>✔ {f}</li>)}
          </ul>
        </div>

        {/* Right: Form */}
        <div style={{ flex: "1.5", minWidth: "300px" }}>
          <h3 style={{ marginBottom: "15px" }}>Business Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} style={inputStyle} />
            <input name="business" placeholder="Business Name" onChange={handleChange} style={inputStyle} />
            <input name="email" value={form.email} placeholder="Billing Email" onChange={handleChange} style={inputStyle} />
            
            <h3 style={{ marginTop: "15px", marginBottom: "10px" }}>Card Details</h3>
            <p style={{ color: "#555", fontSize: "0.75rem", marginBottom: "5px" }}>Test Card: 4242 4242 4242 4242</p>
            
            <input placeholder="Card Number" maxLength="16" style={inputStyle} />
            <div style={{ display: "flex", gap: "10px" }}>
              <input placeholder="MM/YY" style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="CVV" style={{ ...inputStyle, flex: 1 }} />
            </div>

            <button onClick={handlePayment} disabled={loading} style={primaryBtnStyle}>
              {loading ? "Processing..." : `Pay ${plan.price}`}
            </button>

            {message && <p style={{ color: "#4ac6ff", textAlign: "center", marginTop: "10px", fontSize: "0.9rem" }}>{message}</p>}
            
            <button onClick={() => setMethod(null)} style={linkBtnStyle}>
              ← Change Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = {
  minHeight: "100vh",
  background: "#0d0d14",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  fontFamily: "sans-serif"
};

const cardStyle = {
  background: "#1a1a2e",
  padding: "40px",
  borderRadius: "24px",
  width: "100%",
  maxWidth: "500px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  textAlign: "center",
  color: "#fff"
};

const inputStyle = {
  padding: "12px 15px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#0d0d14",
  color: "#fff",
  outline: "none"
};

const primaryBtnStyle = {
  padding: "15px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#666",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "0.9rem"
};

export default PaymentPage;