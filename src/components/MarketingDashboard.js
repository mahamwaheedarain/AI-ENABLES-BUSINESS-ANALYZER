// src/components/MarketingDashboard.js
import React, { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ---------- Register ChartJS modules ----------
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ---------- Theme Colors ----------
const themeColors = {
  primary: "#4ac6ff",
  secondary: "#2a2f4a",
  cardBg: "#1a1a2e",
  bg: "#0d0d14",
  text: "#e0e0e0",
  placeholder: "#555",
};

// ---------- Styles ----------
const styles = {
  appContainer: { display: "flex", height: "100vh", background: themeColors.bg, color: themeColors.text, fontFamily: "Inter, sans-serif" },
  sidebar: { width: 250, background: themeColors.secondary, padding: 20, display: "flex", flexDirection: "column", gap: 15 },
  menuItem: { padding: 12, cursor: "pointer", borderRadius: 10, transition: "0.2s", display: "flex", alignItems: "center" },
  menuItemActive: { background: themeColors.primary, color: "#000" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: themeColors.bg, borderBottom: "1px solid #222" },
  sidebarToggle: { fontSize: 22, cursor: "pointer" },
  search: { padding: 8, borderRadius: 8, border: `1px solid ${themeColors.placeholder}`, background: themeColors.bg, color: themeColors.text, width: 250 },
  dashboard: { padding: 30, flex: 1, overflowY: "auto" },
  cardGrid: { display: "flex", flexWrap: "wrap", gap: 20 },
  card: { background: themeColors.cardBg, borderRadius: 15, padding: 20, color: "#fff", flex: "1 1 300px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transition: "0.3s" },
  backButton: { padding: "10px 25px", borderRadius: 20, background: themeColors.primary, border: "none", color: "#000", fontWeight: "bold", cursor: "pointer", marginBottom: 20 },
};

// ---------- Marketing Categories ----------
const categories = [
  { name: "Campaigns", functionalities: ["Campaign Overview", "ROI Analysis", "Budget Updates", "Track Conversions"] },
  { name: "Leads & CRM", functionalities: ["Leads Management", "Lead Segmentation", "Assign Leads", "CRM Integration"] },
  { name: "AI & Automation", functionalities: ["Voice AI Suggestions", "Generate Reports", "Email Blasts", "Content Generation", "Push Notifications"] },
  { name: "Analytics & Marketing Ops", functionalities: ["Social Posts", "SEO Score", "Keyword Analysis", "Customer Journey", "Competitor Insights", "Engagement Tracking", "Forecast Sales", "Manage Events"] },
];

// ---------- Marketing Data ----------
const MarketingData = {
  "Campaign Overview": { metrics: [{ name: "Total Campaigns", value: 5 }, { name: "Active Campaigns", value: 3 }, { name: "Conversions", value: 120 }], insight: "Overview of all marketing campaigns, budget utilization, and conversions." },
  "ROI Analysis": { metrics: [{ name: "Total Spent", value: 13000 }, { name: "Revenue", value: 30000 }, { name: "ROI", value: 130 }], insight: "Analyze marketing ROI per campaign. AI can suggest which campaigns to scale." },
  "Budget Updates": { metrics: [{ name: "Campaigns Adjusted", value: 2 }, { name: "Budget Increase Suggested", value: 3000 }], insight: "Track budget adjustments across campaigns to optimize spending." },
  "Track Conversions": { metrics: [{ name: "Conversions Tracked", value: 120 }, { name: "Conversion Rate", value: 9.4 }], insight: "Monitor campaign effectiveness. AI predicts future conversion trends." },
  "Leads Management": { metrics: [{ name: "Total Leads", value: 50 }, { name: "Contacted Leads", value: 20 }, { name: "New Leads", value: 10 }], insight: "Manage all leads in the pipeline. AI can prioritize high-potential leads." },
  "Lead Segmentation": { metrics: [{ name: "Leads Segmented", value: 30 }, { name: "Segments Created", value: 3 }], insight: "Segment leads for targeted campaigns. AI can suggest the best segment for each campaign." },
  "Assign Leads": { metrics: [{ name: "Assigned Leads", value: 20 }, { name: "Pending Assignment", value: 5 }], insight: "Automatically assign leads to sales reps based on workload and AI scoring." },
  "CRM Integration": { metrics: [{ name: "Tasks Synced", value: 12 }, { name: "Pending Tasks", value: 3 }], insight: "Integrate CRM with campaigns and leads to streamline operations." },
};

// ---------- Dashboard ----------
export default function MarketingDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [activeFunc, setActiveFunc] = useState(null);

  const handleBackCategory = () => { setCategory(null); setActiveFunc(null); };
  const handleBackFunctionality = () => setActiveFunc(null);

  // Render multiple charts
  const renderCharts = (funcName) => {
    const data = MarketingData[funcName]?.metrics || [];
    if (data.length === 0) return null;

    const barData = { labels: data.map(m => m.name), datasets: [{ label: "Values", data: data.map(m => Number(m.value)), backgroundColor: themeColors.primary }] };
    const lineData = { labels: data.map(m => m.name), datasets: [{ label: "Trend", data: data.map(m => Number(m.value)), borderColor: "#ff9f40", backgroundColor: "rgba(255,159,64,0.3)" }] };
    const pieData = { labels: data.map(m => m.name), datasets: [{ label: "Distribution", data: data.map(m => Number(m.value)), backgroundColor: ["#4ac6ff", "#ff6384", "#ff9f40", "#36a2eb"] }] };

    return (
      <div style={{ marginBottom: 30 }}>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: funcName + " (Bar Chart)" } } }} />
        <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: funcName + " (Trend Line)" } } }} />
        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" }, title: { display: true, text: funcName + " (Distribution Pie)" } } }} />
      </div>
    );
  };

  const renderInsight = (funcName) => (
    <div style={styles.cardGrid}>
      <div style={styles.card}>
        <h4>Insight</h4>
        <p>{MarketingData[funcName]?.insight || "No insights available."}</p>
      </div>
    </div>
  );

  const renderFunctionalityDetails = () => (
    <div>
      <button onClick={handleBackFunctionality} style={styles.backButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{activeFunc}</h2>
      {renderCharts(activeFunc)}
      {renderInsight(activeFunc)}
    </div>
  );

  const renderCategory = () => (
    <div>
      <button onClick={handleBackCategory} style={styles.backButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{category.name}</h2>
      <div style={styles.cardGrid}>
        {category.functionalities.map((func, idx) => (
          <div key={idx} style={styles.card} onClick={() => setActiveFunc(func)}>{func}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>Marketing Analyzer</h2>
          {categories.map((cat, idx) => (
            <div key={idx} style={{ ...styles.menuItem, ...(category?.name === cat.name ? styles.menuItemActive : {}) }} onClick={() => { setCategory(cat); setActiveFunc(null); }}>{cat.name}</div>
          ))}
        </div>
      )}

      <div style={styles.main}>
        <div style={styles.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
          <input type="text" placeholder="Search..." style={styles.search} />
          <div>👤</div>
          <div>🔔</div>
        </div>

        <div style={styles.dashboard}>
          {!category && <h2 style={{ textAlign: "center", color: "#fff" }}>Select a Category to Begin</h2>}
          {category && !activeFunc && renderCategory()}
          {activeFunc && renderFunctionalityDetails()}
        </div>
      </div>
    </div>
  );
}