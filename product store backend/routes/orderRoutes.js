import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /orders - Place new order
router.post("/", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { full_name, address, city, pincode, phone } = req.body;

  if (!full_name || !address || !city || !pincode || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Get cart items
  db.all(
    `SELECT cart.product_id, cart.quantity, products.price
     FROM cart
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [user_id],
    (err, cartItems) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!cartItems.length) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total
      const total_amount = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Create order
      db.run(
        `INSERT INTO orders (user_id, total_amount, full_name, address, city, pincode, phone, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'Placed')`,
        [user_id, total_amount, full_name, address, city, pincode, phone],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          const order_id = this.lastID;

          // Insert order items
          const stmt = db.prepare(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES (?, ?, ?, ?)`
          );

          cartItems.forEach((item) => {
            stmt.run([order_id, item.product_id, item.quantity, item.price]);
          });

          stmt.finalize((err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Clear cart after order
            db.run(
              "DELETE FROM cart WHERE user_id = ?",
              [user_id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                  message: "✅ Order placed successfully!",
                  order_id,
                  total_amount,
                });
              }
            );
          });
        }
      );
    }
  );
});

// GET /orders - Get user's order history
router.get("/", authMiddleware, (req, res) => {
  const user_id = req.user.id;

  db.all(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [user_id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!orders.length) {
        return res.json([]);
      }

      // Get order items for each order
      let completed = 0;

      orders.forEach((order, index) => {
        db.all(
          `SELECT order_items.*, products.name, products.image
           FROM order_items
           JOIN products ON order_items.product_id = products.id
           WHERE order_items.order_id = ?`,
          [order.id],
          (err, items) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            orders[index].items = items;
            completed++;

            if (completed === orders.length) {
              res.json(orders);
            }
          }
        );
      });
    }
  );
});

// GET /orders/:id - Get single order details
router.get("/:id", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  db.get(
    `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
    [id, user_id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      db.all(
        `SELECT order_items.*, products.name, products.image
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = ?`,
        [order.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          order.items = items;
          res.json(order);
        }
      );
    }
  );
});

// PUT /orders/:id/cancel - Cancel order
router.put("/:id/cancel", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  db.get(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [id, user_id],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status === "Cancelled") {
        return res.status(400).json({ error: "Order is already cancelled" });
      }

      db.run(
        "UPDATE orders SET status = 'Cancelled' WHERE id = ? AND user_id = ?",
        [id, user_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({ message: "✅ Order cancelled successfully" });
        }
      );
    }
  );
});

export default router;