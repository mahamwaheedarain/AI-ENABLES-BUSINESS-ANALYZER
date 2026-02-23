import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { predictSales } from "../ml/marketingModel";
import VoiceButton from "./VoiceButton";
import FileUpload from "./FileUpload";

const MarketingDashboard = () => {
  const [data, setData] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  const handleUpload = (excelData) => {
    setData(excelData);
    const leads = excelData.map(d => d.leads || 0);
    const conversions = excelData.map(d => d.conversions || 0);
    const predicted = predictSales(leads, conversions);
    setSuggestion(predicted < 1000 ? "Low marketing performance" : "Marketing is good");
  };

  const handleVoice = (month) => {
    if (month) {
      const filtered = data.filter(d => d.month.toLowerCase() === month.toLowerCase());
      setData(filtered);
      const leads = filtered.map(d => d.leads || 0);
      const conversions = filtered.map(d => d.conversions || 0);
      const predicted = predictSales(leads, conversions);
      setSuggestion(predicted < 1000 ? `Low marketing in ${month}` : `Marketing is good in ${month}`);
    }
  };

  const totalLeads = data.reduce((a, b) => a + (b.leads || 0), 0);
  const totalConversions = data.reduce((a, b) => a + (b.conversions || 0), 0);

  const chartData = data.map(d => ({
    ...d,
    predictedSales: predictSales([d.leads || 0], [d.conversions || 0])
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h2>Marketing Dashboard</h2>
      <FileUpload onDataReady={handleUpload} />
      <VoiceButton onCommand={handleVoice} />

      <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
        <div style={{ padding: "20px", backgroundColor: "#4caf50", color: "white", flex: 1, textAlign: "center" }}>Total Leads: {totalLeads}</div>
        <div style={{ padding: "20px", backgroundColor: "#2196f3", color: "white", flex: 1, textAlign: "center" }}>Total Conversions: {totalConversions}</div>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="leads" stroke="#4caf50" />
            <Line type="monotone" dataKey="conversions" stroke="#2196f3" />
            <Line type="monotone" dataKey="predictedSales" stroke="#ff9800" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>AI Suggestion: {suggestion}</h3>
    </div>
  );
};

export default MarketingDashboard;
