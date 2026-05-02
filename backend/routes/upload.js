const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/upload-multiple", async (req, res) => {
  const { files } = req.body; 

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "No files provided." });
  }

  try {
    const insertPromises = files.map((file) => {
      return pool.query(
        "INSERT INTO business_files (filename, content) VALUES ($1, $2)",
        [file.filename, file.content]
      );
    });

    await Promise.all(insertPromises);
    res.json({ message: "Files successfully stored in PostgreSQL." });
  } catch (err) {
    console.error("❌ DB Upload Error:", err.message);
    res.status(500).json({ error: "Database save failed." });
  }
});

module.exports = router;