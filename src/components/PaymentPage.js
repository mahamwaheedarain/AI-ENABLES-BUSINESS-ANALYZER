import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Confetti from "react-confetti";

function PaymentPage({ plan, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [method, setMethod] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const [form, setForm] = useState({
    name: "",
    business: "",
    contact: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!form.business || !form.email || !form.password) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    let uid = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      uid = userCredential.user.uid;
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        const loginRes = await signInWithEmailAndPassword(auth, form.email, form.password);
        uid = loginRes.user.uid;
      } else {
        alert("Auth error: " + err.message);
        setLoading(false);
        return;
      }
    }

    try {
      await setDoc(doc(db, "subscriptions", uid), {
        name: form.name,
        business: form.business,
        contact: form.contact,
        email: form.email,
        plan: plan.name,
        status: "active",
        createdAt: new Date().toISOString(),
      });
      setPaymentComplete(true);
    } catch (error) {
      console.error(error);
      setPaymentComplete(true); // Continue to success even if DB log fails
    }
    setLoading(false);
  };

  // ---------------- SUCCESS VIEW ----------------
  if (paymentComplete) {
    return (
      <div style={containerStyle}>
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.1} colors={['#4ac6ff', '#2a2f4a', '#ffffff', '#1a1a2e']} />
        <div style={{ ...cardStyle, maxWidth: "500px", textAlign: "center", animation: "fadeIn 0.8s ease-out" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✨</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "300", marginBottom: "10px", letterSpacing: "1px" }}>Access Granted</h1>
          <p style={{ color: "#aaa", marginBottom: "30px" }}>
            Your <strong>{plan.name}</strong> subscription is now active.
          </p>
          
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(74, 198, 255, 0.2)", marginBottom: "30px", textAlign: "left" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#4ac6ff", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "2px" }}>Plan Details</h4>
            <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>{plan.name} Analyzer</div>
            <div style={{ color: "#888", fontSize: "0.9rem" }}>{plan.price} / monthly</div>
          </div>

          <button onClick={() => onSuccess({ email: form.email, password: form.password, plan: plan.name })} style={primaryBtnStyle}>
            Go to Executive Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------------- METHOD SELECTION ----------------
  if (!method) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, maxWidth: "400px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "20px", fontWeight: "300", letterSpacing: "1px" }}>Secure Checkout</h2>
          <p style={{ color: "#888", marginBottom: "30px", fontSize: "0.9rem" }}>Choose a payment method for <strong>{plan.name}</strong>.</p>
          <button onClick={() => setMethod("card")} style={primaryBtnStyle}>Pay with Card</button>
          <button onClick={onBack} style={linkBtnStyle}>Back to Plans</button>
        </div>
      </div>
    );
  }

  // ---------------- CHECKOUT FORM ----------------
  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, display: "flex", gap: "40px", maxWidth: "900px" }}>
        <div style={{ flex: 1, borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "20px" }}>
          <span style={{ color: "#4ac6ff", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "2px" }}>Selected Plan</span>
          <h2 style={{ fontSize: "2.5rem", margin: "10px 0", fontWeight: "600" }}>{plan.name}</h2>
          <h1 style={{ color: "#fff", opacity: 0.9 }}>{plan.price}</h1>
          <ul style={{ padding: 0, marginTop: "20px", listStyle: "none", color: "#aaa", fontSize: "0.85rem" }}>
            {plan.features?.map((f, i) => <li key={i} style={{ marginBottom: "8px" }}>✦ {f}</li>)}
          </ul>
        </div>

        <div style={{ flex: 2 }}>
          <h3 style={{ marginBottom: "20px", fontWeight: "400", borderBottom: "1px solid #333", paddingBottom: "10px" }}>Business Registration</h3>
          <div style={rowStyle}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" style={inputStyle} />
            <input name="business" value={form.business} onChange={handleChange} placeholder="Business Name" style={inputStyle} />
          </div>
          <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact Number" style={inputStyle} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Business Email" style={inputStyle} autoComplete="off" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Dashboard Password" style={inputStyle} autoComplete="new-password" />

          <h3 style={{ margin: "30px 0 20px 0", fontWeight: "400", borderBottom: "1px solid #333", paddingBottom: "10px" }}>Payment Details</h3>
          <input placeholder="Card Number" style={inputStyle} />
          <div style={rowStyle}>
            <input placeholder="MM / YY" style={inputStyle} />
            <input placeholder="CVV" style={inputStyle} />
          </div>

          <button onClick={handlePayment} style={{ ...primaryBtnStyle, marginTop: "20px" }}>
            {loading ? "Verifying..." : `Activate ${plan.name} Plan`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Updated Styles for a "Quiet Luxury" Tech aesthetic
const containerStyle = { minHeight: "100vh", background: "#08080c", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" };
const cardStyle = { background: "rgba(26, 26, 46, 0.4)", backdropFilter: "blur(10px)", padding: "40px", borderRadius: "24px", color: "#fff", width: "100%", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" };
const inputStyle = { width: "100%", padding: "14px", marginBottom: "12px", background: "rgba(0, 0, 0, 0.2)", color: "#fff", border: "1px solid #2a2a3a", borderRadius: "12px", outline: "none", fontSize: "0.9rem" };
const rowStyle = { display: "flex", gap: "12px" };
const primaryBtnStyle = { width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #4ac6ff 0%, #2a2f4a 100%)", color: "#fff", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(74, 198, 255, 0.2)" };
const linkBtnStyle = { background: "none", border: "none", color: "#666", marginTop: "15px", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" };

export default PaymentPage;