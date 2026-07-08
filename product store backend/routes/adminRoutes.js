import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// POST /admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = db.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Admin login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/dashboard
router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const products = db.prepare("SELECT COUNT(*) as count FROM products").get();
    const users = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const orders = db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const revenue = db.prepare(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'"
    ).get();

    const recentOrders = db.prepare(
      `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
              users.name as user_name
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC
       LIMIT 4`
    ).all();

    const topProducts = db.prepare(
      `SELECT products.id, products.name, products.image, products.price,
              COALESCE(SUM(order_items.quantity), 0) as total_sold
       FROM products
       LEFT JOIN order_items ON products.id = order_items.product_id
       LEFT JOIN orders ON order_items.order_id = orders.id AND orders.status != 'Cancelled'
       GROUP BY products.id
       ORDER BY total_sold DESC
       LIMIT 4`
    ).all();

    res.json({
      totalProducts: products.count,
      totalUsers: users.count,
      totalOrders: orders.count,
      totalRevenue: revenue.total,
      recentOrders: recentOrders || [],
      topProducts: topProducts || [],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/products - Add new product
router.post("/products", authMiddleware, adminMiddleware, (req, res) => {
  const { name, price, category_id, rating, image, images, description } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }

  try {
    const result = db.prepare(
      `INSERT INTO products (name, price, category_id, rating, image, images, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name,
      price,
      category_id,
      rating || 0,
      image || "",
      JSON.stringify(images || []),
      description || ""
    );

    res.status(201).json({
      message: "✅ Product added successfully!",
      product_id: result.lastInsertRowid,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/products/:id - Update product
router.put("/products/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, price, category_id, rating, image, images, description } = req.body;

  try {
    db.prepare(
      `UPDATE products 
       SET name = ?, price = ?, category_id = ?, rating = ?, image = ?, images = ?, description = ?
       WHERE id = ?`
    ).run(
      name,
      price,
      category_id,
      rating,
      image,
      JSON.stringify(images || []),
      description,
      id
    );

    res.json({ message: "✅ Product updated successfully!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/products/:id - Delete product
router.delete("/products/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ message: "✅ Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/orders - Get all orders
router.get("/orders", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const orders = db.prepare(
      `SELECT orders.*, users.name as user_name, users.email as user_email
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC`
    ).all();

    if (!orders.length) {
      return res.json([]);
    }

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

// PUT /admin/orders/:id/status - Update order status
router.put("/orders/:id/status", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    db.prepare(
      "UPDATE orders SET status = ? WHERE id = ?"
    ).run(status, id);

    res.json({ message: `✅ Order status updated to ${status}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/categories - Get all categories with product count
router.get("/categories", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      `SELECT categories.id, categories.name,
              COUNT(products.id) as product_count
       FROM categories
       LEFT JOIN products ON categories.id = products.category_id
       GROUP BY categories.id
       ORDER BY categories.id ASC`
    ).all();

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/categories - Add new category
router.post("/categories", authMiddleware, adminMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const result = db.prepare(
      "INSERT INTO categories (name) VALUES (?)"
    ).run(name);

    res.status(201).json({
      message: "✅ Category added successfully!",
      category_id: result.lastInsertRowid,
    });

  } catch (err) {
    if (err.message.includes("UNIQUE constraint")) {
      return res.status(400).json({ error: "Category already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/categories/:id - Delete category
router.delete("/categories/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ message: "✅ Category deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/users - Get all users
router.get("/users", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT id, name, email, role FROM users"
    ).all();

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/users/:id/role - Change user role
router.put("/users/:id/role", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "user" && role !== "admin") {
    return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
  }

  try {
    const result = db.prepare(
      "UPDATE users SET role = ? WHERE id = ?"
    ).run(role, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `✅ User role updated to ${role}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/revenue - Get revenue details
router.get("/revenue", authMiddleware, adminMiddleware, (req, res) => {
  try {
    const orders = db.prepare(
      `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
              users.name as customer_name
       FROM orders
       JOIN users ON orders.user_id = users.id
       WHERE orders.status != 'Cancelled'
       ORDER BY orders.created_at DESC`
    ).all();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount, 0
    );

    const cancelled = db.prepare(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'Cancelled'"
    ).get();

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      cancelledOrders: cancelled.count,
      orders,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;