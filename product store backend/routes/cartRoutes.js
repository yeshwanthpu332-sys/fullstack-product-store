import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /cart - Get user's cart
router.get("/", authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        products.id as id,
        cart.quantity,
        products.name,
        products.price,
        products.image,
        products.images,
        products.rating,
        categories.name as category
      FROM cart
      JOIN products ON cart.product_id = products.id
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE cart.user_id = ?
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

// POST /cart - Add item to cart
router.post("/", authMiddleware, (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  try {
    const row = db.prepare(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?"
    ).get(user_id, product_id);

    if (row) {
      db.prepare(
        "UPDATE cart SET quantity = quantity + 1 WHERE id = ?"
      ).run(row.id);
      res.json({ message: "✅ Cart item quantity increased" });
    } else {
      db.prepare(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)"
      ).run(user_id, product_id);
      res.status(201).json({ message: "✅ Item added to cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /cart/increase/:product_id - Increase quantity
router.put("/increase/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    db.prepare(
      "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?"
    ).run(user_id, product_id);
    res.json({ message: "✅ Quantity increased" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /cart/decrease/:product_id - Decrease quantity or remove
router.put("/decrease/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    const row = db.prepare(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?"
    ).get(user_id, product_id);

    if (row && row.quantity <= 1) {
      db.prepare(
        "DELETE FROM cart WHERE user_id = ? AND product_id = ?"
      ).run(user_id, product_id);
      res.json({ message: "✅ Item removed from cart" });
    } else {
      db.prepare(
        "UPDATE cart SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?"
      ).run(user_id, product_id);
      res.json({ message: "✅ Quantity decreased" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cart/:product_id - Remove item from cart
router.delete("/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    db.prepare(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?"
    ).run(user_id, product_id);
    res.json({ message: "✅ Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cart - Clear entire cart
router.delete("/", authMiddleware, (req, res) => {
  const user_id = req.user.id;

  try {
    db.prepare(
      "DELETE FROM cart WHERE user_id = ?"
    ).run(user_id);
    res.json({ message: "✅ Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;