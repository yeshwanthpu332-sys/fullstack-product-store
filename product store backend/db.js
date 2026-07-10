import pg from "pg";
import bcrypt from "bcryptjs";
import productsData from "./seedData.js";

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("✅ Connected to PostgreSQL database");

// ✅ Setup function - creates tables and seeds data
const setup = async () => {
  try {
    // Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        rating REAL,
        image TEXT,
        images TEXT,
        description TEXT
      )
    `);

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `);

    // Create cart table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Create wishlist table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id)
      )
    `);

    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total_amount INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        pincode TEXT NOT NULL,
        phone TEXT NOT NULL,
        payment_method TEXT DEFAULT 'COD',
        status TEXT DEFAULT 'Placed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL
      )
    `);

    // ✅ Auto seed products if empty
    const productCount = await db.query("SELECT COUNT(*) as count FROM products");
    const count = parseInt(productCount.rows[0].count);

    if (count === 0) {
      console.log("🌱 Seeding initial products...");

      const uniqueCategories = [...new Set(productsData.map(p => p.category))];

      for (const cat of uniqueCategories) {
        await db.query(
          "INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [cat]
        );
      }

      const categoriesResult = await db.query("SELECT * FROM categories");
      const categoryMap = {};
      categoriesResult.rows.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      for (const p of productsData) {
        await db.query(
          `INSERT INTO products (name, price, category_id, rating, image, images, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.name, p.price, categoryMap[p.category], p.rating, p.image, JSON.stringify(p.images), p.description]
        );
      }

      console.log("✅ Initial products seeded!");
    }

    // ✅ Auto create admin account if not exists
    const adminExists = await db.query(
      "SELECT * FROM users WHERE email = $1",
      ["admin@gmail.com"]
    );

    if (adminExists.rows.length === 0) {
      console.log("🌱 Creating admin account...");
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Admin", "admin@gmail.com", hashedPassword, "admin"]
      );
      console.log("✅ Admin account created!");
    }

    console.log("✅ Database setup complete!");

  } catch (err) {
    console.error("❌ Database setup error:", err.message);
  }
};

setup();

export default db;