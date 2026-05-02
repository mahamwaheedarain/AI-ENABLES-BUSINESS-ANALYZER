const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Pull context so the general chatbot also knows about the company
    const dbData = await pool.query("SELECT content FROM business_files");
    const context = dbData.rows.map(row => row.content).join("\n\n");

    const prompt = `
      Analyst Role: Academic Attire Co.
      Business Context: ${context || "No documents uploaded yet."}
      User Question: ${message}
    `;

    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();

    // Save to PostgreSQL chat_history
    await pool.query(
      "INSERT INTO chat_history (user_message, ai_response) VALUES ($1, $2)",
      [message, aiReply]
    );

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Chatbot Error:", err.message);
    res.status(500).json({ reply: "The chatbot encountered an error." });
  }
});

module.exports = router;