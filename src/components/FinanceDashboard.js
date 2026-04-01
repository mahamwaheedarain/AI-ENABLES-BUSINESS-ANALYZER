// src/components/FinanceDashboard.js
import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ---------- Professional Styles ----------
const themeColors = {
  primary: "#4ac6ff",
  secondary: "#2a2f4a",
  cardBg: "#1a1a2e",
  bg: "#0d0d14",
  text: "#e0e0e0",
  placeholder: "#444",
  hover: "rgba(74,198,255,0.2)",
};

const styles = {
  appContainer: { display: "flex", height: "100vh", background: themeColors.bg, color: themeColors.text, fontFamily: "Inter, sans-serif" },
  sidebar: { width: 250, background: themeColors.secondary, padding: 20, display: "flex", flexDirection: "column", gap: 15, transition: "all 0.3s" },
  menuItem: { padding: 12, cursor: "pointer", borderRadius: 10, transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "space-between" },
  menuItemActive: { background: themeColors.primary, color: "#000" },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: themeColors.bg, borderBottom: "1px solid #222" },
  sidebarToggle: { fontSize: 22, cursor: "pointer" },
  search: { padding: 8, borderRadius: 8, border: `1px solid ${themeColors.placeholder}`, background: themeColors.bg, color: themeColors.text, width: 250 },
  dashboard: { padding: 30, flex: 1, overflowY: "auto" },
  categoryButtons: { display: "flex", flexWrap: "wrap", gap: 20 },
  categoryButton: { padding: "20px 30px", borderRadius: 15, background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`, color: "#fff", fontWeight: "bold", fontSize: 18, cursor: "pointer", border: "none", flex: "1 1 200px", transition: "0.3s" },
  categoryButtonHover: { boxShadow: "0 4px 20px rgba(74,198,255,0.5)" },
  cardGrid: { display: "flex", flexWrap: "wrap", gap: 20 },
  card: { background: themeColors.cardBg, borderRadius: 15, padding: 20, color: "#fff", flex: "1 1 300px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transition: "0.3s", cursor: "pointer" },
  cardHover: { transform: "translateY(-5px)", boxShadow: "0 8px 25px rgba(74,198,255,0.5)" },
  chartPlaceholder: { height: 200, borderRadius: 10, background: themeColors.bg, display: "flex", alignItems: "center", justifyContent: "center", color: themeColors.placeholder, fontStyle: "italic", marginTop: 10 },
};

// ---------- Sample Chart Data ----------
const sampleLineData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4000 },
  { name: "May", value: 6000 },
];

const samplePieData = [
  { name: "Category A", value: 400 },
  { name: "Category B", value: 300 },
  { name: "Category C", value: 300 },
  { name: "Category D", value: 200 },
];

const pieColors = [themeColors.primary, "#ff6b6b", "#feca57", "#1dd1a1"];

// ---------- Finance Dashboard Component ----------
export default function FinanceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [activeFunc, setActiveFunc] = useState(null);

  // ---------- 10 Categories with 5 Functionalities each ----------
  const categories = [
    {
      name: "Revenue & Expenses",
      functionalities: ["Revenue", "Expenses", "Net Profit", "Cash Flow", "Forecast"],
    },
    {
      name: "Budget & Investment",
      functionalities: ["Budget Planning", "Investment Analysis", "Alerts", "Break-even", "Cost Optimization"],
    },
    {
      name: "Accounts & Tax",
      functionalities: ["Accounts Receivable", "Accounts Payable", "Loan/Debt", "Tax Reporting", "Expense Categorization"],
    },
    {
      name: "Analysis & KPIs",
      functionalities: ["Profit Margin", "Trend Analysis", "Scenario Analysis", "KPI Dashboard", "Revenue by Dept/Region"],
    },
    {
      name: "Risk & AI Insights",
      functionalities: ["Vendor/Supplier Analysis", "Risk/Fraud Analysis", "Historical Comparison", "AI Insights", "Forecast vs Actual"],
    },
    {
      name: "Market & Competitors",
      functionalities: ["Market Share", "Competitor Analysis", "SWOT Analysis", "Pricing Trends", "Customer Insights"],
    },
    {
      name: "Cash & Liquidity",
      functionalities: ["Cash Position", "Liquidity Ratio", "Short-term Investments", "Receivables Aging", "Payables Aging"],
    },
    {
      name: "Performance & Efficiency",
      functionalities: ["ROE", "ROA", "Operational KPIs", "Productivity Analysis", "Cost Efficiency"],
    },
    {
      name: "Customer & Sales",
      functionalities: ["Customer Segmentation", "Sales Trends", "Churn Rate", "Customer LTV", "Lead Conversion"],
    },
    {
      name: "Forecasting & Planning",
      functionalities: ["Financial Forecast", "Scenario Planning", "Budget vs Actual", "Revenue Projections", "Expense Forecast"],
    },
  ];

  // ---------- Handlers ----------
  const handleBackCategory = () => {
    setCategory(null);
    setActiveFunc(null);
  };
  const handleBackFunctionality = () => setActiveFunc(null);

  // ---------- Render Functionalities Card ----------
  const renderFunctionalityCard = (funcName, idx) => {
    const chartType = idx % 3 === 0 ? "line" : idx % 3 === 1 ? "bar" : "pie";
    return (
      <div key={idx} style={styles.card}>
        <h3>{funcName}</h3>
        {chartType === "line" && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sampleLineData}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={themeColors.primary} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sampleLineData}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={themeColors.primary} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={samplePieData} dataKey="value" nameKey="name" outerRadius={70} fill={themeColors.primary}>
                {samplePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  // ---------- Render Category Functionalities ----------
  const renderCategory = () => (
    <div style={{ padding: 30 }}>
      <button onClick={handleBackCategory} style={{ ...styles.categoryButton, marginBottom: 20 }}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{category.name}</h2>
      <div style={styles.categoryButtons}>
        {category.functionalities.map((func, idx) => (
          <button key={idx} style={styles.categoryButton} onClick={() => setActiveFunc(func)}>
            {func}
          </button>
        ))}
      </div>
    </div>
  );

  // ---------- Render Functionality Details ----------
  const renderFunctionalityDetails = () => (
    <div style={{ padding: 30 }}>
      <button onClick={handleBackFunctionality} style={{ ...styles.categoryButton, marginBottom: 20 }}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{activeFunc}</h2>
      <div style={styles.cardGrid}>
        {[1, 2, 3, 4, 5].map((_, idx) => renderFunctionalityCard(activeFunc + " Metric " + idx, idx))}
      </div>
    </div>
  );

  // ---------- Render Sidebar & Main ----------
  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 20 }}>AI Analyzer</h2>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              style={{ ...styles.menuItem, ...(category?.name === cat.name ? styles.menuItemActive : {}) }}
              onClick={() => { setCategory(cat); setActiveFunc(null); }}
            >
              {cat.name}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={styles.main}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.sidebarToggle}>☰</button>
          <input type="text" placeholder="Search..." style={styles.search} />
          <div>👤</div>
          <div>🔔</div>
        </div>

        {/* Dashboard Content */}
        <div style={styles.dashboard}>
          {!category && <h2 style={{ textAlign: "center", color: "#fff" }}>Select a Category to Begin</h2>}
          {category && !activeFunc && renderCategory()}
          {activeFunc && renderFunctionalityDetails()}
        </div>
      </div>
    </div>
  );
}