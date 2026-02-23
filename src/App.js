import React, { useState } from "react";
import FinanceDashboard from "./components/FinanceDashboard";
import HRDashboard from "./components/HRDashboard";
import MarketingDashboard from "./components/MarketingDashboard";

function App() {
  const [module, setModule] = useState("finance");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>AI Business Analyzer</h1>
      <div style={{ margin: "20px 0" }}>
        <button onClick={() => setModule("finance")} style={{ marginRight: "10px" }}>Finance</button>
        <button onClick={() => setModule("hr")} style={{ marginRight: "10px" }}>HR</button>
        <button onClick={() => setModule("marketing")}>Marketing</button>
      </div>

      {module === "finance" && <FinanceDashboard />}
      {module === "hr" && <HRDashboard />}
      {module === "marketing" && <MarketingDashboard />}
    </div>
  );
}

export default App;
