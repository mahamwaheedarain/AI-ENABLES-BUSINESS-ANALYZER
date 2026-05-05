const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * ROUTE: POST /api/upload/upload-multiple
 * DESC: Persists multiple financial files into the PostgreSQL 'business_files' table.
 *       This allows the dashboard to retrieve data without re-uploading CSVs.
 */
router.post("/upload-multiple", async (req, res) => {
  const { files } = req.body; 

  // Validation: Ensure a valid array of files is provided
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "No files provided." });
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
    
    res.json({ message: "Financial archives successfully synchronized with PostgreSQL." });
  } catch (err) {
    console.error("❌ DB Upload Error:", err.message);
    res.status(500).json({ error: "Database save failed. Ensure connection to 'business-analyzer' is active." });
  }
});

module.exports = router;