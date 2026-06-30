import "dotenv/config";
import express from "express";
import cors from "cors";

import "./db.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Product Store Backend Running 🚀");
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});