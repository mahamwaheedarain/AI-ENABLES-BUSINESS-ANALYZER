// src/components/AboutApp.js
import React from "react";
import "../Subscription.css";

export default function AboutApp({ onBack }) {
  return (
    <div className="subscription-container">
      {/* Back Button */}
      <button className="back-btn" onClick={onBack}>
        ← Back to Plans
      </button>

      {/* About Section */}
      <section className="about-page fade-in">
        <h2>About InsightIQ</h2>
        <p>
          InsightIQ is an AI-powered Business Analyzer helping businesses make smarter, data-driven decisions. Explore detailed dashboards, upload files, and get actionable AI insights to improve your operations.
        </p>

        {/* Benefits */}
        <h3>Benefits</h3>
        <div className="benefits-grid">
          <div className="benefit-card">📊 Dashboards & analytics for Finance, HR & Marketing</div>
          <div className="benefit-card">🤖 AI insights & predictions for optimization</div>
          <div className="benefit-card">📁 Upload & process business files seamlessly</div>
          <div className="benefit-card">💡 Actionable recommendations for growth</div>
        </div>

        {/* How It Works */}
        <h3>Step-by-Step Guide</h3>
        <div className="tutorial-cards">
          <div className="tutorial-card">1️⃣ Sign up and choose a subscription plan</div>
          <div className="tutorial-card">2️⃣ Upload your business data securely</div>
          <div className="tutorial-card">3️⃣ InsightIQ analyzes your data with AI</div>
          <div className="tutorial-card">4️⃣ Access dashboards, insights, and recommendations</div>
          <div className="tutorial-card">5️⃣ Apply insights to improve business decisions</div>
        </div>

        {/* Who Can Benefit */}
        <h3>Who Can Benefit</h3>
        <p>
          Startups, SMEs, and large enterprises aiming to improve their Finance, HR, and Marketing strategies.
        </p>
      </section>
    </div>
  );
}