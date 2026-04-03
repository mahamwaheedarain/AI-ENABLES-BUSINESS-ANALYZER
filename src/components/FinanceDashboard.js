// src/components/FinanceDashboard.js
import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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
  sidebar: { width: 250, background: themeColors.secondary, padding: 20, display: "flex", flexDirection: "column", gap: 15, transition: "all 0.3s" },
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
  table: { width: "100%", borderCollapse: "collapse", marginTop: 20 },
  th: { borderBottom: "1px solid #444", padding: 10, textAlign: "left" },
  td: { borderBottom: "1px solid #333", padding: 8 },
};

// ---------- Sample Data ----------
const sampleLineData = [
  { name: "Jan", Revenue: 4000, Expenses: 2400, NetProfit: 1600 },
  { name: "Feb", Revenue: 3000, Expenses: 1398, NetProfit: 1602 },
  { name: "Mar", Revenue: 5000, Expenses: 3800, NetProfit: 1200 },
  { name: "Apr", Revenue: 4000, Expenses: 2500, NetProfit: 1500 },
  { name: "May", Revenue: 6000, Expenses: 3200, NetProfit: 2800 },
];

const samplePieData = [
  { name: "Category A", value: 400 },
  { name: "Category B", value: 300 },
  { name: "Category C", value: 300 },
  { name: "Category D", value: 200 },
];

const pieColors = [themeColors.primary, "#ff6b6b", "#feca57", "#1dd1a1"];

// ---------- Categories & Functionalities ----------
const categories = [
  { name: "Revenue & Expenses", functionalities: ["Revenue", "Expenses", "Net Profit", "Cash Flow", "Forecast"] },
  { name: "Budget & Investment", functionalities: ["Budget Planning", "Investment Analysis", "Alerts", "Break-even", "Cost Optimization"] },
  { name: "Accounts & Tax", functionalities: ["Accounts Receivable", "Accounts Payable", "Loan/Debt", "Tax Reporting", "Expense Categorization"] },
  { name: "Analysis & KPIs", functionalities: ["Profit Margin", "Trend Analysis", "Scenario Analysis", "KPI Dashboard", "Revenue by Dept/Region"] },
  { name: "Risk & AI Insights", functionalities: ["Vendor/Supplier Analysis", "Risk/Fraud Analysis", "Historical Comparison", "AI Insights", "Forecast vs Actual"] },
  { name: "Market & Competitors", functionalities: ["Market Share", "Competitor Analysis", "SWOT Analysis", "Pricing Trends", "Customer Insights"] },
  { name: "Cash & Liquidity", functionalities: ["Cash Position", "Liquidity Ratio", "Short-term Investments", "Receivables Aging", "Payables Aging"] },
  { name: "Performance & Efficiency", functionalities: ["ROE", "ROA", "Operational KPIs", "Productivity Analysis", "Cost Efficiency"] },
  { name: "Customer & Sales", functionalities: ["Customer Segmentation", "Sales Trends", "Churn Rate", "Customer LTV", "Lead Conversion"] },
  { name: "Forecasting & Planning", functionalities: ["Financial Forecast", "Scenario Planning", "Budget vs Actual", "Revenue Projections", "Expense Forecast"] },
];

// ---------- Finance Dashboard ----------
export default function FinanceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [activeFunc, setActiveFunc] = useState(null);

  const handleBackCategory = () => { setCategory(null); setActiveFunc(null); };
  const handleBackFunctionality = () => setActiveFunc(null);

  // ---------- Render KPI Cards ----------
  const renderKPICards = (funcName) => {
    const metrics = ["Metric 1", "Metric 2", "Metric 3"];
    return (
      <div style={styles.cardGrid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.card}>
            <h4>{funcName} - {m}</h4>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{Math.floor(Math.random() * 10000)}</p>
          </div>
        ))}
      </div>
    );
  };

  // ---------- Render Charts ----------
  const renderCharts = (funcName) => (
    <div style={styles.cardGrid}>
      <div style={styles.card}>
        <h4>{funcName} - Line Chart</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={sampleLineData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke={themeColors.primary} />
            <Line type="monotone" dataKey="Expenses" stroke="#ff6b6b" />
            <Line type="monotone" dataKey="NetProfit" stroke="#1dd1a1" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.card}>
        <h4>{funcName} - Bar Chart</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sampleLineData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Revenue" fill={themeColors.primary} />
            <Bar dataKey="Expenses" fill="#ff6b6b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.card}>
        <h4>{funcName} - Pie Chart</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={samplePieData} dataKey="value" nameKey="name" outerRadius={70}>
              {samplePieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ---------- Render Data Table ----------
  const renderTable = () => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Month</th>
          <th style={styles.th}>Revenue</th>
          <th style={styles.th}>Expenses</th>
          <th style={styles.th}>Net Profit</th>
        </tr>
      </thead>
      <tbody>
        {sampleLineData.map((row, idx) => (
          <tr key={idx}>
            <td style={styles.td}>{row.name}</td>
            <td style={styles.td}>{row.Revenue}</td>
            <td style={styles.td}>{row.Expenses}</td>
            <td style={styles.td}>{row.NetProfit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // ---------- Render Category Functionalities ----------
  const renderCategory = () => (
    <div>
      <button onClick={handleBackCategory} style={styles.categoryButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginTop: 20 }}>{category.name}</h2>
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
    <div>
      <button onClick={handleBackFunctionality} style={styles.categoryButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginTop: 20 }}>{activeFunc}</h2>
      {renderKPICards(activeFunc)}
      {renderCharts(activeFunc)}
      {renderTable()}
    </div>
  );

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
          {category && !activeFunc && renderCategory()}
          {activeFunc && renderFunctionalityDetails()}
        </div>
      </div>
    </div>
  );
}