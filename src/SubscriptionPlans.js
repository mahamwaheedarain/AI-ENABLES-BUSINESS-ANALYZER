import React, { useState, useEffect } from "react";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import ContactUs from "./components/ContactUs";
import AboutApp from "./components/AboutApp";
import { auth, db } from "./firebase"; // ✅ Ensure db is imported from your firebase config
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // ✅ Needed for plan verification
import "./Subscription.css";

const plans = [
  { name: "Pro", price: "$25/month", features: ["Dashboards", "Upload Files"] },
  { name: "Enterprise", price: "$50/month", features: ["All Features + AI Insights", "Operations & Sales"] },
];

export default function Subscription({ onSubscribe, onGoToDashboard }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [goToPayment, setGoToPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Enterprise auth states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [verifyEnterprise, setVerifyEnterprise] = useState(false);

  // Pro auth states
  const [proEmail, setProEmail] = useState("");
  const [proPassword, setProPassword] = useState("");
  const [verifyPro, setVerifyPro] = useState(false);

  // ✅ FIXED & SECURED: Verification Logic
  const handleBusinessAuth = async (email, password, type) => {
    if (!email || !password) {
      alert("Please enter Email and Password to continue!");
      return;
    }

    try {
      // 1. Authenticate the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch the plan details from the 'subscriptions' collection (as saved in PaymentPage)
      const subDoc = await getDoc(doc(db, "subscriptions", uid));

      if (subDoc.exists()) {
        const subData = subDoc.data();
        const paidPlan = subData.plan.toLowerCase(); // Matches 'Pro' or 'Enterprise'
        const targetDashboard = type.toLowerCase();

        // 3. Security Check: Compare the paid plan to the button clicked
        if (paidPlan === targetDashboard) {
          if (paidPlan === "enterprise") {
            onSubscribe("enterprise");
          } else {
            onGoToDashboard();
          }
        } else {
          // Access Denied: Wrong Dashboard for this Plan
          alert(`Access Denied!`);
          await signOut(auth); // Log out for security
        }
      } else {
        alert("No business subscription found for this account.");
        await signOut(auth);
      }
    } catch (error) {
      alert("Verification Failed: " + error.message);
    }
  };

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle payment success safely
  useEffect(() => {
    if (paymentComplete && selectedPlan) {
      if (selectedPlan.name === "Enterprise") {
        setVerifyEnterprise(true);
      } else if (selectedPlan.name === "Pro") {
        setVerifyPro(true);
      }
    }
  }, [paymentComplete, selectedPlan]);

  // ----------------- Enterprise Auth -----------------
  if (verifyEnterprise) {
    return (
      <div className="auth-container" style={{
        maxWidth: 400, margin: "100px auto", padding: 30,
        background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center",
      }}>
        <h2>Enterprise Dashboard Login</h2>
        <input
          type="email" placeholder="Business Email"
          value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 }}
        />
        <input
          type="password" placeholder="Password"
          value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 }}
        />
        <button
          onClick={() => handleBusinessAuth(authEmail, authPassword, "enterprise")}
          style={{ padding: "12px", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", width: "100%" }}
        >
          Go to Enterprise Dashboard
        </button>
        <button onClick={() => setVerifyEnterprise(false)} style={{ background: "none", border: "none", color: "#888", marginTop: 10, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  // ----------------- Pro Auth -----------------
  if (verifyPro) {
    return (
      <div className="auth-container" style={{
        maxWidth: 400, margin: "100px auto", padding: 30,
        background: "rgba(255,255,255,0.05)", borderRadius: 20, textAlign: "center",
      }}>
        <h2>Pro Dashboard Verification</h2>
        <input
          type="email" placeholder="Business Email"
          value={proEmail} onChange={(e) => setProEmail(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 }}
        />
        <input
          type="password" placeholder="Password"
          value={proPassword} onChange={(e) => setProPassword(e.target.value)}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #444", background: "rgba(0,0,0,0.2)", color: "#fff", width: "100%", marginBottom: 10 }}
        />
        <button
          onClick={() => handleBusinessAuth(proEmail, proPassword, "pro")}
          style={{ padding: "12px", borderRadius: 25, border: "none", background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)", color: "#fff", cursor: "pointer", width: "100%" }}
        >
          Go to Pro Dashboard
        </button>
        <button onClick={() => setVerifyPro(false)} style={{ background: "none", border: "none", color: "#888", marginTop: 10, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  // ----------------- Payment -----------------
  if (goToPayment && selectedPlan) {
    return (
      <PaymentPage
        plan={selectedPlan}
        onSuccess={() => setPaymentComplete(true)}
        onBack={() => setGoToPayment(false)}
      />
    );
  }

  // ----------------- Contact/About -----------------
  if (showContact) return <ContactUs onBack={() => setShowContact(false)} />;
  if (showAbout) return <AboutApp onBack={() => setShowAbout(false)} />;

  // ----------------- Main UI -----------------
  return (
    <div className="subscription-container">
      <div className="particle-background" />

      <section className={`hero ${scrollY > 50 ? "fade-in" : ""}`}>
        <div className="hero-content">
          <h1>InsightIQ</h1>
          <p>Smarter business decisions with AI insights for Finance, HR, Marketing, Operations & Sales.</p>

          <button className="contact-btn" onClick={() => setShowAbout(true)}>Learn More</button>
          <button onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>Explore Plans</button>
          <button className="contact-btn" onClick={() => setShowContact(true)}>Contact Us</button>
          <button onClick={() => setVerifyPro(true)}>Go to Pro Dashboard</button>
          <button onClick={() => setVerifyEnterprise(true)} style={{ marginTop: 10 }}>Go to Enterprise Dashboard</button>
        </div>
      </section>

      <section className={`story ${scrollY > 300 ? "slide-up" : ""}`}>
        <h2>Our Story</h2>
        <p>AI Business Analyzer empowers businesses with AI-driven insights.</p>
      </section>

      <section className={`benefits ${scrollY > 600 ? "slide-up" : ""}`}>
        <h2>What You’ll Get</h2>
        <div className="benefits-grid">
          <div className="benefit-card">📊 Dashboards & Analytics</div>
          <div className="benefit-card">📁 Upload & Process Files</div>
          <div className="benefit-card">🤖 AI Insights & Forecasts</div>
        </div>
      </section>

      <section className={`plans ${scrollY > 900 ? "slide-up" : ""}`}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="plan-card"
            onClick={() => {
              setSelectedPlan(plan);
              setGoToPayment(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <h3>{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>
            <ul>
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>
            <button>Subscribe</button>
          </div>
        ))}
      </section>
    </div>
  );
}