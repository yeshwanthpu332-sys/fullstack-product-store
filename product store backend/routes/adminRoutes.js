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
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

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
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const productsResult = await db.query("SELECT COUNT(*) as count FROM products");
    const usersResult = await db.query("SELECT COUNT(*) as count FROM users");
    const ordersResult = await db.query("SELECT COUNT(*) as count FROM orders");
    const revenueResult = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'"
    );

    const recentOrdersResult = await db.query(
      `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
              users.name as user_name
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC
       LIMIT 4`
    );

    const topProductsResult = await db.query(
      `SELECT products.id, products.name, products.image, products.price,
              COALESCE(SUM(order_items.quantity), 0) as total_sold
       FROM products
       LEFT JOIN order_items ON products.id = order_items.product_id
       LEFT JOIN orders ON order_items.order_id = orders.id AND orders.status != 'Cancelled'
       GROUP BY products.id
       ORDER BY total_sold DESC
       LIMIT 4`
    );

    res.json({
      totalProducts: productsResult.rows[0].count,
      totalUsers: usersResult.rows[0].count,
      totalOrders: ordersResult.rows[0].count,
      totalRevenue: revenueResult.rows[0].total,
      recentOrders: recentOrdersResult.rows || [],
      topProducts: topProductsResult.rows || [],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/products - Add new product
router.post("/products", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, price, category_id, rating, image, images, description } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (name, price, category_id, rating, image, images, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        name,
        price,
        category_id,
        rating || 0,
        image || "",
        JSON.stringify(images || []),
        description || ""
      ]
    );

    res.status(201).json({
      message: "✅ Product added successfully!",
      product_id: result.rows[0].id,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/products/:id - Update product
router.put("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, price, category_id, rating, image, images, description } = req.body;

  try {
    await db.query(
      `UPDATE products 
       SET name = $1, price = $2, category_id = $3, rating = $4, image = $5, images = $6, description = $7
       WHERE id = $8`,
      [
        name,
        price,
        category_id,
        rating,
        image,
        JSON.stringify(images || []),
        description,
        id
      ]
    );

    res.json({ message: "✅ Product updated successfully!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/products/:id - Delete product
router.delete("/products/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ message: "✅ Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/orders - Get all orders
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ordersResult = await db.query(
      `SELECT orders.*, users.name as user_name, users.email as user_email
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC`
    );

    const orders = ordersResult.rows;

    if (!orders.length) {
      return res.json([]);
    }

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

// PUT /admin/orders/:id/status - Update order status
router.put("/orders/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await db.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({ message: `✅ Order status updated to ${status}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/categories - Get all categories with product count
router.get("/categories", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT categories.id, categories.name,
              COUNT(products.id) as product_count
       FROM categories
       LEFT JOIN products ON categories.id = products.category_id
       GROUP BY categories.id
       ORDER BY categories.id ASC`
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/categories - Add new category
router.post("/categories", authMiddleware, adminMiddleware, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING id",
      [name]
    );

    res.status(201).json({
      message: "✅ Category added successfully!",
      category_id: result.rows[0].id,
    });

  } catch (err) {
    if (err.message.includes("unique") || err.message.includes("duplicate")) {
      return res.status(400).json({ error: "Category already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/categories/:id - Delete category
router.delete("/categories/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM categories WHERE id = $1", [id]);
    res.json({ message: "✅ Category deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/users - Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, role FROM users"
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/users/:id/role - Change user role
router.put("/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "user" && role !== "admin") {
    return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
  }

  try {
    const result = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2",
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `✅ User role updated to ${role}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/revenue - Get revenue details
router.get("/revenue", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ordersResult = await db.query(
      `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
              users.name as customer_name
       FROM orders
       JOIN users ON orders.user_id = users.id
       WHERE orders.status != 'Cancelled'
       ORDER BY orders.created_at DESC`
    );

    const orders = ordersResult.rows;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount, 0
    );

    const cancelledResult = await db.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'Cancelled'"
    );

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      cancelledOrders: cancelledResult.rows[0].count,
      orders,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;