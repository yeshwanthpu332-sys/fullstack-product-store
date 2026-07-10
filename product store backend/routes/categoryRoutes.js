import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /categories
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;