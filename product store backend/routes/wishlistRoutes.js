import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /wishlist - Get user's wishlist
router.get("/", authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        products.id as id,
        products.name,
        products.price,
        products.image,
        products.images,
        products.rating,
        categories.name as category
      FROM wishlist
      JOIN products ON wishlist.product_id = products.id
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE wishlist.user_id = ?
    `).all(req.user.id);

    const formattedRows = rows.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    }));

    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /wishlist - Toggle wishlist item
router.post("/", authMiddleware, (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  try {
    const row = db.prepare(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?"
    ).get(user_id, product_id);

    if (row) {
      // Already exists → Remove it
      db.prepare(
        "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?"
      ).run(user_id, product_id);
      res.json({ message: "✅ Removed from wishlist", action: "removed" });
    } else {
      // Doesn't exist → Add it
      db.prepare(
        "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)"
      ).run(user_id, product_id);
      res.status(201).json({ message: "✅ Added to wishlist", action: "added" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /wishlist/:product_id - Remove from wishlist
router.delete("/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    db.prepare(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?"
    ).run(user_id, product_id);
    res.json({ message: "✅ Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;