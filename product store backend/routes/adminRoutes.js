import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// POST /admin/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

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
    }
  );
});

// GET /admin/dashboard
router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  db.get("SELECT COUNT(*) as count FROM products", (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get("SELECT COUNT(*) as count FROM users", (err, users) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT COUNT(*) as count FROM orders", (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(
          "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'",
          (err, revenue) => {
            if (err) return res.status(500).json({ error: err.message });

            // Recent 5 orders
            db.all(
              `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
                      users.name as user_name
               FROM orders
               JOIN users ON orders.user_id = users.id
               ORDER BY orders.created_at DESC
               LIMIT 4`,
              (err, recentOrders) => {
                if (err) return res.status(500).json({ error: err.message });

                // Top 5 most ordered products
                db.all(
                  `SELECT products.id, products.name, products.image, products.price,
                          COALESCE(SUM(order_items.quantity), 0) as total_sold
                   FROM products
                   LEFT JOIN order_items ON products.id = order_items.product_id
                   LEFT JOIN orders ON order_items.order_id = orders.id AND orders.status != 'Cancelled'
                   GROUP BY products.id
                   ORDER BY total_sold DESC
                   LIMIT 4`,
                  (err, topProducts) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json({
                      totalProducts: products.count,
                      totalUsers: users.count,
                      totalOrders: orders.count,
                      totalRevenue: revenue.total,
                      recentOrders: recentOrders || [],
                      topProducts: topProducts || [],
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

// POST /admin/products - Add new product
router.post("/products", authMiddleware, adminMiddleware, (req, res) => {
  const { name, price, category_id, rating, image, images, description } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Name, price and category are required" });
  }

  db.run(
    `INSERT INTO products (name, price, category_id, rating, image, images, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      price,
      category_id,
      rating || 0,
      image || "",
      JSON.stringify(images || []),
      description || "",
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "✅ Product added successfully!",
        product_id: this.lastID,
      });
    }
  );
});

// PUT /admin/products/:id - Update product
router.put("/products/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, price, category_id, rating, image, images, description } = req.body;

  db.run(
    `UPDATE products 
     SET name = ?, price = ?, category_id = ?, rating = ?, image = ?, images = ?, description = ?
     WHERE id = ?`,
    [
      name,
      price,
      category_id,
      rating,
      image,
      JSON.stringify(images || []),
      description,
      id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "✅ Product updated successfully!" });
    }
  );
});

// DELETE /admin/products/:id - Delete product
router.delete("/products/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "✅ Product deleted successfully!" });
  });
});

// GET /admin/orders - Get all orders
router.get("/orders", authMiddleware, adminMiddleware, (req, res) => {
  db.all(
    `SELECT orders.*, users.name as user_name, users.email as user_email
     FROM orders
     JOIN users ON orders.user_id = users.id
     ORDER BY orders.created_at DESC`,
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!orders.length) {
        return res.json([]);
      }

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

// PUT /admin/orders/:id/status - Update order status
router.put("/orders/:id/status", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.run(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: `✅ Order status updated to ${status}` });
    }
  );
});

// GET /admin/categories - Get all categories with product count
router.get("/categories", authMiddleware, adminMiddleware, (req, res) => {
  db.all(
    `SELECT categories.id, categories.name,
            COUNT(products.id) as product_count
     FROM categories
     LEFT JOIN products ON categories.id = products.category_id
     GROUP BY categories.id
     ORDER BY categories.id ASC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// POST /admin/categories - Add new category
router.post("/categories", authMiddleware, adminMiddleware, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  db.run(
    "INSERT INTO categories (name) VALUES (?)",
    [name],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint")) {
          return res.status(400).json({ error: "Category already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "✅ Category added successfully!",
        category_id: this.lastID,
      });
    }
  );
});

// DELETE /admin/categories/:id - Delete category
router.delete("/categories/:id", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM categories WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "✅ Category deleted successfully!" });
  });
});

// GET /admin/users - Get all users
router.get("/users", authMiddleware, adminMiddleware, (req, res) => {
  db.all(
    "SELECT id, name, email, role FROM users",
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

// PUT /admin/users/:id/role - Change user role
router.put("/users/:id/role", authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "user" && role !== "admin") {
    return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
  }

  db.run(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: `✅ User role updated to ${role}` });
    }
  );
});

// GET /admin/revenue - Get revenue details
router.get("/revenue", authMiddleware, adminMiddleware, (req, res) => {
  db.all(
    `SELECT orders.id, orders.total_amount, orders.status, orders.created_at,
            users.name as customer_name
     FROM orders
     JOIN users ON orders.user_id = users.id
     WHERE orders.status != 'Cancelled'
     ORDER BY orders.created_at DESC`,
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.total_amount, 0
      );

      db.get(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'Cancelled'",
        (err, cancelled) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            totalRevenue,
            totalOrders: orders.length,
            cancelledOrders: cancelled.count,
            orders,
          });
        }
      );
    }
  );
});

export default router;