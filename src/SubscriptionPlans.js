import React, { useState } from "react";

// Only Pro & Enterprise plans
const plans = [
  { name: "Pro", price: "$25/month", features: ["Dashboards", "Upload Files"] },
  { name: "Enterprise", price: "$50/month", features: ["All Features + AI Insights"] },
];

function Subscription({ onSubscribe }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePayment = () => {
    setPaymentStatus("Processing Payment...");
    setTimeout(() => {
      setPaymentStatus("Payment Successful! 🎉");
      setTimeout(() => onSubscribe(selectedPlan), 1500);
    }, 2000);
  };

  if (selectedPlan) {
    return (
      <div style={{ fontFamily: "Segoe UI", textAlign: "center", padding: "50px" }}>
        <h1>Payment for {selectedPlan.name} Plan</h1>
        <p>Price: {selectedPlan.price}</p>
        <p>Choose a demo payment method:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "20px 0" }}>
          <button style={styles.paymentBtn} onClick={handlePayment}>Credit Card</button>
          <button style={styles.paymentBtn} onClick={handlePayment}>PayPal</button>
          <button style={styles.paymentBtn} onClick={handlePayment}>Demo UPI</button>
        </div>
        {paymentStatus && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{paymentStatus}</p>}
      </div>
    );
  }

  // Subscription / Story Page
  return (
    <div style={{ fontFamily: "Segoe UI", lineHeight: 1.6 }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(90deg, #667eea, #764ba2)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center",
        borderRadius: "0 0 50px 50px",
        marginBottom: "40px"
      }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>AI Business Analyzer</h1>
        <p style={{ fontSize: "20px", maxWidth: "600px", margin: "0 auto 30px" }}>
          Make smarter business decisions with AI insights for Finance, HR, and Marketing.
        </p>
        <button 
          style={{
            padding: "15px 40px",
            fontSize: "18px",
            borderRadius: "30px",
            background: "white",
            color: "#667eea",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={() => window.scrollTo({top: 600, behavior: "smooth"})}
        >
          Explore Plans
        </button>
      </div>

      {/* Story Section */}
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "50px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>Our Story</h2>
        <p>
          AI Business Analyzer started with a mission to empower businesses with AI-driven insights.
          From small startups to large enterprises, our goal is to provide actionable intelligence 
          that helps you grow, optimize, and make data-driven decisions.
        </p>
      </div>

      {/* Benefits Section */}
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "60px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>What You’ll Get</h2>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ width: "250px", background: "#eef2fb", padding: "20px", borderRadius: "15px" }}>📊 Detailed Dashboards</div>
          <div style={{ width: "250px", background: "#eef2fb", padding: "20px", borderRadius: "15px" }}>📁 Upload & Analyze Files</div>
          <div style={{ width: "250px", background: "#eef2fb", padding: "20px", borderRadius: "15px" }}>🤖 AI Business Insights</div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "60px", flexWrap: "wrap" }}>
        {plans.map(plan => (
          <div key={plan.name} style={styles.planCard}
               onClick={() => setSelectedPlan(plan)}
               onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"}
               onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>{plan.name}</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px" }}>{plan.price}</p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
              {plan.features.map((f, i) => <li key={i} style={{ marginBottom: "8px" }}>✔ {f}</li>)}
            </ul>
            <button style={styles.subscribeBtn}>Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  planCard: {
    padding: "30px",
    borderRadius: "20px",
    background: "#f7f9fc",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    width: "250px",
    textAlign: "center",
    transition: "transform 0.3s",
    cursor: "pointer"
  },
  subscribeBtn: {
    padding: "12px 25px",
    borderRadius: "25px",
    background: "#667eea",
    color: "white",
    fontWeight: "bold",
    border: "none",
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
  }
};

export default Subscription;