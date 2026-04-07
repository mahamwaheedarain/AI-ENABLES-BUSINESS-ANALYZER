// src/components/HRDashboard.js
import React, { useState } from "react";

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

// ---------- HR Categories ----------
const categories = [
  { name: "Employee Management", functionalities: ["Employee Overview", "Attendance Tracking", "Attrition Analysis", "Payroll Management", "Leave Management"] },
  { name: "Performance & Goals", functionalities: ["Performance Reviews", "Goal Tracking", "AI Hiring Suggestions", "Resume Screening", "Interview Scheduler"] },
  { name: "Insights & Analytics", functionalities: ["Team Insights", "Diversity Analytics", "Training Programs", "Rewards System", "Feedback Collection"] },
  { name: "Monitoring & AI", functionalities: ["Remote Work Monitor", "Compliance Check", "Salary Benchmarking", "Workforce Forecasting", "HR AI Assistant"] },
];

// ---------- Detailed HR Data ----------
const HRData = {
  "Employee Overview": {
    metrics: [
      { name: "Total Employees", value: 128 },
      { name: "Active Employees", value: 123 },
      { name: "New Hires (Month)", value: 5 }
    ],
    insight: "Overview of all employees, including roles, departments, and current status. AI can detect anomalies or gaps in employee data."
  },
  "Attendance Tracking": {
    metrics: [
      { name: "Average Attendance", value: "95%" },
      { name: "Late Arrivals", value: 12 },
      { name: "Absent Today", value: 4 }
    ],
    insight: "Track employee attendance and patterns. AI may suggest policies for improving punctuality."
  },
  "Attrition Analysis": {
    metrics: [
      { name: "Attrition Rate", value: "4.6%" },
      { name: "Resigned Employees", value: 6 },
      { name: "Retention Rate", value: "95%" }
    ],
    insight: "Analyze employee turnover trends. AI can predict potential attrition risks."
  },
  "Payroll Management": {
    metrics: [
      { name: "Salary Processed", value: "$120,000" },
      { name: "Pending Approvals", value: 2 },
      { name: "Overtime Paid", value: "$3,400" }
    ],
    insight: "Manage salaries, deductions, bonuses. AI can suggest optimization for payroll and tax compliance."
  },
  "Leave Management": {
    metrics: [
      { name: "Leaves Pending", value: 14 },
      { name: "Approved Today", value: 3 },
      { name: "Leave Balance Avg", value: 12 }
    ],
    insight: "Track leave applications and approvals. AI can highlight trends and overload risks."
  },
  "Performance Reviews": {
    metrics: [
      { name: "Completed Reviews", value: 75 },
      { name: "Pending Reviews", value: 10 },
      { name: "Average Score", value: "87%" }
    ],
    insight: "Monitor employee performance. AI can suggest areas for improvement or training."
  },
  "Goal Tracking": {
    metrics: [
      { name: "Goals Set", value: 50 },
      { name: "Goals Achieved", value: 42 },
      { name: "Completion Rate", value: "84%" }
    ],
    insight: "Track employee and team goals. AI can flag underperforming areas and suggest support."
  },
  "AI Hiring Suggestions": {
    metrics: [
      { name: "Candidate Matches", value: 12 },
      { name: "Shortlisted", value: 5 },
      { name: "Interview Scheduled", value: 3 }
    ],
    insight: "AI analyzes resumes and recommends top candidates based on skills, experience, and cultural fit."
  },
  "Resume Screening": {
    metrics: [
      { name: "Resumes Reviewed", value: 250 },
      { name: "Accepted", value: 23 },
      { name: "Rejected", value: 227 }
    ],
    insight: "Automated resume scanning for matching job requirements. AI can pre-screen resumes efficiently."
  },
  "Interview Scheduler": {
    metrics: [
      { name: "Scheduled Interviews", value: 12 },
      { name: "Pending Interviews", value: 3 },
      { name: "Feedback Completed", value: 9 }
    ],
    insight: "Manage interview slots and feedback. AI can optimize schedules based on availability."
  },
  "Team Insights": {
    metrics: [
      { name: "Teams Active", value: 8 },
      { name: "Projects Assigned", value: 23 },
      { name: "Avg Team Size", value: 5 }
    ],
    insight: "View team performance, workload distribution, and collaboration patterns."
  },
  "Diversity Analytics": {
    metrics: [
      { name: "Gender Ratio", value: "52% F / 48% M" },
      { name: "Minority Employees", value: 18 },
      { name: "Inclusion Score", value: "85%" }
    ],
    insight: "Monitor diversity metrics. AI can highlight gaps and suggest initiatives."
  },
  "Training Programs": {
    metrics: [
      { name: "Programs Active", value: 6 },
      { name: "Employees Enrolled", value: 42 },
      { name: "Completion Rate", value: "78%" }
    ],
    insight: "Track training progress. AI can recommend courses for skill enhancement."
  },
  "Rewards System": {
    metrics: [
      { name: "Rewards Granted", value: 24 },
      { name: "Pending Recognition", value: 3 },
      { name: "Avg Points", value: 120 }
    ],
    insight: "Track employee rewards and recognition. AI can suggest high-performing employees for rewards."
  },
  "Feedback Collection": {
    metrics: [
      { name: "Feedback Submitted", value: 67 },
      { name: "Pending Review", value: 5 },
      { name: "Avg Satisfaction", value: "88%" }
    ],
    insight: "Collect and analyze employee feedback. AI can summarize sentiment and key concerns."
  },
  "Remote Work Monitor": {
    metrics: [
      { name: "Employees Online", value: 102 },
      { name: "Tasks Completed", value: 65 },
      { name: "Avg Response Time", value: "3h" }
    ],
    insight: "Monitor remote workforce. AI can detect delays or potential burnout risks."
  },
  "Compliance Check": {
    metrics: [
      { name: "Policies Compliant", value: 95 },
      { name: "Pending Reviews", value: 3 },
      { name: "Incidents", value: 0 }
    ],
    insight: "Ensure HR compliance. AI can alert about non-compliance risks."
  },
  "Salary Benchmarking": {
    metrics: [
      { name: "Avg Salary", value: "$62,000" },
      { name: "Above Market", value: 12 },
      { name: "Below Market", value: 5 }
    ],
    insight: "Compare salaries with market standards. AI can recommend adjustments."
  },
  "Workforce Forecasting": {
    metrics: [
      { name: "Projected Hires", value: 10 },
      { name: "Projected Attrition", value: 4 },
      { name: "Future Staffing Needs", value: 120 }
    ],
    insight: "Forecast HR needs based on growth and attrition. AI can optimize recruitment planning."
  },
  "HR AI Assistant": {
    metrics: [
      { name: "Queries Resolved", value: 45 },
      { name: "Pending Requests", value: 3 },
      { name: "Avg Resolution Time", value: "2h" }
    ],
    insight: "AI assistant helps HR with automated responses, recommendations, and workflow suggestions."
  },
};

