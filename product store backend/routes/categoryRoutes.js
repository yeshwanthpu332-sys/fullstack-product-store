import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /categories
router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM categories").all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;