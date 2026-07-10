import "dotenv/config";
import express from "express";
import cors from "cors";

import "./db.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// ✅ CORS - Fixed for deployment
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "https://fullstack-product-store-tau.vercel.app",
      "https://fullstack-product-store-3ynu.vercel.app",
      "https://falconrex.com",
      "https://www.falconrex.com",
      "https://admin.falconrex.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Product Store Backend Running 🚀");
});

// ✅ PORT - Fixed for deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});