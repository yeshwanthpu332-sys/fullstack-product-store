import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /products
router.get("/", (req, res) => {
  const { page = 1, limit = 4, category, search, sort, minPrice, maxPrice } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, parseInt(limit, 10) || 4);
  const offset = (pageNum - 1) * pageLimit;

  const whereClauses = [];
  const params = [];

  if (category && category !== "All") {
    whereClauses.push("categories.name = ?");
    params.push(category);
  }

  if (search) {
    whereClauses.push("products.name LIKE ?");
    params.push(`%${search}%`);
  }

  if (minPrice) {
    whereClauses.push("products.price >= ?");
    params.push(parseInt(minPrice));
  }

  if (maxPrice) {
    whereClauses.push("products.price <= ?");
    params.push(parseInt(maxPrice));
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    // Count total items matching filters
    const countSQL = `
      SELECT COUNT(*) as count
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      ${whereSQL}
    `;

    const countRow = db.prepare(countSQL).get(params);
    const totalItems = countRow ? countRow.count : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageLimit));

    // Build main query with ordering, limit and offset
    let orderSQL = "";
    if (sort === "lowToHigh") orderSQL = "ORDER BY products.price ASC";
    else if (sort === "highToLow") orderSQL = "ORDER BY products.price DESC";

    const dataSQL = `
      SELECT products.*, categories.name as category
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      ${whereSQL}
      ${orderSQL}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, pageLimit, offset];

    const rows = db.prepare(dataSQL).all(dataParams);

    const formattedRows = rows.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      products: formattedRows,
      page: pageNum,
      totalPages,
      totalItems,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /products/:id
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare(`
      SELECT products.*, categories.name as category
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.id = ?
    `).get(id);

    if (!row) {
      return res.status(404).json({ message: "Product not found" });
    }

    row.images = row.images ? JSON.parse(row.images) : [];
    res.json(row);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;