import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /wishlist - Get user's wishlist
router.get("/", authMiddleware, (req, res) => {
  db.all(`
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

// POST /wishlist - Toggle wishlist item
router.post("/", authMiddleware, (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user.id;

  // Check if item already exists
  db.get(
    "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        // Already exists → Remove it
        db.run(
          "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
          [user_id, product_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "✅ Removed from wishlist", action: "removed" });
          }
        );
      } else {
        // Doesn't exist → Add it
        db.run(
          "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
          [user_id, product_id],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "✅ Added to wishlist", action: "added" });
          }
        );
      }
    }
  );
});

// DELETE /wishlist/:product_id - Remove from wishlist
router.delete("/:product_id", authMiddleware, (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;

  db.run(
    "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
    [user_id, product_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Removed from wishlist" });
    }
  );
});

export default router;