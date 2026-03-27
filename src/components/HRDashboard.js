import React from "react";

function HRDashboard() {
  const handleVoiceCommand = () => alert("HR AI suggestion triggered!");
  return (
    <div>
      <h2>HR Dashboard</h2>
      <p>Employee stats, attrition rates...</p>
      <button onClick={handleVoiceCommand} style={{marginTop: "10px", padding: "8px 16px", borderRadius: "5px", background: "#667eea", color: "white"}}>🎤 Ask AI</button>
    </div>
  );
}

export default HRDashboard;