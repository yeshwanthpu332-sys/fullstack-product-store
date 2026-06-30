import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /products
router.get("/", (req, res) => {
  db.all(`
    SELECT products.*, categories.name as category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedRows = rows.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));
    res.json(formattedRows);
  });
});

// GET /products/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get(`
    SELECT products.*, categories.name as category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
  `, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Product not found" });
    }
    row.images = row.images ? JSON.parse(row.images) : [];
    res.json(row);
  });
});

export default router;