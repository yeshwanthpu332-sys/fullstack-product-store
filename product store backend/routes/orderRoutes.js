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

  try {
    // Get cart items
    const cartItems = db.prepare(
      `SELECT cart.product_id, cart.quantity, products.price
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = ?`
    ).all(user_id);

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total
    const total_amount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order
    const orderResult = db.prepare(
      `INSERT INTO orders (user_id, total_amount, full_name, address, city, pincode, phone, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'Placed')`
    ).run(user_id, total_amount, full_name, address, city, pincode, phone);

    const order_id = orderResult.lastInsertRowid;

    // Insert order items
    const stmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`
    );

    cartItems.forEach((item) => {
      stmt.run(order_id, item.product_id, item.quantity, item.price);
    });

    // Clear cart after order
    db.prepare(
      "DELETE FROM cart WHERE user_id = ?"
    ).run(user_id);

    res.status(201).json({
      message: "✅ Order placed successfully!",
      order_id,
      total_amount,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders - Get user's order history
router.get("/", authMiddleware, (req, res) => {
  const user_id = req.user.id;

  try {
    const orders = db.prepare(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`
    ).all(user_id);

    if (!orders.length) {
      return res.json([]);
    }

    // Get order items for each order
    const ordersWithItems = orders.map((order) => {
      const items = db.prepare(
        `SELECT order_items.*, products.name, products.image
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = ?`
      ).all(order.id);

      return { ...order, items };
    });

    res.json(ordersWithItems);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders/:id - Get single order details
router.get("/:id", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const order = db.prepare(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`
    ).get(id, user_id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = db.prepare(
      `SELECT order_items.*, products.name, products.image
       FROM order_items
       JOIN products ON order_items.product_id = products.id
       WHERE order_items.order_id = ?`
    ).all(order.id);

    order.items = items;
    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /orders/:id/cancel - Cancel order
router.put("/:id/cancel", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const order = db.prepare(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?"
    ).get(id, user_id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    db.prepare(
      "UPDATE orders SET status = 'Cancelled' WHERE id = ? AND user_id = ?"
    ).run(id, user_id);

    res.json({ message: "✅ Order cancelled successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;