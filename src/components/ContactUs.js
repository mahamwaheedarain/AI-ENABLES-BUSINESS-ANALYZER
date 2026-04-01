// src/components/ContactUs.js
import React, { useState, useEffect } from "react";
import "../Subscription.css"; // Uses same CSS file

export default function ContactUs({ onBack }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="subscription-container">
      {/* Back Button */}
      <button className="back-btn" onClick={onBack}>← Back to Plans</button>

      {/* Hero Section */}
      <section className={`hero ${scrollY > 50 ? "fade-in" : ""}`}>
        <div className="hero-content">
          <h1>Contact InsightIQ</h1>
          <p>Reach out for support, feedback, or partnership opportunities.</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={`contact-form-section ${scrollY > 300 ? "slide-up" : ""}`}>
        <h2>Send Us a Message</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* Professional Team Section */}
      <section className={`team ${scrollY > 600 ? "fade-in" : ""}`}>
        <h2>Our Experts</h2>
        <div className="team-grid">
          <div className="team-card hover-animate">
            <div className="avatar">👩‍💼</div>
            <h3>Maham Waheed</h3>
            <p>Project Lead & AI Analyst</p>
          </div>
          
          <div className="team-card hover-animate">
            <div className="avatar">👩‍💻</div>
            <h3>Adeena Sheikh</h3>
            <p>Team Member</p>
          </div>
          <div className="team-card hover-animate">
            <div className="avatar">🤖</div>
            <h3>InsightIQ AI</h3>
            <p>AI & Analytics Engine</p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className={`contact-info ${scrollY > 900 ? "slide-up" : ""}`}>
        <h2>Contact Details</h2>
        <ul>
          <li>📧 Email: wmaham06@gmail.com</li>
          <li>📞 Phone: +92 300 3799 170</li>
          <li>🌐 Website: www.insightiq.com</li>
          <li>📍 Location: Mirpurkhas, Pakistan</li>
        </ul>
      </section>
    </div>
  );
}