const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * ROUTE: POST /api/upload/upload-multiple
 * DESC: Persists multi-domain data (Finance, HR, Marketing) into PostgreSQL.
 * Enables the Gemini AI Analyst to retrieve cross-functional context.
 */
router.post("/upload-multiple", async (req, res) => {
  const { files } = req.body; 

  // Validation: Ensure a valid array of files is provided
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "No files provided for synchronization." });
  }

  try {
    /**
     * Map each file to a database query promise.
     * Table: business_files
     * Columns: filename (String), content (Text/CSV Data)
     */
    const insertPromises = files.map((file) => {
      return pool.query(
        "INSERT INTO business_files (filename, content) VALUES ($1, $2)",
        [file.filename, file.content]
      );
    });

    // Execute all insertions in parallel for maximum efficiency
    await Promise.all(insertPromises);
    
    res.json({ message: "Marketing and business archives successfully synchronized with PostgreSQL." });
  } catch (err) {
    console.error("❌ DB Upload Error:", err.message);
    res.status(500).json({ error: "Database save failed. Ensure connection to 'business-analyzer' is active." });
  }
});

module.exports = router;