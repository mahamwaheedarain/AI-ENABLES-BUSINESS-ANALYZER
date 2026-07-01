const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * GEMINI AI CONFIGURATION
 * Uses the Gemini 1.5 Flash model to process fiscal, HR, Marketing, Sales, and Operations data 
 * retrieved from the PostgreSQL 'business_files' table, scoped per-user.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using 1.5-flash for high-speed multi-modal business analysis
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/analyze", async (req, res) => {
  const { message, email } = req.body;
  const userEmail = email || "guest";

  try {
    // 1. Fetch data from your PostgreSQL 'business_files' table — only this user's rows
    const dbData = await pool.query(
      "SELECT filename, content FROM business_files WHERE user_email = $1",
      [userEmail]
    );

    if (dbData.rows.length === 0) {
      return res.json({ reply: "No business intelligence files found in the database. Please upload your Finance, HR, Marketing, or Sales data first." });
    }

    // 2. Prepare the context from all stored files belonging to this user
    const context = dbData.rows
      .map(row => `FILE NAME: ${row.filename}\nCONTENT:\n${row.content}`)
      .join("\n\n---\n\n");

    // 3. Structured Prompt to prevent "generic" AI behavior
    const prompt = `
      You are the Professional Lead Analyst for Academic Attire Co.
      
      CORE KNOWLEDGE BASE (From Uploaded Financial, HR, Marketing, Sales, and Operations Files):
      ${context}

      TASK:
      Analyze the provided SOURCE MATERIAL above to answer the user's question. 
      You have access to:
      1. FISCAL RECORDS: Revenue, expenses, and profit margins.
      2. HR INTELLIGENCE: Employee performance (92.4% accuracy), attrition risk, and absence trends.
      3. MARKETING INSIGHTS: Lead scoring (91.8% accuracy), customer churn, and market trends.
      4. SALES INTELLIGENCE: Amazon revenue forecasting (91.2% accuracy), Marketing ROI, and Customer Churn.
      5. OPERATIONS: Supply chain risk (97.5% accuracy) and logistics tracking.

      GUIDELINES:
      - Be specific and provide data-driven insights derived from the text above.
      - If the user asks about risk or performance, refer to the high-accuracy predictions found in the records.
      - If data is missing for a specific query, inform the user clearly based on the available documents.
      - Maintain a professional, executive tone.

      CRITICAL: Never say "I cannot see files." You have the full text content provided in the CORE KNOWLEDGE BASE.

      USER QUESTION:
      ${message}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // 4. Save the generated response to 'chat_history' table, tagged with the user
    await pool.query(
      "INSERT INTO chat_history (user_message, ai_response, user_email) VALUES ($1, $2, $3)",
      [message, aiResponse, userEmail]
    );

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error("❌ Analyzer/SQL Error:", err.message);
    res.status(500).json({ reply: "Error analyzing business data and saving history." });
  }
});

module.exports = router;