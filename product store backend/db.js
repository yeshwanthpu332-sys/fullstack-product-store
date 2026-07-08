import Database from "better-sqlite3";
import productsData from "./seedData.js"; // we will create this

const db = new Database("./products.db");

console.log("✅ Connected to SQLite database");

// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

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

// ✅ CHECK IF PRODUCTS EXIST
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;

if (productCount === 0) {
  console.log("🌱 Seeding initial products...");

  const uniqueCategories = [...new Set(productsData.map(p => p.category))];

  const insertCategory = db.prepare("INSERT INTO categories (name) VALUES (?)");
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