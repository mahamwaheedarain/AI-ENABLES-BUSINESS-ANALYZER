const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/**
 * ARCHITECTURAL NOTE: 
 * Payload limits are set to 50mb to accommodate large CSV data for 
 * Finance, HR, and Marketing trend analysis stored in PostgreSQL.
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
 * /api/upload: Handles storing cross-domain file content into 'business_files'.
 * /api/analyzer: Pulls from DB for AI-driven insights (Finance, HR, Marketing).
 * /api/chatbot: Manages the analytical conversation history in 'chat_history'.
 */
const adminRouter = require("./routes/admin");
app.use("/api/admin", adminRouter);
app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analyzer", analyzerRoutes);

app.get("/", (req, res) => res.send("Academic Attire Co. Business Analyzer API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));