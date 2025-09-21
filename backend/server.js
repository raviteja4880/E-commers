const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const { syncProducts } = require("./services/syncService");
const auth = require("./routes/auth");
const cartRoutes = require("./routes/cart");


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use("/api/products", productRoutes);
app.use("/api/auth", auth);
app.use("/api/cart", cartRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Cron job (runs every day at midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("🌙 Running daily product sync...");
  await syncProducts();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
