const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/analyze", async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Fetch data from your PostgreSQL 'business_files' table
    const dbData = await pool.query("SELECT filename, content FROM business_files");
    
    if (dbData.rows.length === 0) {
      return res.json({ reply: "No business files found in the database. Please upload your data first." });
    }

    // 2. Prepare the context from all stored files
    const context = dbData.rows
      .map(row => `FILE NAME: ${row.filename}\nCONTENT:\n${row.content}`)
      .join("\n\n---\n\n");

    // 3. Structured Prompt to prevent "generic" AI behavior
    const prompt = `
      You are the Professional Lead Analyst for Academic Attire Co.
      
      CORE KNOWLEDGE BASE (From Uploaded Files):
      ${context}

      TASK:
      Analyze the provided SOURCE MATERIAL above to answer the user's question. 
      If the answer is found in the files, be specific. 
      If the data is missing, inform the user you don't have that specific information in the current documents.
      
      CRITICAL: Never say "I cannot see files." You have the full text content above.

      USER QUESTION:
      ${message}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // 4. Save the generated response to 'chat_history' table
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