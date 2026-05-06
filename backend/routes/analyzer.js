const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * GEMINI AI CONFIGURATION
 * Uses the Gemini 1.5 Flash model to process fiscal, HR, and marketing data 
 * retrieved from the PostgreSQL 'business_files' table.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/analyze", async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Fetch data from your PostgreSQL 'business_files' table
    // This allows the AI to access actual user data stored previously
    const dbData = await pool.query("SELECT filename, content FROM business_files");
    
    if (dbData.rows.length === 0) {
      return res.json({ reply: "No business files found in the database. Please upload your data first." });
    }

    // 2. Prepare the context from all stored files
    // Maps the 'content' column to a string context for the AI prompt
    const context = dbData.rows
      .map(row => `FILE NAME: ${row.filename}\nCONTENT:\n${row.content}`)
      .join("\n\n---\n\n");

    // 3. Structured Prompt to prevent "generic" AI behavior
    // Instructs the model to act as a Professional Lead Analyst
    const prompt = `
      You are the Professional Lead Analyst for Academic Attire Co.
      
      CORE KNOWLEDGE BASE (From Uploaded Financial, HR, and Marketing Files):
      ${context}

      TASK:
      Analyze the provided SOURCE MATERIAL above to answer the user's question. 
      You have access to detailed fiscal records, employee performance/attrition data, 
      and marketing trends (including lead scoring and customer churn insights).

      If the answer is found in the files, be specific and provide data-driven insights. 
      If the data is missing, inform the user you don't have that specific information in the current documents.
      
      CRITICAL: Never say "I cannot see files." You have the full text content above.

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