// ---------- HR Dashboard Component ----------
export default function HRDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState(null);
  const [activeFunc, setActiveFunc] = useState(null);

  const handleBackCategory = () => { setCategory(null); setActiveFunc(null); };
  const handleBackFunctionality = () => setActiveFunc(null);

  // Render KPI Cards
  const renderKPICards = (funcName) => {
    const data = HRData[funcName]?.metrics || [];
    return (
      <div style={styles.cardGrid}>
        {data.map((m, idx) => (
          <div key={idx} style={styles.card}>
            <h4>{m.name}</h4>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{m.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render Insight
  const renderInsight = (funcName) => {
    const insight = HRData[funcName]?.insight || "No insights available.";
    return (
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h4>Insight</h4>
          <p>{insight}</p>
        </div>
      </div>
    );
  };

  // Render Functionality Details
  const renderFunctionalityDetails = () => (
    <div>
      <button onClick={handleBackFunctionality} style={styles.backButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{activeFunc}</h2>
      {renderInsight(activeFunc)}
      {renderKPICards(activeFunc)}
    </div>
  );

  // Render Category Functionalities
  const renderCategory = () => (
    <div>
      <button onClick={handleBackCategory} style={styles.backButton}>⬅ Back</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{category.name}</h2>
      <div style={styles.cardGrid}>
        {category.functionalities.map((func, idx) => (
          <div key={idx} style={styles.card} onClick={() => setActiveFunc(func)}>
            {func}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={styles.sidebar}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>HR Analyzer</h2>
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