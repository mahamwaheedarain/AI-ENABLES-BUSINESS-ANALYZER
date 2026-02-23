import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { predictAttrition } from "../ml/hrModel";
import VoiceButton from "./VoiceButton";
import FileUpload from "./FileUpload";

const HRDashboard = () => {
  const [data, setData] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  const handleUpload = (excelData) => {
    setData(excelData);
    const attr = predictAttrition(excelData);
    setSuggestion(attr > 10 ? "High attrition risk!" : "HR is stable");
  };

  const handleVoice = (month) => {
    if (month) {
      const filtered = data.filter(d => d.month.toLowerCase() === month.toLowerCase());
      setData(filtered);
      const attr = predictAttrition(filtered);
      setSuggestion(attr > 10 ? `High attrition in ${month}` : `HR stable in ${month}`);
    }
  };

  const totalEmployees = data.reduce((a, b) => a + (b.employees || 0), 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>HR Dashboard</h2>
      <FileUpload onDataReady={handleUpload} />
      <VoiceButton onCommand={handleVoice} />

      <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
        <div style={{ padding: "20px", backgroundColor: "#4caf50", color: "white", flex: 1, textAlign: "center" }}>Total Employees: {totalEmployees}</div>
        <div style={{ padding: "20px", backgroundColor: "#f44336", color: "white", flex: 1, textAlign: "center" }}>Attrition Rate: {predictAttrition(data)}%</div>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="employees" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>AI Suggestion: {suggestion}</h3>
    </div>
  );
};

export default HRDashboard;
