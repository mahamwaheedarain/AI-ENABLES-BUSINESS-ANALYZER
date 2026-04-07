// src/components/OperationsDashboard.js
import React, { useState } from "react";

// ---------- Theme Colors ----------
const themeColors = {
  primary: "#4ac6ff",
  secondary: "#2a2f4a",
  cardBg: "#1a1a2e",
  bg: "#0d0d14",
  text: "#e0e0e0",
  placeholder: "#444",
};

// ---------- Styles ----------
const styles = {
  appContainer: { display: "flex", height: "100vh", background: themeColors.bg, color: themeColors.text, fontFamily: "Inter, sans-serif" },
  sidebar: { width: 250, background: themeColors.secondary, padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 12, cursor: "pointer", borderRadius: 10, transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "space-between" },
  menuItemActive: { background: themeColors.primary, color: "#000" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: themeColors.bg, borderBottom: "1px solid #222" },
  sidebarToggle: { fontSize: 22, cursor: "pointer" },
  search: { padding: 8, borderRadius: 8, border: `1px solid ${themeColors.placeholder}`, background: themeColors.bg, color: themeColors.text, width: 250 },
  dashboard: { padding: 30, flex: 1, overflowY: "auto" },
  categoryButtons: { display: "flex", flexWrap: "wrap", gap: 20 },
  categoryButton: { padding: "15px 25px", borderRadius: 15, background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`, color: "#fff", fontWeight: "bold", fontSize: 16, cursor: "pointer", border: "none", flex: "1 1 200px", transition: "0.3s" },
  cardGrid: { display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 },
  card: { background: themeColors.cardBg, borderRadius: 15, padding: 20, color: "#fff", flex: "1 1 300px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transition: "0.3s", cursor: "pointer" },
  backBtn: { padding: "10px 20px", borderRadius: 12, background: themeColors.primary, color: "#000", cursor: "pointer", marginBottom: 20 },
};

// ---------- Categories & Functionalities ----------
const categories = [
  { name: "Core Operations", functionalities: ["Inventory Control", "Supply Chain", "Order Processing", "Production Status", "Logistics Tracking"] },
  { name: "Analytics & Insights", functionalities: ["Demand Forecasting", "Cost Optimization", "KPI Metrics", "AI Efficiency Insights", "Global Ops View"] },
  { name: "Workflow & Management", functionalities: ["Task Manager", "Time Tracking", "Workforce Allocation", "Workflow Automation", "Process Optimization"] },
  { name: "Monitoring & Control", functionalities: ["Live Monitoring", "Risk Management", "Vendor Management", "Warehouse Tracking", "AI Operations Assistant"] },
];

// ---------- Dummy Insights (Replace with AI output later) ----------
const generateInsight = (funcName) => `${funcName}: AI will generate dynamic insights here.`;

// ---------- Dummy Metrics (Replace with AI output later) ----------
const generateMetrics = (funcName) => {
  return Array.from({ length: 4 }, (_, i) => ({
    name: `${funcName} - Metric ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
  }));
};

// ---------- Dummy Tasks / Updates ----------
const generateTasks = () => [
  "Task 1 pending",
  "Task 2 completed",
  "Task 3 pending",
  "Alert: Review needed",
];

const generateUpdates = () => [
  "Vendor 1 confirmed",
  "Shipment delayed by 1 day",
  "New order processed",
  "AI suggested optimization",
];

// ---------- Operations Dashboard ----------
export default function OperationsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [func, setFunc] = useState(null);

  const handleBackCategory = () => { setCategory(null); setFunc(null); };
  const handleBackFunctionality = () => setFunc(null);

  // ---------- Render KPI Cards ----------
  const renderKPICards = (funcName) => {
    const metrics = generateMetrics(funcName);
    return (
      <div style={styles.cardGrid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.card}>
            <h4>{m.name}</h4>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{m.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // ---------- Render Functionality Details ----------
  const renderFunctionalityDetails = () => (
    <div>
      <button onClick={handleBackFunctionality} style={styles.backBtn}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginTop: 20 }}>{func}</h2>

      {/* Insight */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h4>Insight</h4>
          <p>{generateInsight(func)}</p>
        </div>
      </div>

      {/* KPI Metrics */}
      {renderKPICards(func)}

      {/* Tasks & Updates */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h4>Tasks / Alerts</h4>
          <ul>
            {generateTasks().map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
        <div style={styles.card}>
          <h4>Updates</h4>
          <ul>
            {generateUpdates().map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  // ---------- Render Category Functionalities ----------
  const renderCategory = () => (
    <div>
      <button onClick={handleBackCategory} style={styles.backBtn}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginTop: 20 }}>{category.name}</h2>
      <div style={styles.categoryButtons}>
        {category.functionalities.map((f, idx) => (
          <button key={idx} style={styles.categoryButton} onClick={() => setFunc(f)}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 20 }}>AI Operations</h2>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              style={{ ...styles.menuItem, ...(category?.name === cat.name ? styles.menuItemActive : {}) }}
              onClick={() => { setCategory(cat); setFunc(null); }}
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
          <input type="text" placeholder="Search..." style={styles.search} />
          <div>👤</div>
          <div>🔔</div>
        </div>
        <div style={styles.dashboard}>
          {!category && <h2 style={{ textAlign: "center", color: "#fff" }}>Select a Category to Begin</h2>}
          {category && !func && renderCategory()}
          {func && renderFunctionalityDetails()}
        </div>
      </div>
    </div>
  );
}