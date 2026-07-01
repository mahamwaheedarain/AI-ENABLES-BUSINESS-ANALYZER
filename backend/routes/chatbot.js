const express = require("express");
const router = express.Router();
const pool = require("../db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/chat", async (req, res) => {
  const { message, email } = req.body;
  const userEmail = email || "guest";

  try {
    // Pull context ONLY for this specific user's uploaded files
    const dbData = await pool.query(
      "SELECT content FROM business_files WHERE user_email = $1",
      [userEmail]
    );
    const context = dbData.rows.map(row => row.content).join("\n\n");

    const prompt = `
     
      Business Context: ${context || "No documents uploaded yet."}
      User Question: ${message}
    `;

    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();

    // Save to PostgreSQL chat_history, tagged with the user
    await pool.query(
      "INSERT INTO chat_history (user_message, ai_response, user_email) VALUES ($1, $2, $3)",
      [message, aiReply, userEmail]
    );

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Chatbot Error:", err.message);
    res.status(500).json({ reply: "The chatbot encountered an error." });
  }
});

module.exports = router;