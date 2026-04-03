import React, { useState, useEffect } from "react";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import ContactUs from "./components/ContactUs";
import AboutApp from "./components/AboutApp";
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

  // Track scroll for animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ----------------- Payment Success -----------------
  if (paymentComplete && selectedPlan) {
    if (selectedPlan.name === "Enterprise") {
      // Show Enterprise Auth Check before going to Enterprise Dashboard
      setVerifyEnterprise(true);
      return null;
    } else {
      // Pro plan goes to normal dashboard after payment success
      return (
        <PaymentSuccess
          plan={selectedPlan}
          onContinue={onGoToDashboard}
        />
      );
    }
  }

  // ----------------- Enterprise Auth Check -----------------
  if (verifyEnterprise) {
    return (
      <div
        className="auth-container"
        style={{
          maxWidth: 400,
          margin: "100px auto",
          padding: 30,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 20,
          textAlign: "center",
        }}
      >
        <h2>Enterprise Dashboard Login</h2>
        <input
          type="email"
          placeholder="Enter Email"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #444",
            background: "rgba(0,0,0,0.2)",
            color: "#fff",
            width: "100%",
            marginBottom: 10,
          }}
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Password"
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #444",
            background: "rgba(0,0,0,0.2)",
            color: "#fff",
            width: "100%",
            marginBottom: 10,
          }}
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
        />

        <button
          style={{
            padding: "12px",
            borderRadius: 25,
            border: "none",
            background: "linear-gradient(90deg, #4ac6ff, #2a2f4a)",
            color: "#fff",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => {
            if (authEmail && authPassword) {
              // send to Enterprise Dashboard
              onSubscribe("enterprise");
            } else {
              alert("Please enter Email and Password to continue!");
            }
          }}
        >
          Go to Enterprise Dashboard
        </button>
      </div>
    );
  }

  // ----------------- Payment Page -----------------
  if (goToPayment && selectedPlan) {
    return (
      <PaymentPage
        plan={selectedPlan}
        onSuccess={() => setPaymentComplete(true)}
        onBack={() => setGoToPayment(false)}
      />
    );
  }

  // ----------------- Contact Us page -----------------
  if (showContact) return <ContactUs onBack={() => setShowContact(false)} />;

  // ----------------- About App page -----------------
  if (showAbout) return <AboutApp onBack={() => setShowAbout(false)} />;

  // ----------------- Main Subscription Page -----------------
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
          <button onClick={onGoToDashboard}>Go to Pro Dashboard</button>
          <button
            onClick={() => setVerifyEnterprise(true)}
            style={{ marginTop: 10 }}
          >
            Go to Enterprise Dashboard
          </button>
        </div>
      </section>

      <section className={`story ${scrollY > 300 ? "slide-up" : ""}`}>
        <h2>Our Story</h2>
        <p>
          AI Business Analyzer empowers businesses with AI-driven insights. From startups to
          enterprises, actionable intelligence to optimize growth and make data-driven decisions.
        </p>
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