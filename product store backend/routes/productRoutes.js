import express from "express";
import db from "../db.js";

const router = express.Router();

// GET /products
router.get("/", async (req, res) => {
  const { page = 1, limit = 4, category, search, sort, minPrice, maxPrice } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, parseInt(limit, 10) || 4);
  const offset = (pageNum - 1) * pageLimit;

  const whereClauses = [];
  const params = [];
  let paramIndex = 1;

  if (category && category !== "All") {
    whereClauses.push(`categories.name = $${paramIndex++}`);
    params.push(category);
  }

  if (search) {
    whereClauses.push(`products.name ILIKE $${paramIndex++}`);
    params.push(`%${search}%`);
  }

  if (minPrice) {
    whereClauses.push(`products.price >= $${paramIndex++}`);
    params.push(parseInt(minPrice));
  }

  if (maxPrice) {
    whereClauses.push(`products.price <= $${paramIndex++}`);
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

    const countResult = await db.query(countSQL, params);
    const totalItems = parseInt(countResult.rows[0].count);
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
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataParams = [...params, pageLimit, offset];
    const dataResult = await db.query(dataSQL, dataParams);

    const formattedRows = dataResult.rows.map((product) => ({
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT products.*, categories.name as category
      FROM products
      LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const row = result.rows[0];
    row.images = row.images ? JSON.parse(row.images) : [];
    res.json(row);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;