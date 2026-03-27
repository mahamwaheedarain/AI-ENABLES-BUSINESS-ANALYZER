import React from "react";

function FinanceDashboard() {
  const handleVoiceCommand = () => alert("Finance AI suggestion triggered!");
  return (
    <div>
      <h2>Finance Dashboard</h2>
      <p>KPIs, charts, revenue insights...</p>
      <button onClick={handleVoiceCommand} style={{marginTop: "10px", padding: "8px 16px", borderRadius: "5px", background: "#667eea", color: "white"}}>🎤 Ask AI</button>
    </div>
  );
}

export default FinanceDashboard;