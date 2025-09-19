const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
const cors = require("cors"); // ✅ import cors
const productRoutes = require("./routes/productRoutes");
const { syncProducts } = require("./services/syncService");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ allow frontend (port 3000) to access backend (port 5000)
app.use(cors());

// API routes
app.use("/api/products", productRoutes);

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
