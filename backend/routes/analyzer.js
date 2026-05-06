const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * GEMINI AI CONFIGURATION
 * Uses the Gemini 1.5 Flash model to process fiscal, HR, Marketing, and Operations data 
 * retrieved from the PostgreSQL 'business_files' table.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using 1.5-flash for high-speed multi-modal business analysis
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/analyze", async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Fetch data from your PostgreSQL 'business_files' table
    // This allows the AI to access actual user data stored previously across all modules
    const dbData = await pool.query("SELECT filename, content FROM business_files");
    
    if (dbData.rows.length === 0) {
      return res.json({ reply: "No business intelligence files found in the database. Please upload your Finance, HR, or Marketing data first." });
    }

    // 2. Prepare the context from all stored files
    // Maps the 'content' column to a string context for the AI prompt
    const context = dbData.rows
      .map(row => `FILE NAME: ${row.filename}\nCONTENT:\n${row.content}`)
      .join("\n\n---\n\n");

    // 3. Structured Prompt to prevent "generic" AI behavior
    // Instructs the model to act as a Professional Lead Analyst with specific domain expertise
    const prompt = `
      You are the Professional Lead Analyst for Academic Attire Co.
      
      CORE KNOWLEDGE BASE (From Uploaded Financial, HR, Marketing, and Operations Files):
      ${context}

      TASK:
      Analyze the provided SOURCE MATERIAL above to answer the user's question. 
      You have access to:
      1. FISCAL RECORDS: Revenue, expenses, and profit margins.
      2. HR INTELLIGENCE: Employee performance (92.1% accuracy), attrition risk, and absence trends.
      3. MARKETING INSIGHTS: Lead scoring (91.8% accuracy), customer churn, and market trends.
      4. OPERATIONS: Supply chain risk (97.5% accuracy) and logistics tracking.

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

    // 4. Save the generated response to 'chat_history' table
    // Ensures persistence of insights for your unified business dashboard
    await pool.query(
      "INSERT INTO chat_history (user_message, ai_response) VALUES ($1, $2)",
      [message, aiResponse]
    );

    res.json({ reply: aiResponse });

  } catch (err) {
    console.error("❌ Analyzer/SQL Error:", err.message);
    res.status(500).json({ reply: "Error analyzing business data and saving history." });
  }
});

module.exports = router;