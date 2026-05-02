const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Robust Environment Configuration
// Ensuring the path to .env is absolute based on the current directory
require("dotenv").config({ path: path.join(__dirname, "../.env") }); 

// Initialize the Gemini API with your validated key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** 
 * ✅ STABILITY FIX: Use gemini-2.5-flash.
 * Your terminal test confirmed this is the stable ID for May 2026.
 * This avoids the 404 errors you were seeing with older or preview IDs.
 */
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
});

router.post("/chat", async (req, res) => {
    const { message } = req.body;
    const uploadsDir = path.join(__dirname, "../uploads");

    try {
        // 1. Safety Check for API Key
        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY in .env file");
            return res.status(500).json({ reply: "Server Configuration Error: API Key missing." });
        }

        // 2. Locate Latest Business File
        // Automatically creates the uploads folder if it doesn't exist
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        
        const files = fs.readdirSync(uploadsDir);
        
        if (files.length === 0) {
            return res.json({ reply: "I'm ready! Please upload your business file first so I can analyze it." });
        }

        // Get the most recently uploaded file
        const latestFile = files.sort((a, b) => 
            fs.statSync(path.join(uploadsDir, b)).mtime - fs.statSync(path.join(uploadsDir, a)).mtime
        )[0];

        const fileContent = fs.readFileSync(path.join(uploadsDir, latestFile), "utf8");

        // 3. System Prompt for Professional Analysis
        // This framing ensures the AI acts as a dedicated analyst for your brand
        const prompt = `
            You are a Professional Business Analyst for Academic Attire Co.
            
            CONTEXT FROM UPLOADED DOCUMENT:
            """
            ${fileContent}
            """
            
            USER QUESTION: ${message}
            
            INSTRUCTIONS:
            - Use the document data to answer.
            - If the information is not in the document, politely say it isn't covered in the current report.
            - Keep the tone professional and helpful.
        `;

        // 4. API Call
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send successful response back to React
        res.json({ reply: text });

    } catch (err) {
        // Log the detailed error to your terminal for debugging
        console.error("Critical Analysis Error:", err.message);
        
        // Provide user-friendly feedback to your UI
        let userFeedback = "The AI service is currently unavailable. Please check your connection.";
        
        if (err.message.includes("404")) {
            userFeedback = "Model error: The selected AI model version has changed. Please contact support.";
        } else if (err.message.includes("429")) {
            userFeedback = "Rate limit reached. Please wait a moment before asking another question.";
        }
        
        res.status(500).json({ reply: userFeedback });
    }
});

module.exports = router;