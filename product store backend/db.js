import Database from "better-sqlite3";
import productsData from "./seedData.js";

const db = new Database("./products.db");

console.log("✅ Connected to SQLite database");

// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON");

// Create categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

// Create products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category_id INTEGER,
    rating REAL,
    image TEXT,
    images TEXT,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`);

// Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )
`);

// Add role column if table already exists
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch (err) {
  if (!err.message.includes("duplicate column")) {
    console.error("Error adding role column:", err.message);
  }
}

// Cart table
db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Wishlist table
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    status TEXT DEFAULT 'Placed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Order Items table
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// ✅ Auto seed if products empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;

if (productCount === 0) {
  console.log("🌱 Seeding initial products...");

  const uniqueCategories = [...new Set(productsData.map(p => p.category))];

  const insertCategory = db.prepare("INSERT OR IGNORE INTO categories (name) VALUES (?)");
  uniqueCategories.forEach(cat => insertCategory.run(cat));

  const categories = db.prepare("SELECT * FROM categories").all();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  const insertProduct = db.prepare(`
    INSERT INTO products (name, price, category_id, rating, image, images, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  productsData.forEach(p => {
    insertProduct.run(
      p.name,
      p.price,
      categoryMap[p.category],
      p.rating,
      p.image,
      JSON.stringify(p.images),
      p.description
    );
  });

  console.log("✅ Initial products seeded!");
}

export default db;