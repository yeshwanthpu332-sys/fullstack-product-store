import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /cart - Get user's cart
router.get("/", authMiddleware, (req, res) => {
  db.all(`
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
  `, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formattedRows = rows.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    }));
    res.json(formattedRows);
  });
});

// POST /cart - Add item to cart
router.post("/", authMiddleware, (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  // Check if item already exists in cart
  db.get(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        db.run(
          "UPDATE cart SET quantity = quantity + 1 WHERE id = ?",
          [row.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "✅ Cart item quantity increased" });
          }
        );
      } else {
        db.run(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)",
          [user_id, product_id],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "✅ Item added to cart" });
          }
        );
      }
    }
  );
});

// PUT /cart/increase/:product_id - Increase quantity
router.put("/increase/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  db.run(
    "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Quantity increased" });
    }
  );
});

// PUT /cart/decrease/:product_id - Decrease quantity or remove
router.put("/decrease/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  db.get(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row && row.quantity <= 1) {
        db.run(
          "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
          [user_id, product_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "✅ Item removed from cart" });
          }
        );
      } else {
        db.run(
          "UPDATE cart SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?",
          [user_id, product_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "✅ Quantity decreased" });
          }
        );
      }
    }
  );
});

// DELETE /cart/:product_id - Remove item from cart
router.delete("/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  db.run(
    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Item removed from cart" });
    }
  );
});

// DELETE /cart - Clear entire cart
router.delete("/", authMiddleware, (req, res) => {
  const user_id = req.user.id;

  db.run(
    "DELETE FROM cart WHERE user_id = ?",
    [user_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Cart cleared" });
    }
  );
});

export default router;