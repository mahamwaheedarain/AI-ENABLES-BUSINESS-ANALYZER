import React from "react";

function MarketingDashboard() {
  const handleVoiceCommand = () => alert("Marketing AI suggestion triggered!");
  return (
    <div>
      <h2>Marketing Dashboard</h2>
      <p>Campaigns, leads, ROI insights...</p>
      <button onClick={handleVoiceCommand} style={{marginTop: "10px", padding: "8px 16px", borderRadius: "5px", background: "#667eea", color: "white"}}>🎤 Ask AI</button>
    </div>
  );
}

export default MarketingDashboard;