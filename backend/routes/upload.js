const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * ROUTE: POST /api/upload/upload-multiple
 * DESC: Persists multi-domain data (Finance, HR, Marketing) into PostgreSQL,
 *       scoped to the uploading user (userEmail) so the chatbot only ever
 *       sees that specific user's documents.
 * Enables the Gemini AI Analyst to retrieve cross-functional context per-user.
 */
router.post("/upload-multiple", async (req, res) => {
  const { files, userEmail } = req.body;

  // Validation: Ensure a valid array of files is provided
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "No files provided for synchronization." });
  }

  // Validation: Ensure we know who these files belong to
  const ownerEmail = userEmail || "guest";

  try {
    /**
     * Map each file to a database query promise.
     * Table: business_files
     * Columns: filename (String), content (Text/CSV Data), user_email (String)
     */
    const insertPromises = files.map((file) => {
      return pool.query(
        "INSERT INTO business_files (filename, content, user_email) VALUES ($1, $2, $3)",
        [file.filename, file.content, ownerEmail]
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

/**
 * ROUTE: GET /api/upload/files?email=user@example.com
 * DESC: Lists all uploaded files belonging to a specific user, so the
 *       frontend can render a manageable file list (with delete buttons).
 *       Does NOT return full content (to keep payload light) — only
 *       metadata needed to display + target a delete.
 */
router.get("/files", async (req, res) => {
  const userEmail = req.query.email || "guest";

  try {
    const result = await pool.query(
      "SELECT id, filename, uploaded_at FROM business_files WHERE user_email = $1 ORDER BY uploaded_at DESC",
      [userEmail]
    );
    res.json({ files: result.rows });
  } catch (err) {
    console.error("❌ Fetch Files Error:", err.message);
    res.status(500).json({ error: "Failed to fetch uploaded files." });
  }
});

/**
 * ROUTE: DELETE /api/upload/files/:id?email=user@example.com
 * DESC: Deletes a single uploaded file by its DB id, scoped to the
 *       requesting user's email so one user can never delete another
 *       user's file even if they guess/forge an id.
 */
router.delete("/files/:id", async (req, res) => {
  const { id } = req.params;
  const userEmail = req.query.email || req.body.email || "guest";

  try {
    const result = await pool.query(
      "DELETE FROM business_files WHERE id = $1 AND user_email = $2 RETURNING id",
      [id, userEmail]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "File not found or does not belong to this user." });
    }

    res.json({ message: "File deleted successfully.", id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Delete File Error:", err.message);
    res.status(500).json({ error: "Failed to delete file." });
  }
});

module.exports = router;