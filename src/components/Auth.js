// src/components/Auth.js
import React from "react";
import "../Subscription.css";

export const Login = ({ onLogin, switchToSignup, styles }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(e);
  };

  return (
    <div className="auth-container" style={styles?.authContainer}>
      
      {/* ✅ Brand */}
      <h2 className="brand-title">InsightIQ</h2>
      <p className="brand-sub">AI Business Analyzer</p>

      <h1 className="auth-heading">Login</h1>

      <form onSubmit={handleSubmit} className="auth-form" style={styles?.authForm}>
        <input
          type="email"
          placeholder="Email"
          required
          className="auth-input"
          style={styles?.authInput}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="auth-input"
          style={styles?.authInput}
        />

        <button className="auth-btn" type="submit" style={styles?.primaryBtn}>
          Login
        </button>
      </form>

      <p className="auth-text">
        Don't have an account?{" "}
        <span className="auth-link" onClick={switchToSignup}>
          Sign Up
        </span>
      </p>
    </div>
  );
};

export const Signup = ({ onSignup, switchToLogin, styles }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup(e);
  };

  return (
    <div className="auth-container" style={styles?.authContainer}>
      
      {/* ✅ Brand */}
      <h2 className="brand-title">InsightIQ</h2>
      <p className="brand-sub">AI Business Analyzer</p>

      <h1 className="auth-heading">Sign Up</h1>

      <form onSubmit={handleSubmit} className="auth-form" style={styles?.authForm}>
        <input
          type="text"
          placeholder="Name"
          required
          className="auth-input"
          style={styles?.authInput}
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="auth-input"
          style={styles?.authInput}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="auth-input"
          style={styles?.authInput}
        />

        <button className="auth-btn" type="submit" style={styles?.primaryBtn}>
          Sign Up
        </button>
      </form>

      <p className="auth-text">
        Already have an account?{" "}
        <span className="auth-link" onClick={switchToLogin}>
          Login
        </span>
      </p>
    </div>
  );
};