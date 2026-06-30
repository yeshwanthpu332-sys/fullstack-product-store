import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();
const db = new sqlite.Database("./products.db");

const products = [
  {
    name: "Wireless Headphones",
    price: 2499,
    category: "Electronics",
    rating: 4.5,
    image: "https://images.pexels.com/photos/5269699/pexels-photo-5269699.jpeg",
    images: [
      "https://images.pexels.com/photos/5269699/pexels-photo-5269699.jpeg",
      "https://images.pexels.com/photos/5269695/pexels-photo-5269695.jpeg",
      "https://images.pexels.com/photos/4887231/pexels-photo-4887231.jpeg",
      "https://images.pexels.com/photos/12799296/pexels-photo-12799296.jpeg",
    ],
    description: "High quality wireless headphones with noise cancellation and long battery life.",
  },
  {
    name: "Smart Watch",
    price: 3999,
    category: "Electronics",
    rating: 4.7,
    image: "https://images.pexels.com/photos/13007642/pexels-photo-13007642.jpeg",
    images: [
      "https://images.pexels.com/photos/13007642/pexels-photo-13007642.jpeg",
      "https://images.pexels.com/photos/4041157/pexels-photo-4041157.jpeg",
      "https://images.pexels.com/photos/4498481/pexels-photo-4498481.jpeg",
      "https://images.pexels.com/photos/2779018/pexels-photo-2779018.jpeg",
    ],
    description: "Track fitness, calls, messages, and health metrics with this smart watch.",
  },
  {
    name: "Running Shoes",
    price: 2999,
    category: "Fashion",
    rating: 4.4,
    image: "https://images.pexels.com/photos/4233114/pexels-photo-4233114.jpeg",
    images: [
      "https://images.pexels.com/photos/4233114/pexels-photo-4233114.jpeg",
      "https://images.pexels.com/photos/4228206/pexels-photo-4228206.jpeg",
      "https://images.pexels.com/photos/4228201/pexels-photo-4228201.jpeg",
      "https://images.pexels.com/photos/4211334/pexels-photo-4211334.jpeg",
    ],
    description: "Comfortable and lightweight running shoes suitable for daily workouts.",
  },
  {
    name: "Backpack",
    price: 1499,
    category: "Fashion",
    rating: 4.3,
    image: "https://images.pexels.com/photos/18510447/pexels-photo-18510447.jpeg",
    images: [
      "https://images.pexels.com/photos/18510447/pexels-photo-18510447.jpeg",
      "https://images.pexels.com/photos/18510449/pexels-photo-18510449.jpeg",
      "https://images.pexels.com/photos/18510445/pexels-photo-18510445.jpeg",
      "https://images.pexels.com/photos/18510444/pexels-photo-18510444.jpeg",
    ],
    description: "Durable backpack with multiple compartments for travel and work.",
  },
  {
    name: "Coffee Maker",
    price: 3499,
    category: "Home",
    rating: 4.6,
    image: "https://images.pexels.com/photos/12246501/pexels-photo-12246501.jpeg",
    images: [
      "https://images.pexels.com/photos/12246501/pexels-photo-12246501.jpeg",
      "https://images.pexels.com/photos/6589154/pexels-photo-6589154.jpeg",
      "https://images.pexels.com/photos/12246500/pexels-photo-12246500.jpeg",
      "https://images.pexels.com/photos/32339287/pexels-photo-32339287.jpeg",
    ],
    description: "Brew fresh coffee every morning with this easy-to-use coffee maker.",
  },
  {
    name: "Office Chair",
    price: 6999,
    category: "Home",
    rating: 4.8,
    image: "https://images.pexels.com/photos/6044928/pexels-photo-6044928.jpeg",
    images: [
      "https://images.pexels.com/photos/6044928/pexels-photo-6044928.jpeg",
      "https://images.pexels.com/photos/6044915/pexels-photo-6044915.jpeg",
      "https://images.pexels.com/photos/6044921/pexels-photo-6044921.jpeg",
      "https://images.pexels.com/photos/6044811/pexels-photo-6044811.jpeg",
    ],
    description: "Ergonomic office chair designed for comfort and productivity.",
  },
  {
    name: "Gaming Mouse",
    price: 1999,
    category: "Electronics",
    rating: 4.5,
    image: "https://images.pexels.com/photos/34396238/pexels-photo-34396238.jpeg",
    images: [
      "https://images.pexels.com/photos/34396238/pexels-photo-34396238.jpeg",
      "https://images.pexels.com/photos/17821147/pexels-photo-17821147.jpeg",
      "https://images.pexels.com/photos/34396230/pexels-photo-34396230.jpeg",
      "https://images.pexels.com/photos/31915113/pexels-photo-31915113.jpeg",
    ],
    description: "Precision gaming mouse with customizable RGB lighting.",
  },
  {
    name: "Bluetooth Speaker",
    price: 2799,
    category: "Electronics",
    rating: 4.4,
    image: "https://images.pexels.com/photos/6023354/pexels-photo-6023354.jpeg",
    images: [
      "https://images.pexels.com/photos/6023354/pexels-photo-6023354.jpeg",
      "https://images.pexels.com/photos/9767549/pexels-photo-9767549.jpeg",
      "https://images.pexels.com/photos/6332446/pexels-photo-6332446.jpeg",
      "https://images.pexels.com/photos/10963255/pexels-photo-10963255.jpeg",
    ],
    description: "Portable Bluetooth speaker with excellent sound quality.",
  },
  {
    name: "Yoga Mat",
    price: 999,
    category: "Fitness",
    rating: 4.2,
    image: "https://images.pexels.com/photos/4498609/pexels-photo-4498609.jpeg",
    images: [
      "https://images.pexels.com/photos/4498609/pexels-photo-4498609.jpeg",
      "https://images.pexels.com/photos/6454060/pexels-photo-6454060.jpeg",
      "https://images.pexels.com/photos/4498214/pexels-photo-4498214.jpeg",
      "https://images.pexels.com/photos/4498605/pexels-photo-4498605.jpeg",
    ],
    description: "Non-slip yoga mat ideal for home workouts and fitness sessions.",
  },
  {
    name: "Dumbbell Set",
    price: 4999,
    category: "Fitness",
    rating: 4.7,
    image: "https://images.pexels.com/photos/4793209/pexels-photo-4793209.jpeg",
    images: [
      "https://images.pexels.com/photos/4793209/pexels-photo-4793209.jpeg",
      "https://images.pexels.com/photos/4793237/pexels-photo-4793237.jpeg",
      "https://images.pexels.com/photos/4793223/pexels-photo-4793223.jpeg",
      "https://images.pexels.com/photos/4793234/pexels-photo-4793234.jpeg",
    ],
    description: "Adjustable dumbbell set for strength training exercises.",
  },
  {
    name: "Laptop Stand",
    price: 1299,
    category: "Accessories",
    rating: 4.3,
    image: "https://images.pexels.com/photos/19958745/pexels-photo-19958745.jpeg",
    images: [
      "https://images.pexels.com/photos/19958745/pexels-photo-19958745.jpeg",
      "https://images.pexels.com/photos/19954937/pexels-photo-19954937.jpeg",
      "https://images.pexels.com/photos/20542049/pexels-photo-20542049.jpeg",
      "https://images.pexels.com/photos/16823699/pexels-photo-16823699.jpeg",
    ],
    description: "Portable aluminum laptop stand with ergonomic design.",
  },
  {
    name: "Water Bottle",
    price: 599,
    category: "Accessories",
    rating: 4.1,
    image: "https://images.pexels.com/photos/5274793/pexels-photo-5274793.jpeg",
    images: [
      "https://images.pexels.com/photos/5274793/pexels-photo-5274793.jpeg",
      "https://images.pexels.com/photos/5274796/pexels-photo-5274796.jpeg",
      "https://images.pexels.com/photos/3737803/pexels-photo-3737803.jpeg",
      "https://images.pexels.com/photos/25382222/pexels-photo-25382222.jpeg",
    ],
    description: "Reusable stainless steel water bottle for daily use.",
  },
];

const uniqueCategories = [...new Set(products.map((p) => p.category))];

db.serialize(() => {
  // ✅ Drop and recreate tables (resets IDs to 1)
  db.run("DROP TABLE IF EXISTS products");
  db.run("DROP TABLE IF EXISTS categories");

  db.run(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE products (
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

  const catStmt = db.prepare(
    "INSERT OR IGNORE INTO categories (name) VALUES (?)"
  );
  uniqueCategories.forEach((cat) => catStmt.run([cat]));
  catStmt.finalize();

  db.all("SELECT * FROM categories", [], (err, categories) => {
    if (err) {
      console.error(err.message);
      return;
    }

    console.log("✅ Categories inserted:", categories);

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    const prodStmt = db.prepare(`
      INSERT INTO products 
      (name, price, category_id, rating, image, images, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    products.forEach((p) => {
      prodStmt.run([
        p.name,
        p.price,
        categoryMap[p.category],
        p.rating,
        p.image,
        JSON.stringify(p.images),
        p.description,
      ]);
    });

    prodStmt.finalize(() => {
      console.log("✅ Products inserted successfully!");
      db.close();
    });
  });
});