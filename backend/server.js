const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Essential: Increased limits for business data processing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Import Routes
const uploadRoutes = require("./routes/upload");
const chatbotRoutes = require("./routes/chatbot");
const analyzerRoutes = require("./routes/analyzer");

// Endpoints
app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analyzer", analyzerRoutes);

app.get("/", (req, res) => res.send("Business Analyzer API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));