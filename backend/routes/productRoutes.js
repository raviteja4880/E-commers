const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { syncProducts } = require("../services/syncService");

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/products/sync
router.post("/sync", async (req, res) => {
  try {
    await syncProducts();
    res.json({ message: "✅ Products synced successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
