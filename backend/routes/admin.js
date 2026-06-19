/**
 * routes/admin.js
 * InsightIQ — Admin Panel API Routes
 *
 * Mount in server.js / index.js:
 *   const adminRouter = require("./routes/admin");
 *   app.use("/api/admin", adminRouter);
 *
 * Tables expected in your 'business_analyzer' PostgreSQL database:
 *
 *   business_files  (id SERIAL PK, filename TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT now())
 *   chat_history    (id SERIAL PK, user_message TEXT, ai_response TEXT, created_at TIMESTAMPTZ DEFAULT now())
 *
 * Run once to ensure the created_at column exists if it was created without it:
 *   ALTER TABLE business_files  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
 *   ALTER TABLE chat_history    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
 */

const express = require("express");
const router  = express.Router();
const pool    = require("../db"); // your existing pg Pool

// ─────────────────────────────────────────────
// BUSINESS FILES
// ─────────────────────────────────────────────

// GET all records
router.get("/business-files", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, filename, content, created_at FROM business_files ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin GET business-files:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST — add a new record
router.post("/business-files", async (req, res) => {
  const { filename, content } = req.body;
  if (!filename) return res.status(400).json({ error: "filename is required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO business_files (filename, content) VALUES ($1, $2) RETURNING *",
      [filename, content || ""]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Admin POST business-files:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT — update by id
router.put("/business-files/:id", async (req, res) => {
  const { id }              = req.params;
  const { filename, content } = req.body;
  if (!filename) return res.status(400).json({ error: "filename is required" });
  try {
    const { rows } = await pool.query(
      "UPDATE business_files SET filename = $1, content = $2 WHERE id = $3 RETURNING *",
      [filename, content || "", id]
    );
    if (!rows.length) return res.status(404).json({ error: "Record not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Admin PUT business-files:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove by id
router.delete("/business-files/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM business_files WHERE id = $1", [id]
    );
    if (!rowCount) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE business-files:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// CHAT HISTORY
// ─────────────────────────────────────────────

// GET all records
router.get("/chat-history", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, user_message, ai_response, created_at FROM chat_history ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin GET chat-history:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove by id (AI responses are read-only in the panel; only deletion is allowed)
router.delete("/chat-history/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM chat_history WHERE id = $1", [id]
    );
    if (!rowCount) return res.status(404).json({ error: "Record not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Admin DELETE chat-history:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;