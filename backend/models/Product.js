const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  externalId: String,
  name: { type: String, required: true },
  image: String,
  brand: String,
  category: String,
  description: String,
  price: Number,
  countInStock: Number,
});

module.exports = mongoose.model("Product", productSchema);
