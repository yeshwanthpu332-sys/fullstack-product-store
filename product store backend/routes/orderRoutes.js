import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /orders - Place new order
router.post("/", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { full_name, address, city, pincode, phone } = req.body;

  if (!full_name || !address || !city || !pincode || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Get cart items
    const cartResult = await db.query(
      `SELECT cart.product_id, cart.quantity, products.price
       FROM cart
       JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = $1`,
      [user_id]
    );

    const cartItems = cartResult.rows;

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total
    const total_amount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create order
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total_amount, full_name, address, city, pincode, phone, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'COD', 'Placed') RETURNING id`,
      [user_id, total_amount, full_name, address, city, pincode, phone]
    );

    const order_id = orderResult.rows[0].id;

    // Insert order items
    for (const item of cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart after order
    await db.query(
      "DELETE FROM cart WHERE user_id = $1",
      [user_id]
    );

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
router.get("/", authMiddleware, async (req, res) => {
  const user_id = req.user.id;

  try {
    const ordersResult = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    const orders = ordersResult.rows;

    if (!orders.length) {
      return res.json([]);
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT order_items.*, products.name, products.image
           FROM order_items
           JOIN products ON order_items.product_id = products.id
           WHERE order_items.order_id = $1`,
          [order.id]
        );
        return { ...order, items: itemsResult.rows };
      })
    );

    res.json(ordersWithItems);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders/:id - Get single order details
router.get("/:id", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const orderResult = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const itemsResult = await db.query(
      `SELECT order_items.*, products.name, products.image
       FROM order_items
       JOIN products ON order_items.product_id = products.id
       WHERE order_items.order_id = $1`,
      [order.id]
    );

    order.items = itemsResult.rows;
    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /orders/:id/cancel - Cancel order
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  try {
    const orderResult = await db.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ error: "Order is already cancelled" });
    }

    await db.query(
      "UPDATE orders SET status = 'Cancelled' WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    res.json({ message: "✅ Order cancelled successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;