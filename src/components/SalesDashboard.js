// src/components/SalesDashboard.js
import React, { useState } from "react";
import {
  Line,
  Bar,
  Doughnut,
  Pie,
  PolarArea,
  Radar,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

// ---------- Dummy Data ----------
const dummyData = {
  revenueTrend: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [12000, 15000, 13000, 17000, 19000, 22000],
        backgroundColor: "rgba(74,198,255,0.3)",
        borderColor: "#4ac6ff",
        tension: 0.4,
        fill: true,
      },
    ],
  },
  salesBar: {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: "Sales Units",
        data: [120, 90, 140, 70],
        backgroundColor: ["#4ac6ff", "#2a2f4a", "#4ac6ff", "#2a2f4a"],
      },
    ],
  },
  leadPie: {
    labels: ["Hot Leads", "Warm Leads", "Cold Leads"],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: ["#4ac6ff", "#2a2f4a", "#888"],
      },
    ],
  },
  conversionRadar: {
    labels: ["Emails", "Calls", "Meetings", "Follow-ups", "Demos"],
    datasets: [
      {
        label: "Conversion Rate (%)",
        data: [80, 65, 70, 55, 90],
        backgroundColor: "rgba(74,198,255,0.3)",
        borderColor: "#4ac6ff",
        borderWidth: 2,
      },
    ],
  },
  regionalArea: {
    labels: ["North", "South", "East", "West"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [5000, 7000, 4000, 6000],
        backgroundColor: "rgba(74,198,255,0.3)",
        borderColor: "#4ac6ff",
        tension: 0.3,
        fill: true,
      },
    ],
  },
  aiInsights: [
    "Focus on Product C; high sales potential.",
    "Email campaigns have 80% conversion rate, scale up.",
    "Regional South underperforming, check local strategy.",
    "AI suggests prioritizing warm leads for higher ROI.",
  ],
};

// ---------- Styles ----------
const themeColors = {
  primary: "#4ac6ff",
  secondary: "#2a2f4a",
  cardBg: "#1a1a2e",
  bg: "#0d0d14",
  text: "#e0e0e0",
  placeholder: "#555",
};
const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    background: themeColors.bg,
    color: themeColors.text,
    fontFamily: "Inter, sans-serif",
  },
  sidebar: {
    width: 250,
    background: themeColors.secondary,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  menuItem: {
    padding: 12,
    cursor: "pointer",
    borderRadius: 10,
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
  },
  menuItemActive: { background: themeColors.primary, color: "#000" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    background: themeColors.bg,
    borderBottom: "1px solid #222",
  },
  sidebarToggle: { fontSize: 22, cursor: "pointer" },
  search: {
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${themeColors.placeholder}`,
    background: themeColors.bg,
    color: themeColors.text,
    width: 250,
  },
  dashboard: { padding: 30, flex: 1, overflowY: "auto" },
  cardGrid: { display: "flex", flexWrap: "wrap", gap: 20 },
  card: {
    background: themeColors.cardBg,
    borderRadius: 15,
    padding: 20,
    color: "#fff",
    flex: "1 1 300px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    transition: "0.3s",
  },
  backButton: {
    padding: "10px 25px",
    borderRadius: 20,
    background: themeColors.primary,
    border: "none",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 20,
  },
};

// ---------- Sales Dashboard ----------
export default function SalesDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);

  const categories = [
    { name: "Revenue Overview" },
    { name: "Sales Analytics" },
    { name: "Leads & Conversion" },
    { name: "Regional Trends" },
    { name: "AI Insights" },
  ];

  const handleCategoryClick = (cat) => setCategory(cat);

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>
            Sales Analyzer
          </h2>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              style={{
                ...styles.menuItem,
                ...(category === cat ? styles.menuItemActive : {}),
              }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.sidebarToggle}
          >
            ☰
          </button>
          <input type="text" placeholder="Search..." style={styles.search} />
          <div>👤</div>
          <div>🔔</div>
        </div>

        <div style={styles.dashboard}>
          {!category && (
            <h2 style={{ textAlign: "center", color: "#fff" }}>
              Select a Category to Begin
            </h2>
          )}

          {category?.name === "Revenue Overview" && (
            <div>
              <h2>💰 Revenue Overview</h2>
              <div style={{ maxWidth: 600, margin: "20px auto" }}>
                <Line data={dummyData.revenueTrend} />
              </div>
            </div>
          )}

          {category?.name === "Sales Analytics" && (
            <div>
              <h2>📊 Sales Analytics</h2>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <Bar data={dummyData.salesBar} />
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <Doughnut data={dummyData.leadPie} />
                </div>
              </div>
            </div>
          )}

          {category?.name === "Leads & Conversion" && (
            <div>
              <h2>🎯 Leads & Conversion</h2>
              <div style={{ maxWidth: 600, margin: "20px auto" }}>
                <Radar data={dummyData.conversionRadar} />
              </div>
            </div>
          )}

          {category?.name === "Regional Trends" && (
            <div>
              <h2>🌍 Regional Trends</h2>
              <div style={{ maxWidth: 600, margin: "20px auto" }}>
                <Bar data={dummyData.salesBar} />
                <Line data={dummyData.regionalArea} />
              </div>
            </div>
          )}

          {category?.name === "AI Insights" && (
            <div>
              <h2>🤖 AI Insights</h2>
              <div style={styles.cardGrid}>
                {dummyData.aiInsights.map((insight, idx) => (
                  <div key={idx} style={styles.card}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}