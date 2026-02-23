import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { predictProfit } from "../ml/financeModel";
import VoiceButton from "./VoiceButton";
import FileUpload from "./FileUpload";

const FinanceDashboard = () => {
  const [data, setData] = useState([]);
  const [suggestion, setSuggestion] = useState("");

  const handleUpload = (excelData) => {
    setData(excelData);
    const revenue = excelData.map(d => d.revenue);
    const expense = excelData.map(d => d.expenses);
    const predicted = predictProfit(revenue, expense);
    setSuggestion(predicted < 5000 ? "Warning: low predicted profit!" : "Business is healthy!");
  };

  const handleVoice = (month) => {
    if (month) {
      const filtered = data.filter(d => d.month.toLowerCase() === month.toLowerCase());
      setData(filtered);
      const revenue = filtered.map(d => d.revenue);
      const expense = filtered.map(d => d.expenses);
      const predicted = predictProfit(revenue, expense);
      setSuggestion(predicted < 5000 ? `Low profit in ${month}` : `Profit looks good in ${month}`);
    }
  };

  const chartData = data.map(d => ({
    ...d,
    predictedProfit: predictProfit([d.revenue], [d.expenses])
  }));

  const totalRevenue = data.reduce((a, b) => a + b.revenue, 0);
  const totalExpenses = data.reduce((a, b) => a + b.expenses, 0);
  const totalProfit = data.reduce((a, b) => a + b.profit, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Finance Dashboard</h2>
      <FileUpload onDataReady={handleUpload} />
      <VoiceButton onCommand={handleVoice} />

      <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
        <div style={{ padding: "20px", backgroundColor: "#4caf50", color: "white", flex: 1, textAlign: "center" }}>Revenue: ${totalRevenue}</div>
        <div style={{ padding: "20px", backgroundColor: "#f44336", color: "white", flex: 1, textAlign: "center" }}>Expenses: ${totalExpenses}</div>
        <div style={{ padding: "20px", backgroundColor: "#2196f3", color: "white", flex: 1, textAlign: "center" }}>Profit: ${totalProfit}</div>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4caf50" />
            <Line type="monotone" dataKey="expenses" stroke="#f44336" />
            <Line type="monotone" dataKey="profit" stroke="#2196f3" />
            <Line type="monotone" dataKey="predictedProfit" stroke="#ff9800" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>AI Suggestion: {suggestion}</h3>
    </div>
  );
};

export default FinanceDashboard;
