const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Product = require("./models/Product");

dotenv.config();

const importData = async () => {
  try {
    await Product.deleteMany();

    const { data } = await axios.get("https://fakestoreapi.com/products");

    const products = data.map((item) => ({
      externalId: String(item.id),
      name: item.title,
      image: item.image,
      brand: "Generic",
      category: item.category,
      description: item.description,
      price: item.price,
      countInStock: Math.floor(Math.random() * 20) + 1,
    }));

    await Product.insertMany(products);
    console.log("✅ Products imported from API!");
    process.exit();
  } catch (error) {
    console.error("❌ Error importing:", error.message);
    process.exit(1);
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => importData())
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });
