const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/**
 * ARCHITECTURAL NOTE: 
 * The limit is set to 50mb to ensure large financial CSVs can be stored 
 * in your PostgreSQL 'business_files' table without payload errors.
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Import Routes
const uploadRoutes = require("./routes/upload");
const chatbotRoutes = require("./routes/chatbot");
const analyzerRoutes = require("./routes/analyzer");

// Endpoints
/**
 * /api/upload: Handles storing file names and content into 'business_files'.
 * /api/analyzer: Pulls from DB to generate AI-driven fiscal insights.
 * /api/chatbot: Manages the conversational history in 'chat_history'.
 */
app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analyzer", analyzerRoutes);

app.get("/", (req, res) => res.send("Business Analyzer API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));