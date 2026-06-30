import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /categories
router.get("/", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

export default router;