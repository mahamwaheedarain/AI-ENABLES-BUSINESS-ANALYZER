import React, { useState, useEffect } from "react";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import "./Subscription.css";

const plans = [
  { name: "Pro", price: "$25/month", features: ["Dashboards", "Upload Files"] },
  { name: "Enterprise", price: "$50/month", features: ["All Features + AI Insights"] },
];

function Subscription({ onSubscribe }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [goToPayment, setGoToPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (paymentComplete && selectedPlan) {
    return <PaymentSuccess plan={selectedPlan} onContinue={() => onSubscribe(selectedPlan)} />;
  }

  if (goToPayment && selectedPlan) {
    return <PaymentPage plan={selectedPlan} onSuccess={() => setPaymentComplete(true)} onBack={() => setGoToPayment(false)} />;
  }

  return (
    <div className="subscription-container">

      {/* Animated Particle Background */}
      <div className="particle-background" />

      {/* Hero Section */}
      <section className={`hero ${scrollY > 50 ? "fade-in" : ""}`}>
        <div className="hero-content">
          <h1>InsightIQ</h1>
          <p>Smarter business decisions with AI insights for Finance, HR & Marketing.</p>
          <button onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>
            Explore Plans
          </button>
        </div>
      </section>

      {/* Story Section */}
      <section className={`story ${scrollY > 300 ? "slide-up" : ""}`}>
        <h2>Our Story</h2>
        <p>
          AI Business Analyzer empowers businesses with AI-driven insights. From startups to enterprises, actionable intelligence to optimize growth and make data-driven decisions.
        </p>
      </section>

      {/* Benefits Section */}
      <section className={`benefits ${scrollY > 600 ? "slide-up" : ""}`}>
        <h2>What You’ll Get</h2>
        <div className="benefits-grid">
          <div className="benefit-card">📊 Dashboards & Analytics</div>
          <div className="benefit-card">📁 Upload & Process Files</div>
          <div className="benefit-card">🤖 AI Insights & Forecasts</div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className={`plans ${scrollY > 900 ? "slide-up" : ""}`}>
        {plans.map(plan => (
          <div key={plan.name} className="plan-card" onClick={() => { setSelectedPlan(plan); setGoToPayment(true); }}>
            <h3>{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>
            <ul>
              {plan.features.map((f, i) => <li key={i}>✔ {f}</li>)}
            </ul>
            <button>Subscribe</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Subscription;