import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /cart - Get user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
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
      WHERE cart.user_id = $1
    `, [req.user.id]);

    const formattedRows = result.rows.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    }));

    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /cart - Add item to cart
router.post("/", authMiddleware, async (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    const row = result.rows[0];

    if (row) {
      await db.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE id = $1",
        [row.id]
      );
      res.json({ message: "✅ Cart item quantity increased" });
    } else {
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, 1)",
        [user_id, product_id]
      );
      res.status(201).json({ message: "✅ Item added to cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /cart/increase/:product_id - Increase quantity
router.put("/increase/:product_id", authMiddleware, async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    await db.query(
      "UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );
    res.json({ message: "✅ Quantity increased" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /cart/decrease/:product_id - Decrease quantity or remove
router.put("/decrease/:product_id", authMiddleware, async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );

    const row = result.rows[0];

    if (row && row.quantity <= 1) {
      await db.query(
        "DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
        [user_id, product_id]
      );
      res.json({ message: "✅ Item removed from cart" });
    } else {
      await db.query(
        "UPDATE cart SET quantity = quantity - 1 WHERE user_id = $1 AND product_id = $2",
        [user_id, product_id]
      );
      res.json({ message: "✅ Quantity decreased" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cart/:product_id - Remove item from cart
router.delete("/:product_id", authMiddleware, async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  try {
    await db.query(
      "DELETE FROM cart WHERE user_id = $1 AND product_id = $2",
      [user_id, product_id]
    );
    res.json({ message: "✅ Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cart - Clear entire cart
router.delete("/", authMiddleware, async (req, res) => {
  const user_id = req.user.id;

  try {
    await db.query(
      "DELETE FROM cart WHERE user_id = $1",
      [user_id]
    );
    res.json({ message: "✅ Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;